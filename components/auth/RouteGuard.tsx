'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface RouteGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  redirectTo?: string
}

export function RouteGuard({ 
  children, 
  requireAuth = false, 
  requireAdmin = false,
  redirectTo = '/login'
}: RouteGuardProps) {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return // Wait for auth to load

    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo)
      return
    }

    if (requireAdmin && !isAdmin) {
      router.push(redirectTo)
      return
    }
  }, [isAuthenticated, isAdmin, loading, requireAuth, requireAdmin, redirectTo, router])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if auth requirements not met
  if (requireAuth && !isAuthenticated) {
    return null
  }

  if (requireAdmin && !isAdmin) {
    return null
  }

  return <>{children}</>
}