// Production-ready authentication service with security best practices
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createSupabaseClient } from './supabase'

export interface User {
  id: string
  email: string
  name: string
  role: 'A' | 'S' // A=Admin, S=Student
  domain?: string
  emailVerified: boolean
  profileCompleted: boolean
  lastLogin?: string
}

export interface AuthResult {
  user: User | null
  error: string | null
  requiresEmailVerification?: boolean
}

export interface SessionData {
  sessionToken: string
  refreshToken: string
  expiresAt: string
}

class ProductionAuthService {
  private supabase = createSupabaseClient()
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'
  private readonly SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours
  private readonly REFRESH_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days
  private readonly MAX_LOGIN_ATTEMPTS = 5
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

  // Hash password using bcrypt
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return bcrypt.hash(password, saltRounds)
  }

  // Verify password
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  // Generate secure tokens
  private generateTokens(userId: string, role: string): { sessionToken: string; refreshToken: string } {
    const sessionToken = jwt.sign(
      { 
        userId, 
        role, 
        type: 'session',
        iat: Math.floor(Date.now() / 1000)
      },
      this.JWT_SECRET,
      { expiresIn: '24h' }
    )

    const refreshToken = jwt.sign(
      { 
        userId, 
        type: 'refresh',
        iat: Math.floor(Date.now() / 1000)
      },
      this.JWT_SECRET,
      { expiresIn: '7d' }
    )

    return { sessionToken, refreshToken }
  }

  // Verify JWT token
  private verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.JWT_SECRET)
    } catch (error) {
      return null
    }
  }

  // Get client IP and user agent
  private getClientInfo(): { ipAddress: string; userAgent: string } {
    if (typeof window === 'undefined') {
      return { ipAddress: '127.0.0.1', userAgent: 'Server' }
    }
    
    return {
      ipAddress: '127.0.0.1', // In production, get from headers
      userAgent: navigator.userAgent
    }
  }

  // Check if account is locked
  private async isAccountLocked(userId: string): Promise<boolean> {
    try {
      const { data: user } = await this.supabase
        .from('users')
        .select('failed_login_attempts, locked_until')
        .eq('id', userId)
        .single()

      if (!user) return false

      if (user.locked_until && new Date(user.locked_until) > new Date()) {
        return true
      }

      return user.failed_login_attempts >= this.MAX_LOGIN_ATTEMPTS
    } catch (error) {
      console.error('Error checking account lock:', error)
      return false
    }
  }

  // Update login attempts
  private async updateLoginAttempts(userId: string, success: boolean): Promise<void> {
    try {
      if (success) {
        // Reset failed attempts on successful login
        await this.supabase
          .from('users')
          .update({
            failed_login_attempts: 0,
            locked_until: null,
            last_login: new Date().toISOString()
          })
          .eq('id', userId)
      } else {
        // Increment failed attempts
        const { data: user } = await this.supabase
          .from('users')
          .select('failed_login_attempts')
          .eq('id', userId)
          .single()

        const attempts = (user?.failed_login_attempts || 0) + 1
        const lockUntil = attempts >= this.MAX_LOGIN_ATTEMPTS 
          ? new Date(Date.now() + this.LOCKOUT_DURATION).toISOString()
          : null

        await this.supabase
          .from('users')
          .update({
            failed_login_attempts: attempts,
            locked_until: lockUntil
          })
          .eq('id', userId)
      }
    } catch (error) {
      console.error('Error updating login attempts:', error)
    }
  }

  // Create session in database
  private async createSession(userId: string, sessionToken: string, refreshToken: string): Promise<void> {
    const { ipAddress, userAgent } = this.getClientInfo()
    const expiresAt = new Date(Date.now() + this.SESSION_DURATION).toISOString()

    try {
      // Clean up old sessions for this user
      await this.supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', userId)
        .lt('expires_at', new Date().toISOString())

      // Create new session
      await this.supabase
        .from('user_sessions')
        .insert({
          user_id: userId,
          session_token: sessionToken,
          refresh_token: refreshToken,
          ip_address: ipAddress,
          user_agent: userAgent,
          expires_at: expiresAt
        })
    } catch (error) {
      console.error('Error creating session:', error)
    }
  }

  // Validate session
  private async validateSession(sessionToken: string): Promise<User | null> {
    try {
      // Verify JWT
      const decoded = this.verifyToken(sessionToken)
      if (!decoded || decoded.type !== 'session') {
        return null
      }

      // Check session in database
      const { data: session } = await this.supabase
        .from('user_sessions')
        .select('user_id, expires_at, is_active')
        .eq('session_token', sessionToken)
        .single()

      if (!session || !session.is_active || new Date(session.expires_at) < new Date()) {
        return null
      }

      // Get user data
      const { data: user } = await this.supabase
        .from('users')
        .select('id, email, name, role, domain, email_verified, profile_completed, last_login')
        .eq('id', session.user_id)
        .single()

      if (!user) return null

      // Update last accessed
      await this.supabase
        .from('user_sessions')
        .update({ last_accessed: new Date().toISOString() })
        .eq('session_token', sessionToken)

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        domain: user.domain,
        emailVerified: user.email_verified,
        profileCompleted: user.profile_completed,
        lastLogin: user.last_login
      }
    } catch (error) {
      console.error('Error validating session:', error)
      return null
    }
  }

  // Login with email and password
  async login(email: string, password: string): Promise<AuthResult & { sessionData?: SessionData }> {
    try {
      // Input validation
      if (!email || !password) {
        return { user: null, error: 'Email and password are required' }
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { user: null, error: 'Invalid email format' }
      }

      // Get user from database
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('id, email, name, role, domain, password_hash, email_verified, profile_completed, failed_login_attempts, locked_until')
        .eq('email', email.toLowerCase())
        .single()

      if (userError || !user) {
        return { user: null, error: 'Invalid email or password' }
      }

      // Check if account is locked
      if (await this.isAccountLocked(user.id)) {
        return { user: null, error: 'Account temporarily locked due to multiple failed login attempts. Please try again later.' }
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(password, user.password_hash)
      
      if (!isValidPassword) {
        await this.updateLoginAttempts(user.id, false)
        return { user: null, error: 'Invalid email or password' }
      }

      // Check email verification
      if (!user.email_verified) {
        return { 
          user: null, 
          error: 'Please verify your email address before logging in',
          requiresEmailVerification: true
        }
      }

      // Generate tokens
      const { sessionToken, refreshToken } = this.generateTokens(user.id, user.role)
      
      // Create session
      await this.createSession(user.id, sessionToken, refreshToken)
      
      // Update login success
      await this.updateLoginAttempts(user.id, true)

      // Log audit event
      await this.logAuditEvent(user.id, 'login', 'user', user.id)

      const userData: User = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        domain: user.domain,
        emailVerified: user.email_verified,
        profileCompleted: user.profile_completed,
        lastLogin: new Date().toISOString()
      }

      const sessionData: SessionData = {
        sessionToken,
        refreshToken,
        expiresAt: new Date(Date.now() + this.SESSION_DURATION).toISOString()
      }

      return { user: userData, error: null, sessionData }
    } catch (error: any) {
      console.error('Login error:', error)
      return { user: null, error: 'Login failed. Please try again.' }
    }
  }

  // Register new user
  async register(email: string, password: string, name: string): Promise<AuthResult> {
    try {
      // Input validation
      if (!email || !password || !name) {
        return { user: null, error: 'All fields are required' }
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { user: null, error: 'Invalid email format' }
      }

      if (password.length < 8) {
        return { user: null, error: 'Password must be at least 8 characters long' }
      }

      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        return { user: null, error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' }
      }

      // Check if user already exists
      const { data: existingUser } = await this.supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single()

      if (existingUser) {
        return { user: null, error: 'An account with this email already exists' }
      }

      // Hash password
      const passwordHash = await this.hashPassword(password)

      // Generate email verification token
      const emailVerificationToken = jwt.sign(
        { email: email.toLowerCase(), type: 'email_verification' },
        this.JWT_SECRET,
        { expiresIn: '24h' }
      )

      // Create user
      const { data: newUser, error: createError } = await this.supabase
        .from('users')
        .insert({
          email: email.toLowerCase(),
          password_hash: passwordHash,
          name: name.trim(),
          role: 'S', // Default to student
          email_verification_token: emailVerificationToken
        })
        .select('id, email, name, role')
        .single()

      if (createError || !newUser) {
        console.error('User creation error:', createError)
        return { user: null, error: 'Failed to create account. Please try again.' }
      }

      // Log audit event
      await this.logAuditEvent(newUser.id, 'register', 'user', newUser.id)

      // TODO: Send verification email
      console.log('Email verification token:', emailVerificationToken)

      return { 
        user: null, 
        error: null,
        requiresEmailVerification: true
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      return { user: null, error: 'Registration failed. Please try again.' }
    }
  }

  // Get current user from session token
  async getCurrentUser(sessionToken?: string): Promise<User | null> {
    if (!sessionToken) {
      if (typeof window === 'undefined') return null
      sessionToken = localStorage.getItem('session_token') || undefined
    }

    if (!sessionToken) return null

    return this.validateSession(sessionToken)
  }

  // Logout
  async logout(sessionToken?: string): Promise<void> {
    try {
      if (!sessionToken && typeof window !== 'undefined') {
        sessionToken = localStorage.getItem('session_token') || undefined
      }

      if (sessionToken) {
        // Get user for audit log
        const user = await this.validateSession(sessionToken)
        
        // Invalidate session in database
        await this.supabase
          .from('user_sessions')
          .update({ is_active: false })
          .eq('session_token', sessionToken)

        // Log audit event
        if (user) {
          await this.logAuditEvent(user.id, 'logout', 'user', user.id)
        }
      }

      // Clear client-side storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('session_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_data')
        
        // Clear cookies
        document.cookie = 'session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure'
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure'
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Refresh session
  async refreshSession(refreshToken: string): Promise<{ sessionData: SessionData; user: User } | null> {
    try {
      const decoded = this.verifyToken(refreshToken)
      if (!decoded || decoded.type !== 'refresh') {
        return null
      }

      // Check refresh token in database
      const { data: session } = await this.supabase
        .from('user_sessions')
        .select('user_id, is_active')
        .eq('refresh_token', refreshToken)
        .single()

      if (!session || !session.is_active) {
        return null
      }

      // Get user
      const { data: user } = await this.supabase
        .from('users')
        .select('id, email, name, role, domain, email_verified, profile_completed')
        .eq('id', session.user_id)
        .single()

      if (!user) return null

      // Generate new tokens
      const { sessionToken: newSessionToken, refreshToken: newRefreshToken } = this.generateTokens(user.id, user.role)

      // Update session
      await this.supabase
        .from('user_sessions')
        .update({
          session_token: newSessionToken,
          refresh_token: newRefreshToken,
          expires_at: new Date(Date.now() + this.SESSION_DURATION).toISOString(),
          last_accessed: new Date().toISOString()
        })
        .eq('refresh_token', refreshToken)

      const userData: User = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        domain: user.domain,
        emailVerified: user.email_verified,
        profileCompleted: user.profile_completed
      }

      const sessionData: SessionData = {
        sessionToken: newSessionToken,
        refreshToken: newRefreshToken,
        expiresAt: new Date(Date.now() + this.SESSION_DURATION).toISOString()
      }

      return { sessionData, user: userData }
    } catch (error) {
      console.error('Refresh session error:', error)
      return null
    }
  }

  // Log audit events
  private async logAuditEvent(userId: string, action: string, resourceType: string, resourceId: string, oldValues?: any, newValues?: any): Promise<void> {
    try {
      const { ipAddress, userAgent } = this.getClientInfo()
      
      await this.supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          old_values: oldValues,
          new_values: newValues,
          ip_address: ipAddress,
          user_agent: userAgent
        })
    } catch (error) {
      console.error('Error logging audit event:', error)
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem('session_token')
  }

  // Check if user is admin
  async isAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return user?.role === 'A'
  }
}

// Export singleton instance
export const authService = new ProductionAuthService()