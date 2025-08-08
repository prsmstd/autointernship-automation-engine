'use client'

import { AuthProvider } from '@/contexts/AuthContextFinal'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}