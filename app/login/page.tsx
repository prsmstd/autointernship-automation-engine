'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createSupabaseClient } from '@/lib/supabase'
import { SpinnerIcon, SignInIcon } from '@/components/ui/SafeIcon'

export default function LoginPage() {
  const [isLogin] = useState(true) // Always true for registered students only

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createSupabaseClient()



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Check for test credentials first
      const mockStudentEmail = 'student@prismstudio.co.in'
      const mockStudentPassword = 'student123'
      const mockAdminEmail = 'admin@prismstudio.co.in'
      const mockAdminPassword = 'admin123'

      console.log('Login attempt:', { email: formData.email, password: formData.password })

      if (formData.email === mockStudentEmail && formData.password === mockStudentPassword) {
        // Student login - set cookie for middleware bypass
        document.cookie = 'mock-auth=student; path=/; max-age=86400'
        document.cookie = 'mock-user-role=student; path=/; max-age=86400'
        document.cookie = 'mock-user-email=student@prismstudio.co.in; path=/; max-age=86400'

        console.log('Student login successful')
        setLoading(false)

        // Small delay to ensure cookies are set
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 100)
        return
      }

      if (formData.email === mockAdminEmail && formData.password === mockAdminPassword) {
        // Admin login - set cookie for middleware bypass
        document.cookie = 'mock-auth=admin; path=/; max-age=86400'
        document.cookie = 'mock-user-role=admin; path=/; max-age=86400'
        document.cookie = 'mock-user-email=admin@prismstudio.co.in; path=/; max-age=86400'

        console.log('Admin login successful')
        setLoading(false)

        // Small delay to ensure cookies are set
        setTimeout(() => {
          window.location.href = '/admin'
        }, 100)
        return
      }

      // If no test credentials match, show error
      if (formData.email === mockStudentEmail || formData.email === mockAdminEmail) {
        throw new Error('Invalid password')
      } else {
        throw new Error('User not found. Only registered students can login.')
      }

      // Real login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (error) throw error

      // Check user role and redirect
      if (data.user) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single()

        if (userProfile?.role === 'admin') {
          window.location.href = '/admin'
        } else {
          window.location.href = '/dashboard'
        }
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PrismStudio
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Back to Home
              </Link>
              <Link href="/apply" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full font-semibold hover:shadow-lg transition-all duration-300">
                Apply for Internship
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Login Form */}
      <div className="py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">
              Access your internship dashboard (registered students only)
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">
                Student Login
              </h2>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-gray-700">Password</label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={async () => {
                          if (!formData.email) {
                            setError('Please enter your email address first')
                            return
                          }
                          try {
                            setLoading(true)
                            const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
                              redirectTo: `${window.location.origin}/auth/reset-password`
                            })
                            if (error) throw error
                            alert('Password reset link sent to your email!')
                          } catch (error: any) {
                            setError(error.message)
                          } finally {
                            setLoading(false)
                          }
                        }}
                        className="text-xs text-red-600 hover:text-red-800 font-medium underline-offset-4 hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <SpinnerIcon className="mr-2" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <SignInIcon className="mr-2" />
                      Sign In
                    </>
                  )}
                </button>
              </form>

              {/* Google Sign In Option */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setLoading(true)
                      const { error } = await supabase.auth.signInWithOAuth({
                        provider: 'google',
                        options: {
                          redirectTo: `${window.location.origin}/auth/callback`
                        }
                      })
                      if (error) throw error
                    } catch (error: any) {
                      setError(error.message)
                      setLoading(false)
                    }
                  }}
                  disabled={loading}
                  className="mt-4 w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>
                <p className="text-xs text-center text-gray-500 mt-2">
                  Recommended for quick and secure access
                </p>
              </div>

              {/* Forgot Password */}
              {isLogin && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!formData.email) {
                        setError('Please enter your email address first')
                        return
                      }
                      try {
                        setLoading(true)
                        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
                          redirectTo: `${window.location.origin}/auth/reset-password`
                        })
                        if (error) throw error
                        alert('Password reset link sent to your email!')
                      } catch (error: any) {
                        setError(error.message)
                      } finally {
                        setLoading(false)
                      }
                    }}
                    className="text-red-600 hover:text-red-800 font-medium text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}

              {/* Registration Notice */}
              {isLogin && (
                <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-xs text-center">
                    <strong>For registered students only.</strong> If you haven't applied for an internship yet, please visit our{' '}
                    <Link href="/apply" className="text-blue-600 hover:text-blue-800 font-medium underline">
                      application page
                    </Link>{' '}
                    first.
                  </p>
                </div>
              )}




            </div>
          </div>
        </div>
      </div>
    </div>
  )
}