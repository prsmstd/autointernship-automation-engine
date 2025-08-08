'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContextFinal'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return // Wait for auth to load

    if (!user) {
      router.push('/login')
      return
    }

    if (requireAdmin && user.role !== 'A') {
      router.push('/login')
      return
    }
  }, [user, loading, requireAdmin, router])

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!user) {
    return null
  }

  // Don't render if admin required but user is not admin
  if (requireAdmin && user.role !== 'A') {
    return null
  }

  return <>{children}</>
}