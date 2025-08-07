import { NextRequest, NextResponse } from 'next/server';
import { generateCertificate } from '@/lib/certificate-generator';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Verify user exists and has completed final task
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        submissions!inner(
          *,
          tasks!inner(is_final)
        )
      `)
      .eq('email', email)
      .eq('submissions.tasks.is_final', true)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found or has not completed final task' },
        { status: 404 }
      );
    }

    // Check if user has made payment
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'paid')
      .single();

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment required before certificate generation' },
        { status: 402 }
      );
    }

    // Generate certificate
    const certificate = await generateCertificate(email);

    return NextResponse.json({
      success: true,
      certificate: {
        id: certificate.certificateId,
        pdfUrl: certificate.url,
        verificationUrl: `https://www.prismstudio.co.in/verification?cert=${certificate.certificateId}`,
        hash: certificate.hash
      },
      message: 'Certificate generated successfully'
    });

  } catch (error) {
    console.error('Certificate generation error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate certificate'
      },
      { status: 500 }
    );
  }
}

// GET method for testing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      { success: false, error: 'Email parameter is required' },
      { status: 400 }
    );
  }

  // Create mock POST request
  const mockRequest = new NextRequest(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify({ email })
  });

  return POST(mockRequest);
}