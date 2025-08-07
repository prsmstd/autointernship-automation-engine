import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS_PER_WINDOW = 10;

interface VerificationLog {
  certificate_id: string;
  ip_address: string;
  user_agent?: string;
  success: boolean;
  request_method: string;
}

async function getClientIP(request: NextRequest): Promise<string> {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
}

async function checkRateLimit(ip: string, endpoint: string): Promise<boolean> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW);

  // Get or create rate limit record
  const { data: rateLimit, error } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('ip_address', ip)
    .eq('endpoint', endpoint)
    .single();

  if (error && error.code !== 'PGRST116') { // Not found error
    console.error('Rate limit check error:', error);
    return true; // Allow on error
  }

  if (!rateLimit) {
    // Create new rate limit record
    await supabase
      .from('rate_limits')
      .insert({
        ip_address: ip,
        endpoint,
        request_count: 1,
        window_start: now.toISOString()
      });
    return true;
  }

  // Check if we're in a new window
  const recordWindowStart = new Date(rateLimit.window_start);
  if (recordWindowStart < windowStart) {
    // Reset counter for new window
    await supabase
      .from('rate_limits')
      .update({
        request_count: 1,
        window_start: now.toISOString(),
        blocked_until: null
      })
      .eq('id', rateLimit.id);
    return true;
  }

  // Check if blocked
  if (rateLimit.blocked_until && new Date(rateLimit.blocked_until) > now) {
    return false;
  }

  // Increment counter
  const newCount = rateLimit.request_count + 1;
  
  if (newCount > MAX_REQUESTS_PER_WINDOW) {
    // Block for remaining window time
    const blockUntil = new Date(recordWindowStart.getTime() + RATE_LIMIT_WINDOW);
    await supabase
      .from('rate_limits')
      .update({
        request_count: newCount,
        blocked_until: blockUntil.toISOString()
      })
      .eq('id', rateLimit.id);
    return false;
  }

  // Update counter
  await supabase
    .from('rate_limits')
    .update({ request_count: newCount })
    .eq('id', rateLimit.id);

  return true;
}

async function logVerificationAttempt(log: VerificationLog): Promise<void> {
  try {
    await supabase
      .from('verification_logs')
      .insert({
        certificate_id: log.certificate_id,
        ip_address: log.ip_address,
        user_agent: log.user_agent,
        success: log.success,
        request_method: log.request_method,
        verified_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Failed to log verification attempt:', error);
  }
}

function validateCertificateId(certificateId: string): boolean {
  // PS2506DS148 format: PS + YYMM + DOMAIN + XXX
  const pattern = /^PS\d{4}[A-Z]{2,4}\d{3}$/;
  return pattern.test(certificateId.trim().toUpperCase());
}

export async function POST(request: NextRequest) {
  try {
    const ip = await getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    
    // Check rate limiting
    const isAllowed = await checkRateLimit(ip, '/api/verify-certificate');
    if (!isAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Please wait before trying again.',
          retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 1000)
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const certificateId = body.certificate_id?.trim().toUpperCase();

    if (!certificateId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Certificate ID is required',
          format: 'Expected format: PS2506DS148'
        },
        { status: 400 }
      );
    }

    if (!validateCertificateId(certificateId)) {
      await logVerificationAttempt({
        certificate_id: certificateId,
        ip_address: ip,
        user_agent: userAgent,
        success: false,
        request_method: 'POST'
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid certificate ID format',
          format: 'Expected format: PS2506DS148',
          example: 'PS2506DS148'
        },
        { status: 400 }
      );
    }

    // Query certificate with user and institution data
    const { data: certificate, error } = await supabase
      .from('certificates')
      .select(`
        *,
        users!inner(
          name,
          full_name,
          email,
          domain,
          phone,
          education
        )
      `)
      .eq('certificate_id', certificateId)
      .eq('is_active', true)
      .single();

    const logData: VerificationLog = {
      certificate_id: certificateId,
      ip_address: ip,
      user_agent: userAgent,
      success: !!certificate,
      request_method: 'POST'
    };

    await logVerificationAttempt(logData);

    if (!certificate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Certificate not found or has been revoked',
          certificateId,
          timestamp: new Date().toISOString(),
          supportContact: 'team@prismstudio.co.in'
        },
        { status: 404 }
      );
    }

    // Check if certificate is expired
    const isExpired = certificate.valid_until && new Date(certificate.valid_until) < new Date();
    const daysUntilExpiry = certificate.valid_until 
      ? Math.ceil((new Date(certificate.valid_until).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // Generate verification hash for this session
    const verificationHash = require('crypto')
      .createHash('sha256')
      .update(certificate.cert_hash + certificateId + new Date().toDateString())
      .digest('hex');

    // Format domain name
    const domainMap: { [key: string]: string } = {
      'web_development': 'Web Development',
      'ui_ux_design': 'UI/UX Design',
      'data_science': 'Data Science',
      'pcb_design': 'PCB Design',
      'embedded_programming': 'Embedded Programming',
      'fpga_verilog': 'FPGA Verilog',
    };

    const response = {
      success: true,
      certificate: {
        id: certificate.certificate_id,
        studentName: certificate.users.name || certificate.users.full_name,
        studentEmail: certificate.users.email,
        track: domainMap[certificate.users.domain] || certificate.users.domain,
        issueDate: certificate.issued_at,
        completionDate: certificate.completion_date,
        validUntil: certificate.valid_until,
        durationMonths: certificate.duration_months || 2,
        skills: certificate.skills || [],
        grade: certificate.grade,
        projectTitle: certificate.project_title,
        supervisorName: certificate.supervisor_name || 'PrismStudio Team',
        supervisorEmail: certificate.supervisor_email,
        certType: certificate.cert_type,
        isVerified: certificate.is_verified,
        isExpired: !!isExpired,
        daysUntilExpiry,
        pdfUrl: certificate.pdf_url,
        verificationHash: verificationHash.substring(0, 16),
        verifiedAt: new Date().toISOString(),
        metadata: certificate.metadata
      },
      verificationDetails: {
        method: 'Database verification with cryptographic hash',
        securityLevel: 'Industry Standard',
        compliance: 'Educational Institution Compatible',
        verificationId: verificationHash.substring(0, 16),
        ipAddress: ip.replace(/\.\d+$/, '.***'), // Partially mask IP for privacy
      },
      issuer: {
        name: 'PrismStudio',
        website: 'https://www.prismstudio.co.in',
        verificationUrl: `https://www.prismstudio.co.in/verification?cert=${certificateId}`,
        contactEmail: 'team@prismstudio.co.in'
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Certificate verification error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during verification',
        timestamp: new Date().toISOString(),
        supportContact: 'team@prismstudio.co.in'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const certificateId = searchParams.get('cert')?.trim().toUpperCase();

  if (!certificateId) {
    return NextResponse.json(
      {
        success: false,
        error: 'Certificate ID parameter is required',
        usage: 'GET /api/verify-certificate?cert=PS2506DS148'
      },
      { status: 400 }
    );
  }

  // Create a mock POST request body and call POST handler
  const mockRequest = new NextRequest(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify({ certificate_id: certificateId })
  });

  return POST(mockRequest);
}