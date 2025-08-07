'use client'

import { useEffect, useState } from 'react'

interface ClientIconProps {
  icon: string
  className?: string
  style?: React.CSSProperties
}

export function ClientIcon({ icon, className = '', style }: ClientIconProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a placeholder during SSR to prevent hydration mismatch
    return <span className={`inline-block w-4 h-4 ${className}`} style={style} />
  }

  return (
    <i 
      className={`fas fa-${icon} ${className}`}
      style={style}
    />
  )
}