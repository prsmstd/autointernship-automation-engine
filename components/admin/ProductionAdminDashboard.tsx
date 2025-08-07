'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { useAuth } from '@/app/providers'
import Link from 'next/link'

const DOMAIN_MAPPINGS = {
  'web_development': 'Web Development',
  'ui_ux_design': 'UI/UX Design',
  'data_science': 'Data Science',
  'pcb_design': 'PCB Design',
  'embedded_programming': 'Embedded Programming',
  'fpga_verilog': 'FPGA & Verilog'
}

export function ProductionAdminDashboard() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<any>({})
  const [users, setUsers] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [certificates, setCertificates] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const supabase = createSupabaseClient()

  useEffect(() => {
    if (!authLoading) {
      loadAdminData()
    }
  }, [authLoading])

  const loadAdminData = async () => {
    try {
      setLoading(true)
      setError('')

      // Check if user is admin (handle both mock and real auth)
      let currentUserProfile = userProfile

      console.log('Admin dashboard - checking auth:', { user, userProfile })

      // If no profile but we have a user, try to get/create profile
      if (!currentUserProfile && user) {
        try {
          const { data: existingProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

          if (existingProfile) {
            currentUserProfile = existingProfile
          } else {
            // Create profile for new user
            const { data: newProfile } = await supabase
              .from('users')
              .insert({
                id: user.id,
                name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                email: user.email || '',
                role: 'student' // Default role
              })
              .select()
              .single()
            
            currentUserProfile = newProfile
          }
        } catch (dbError) {
          console.warn('Database not available for profile creation')
          // For real users without database, create fallback profile
          if (user.email) {
            currentUserProfile = {
              id: user.id,
              name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
              email: user.email,
              role: 'student', // Default role
              created_at: new Date().toISOString()
            }
          }
        }
      }

      if (!currentUserProfile) {
        setError('Authentication required. Please sign in.')
        return
      }

      if (currentUserProfile.role !== 'admin') {
        setError('Access denied. Admin privileges required.')
        return
      }

      // Try to load data from database, fallback to mock data
      let usersData, submissionsData, paymentsData, certificatesData
      
      try {
        [usersData, submissionsData, paymentsData, certificatesData] = await Promise.all([
          supabase.from('users').select('*').order('created_at', { ascending: false }),
          supabase.from('submissions').select(`
            *,
            users:user_id (name, email),
            tasks:task_id (title, domain)
          `).order('submitted_at', { ascending: false }),
          supabase.from('payments').select(`
            *,
            users:user_id (name, email)
          `).order('created_at', { ascending: false }),
          supabase.from('certificates').select(`
            *,
            users:user_id (name, email, domain)
          `).order('issued_at', { ascending: false })
        ])

        // Set data (use empty arrays if error)
        setUsers(usersData.data || [])
        setSubmissions(submissionsData.data || [])
        setPayments(paymentsData.data || [])
        setCertificates(certificatesData.data || [])
      } catch (dbError) {
        console.warn('Database not available, using mock data')
        
        // Create mock data
        const mockUsers = [
          {
            id: 'student-id',
            name: 'Student User',
            email: 'student@prismstudio.co.in',
            role: 'student',
            domain: 'web_development',
            created_at: new Date().toISOString()
          }
        ]
        
        const mockSubmissions = [
          {
            id: '1',
            user_id: 'student-id',
            task_id: '1',
            github_url: 'https://github.com/student/task1',
            score: 85,
            feedback: 'Great work! Well-structured code with good documentation.',
            submitted_at: new Date().toISOString(),
            users: { name: 'Student User', email: 'student@prismstudio.co.in' },
            tasks: { title: 'Responsive Landing Page', domain: 'web_development' }
          }
        ]
        
        const mockPayments = [
          {
            id: '1',
            user_id: 'student-id',
            amount: 9900, // ₹99 in paise
            status: 'paid',
            created_at: new Date().toISOString(),
            users: { name: 'Student User', email: 'student@prismstudio.co.in' }
          }
        ]
        
        const mockCertificates = [
          {
            id: '1',
            user_id: 'student-id',
            certificate_id: 'PRISM-2025-WEB001',
            issued_at: new Date().toISOString(),
            users: { name: 'Student User', email: 'student@prismstudio.co.in', domain: 'web_development' }
          }
        ]
        
        // Set mock data
        setUsers(mockUsers)
        setSubmissions(mockSubmissions)
        setPayments(mockPayments)
        setCertificates(mockCertificates)
        
        // Create mock data objects for stats calculation
        usersData = { data: mockUsers }
        submissionsData = { data: mockSubmissions }
        paymentsData = { data: mockPayments }
        certificatesData = { data: mockCertificates }
      }

      // Calculate stats using the data (either from DB or mock)
      const totalUsers = usersData?.data?.length || 0
      const totalSubmissions = submissionsData?.data?.length || 0
      const totalPayments = paymentsData?.data?.filter((p: any) => p.status === 'paid').length || 0
      const totalCertificates = certificatesData?.data?.length || 0
      const revenue = paymentsData?.data?.filter((p: any) => p.status === 'paid').reduce((acc: number, p: any) => acc + p.amount, 0) || 0

      // Domain breakdown
      const domainBreakdown: Record<string, number> = {}
      usersData?.data?.forEach((user: any) => {
        if (user.domain) {
          domainBreakdown[user.domain] = (domainBreakdown[user.domain] || 0) + 1
        }
      })

      setStats({
        totalUsers,
        totalSubmissions,
        totalPayments,
        totalCertificates,
        revenue,
        domainBreakdown
      })

    } catch (error: any) {
      console.error('Error loading admin data:', error)
      setError(error.message || 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount / 100) // Convert from paise to rupees
  }

  const handleSignOut = async () => {
    // Clear mock auth cookies
    document.cookie = 'mock-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'mock-user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'mock-user-email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.warn('Error signing out:', error)
    }
    
    window.location.href = '/'
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
          </div>
          <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-900">PrismStudio Admin</h1>

            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-sm text-primary-600 hover:text-primary-700">
                ← Back to Home
              </Link>
              <span className="text-sm text-gray-700">Welcome, {userProfile?.name}</span>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-users text-blue-600"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-file-alt text-green-600"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Submissions</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalSubmissions}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-credit-card text-purple-600"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Payments</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalPayments}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-certificate text-yellow-600"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Certificates</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalCertificates}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue and Domain Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Revenue Generated</h3>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatCurrency(stats.revenue || 0)}
            </div>
            <p className="text-sm text-gray-500">
              From {stats.totalPayments} successful payments
            </p>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Domain Distribution</h3>
            <div className="space-y-2">
              {Object.entries(stats.domainBreakdown || {}).map(([domain, count]) => (
                <div key={domain} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {DOMAIN_MAPPINGS[domain as keyof typeof DOMAIN_MAPPINGS] || domain}
                  </span>
                  <span className="text-sm font-semibold">{count as number}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: 'fas fa-chart-bar' },
              { id: 'users', name: 'Users', icon: 'fas fa-users' },
              { id: 'submissions', name: 'Submissions', icon: 'fas fa-file-alt' },
              { id: 'payments', name: 'Payments', icon: 'fas fa-credit-card' },
              { id: 'certificates', name: 'Certificates', icon: 'fas fa-certificate' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className={`${tab.icon} mr-2`}></i>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">All Users</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Domain
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {DOMAIN_MAPPINGS[user.domain as keyof typeof DOMAIN_MAPPINGS] || user.domain || 'Not Selected'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">System Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">System Features</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    Multi-domain internship support
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    AI-powered evaluation system
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    Automated certificate generation
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    Payment processing integration
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    Certificate verification system
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <Link href="/dashboard" className="block text-sm text-primary-600 hover:text-primary-700">
                    → View Student Dashboard
                  </Link>
                  <Link href="/verify?id=PRISM-2025-WEB001" className="block text-sm text-primary-600 hover:text-primary-700">
                    → Test Certificate Verification
                  </Link>
                  <button 
                    onClick={loadAdminData}
                    className="block text-sm text-primary-600 hover:text-primary-700"
                  >
                    → Refresh Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add other tab content as needed */}
      </div>
    </div>
  )
}