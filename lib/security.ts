// Enterprise-level security utilities
import { NextRequest } from 'next/server'

// Use Web Crypto API for Edge Runtime compatibility
const crypto = globalThis.crypto || require('crypto')

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Security configuration
export const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100, // per window
    MAX_LOGIN_ATTEMPTS: 5, // per 15 minutes
    MAX_API_REQUESTS: 50, // per 15 minutes
  },
  
  // Password requirements
  PASSWORD: {
    MIN_LENGTH: 12,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SYMBOLS: true,
  },
  
  // Session security
  SESSION: {
    MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
    SECURE_COOKIES: true,
    SAME_SITE: 'strict' as const,
  },
  
  // Input validation
  INPUT: {
    MAX_STRING_LENGTH: 10000,
    MAX_EMAIL_LENGTH: 254,
    MAX_PHONE_LENGTH: 20,
    MAX_URL_LENGTH: 2048,
  }
}

// Rate limiting middleware
export class RateLimiter {
  static check(identifier: string, maxRequests: number = SECURITY_CONFIG.RATE_LIMIT.MAX_REQUESTS): boolean {
    const now = Date.now()
    const windowStart = now - SECURITY_CONFIG.RATE_LIMIT.WINDOW_MS
    
    const record = rateLimitStore.get(identifier)
    
    if (!record || record.resetTime < now) {
      rateLimitStore.set(identifier, { count: 1, resetTime: now + SECURITY_CONFIG.RATE_LIMIT.WINDOW_MS })
      return true
    }
    
    if (record.count >= maxRequests) {
      return false
    }
    
    record.count++
    return true
  }
  
  static getRemainingRequests(identifier: string, maxRequests: number = SECURITY_CONFIG.RATE_LIMIT.MAX_REQUESTS): number {
    const record = rateLimitStore.get(identifier)
    if (!record || record.resetTime < Date.now()) {
      return maxRequests
    }
    return Math.max(0, maxRequests - record.count)
  }
}

// Input sanitization and validation
export class InputValidator {
  // Sanitize string input
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') return ''
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential XSS characters
      .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
      .substring(0, SECURITY_CONFIG.INPUT.MAX_STRING_LENGTH)
  }
  
  // Validate email format and security
  static validateEmail(email: string): { valid: boolean; error?: string } {
    if (!email || typeof email !== 'string') {
      return { valid: false, error: 'Email is required' }
    }
    
    if (email.length > SECURITY_CONFIG.INPUT.MAX_EMAIL_LENGTH) {
      return { valid: false, error: 'Email is too long' }
    }
    
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Invalid email format' }
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /script/i,
      /javascript/i,
      /vbscript/i,
      /onload/i,
      /onerror/i,
    ]
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(email)) {
        return { valid: false, error: 'Invalid email format' }
      }
    }
    
    return { valid: true }
  }
  
  // Validate phone number
  static validatePhone(phone: string): { valid: boolean; error?: string } {
    if (!phone) return { valid: true } // Optional field
    
    if (typeof phone !== 'string') {
      return { valid: false, error: 'Invalid phone format' }
    }
    
    if (phone.length > SECURITY_CONFIG.INPUT.MAX_PHONE_LENGTH) {
      return { valid: false, error: 'Phone number is too long' }
    }
    
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
    const phoneRegex = /^[\+]?[1-9][\d]{7,15}$/
    
    if (!phoneRegex.test(cleanPhone)) {
      return { valid: false, error: 'Invalid phone number format' }
    }
    
    return { valid: true }
  }
  
  // Validate URL
  static validateURL(url: string): { valid: boolean; error?: string } {
    if (!url) return { valid: true } // Optional field
    
    if (typeof url !== 'string') {
      return { valid: false, error: 'Invalid URL format' }
    }
    
    if (url.length > SECURITY_CONFIG.INPUT.MAX_URL_LENGTH) {
      return { valid: false, error: 'URL is too long' }
    }
    
    try {
      const parsedUrl = new URL(url)
      
      // Only allow HTTPS URLs (except localhost for development)
      if (parsedUrl.protocol !== 'https:' && !parsedUrl.hostname.includes('localhost')) {
        return { valid: false, error: 'Only HTTPS URLs are allowed' }
      }
      
      // Block suspicious domains
      const blockedDomains = [
        'bit.ly',
        'tinyurl.com',
        'short.link',
        // Add more as needed
      ]
      
      if (blockedDomains.some(domain => parsedUrl.hostname.includes(domain))) {
        return { valid: false, error: 'URL domain not allowed' }
      }
      
      return { valid: true }
    } catch {
      return { valid: false, error: 'Invalid URL format' }
    }
  }
  
  // Validate password strength
  static validatePassword(password: string): { valid: boolean; error?: string; strength: number } {
    if (!password || typeof password !== 'string') {
      return { valid: false, error: 'Password is required', strength: 0 }
    }
    
    if (password.length < SECURITY_CONFIG.PASSWORD.MIN_LENGTH) {
      return { 
        valid: false, 
        error: `Password must be at least ${SECURITY_CONFIG.PASSWORD.MIN_LENGTH} characters long`,
        strength: 0
      }
    }
    
    let strength = 0
    const checks = [
      { regex: /[a-z]/, message: 'lowercase letter', required: SECURITY_CONFIG.PASSWORD.REQUIRE_LOWERCASE },
      { regex: /[A-Z]/, message: 'uppercase letter', required: SECURITY_CONFIG.PASSWORD.REQUIRE_UPPERCASE },
      { regex: /[0-9]/, message: 'number', required: SECURITY_CONFIG.PASSWORD.REQUIRE_NUMBERS },
      { regex: /[^a-zA-Z0-9]/, message: 'special character', required: SECURITY_CONFIG.PASSWORD.REQUIRE_SYMBOLS },
    ]
    
    const missing = []
    
    for (const check of checks) {
      if (check.regex.test(password)) {
        strength += 25
      } else if (check.required) {
        missing.push(check.message)
      }
    }
    
    if (missing.length > 0) {
      return {
        valid: false,
        error: `Password must contain at least one ${missing.join(', ')}`,
        strength
      }
    }
    
    // Check for common weak passwords
    const commonPasswords = [
      'password123',
      'admin123',
      'qwerty123',
      '123456789',
      'password1',
    ]
    
    if (commonPasswords.some(common => password.toLowerCase().includes(common.toLowerCase()))) {
      return {
        valid: false,
        error: 'Password is too common, please choose a stronger password',
        strength: Math.max(strength - 50, 0)
      }
    }
    
    return { valid: true, strength }
  }
}

// CSRF protection
export class CSRFProtection {
  private static secret = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production'
  
  static generateToken(sessionId: string): string {
    const timestamp = Date.now().toString()
    const data = `${sessionId}:${timestamp}`
    const signature = this.simpleHash(data + this.secret)
    return btoa(`${data}:${signature}`)
  }
  
  static validateToken(token: string, sessionId: string): boolean {
    try {
      const decoded = atob(token)
      const [receivedSessionId, timestamp, signature] = decoded.split(':')
      
      if (receivedSessionId !== sessionId) return false
      
      // Check if token is not older than 1 hour
      const tokenAge = Date.now() - parseInt(timestamp)
      if (tokenAge > 60 * 60 * 1000) return false
      
      const data = `${receivedSessionId}:${timestamp}`
      const expectedSignature = this.simpleHash(data + this.secret)
      
      return signature === expectedSignature
    } catch {
      return false
    }
  }
  
  private static simpleHash(input: string): string {
    let hash = 0
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16)
  }
}

// Request validation
export class RequestValidator {
  static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const remoteAddr = request.headers.get('remote-addr')
    
    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }
    
    return realIP || remoteAddr || 'unknown'
  }
  
  static validateContentType(request: NextRequest, expectedType: string): boolean {
    const contentType = request.headers.get('content-type')
    return contentType?.includes(expectedType) || false
  }
  
  static validateUserAgent(request: NextRequest): boolean {
    const userAgent = request.headers.get('user-agent')
    
    if (!userAgent) return false
    
    // Block suspicious user agents
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
    ]
    
    // Allow legitimate bots (Google, etc.) but block others
    const allowedBots = [
      /googlebot/i,
      /bingbot/i,
    ]
    
    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent))
    const isAllowedBot = allowedBots.some(pattern => pattern.test(userAgent))
    
    return !isSuspicious || isAllowedBot
  }
}

// Encryption utilities (Edge Runtime compatible)
export class EncryptionUtils {
  static async hash(text: string): Promise<string> {
    if (typeof crypto.subtle !== 'undefined') {
      try {
        // Use Web Crypto API for Edge Runtime
        const encoder = new TextEncoder()
        const data = encoder.encode(text)
        const hashBuffer = await crypto.subtle.digest('SHA-256', data)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      } catch {
        return this.simpleHash(text)
      }
    } else {
      // Fallback simple hash
      return this.simpleHash(text)
    }
  }
  
  static generateSecureToken(length: number = 32): string {
    if (typeof crypto.getRandomValues === 'function') {
      try {
        // Use Web Crypto API
        const array = new Uint8Array(length)
        crypto.getRandomValues(array)
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
      } catch {
        // Fallback
        return Math.random().toString(36).substring(2) + Date.now().toString(36)
      }
    } else {
      // Fallback
      return Math.random().toString(36).substring(2) + Date.now().toString(36)
    }
  }
  
  private static simpleHash(text: string): string {
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16)
  }
  
  // Simple encryption for non-sensitive data (Edge Runtime compatible)
  static simpleEncrypt(text: string, key: string = 'default'): string {
    let result = ''
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      result += String.fromCharCode(charCode)
    }
    return btoa(result)
  }
  
  static simpleDecrypt(encryptedText: string, key: string = 'default'): string {
    const text = atob(encryptedText)
    let result = ''
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      result += String.fromCharCode(charCode)
    }
    return result
  }
}

// Security headers
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://js.instamojo.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.supabase.co https://api.razorpay.com https://api.instamojo.com; frame-src https://checkout.razorpay.com https://js.instamojo.com;",
}

// Audit logging
export class AuditLogger {
  static async log(event: string, userId: string | null, details: any, request?: NextRequest) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      userId,
      details,
      ip: request ? RequestValidator.getClientIP(request) : null,
      userAgent: request ? request.headers.get('user-agent') : null,
    }
    
    // In production, send to logging service (e.g., Winston, DataDog, etc.)
    console.log('AUDIT:', JSON.stringify(logEntry))
    
    // Store in database for critical events
    if (['login_failed', 'admin_access', 'payment_created', 'data_breach_attempt'].includes(event)) {
      // TODO: Store in audit_logs table
    }
  }
}