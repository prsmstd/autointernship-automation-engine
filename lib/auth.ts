// Industry standard authentication utilities
import { createSupabaseClient } from './supabase'

export interface User {
  id: string
  email: string
  name: string
  role: 'student' | 'admin'
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

// Mock users for demo mode
const MOCK_USERS = {
  'student@prismstudio.co.in': {
    id: 'student-1',
    email: 'student@prismstudio.co.in',
    name: 'Demo Student',
    role: 'student' as const,
    password: 'student123'
  },
  'admin@prismstudio.co.in': {
    id: 'admin-1',
    email: 'admin@prismstudio.co.in',
    name: 'Demo Admin',
    role: 'admin' as const,
    password: 'admin123'
  }
}

export class AuthService {
  private supabase = createSupabaseClient()

  // Check if we're in mock mode
  private isMockMode(): boolean {
    return !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      // Check mock users first
      const mockUser = MOCK_USERS[email as keyof typeof MOCK_USERS]
      if (mockUser && mockUser.password === password) {
        // Store in sessionStorage for client-side persistence
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('auth_user', JSON.stringify({
            id: mockUser.id,
            email: mockUser.email,
            name: mockUser.name,
            role: mockUser.role
          }))
        }
        return {
          user: {
            id: mockUser.id,
            email: mockUser.email,
            name: mockUser.name,
            role: mockUser.role
          },
          error: null
        }
      }

      // If not mock mode, try real authentication
      if (!this.isMockMode()) {
        const { data, error } = await this.supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) {
          return { user: null, error: error.message }
        }

        if (data.user) {
          // Get user profile from database
          try {
            const { data: profile } = await this.supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single()

            const user: User = {
              id: data.user.id,
              email: data.user.email || '',
              name: profile?.name || data.user.user_metadata?.name || 'User',
              role: profile?.role || 'student'
            }

            return { user, error: null }
          } catch (dbError) {
            // Fallback user profile
            const user: User = {
              id: data.user.id,
              email: data.user.email || '',
              name: data.user.user_metadata?.name || 'User',
              role: 'student'
            }
            return { user, error: null }
          }
        }
      }

      // No match found
      if (email in MOCK_USERS) {
        return { user: null, error: 'Invalid password' }
      } else {
        return { user: null, error: 'User not found. Use demo credentials: student@prismstudio.co.in / student123' }
      }
    } catch (error: any) {
      return { user: null, error: error.message || 'Authentication failed' }
    }
  }

  // Sign in with OAuth (Google)
  async signInWithOAuth(provider: 'google'): Promise<{ error: string | null }> {
    if (this.isMockMode()) {
      return { error: 'OAuth not available in demo mode. Use test credentials: student@prismstudio.co.in / student123' }
    }

    try {
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

  // Sign out
  async signOut(): Promise<void> {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('auth_user')
    }
    
    if (!this.isMockMode()) {
      await this.supabase.auth.signOut()
    }
  }

  // Get current user (client-side only)
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null
    
    try {
      const stored = sessionStorage.getItem('auth_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }

  // Check if user is admin
  isAdmin(): boolean {
    const user = this.getCurrentUser()
    return user?.role === 'admin'
  }
}

// Export singleton instance
export const authService = new AuthService()