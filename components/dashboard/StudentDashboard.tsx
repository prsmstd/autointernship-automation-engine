'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { DomainSelector } from './DomainSelector'
import { User, Settings, Bell, LogOut, ChevronDown } from 'lucide-react'

interface StudentDashboardProps {
  user: any
  tasks: any[]
  submissions: any[]
  hasPayment: boolean
  certificate: any
}

const DOMAIN_MAPPINGS = {
  'web_development': 'Web Development',
  'ui_ux_design': 'UI/UX Design',
  'data_science': 'Data Science',
  'pcb_design': 'PCB Design',
  'embedded_programming': 'Embedded Programming',
  'fpga_verilog': 'FPGA & Verilog'
}

export function StudentDashboard({
  user,
  tasks,
  submissions,
  hasPayment,
  certificate
}: StudentDashboardProps) {
  const router = useRouter()
  const [showDomainSelector, setShowDomainSelector] = useState(!user?.domain)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchUnreadAnnouncementsCount()
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchUnreadAnnouncementsCount = async () => {
    try {
      if (!user?.id) return

      // Get all announcements
      const { data: announcements, error: announcementsError } = await supabase
        .from('announcements')
        .select('id')
        .eq('is_active', true)

      if (announcementsError) throw announcementsError

      // Get read announcements for this user
      const { data: readAnnouncements, error: readError } = await supabase
        .from('announcement_reads')
        .select('announcement_id')
        .eq('user_id', user.id)

      if (readError) throw readError

      const readIds = new Set(readAnnouncements?.map((r: any) => r.announcement_id) || [])
      const unreadCount = announcements?.filter((a: any) => !readIds.has(a.id)).length || 0
      setUnreadCount(unreadCount)
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const handleDomainSelect = (domain: string) => {
    console.log('Domain selected:', domain)
    setShowDomainSelector(false)
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Calculate progress
  const completedTasks = submissions.filter(s => s.status === 'evaluated' && s.score >= 60).length
  const totalTasks = tasks.length
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  if (showDomainSelector) {
    return (
      <DomainSelector
        onSelect={handleDomainSelect}
        domains={DOMAIN_MAPPINGS}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-900">PrismStudio</h1>
              <span className="ml-4 text-sm text-gray-500">
                {DOMAIN_MAPPINGS[user?.domain as keyof typeof DOMAIN_MAPPINGS]} Internship
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowDomainSelector(true)}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                <i className="fas fa-exchange-alt mr-1"></i>
                Change Domain
              </button>

              {/* Announcements Bell */}
              <button
                onClick={() => router.push('/announcements')}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="View Announcements"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-600" />
                  </div>
                  <span className="text-sm text-gray-700 hidden sm:block">
                    {user.name || user.full_name}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {/* Dropdown Menu */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name || user.full_name}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        router.push('/profile')
                        setShowProfileDropdown(false)
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Profile Settings
                    </button>
                    
                    <button
                      onClick={() => {
                        router.push('/announcements')
                        setShowProfileDropdown(false)
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Bell className="h-4 w-4 mr-3" />
                      Announcements
                      {unreadCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    
                    <div className="border-t border-gray-100 mt-1">
                      <button
                        onClick={() => {
                          handleSignOut()
                          setShowProfileDropdown(false)
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Overview */}
        <div className="mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {DOMAIN_MAPPINGS[user?.domain as keyof typeof DOMAIN_MAPPINGS]} Progress
              </h2>
              <span className="text-sm text-gray-500">
                {completedTasks} of {totalTasks} tasks completed
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary-600">{completedTasks}</div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{totalTasks - completedTasks}</div>
                <div className="text-sm text-gray-500">Remaining</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{Math.round(progress)}%</div>
                <div className="text-sm text-gray-500">Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {submissions.length > 0
                    ? Math.round(submissions.reduce((acc, s) => acc + (s.score || 0), 0) / submissions.length)
                    : 0}%
                </div>
                <div className="text-sm text-gray-500">Avg Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Status */}
        {certificate && (
          <div className="mb-8">
            <div className="card bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-certificate text-green-600 text-xl"></i>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-green-800">
                    🎉 Certificate Issued!
                  </h3>
                  <p className="text-green-700">
                    Congratulations! Your {DOMAIN_MAPPINGS[user?.domain as keyof typeof DOMAIN_MAPPINGS]} certificate is ready.
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    Certificate ID: {certificate.certificate_id}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <a
                    href={certificate.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    <i className="fas fa-download mr-2"></i>
                    Download
                  </a>
                  <a
                    href={`/verify?id=${certificate.certificate_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                  >
                    <i className="fas fa-external-link-alt mr-2"></i>
                    Verify
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Required */}
        {!hasPayment && !certificate && (
          <div className="mb-8">
            <div className="card bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <i className="fas fa-trophy text-yellow-600 text-xl"></i>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-yellow-800">
                      🎯 All tasks completed! Get your certificate
                    </h3>
                    <p className="text-yellow-700">
                      Pay ₹99 to receive your official {DOMAIN_MAPPINGS[user?.domain as keyof typeof DOMAIN_MAPPINGS]} certificate
                    </p>
                  </div>
                </div>
                <button className="btn-primary">
                  <i className="fas fa-credit-card mr-2"></i>
                  Pay ₹99
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tasks */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">
              {DOMAIN_MAPPINGS[user?.domain as keyof typeof DOMAIN_MAPPINGS]} Tasks
            </h2>
            <div className="text-sm text-gray-500">
              Sequential completion required
            </div>
          </div>

          <div className="grid gap-6">
            <div className="card">
              <div className="text-center py-8">
                <i className="fas fa-info-circle text-blue-500 text-4xl mb-4"></i>
                <h3 className="text-lg font-semibold mb-2">This component is not used</h3>
                <p className="text-gray-600">
                  We're using MockDashboard instead for testing without API keys.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Domain Selector */}
      {showDomainSelector && (
        <DomainSelector
          onSelect={handleDomainSelect}
          domains={DOMAIN_MAPPINGS}
          onClose={() => setShowDomainSelector(false)}
        />
      )}
    </div>
  )
}