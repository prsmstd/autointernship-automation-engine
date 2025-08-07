'use client'

import { useAuth } from '@/app/providers'
import { useEffect, useState } from 'react'

export function AuthDebug() {
  const { user, userProfile, loading } = useAuth()
  const [cookies, setCookies] = useState<string>('')

  useEffect(() => {
    setCookies(document.cookie)
  }, [])

  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h4 className="font-bold mb-2">Auth Debug</h4>
      <div className="space-y-1">
        <div>Loading: {loading ? 'Yes' : 'No'}</div>
        <div>User: {user ? user.email : 'None'}</div>
        <div>Profile: {userProfile ? userProfile.role : 'None'}</div>
        <div>Cookies: {cookies.split(';').filter(c => c.includes('mock')).join(', ') || 'None'}</div>
      </div>
    </div>
  )
}