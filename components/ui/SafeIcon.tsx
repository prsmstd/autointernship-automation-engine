'use client'

import { useEffect, useState } from 'react'

interface SafeIconProps {
  className: string
  fallback?: string
}

export function SafeIcon({ className, fallback = '' }: SafeIconProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a simple placeholder during SSR
    return <span className="inline-block w-4 h-4" />
  }

  return <i className={className} />
}

// Specific icon components to prevent hydration issues
export function SpinnerIcon({ className = '' }: { className?: string }) {
  return <SafeIcon className={`fas fa-spinner fa-spin ${className}`} />
}

export function SignInIcon({ className = '' }: { className?: string }) {
  return <SafeIcon className={`fas fa-sign-in-alt ${className}`} />
}