'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService, User, AuthResult, SessionData } from '@/lib/auth-production'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<AuthResult & { sessionData?: SessionData }>
  register: (email: string, password: string, name: string) => Promise<AuthResult>
  logout: () => Promise<void>
  refreshSession: () => Promise<boolean>
  isAuthenticated: boolean
  isAdmin: boolean
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Handle hydration - only run client-side code after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load user on mount (client-side only)
  useEffect(() => {
    if (!mounted) return

    const loadUser = async () => {
      try {
        setLoading(true)
        const sessionToken = localStorage.getItem('session_token')
        
        if (sessionToken) {
          const currentUser = await authService.getCurrentUser(sessionToken)
          setUser(currentUser)
          
          // If session is invalid, try to refresh
          if (!currentUser) {
            const refreshToken = localStorage.getItem('refresh_token')
            if (refreshToken) {
              const refreshResult = await authService.refreshSession(refreshToken)
              if (refreshResult) {
                setUser(refreshResult.user)
                localStorage.setItem('session_token', refreshResult.sessionData.sessionToken)
                localStorage.setItem('refresh_token', refreshResult.sessionData.refreshToken)
                
                // Set secure cookie for middleware
                document.cookie = `session_token=${refreshResult.sessionData.sessionToken}; path=/; max-age=86400; SameSite=Strict; Secure=${location.protocol === 'https:'}`
              } else {
                // Clear invalid tokens
                localStorage.removeItem('session_token')
                localStorage.removeItem('refresh_token')
                localStorage.removeItem('user_data')
              }
            }
          }
        }
      } catch (err) {
        console.error('Error loading user:', err)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [mounted])

  // Login function
  const login = async (email: string, password: string): Promise<AuthResult & { sessionData?: SessionData }> => {
    setLoading(true)
    setError(null)

    try {
      const result = await authService.login(email, password)
      
      if (result.user && result.sessionData) {
        setUser(result.user)
        setError(null)
        
        // Store tokens securely
        localStorage.setItem('session_token', result.sessionData.sessionToken)
        localStorage.setItem('refresh_token', result.sessionData.refreshToken)
        localStorage.setItem('user_data', JSON.stringify(result.user))
        
        // Set secure cookie for middleware
        document.cookie = `session_token=${result.sessionData.sessionToken}; path=/; max-age=86400; SameSite=Strict; Secure=${location.protocol === 'https:'}`
        
        // Legacy cookie for backward compatibility
        document.cookie = `auth-token=${result.user.id}; path=/; max-age=86400; SameSite=Strict; Secure=${location.protocol === 'https:'}`
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

  // Register function
  const register = async (email: string, password: string, name: string): Promise<AuthResult> => {
    setLoading(true)
    setError(null)

    try {
      const result = await authService.register(email, password, name)
      
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

  // Logout function
  const logout = async () => {
    setLoading(true)
    
    try {
      const sessionToken = localStorage.getItem('session_token')
      await authService.logout(sessionToken || undefined)
      
      setUser(null)
      setError(null)
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Refresh session
  const refreshSession = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) return false

      const result = await authService.refreshSession(refreshToken)
      if (result) {
        setUser(result.user)
        localStorage.setItem('session_token', result.sessionData.sessionToken)
        localStorage.setItem('refresh_token', result.sessionData.refreshToken)
        localStorage.setItem('user_data', JSON.stringify(result.user))
        
        // Update cookie
        document.cookie = `session_token=${result.sessionData.sessionToken}; path=/; max-age=86400; SameSite=Strict; Secure=${location.protocol === 'https:'}`
        
        return true
      }
      
      return false
    } catch (err) {
      console.error('Refresh session error:', err)
      return false
    }
  }

  // Clear error
  const clearError = () => {
    setError(null)
  }

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshSession,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'A',
    clearError
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <AuthContext.Provider value={{
        user: null,
        loading: true,
        error: null,
        login: async () => ({ user: null, error: 'Loading...' }),
        register: async () => ({ user: null, error: 'Loading...' }),
        logout: async () => {},
        refreshSession: async () => false,
        isAuthenticated: false,
        isAdmin: false,
        clearError: () => {}
      }}>
        {children}
      </AuthContext.Provider>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}