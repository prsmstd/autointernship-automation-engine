'use client'

import { useState, useEffect, useCallback } from 'react'
import { authService, User, AuthState } from '@/lib/auth'

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })

  // Load user on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const user = authService.getCurrentUser()
        setState({
          user,
          loading: false,
          error: null
        })
      } catch (error: any) {
        setState({
          user: null,
          loading: false,
          error: error.message
        })
      }
    }

    loadUser()

    // Listen for storage changes (for multi-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_user') {
        loadUser()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Sign in
  const signIn = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    const { user, error } = await authService.signIn(email, password)
    
    setState({
      user,
      loading: false,
      error
    })

    return { user, error }
  }, [])

  // Sign in with OAuth
  const signInWithOAuth = useCallback(async (provider: 'google') => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    const { error } = await authService.signInWithOAuth(provider)
    
    if (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error
      }))
    }
    // If successful, user will be redirected
    
    return { error }
  }, [])

  // Sign out
  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }))
    
    await authService.signOut()
    
    setState({
      user: null,
      loading: false,
      error: null
    })
  }, [])

  return {
    ...state,
    signIn,
    signInWithOAuth,
    signOut,
    isAuthenticated: !!state.user,
    isAdmin: state.user?.role === 'admin'
  }
}