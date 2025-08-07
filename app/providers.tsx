'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createSupabaseClient } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  userProfile: any | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signOut: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  
  const supabase = createSupabaseClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        setLoading(true)
        
        // Only check cookies on client side to avoid hydration mismatch
        if (typeof window !== 'undefined') {
          // Check for authentication cookies first - this takes priority
          const cookies = document.cookie.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=')
            acc[key] = value
            return acc
          }, {} as Record<string, string>)
          
          if (cookies['mock-auth'] && cookies['mock-user-role'] && cookies['mock-user-email']) {
            const role = cookies['mock-user-role']
            const email = cookies['mock-user-email']
            
            console.log('Auth detected:', { role, email })
            
            // Create user object
            const authUser = {
              id: role === 'admin' ? 'admin-id' : 'student-id',
              email: email,
              user_metadata: { name: role === 'admin' ? 'Admin User' : 'Student User' }
            }
            
            const authProfile = {
              id: authUser.id,
              name: role === 'admin' ? 'Admin User' : 'Student User',
              email: email,
              role: role,
              domain: role === 'student' ? 'web_development' : null,
              hasSelectedDomain: true,
              created_at: new Date().toISOString()
            }
            
            setUser(authUser as any)
            setUserProfile(authProfile)
            setLoading(false)
            return
          }
        }

        // Only check real auth if no mock auth
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Fetch user profile
          try {
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            setUserProfile(profile)
          } catch (error) {
            console.warn('Could not fetch user profile:', error)
            // Create a fallback profile for real users
            setUserProfile({
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email,
              role: 'student',
              domain: null,
              hasSelectedDomain: false,
              created_at: new Date().toISOString()
            })
          }
        } else {
          setUserProfile(null)
        }
      } catch (error) {
        console.warn('Could not get session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes - but only if no mock auth
    const checkMockAuth = () => {
      const mockAuth = document.cookie.split(';').find(c => c.trim().startsWith('mock-auth='))
      return !!mockAuth
    }

    if (!checkMockAuth()) {
      try {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event: any, session: any) => {
            // Skip if mock auth is active
            if (checkMockAuth()) return
            
            setUser(session?.user ?? null)
            
            if (session?.user) {
              // Fetch user profile
              try {
                const { data: profile } = await supabase
                  .from('users')
                  .select('*')
                  .eq('id', session.user.id)
                  .single()
                
                setUserProfile(profile)
              } catch (error) {
                console.warn('Could not fetch user profile:', error)
                // Create a fallback profile for real users
                setUserProfile({
                  id: session.user.id,
                  name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                  email: session.user.email,
                  role: 'student',
                  domain: null,
                  hasSelectedDomain: false,
                  created_at: new Date().toISOString()
                })
              }
            } else {
              setUserProfile(null)
            }
            
            setLoading(false)
          }
        )

        return () => {
          try {
            subscription.unsubscribe()
          } catch (error) {
            console.warn('Could not unsubscribe:', error)
          }
        }
      } catch (error) {
        console.warn('Could not set up auth listener:', error)
        setLoading(false)
        return () => {}
      }
    }
  }, [])

  const signOut = async () => {
    try {
      // Clear mock auth cookies
      document.cookie = 'mock-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      document.cookie = 'mock-user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      document.cookie = 'mock-user-email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      
      await supabase.auth.signOut()
    } catch (error) {
      console.warn('Could not sign out:', error)
    } finally {
      setUser(null)
      setUserProfile(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}