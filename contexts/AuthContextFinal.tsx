'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService, type AuthUser as User, type AuthResponse as AuthResult } from '@/lib/auth-service'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<AuthResult>
  register: (email: string, password: string, name: string) => Promise<AuthResult>
  signInWithOAuth: (provider: 'google') => Promise<{ error: string | null }>
  logout: () => Promise<void>
  isAuthenticated: boolean
  isAdmin: boolean
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Ensure we're on the client side to prevent hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load user only after client-side hydration
  useEffect(() => {
    if (!isClient) return

    const loadUser = () => {
      try {
        const currentUser = authService.getCurrentUser()
        setUser(currentUser)
      } catch (err) {
        console.error('Error loading user:', err)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(loadUser, 100)
    return () => clearTimeout(timer)
  }, [isClient])

  const login = async (email: string, password: string): Promise<AuthResult> => {
    setLoading(true)
    setError(null)

    try {
      const result = await authService.signIn(email, password)
      
      if (result.user) {
        setUser(result.user)
        setError(null)
      } else {
        setError(result.error)
      }

      return result
    } catch (err: any) {
      const error = err.message || 'Login failed'
      setError(error)
      return { user: null, error }
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string): Promise<AuthResult> => {
    setLoading(true)
    setError(null)

    try {
      const result = await authService.signUp(email, password, name)
      
      if (result.error) {
        setError(result.error)
      }

      return result
    } catch (err: any) {
      const error = err.message || 'Registration failed'
      setError(error)
      return { user: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signInWithOAuth = async (provider: 'google'): Promise<{ error: string | null }> => {
    setLoading(true)
    setError(null)

    try {
      const result = await authService.signInWithOAuth(provider)
      
      if (result.error) {
        setError(result.error)
        setLoading(false)
      }

      return result
    } catch (err: any) {
      const error = err.message || 'OAuth failed'
      setError(error)
      setLoading(false)
      return { error }
    }
  }

  const logout = async () => {
    setLoading(true)
    
    try {
      await authService.signOut()
      setUser(null)
      setError(null)
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    signInWithOAuth,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'A',
    clearError
  }

  // Show loading until client-side hydration is complete
  if (!isClient) {
    return (
      <AuthContext.Provider value={{
        user: null,
        loading: true,
        error: null,
        login: async () => ({ user: null, error: 'Loading...' }),
        register: async () => ({ user: null, error: 'Loading...' }),
        signInWithOAuth: async () => ({ error: 'Loading...' }),
        logout: async () => {},
        isAuthenticated: false,
        isAdmin: false,
        clearError: () => {}
      }}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </AuthContext.Provider>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}