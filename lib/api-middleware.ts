// Secure API middleware for enterprise-level protection
import { NextRequest, NextResponse } from 'next/server'
import { RateLimiter, RequestValidator, CSRFProtection, AuditLogger, SECURITY_HEADERS } from './security'
import { supabase } from './supabase'

export interface SecureAPIOptions {
  requireAuth?: boolean
  requireAdmin?: boolean
  rateLimit?: number
  requireCSRF?: boolean
  allowedMethods?: string[]
  validateContentType?: string
}

// Secure API wrapper
export function withSecurity(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  options: SecureAPIOptions = {}
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      // Apply security headers
      const response = new NextResponse()
      Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
        response.headers.set(key, value)
      })

      // Method validation
      if (options.allowedMethods && !options.allowedMethods.includes(request.method)) {
        await AuditLogger.log('method_not_allowed', null, { method: request.method }, request)
        return NextResponse.json(
          { error: 'Method not allowed' },
          { status: 405, headers: response.headers }
        )
      }

      // User agent validation
      if (!RequestValidator.validateUserAgent(request)) {
        await AuditLogger.log('suspicious_user_agent', null, { 
          userAgent: request.headers.get('user-agent') 
        }, request)
        return NextResponse.json(
          { error: 'Invalid request' },
          { status: 400, headers: response.headers }
        )
      }

      // Content type validation
      if (options.validateContentType && !RequestValidator.validateContentType(request, options.validateContentType)) {
        await AuditLogger.log('invalid_content_type', null, { 
          contentType: request.headers.get('content-type') 
        }, request)
        return NextResponse.json(
          { error: 'Invalid content type' },
          { status: 400, headers: response.headers }
        )
      }

      // Rate limiting
      const clientIP = RequestValidator.getClientIP(request)
      const rateLimitKey = `${clientIP}:${request.nextUrl.pathname}`
      
      if (!RateLimiter.check(rateLimitKey, options.rateLimit)) {
        await AuditLogger.log('rate_limit_exceeded', null, { 
          ip: clientIP,
          path: request.nextUrl.pathname,
          remaining: RateLimiter.getRemainingRequests(rateLimitKey, options.rateLimit)
        }, request)
        
        return NextResponse.json(
          { 
            error: 'Rate limit exceeded',
            retryAfter: 900 // 15 minutes
          },
          { 
            status: 429,
            headers: {
              ...response.headers,
              'Retry-After': '900'
            }
          }
        )
      }

      // Authentication check
      let user = null
      if (options.requireAuth || options.requireAdmin) {
        try {
          const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
          
          if (authError || !authUser) {
            await AuditLogger.log('unauthorized_access', null, { 
              path: request.nextUrl.pathname 
            }, request)
            return NextResponse.json(
              { error: 'Unauthorized' },
              { status: 401, headers: response.headers }
            )
          }
          
          user = authUser
          
          // Admin check
          if (options.requireAdmin) {
            const { data: userProfile, error: profileError } = await supabase
              .from('users')
              .select('role')
              .eq('id', authUser.id)
              .single()
            
            if (profileError || userProfile?.role !== 'admin') {
              await AuditLogger.log('admin_access_denied', authUser.id, { 
                path: request.nextUrl.pathname,
                userRole: userProfile?.role
              }, request)
              return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403, headers: response.headers }
              )
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          await AuditLogger.log('auth_error', null, { error: errorMessage }, request)
          return NextResponse.json(
            { error: 'Authentication error' },
            { status: 401, headers: response.headers }
          )
        }
      }

      // CSRF protection for state-changing operations
      if (options.requireCSRF && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
        const csrfToken = request.headers.get('x-csrf-token')
        const sessionId = user?.id || 'anonymous'
        
        if (!csrfToken || !CSRFProtection.validateToken(csrfToken, sessionId)) {
          await AuditLogger.log('csrf_validation_failed', user?.id || null, { 
            path: request.nextUrl.pathname 
          }, request)
          return NextResponse.json(
            { error: 'CSRF token validation failed' },
            { status: 403, headers: response.headers }
          )
        }
      }

      // Call the actual handler
      const result = await handler(request, { ...context, user })
      
      // Apply security headers to the result
      Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
        result.headers.set(key, value)
      })
      
      return result
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const errorStack = error instanceof Error ? error.stack : undefined
      await AuditLogger.log('api_error', null, { 
        error: errorMessage,
        stack: errorStack,
        path: request.nextUrl.pathname
      }, request)
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

// Specific middleware for different API types
export const withAuth = (handler: (request: NextRequest, context?: any) => Promise<NextResponse>) => 
  withSecurity(handler, { 
    requireAuth: true,
    rateLimit: 50,
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    validateContentType: 'application/json'
  })

export const withAdminAuth = (handler: (request: NextRequest, context?: any) => Promise<NextResponse>) => 
  withSecurity(handler, { 
    requireAuth: true,
    requireAdmin: true,
    rateLimit: 30,
    requireCSRF: true,
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    validateContentType: 'application/json'
  })

export const withPublicAPI = (handler: (request: NextRequest, context?: any) => Promise<NextResponse>) => 
  withSecurity(handler, { 
    rateLimit: 100,
    allowedMethods: ['GET', 'POST'],
    validateContentType: 'application/json'
  })

// Input validation middleware
export function validateInput(schema: Record<string, any>) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value
    
    descriptor.value = async function(...args: any[]) {
      const [request] = args
      
      try {
        const body = await request.json()
        
        // Validate against schema
        for (const [field, rules] of Object.entries(schema)) {
          const value = body[field]
          
          if ((rules as any).required && (!value || value.toString().trim() === '')) {
            return NextResponse.json(
              { error: `${field} is required` },
              { status: 400 }
            )
          }
          
          if (value && (rules as any).type && typeof value !== (rules as any).type) {
            return NextResponse.json(
              { error: `${field} must be of type ${(rules as any).type}` },
              { status: 400 }
            )
          }
          
          if (value && (rules as any).maxLength && value.toString().length > (rules as any).maxLength) {
            return NextResponse.json(
              { error: `${field} must be less than ${(rules as any).maxLength} characters` },
              { status: 400 }
            )
          }
          
          if (value && (rules as any).pattern && !(rules as any).pattern.test(value)) {
            return NextResponse.json(
              { error: `${field} format is invalid` },
              { status: 400 }
            )
          }
        }
        
        return method.apply(this, args)
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid JSON' },
          { status: 400 }
        )
      }
    }
  }
}

// Database query security wrapper
export class SecureQuery {
  static async execute(query: () => Promise<any>, userId?: string, operation?: string) {
    try {
      const startTime = Date.now()
      const result = await query()
      const duration = Date.now() - startTime
      
      // Log slow queries
      if (duration > 1000) {
        await AuditLogger.log('slow_query', userId || null, { 
          operation,
          duration 
        })
      }
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await AuditLogger.log('database_error', userId || null, { 
        operation,
        error: errorMessage 
      })
      throw error
    }
  }
  
  // Prevent SQL injection by validating UUIDs
  static validateUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }
  
  // Sanitize search queries
  static sanitizeSearchQuery(query: string): string {
    return query
      .replace(/[^\w\s-]/g, '') // Remove special characters except word chars, spaces, hyphens
      .trim()
      .substring(0, 100) // Limit length
  }
}

// File upload security
export class FileUploadSecurity {
  private static allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain'
  ]
  
  private static maxFileSize = 5 * 1024 * 1024 // 5MB
  
  static validateFile(file: File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'No file provided' }
    }
    
    if (file.size > this.maxFileSize) {
      return { valid: false, error: 'File size exceeds limit (5MB)' }
    }
    
    if (!this.allowedMimeTypes.includes(file.type)) {
      return { valid: false, error: 'File type not allowed' }
    }
    
    // Check file extension matches MIME type
    const extension = file.name.split('.').pop()?.toLowerCase()
    const mimeTypeMap: Record<string, string[]> = {
      'image/jpeg': ['jpg', 'jpeg'],
      'image/png': ['png'],
      'image/gif': ['gif'],
      'application/pdf': ['pdf'],
      'text/plain': ['txt']
    }
    
    const allowedExtensions = mimeTypeMap[file.type] || []
    if (extension && !allowedExtensions.includes(extension)) {
      return { valid: false, error: 'File extension does not match content type' }
    }
    
    return { valid: true }
  }
  
  static generateSecureFilename(originalName: string): string {
    const extension = originalName.split('.').pop()
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2)
    return `${timestamp}_${random}.${extension}`
  }
}