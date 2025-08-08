// Final production-ready authentication service
import { createSupabaseClient } from './supabase'

export interface User {
  id: string
  email: string
  name: string
  role: 'A' | 'S' // A=Admin, S=Student
  domain?: string
  emailVerified: boolean
}

export interface AuthResult {
  user: User | null
  error: string | null
}

class FinalAuthService {
  private supabase = createSupabaseClient()

  // Check if we have Supabase configured
  private isSupabaseConfigured(): boolean {
    return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  }

  // Login with email and password
  async login(email: string, password: string): Promise<AuthResult> {
    try {
      if (!this.isSupabaseConfigured()) {
        return { user: null, error: 'Authentication service not configured. Please contact administrator.' }
      }

      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      })

      if (error) {
        return { user: null, error: 'Invalid email or password' }
      }

      if (!data.user) {
        return { user: null, error: 'Login failed' }
      }

      // Get or create user profile
      let userProfile = null
      try {
        const { data: profile } = await this.supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (profile) {
          userProfile = profile
        } else {
          // Create new user profile
          const { data: newProfile } = await this.supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email || '',
              name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
              role: data.user.email === 'admin@prismstudio.co.in' ? 'A' : 'S',
              email_verified: true
            })
            .select()
            .single()
          
          userProfile = newProfile
        }
      } catch (dbError) {
        // Fallback if database is not set up
        userProfile = {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
          role: data.user.email === 'admin@prismstudio.co.in' ? 'A' : 'S',
          email_verified: true
        }
      }

      const user: User = {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        role: userProfile.role,
        domain: userProfile.domain,
        emailVerified: userProfile.email_verified || true
      }

      // Store user data
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(user))
        // Set cookie for middleware
        document.cookie = `auth-token=${user.id}; path=/; max-age=86400; SameSite=Lax`
      }

      return { user, error: null }
    } catch (error: any) {
      console.error('Login error:', error)
      return { user: null, error: 'Login failed. Please try again.' }
    }
  }

  // Register new user
  async register(email: string, password: string, name: string): Promise<AuthResult> {
    try {
      if (!this.isSupabaseConfigured()) {
        return { user: null, error: 'Registration service not configured. Please contact administrator.' }
      }

      const { data, error } = await this.supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            name: name.trim()
          }
        }
      })

      if (error) {
        return { user: null, error: error.message }
      }

      if (data.user && !data.session) {
        return { 
          user: null, 
          error: 'Registration successful! Please check your email to verify your account before logging in.' 
        }
      }

      return { user: null, error: 'Registration completed. Please verify your email.' }
    } catch (error: any) {
      console.error('Registration error:', error)
      return { user: null, error: 'Registration failed. Please try again.' }
    }
  }

  // Sign in with OAuth (Google)
  async signInWithOAuth(provider: 'google'): Promise<{ error: string | null }> {
    try {
      if (!this.isSupabaseConfigured()) {
        return { error: 'OAuth service not configured. Please contact administrator.' }
      }

      const { error } = await this.supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      return { error: error?.message || null }
    } catch (error: any) {
      return { error: error.message || 'OAuth authentication failed' }
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null
    
    try {
      const stored = localStorage.getItem('auth_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      if (this.isSupabaseConfigured()) {
        await this.supabase.auth.signOut()
      }
    } catch (error) {
      console.error('Logout error:', error)
    }

    // Clear client storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_user')
      // Clear cookies
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }

  // Check if admin
  isAdmin(): boolean {
    const user = this.getCurrentUser()
    return user?.role === 'A'
  }
}

// Export singleton
export const authService = new FinalAuthService()