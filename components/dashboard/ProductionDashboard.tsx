'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { useAuth } from '@/app/providers'
import { DomainSelector } from './DomainSelector'
import { TaskCard } from './TaskCard'
import { SubmissionModal } from './SubmissionModal'
import { PaymentModal } from './PaymentModal'

const DOMAIN_MAPPINGS = {
  'web_development': 'Web Development',
  'ui_ux_design': 'UI/UX Design',
  'data_science': 'Data Science',
  'pcb_design': 'PCB Design',
  'embedded_programming': 'Embedded Programming',
  'fpga_verilog': 'FPGA & Verilog'
}

export function ProductionDashboard() {
  const [user, setUser] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [certificate, setCertificate] = useState<any>(null)
  const [payment, setPayment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showDomainSelector, setShowDomainSelector] = useState(false)
  const [error, setError] = useState<string>('')

  const supabase = createSupabaseClient()

  // Import useAuth hook
  const { user: authUser, userProfile: authProfile } = useAuth()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError('')

      // Use auth context user if available (for mock auth), otherwise try Supabase
      let currentUser = authUser
      let currentProfile = authProfile

      if (!currentUser) {
        // Try Supabase auth
        const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser()
        if (authError && !authUser) {
          throw new Error('Authentication failed')
        }
        currentUser = supabaseUser
      }

      if (!currentUser && !authUser) {
        setError('Please sign in to continue')
        return
      }

      // Use auth context profile if available (for mock auth)
      if (currentProfile) {
        setUser(currentProfile)
      } else if (currentUser) {
        // Get user profile from database
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUser.id)
          .single()

        if (profileError) {
          // Create user profile if it doesn't exist
          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert({
              id: currentUser.id,
              name: currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'Student',
              email: currentUser.email || '',
            })
            .select()
            .single()

          if (createError) {
            throw new Error('Failed to create user profile')
          }
          setUser(newProfile)
        } else {
          setUser(userProfile)
        }
      }

      const userProfile = currentProfile || user
      const userId = currentUser?.id || authUser?.id

      // Check if user needs to select domain
      if (!userProfile?.domain) {
        setShowDomainSelector(true)
        setLoading(false)
        return
      }

      // Get tasks for user's domain
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('domain', userProfile.domain)
        .order('order_number')

      if (tasksError) {
        console.error('Error loading tasks:', tasksError)
        setTasks([])
      } else {
        setTasks(tasksData || [])
      }

      // Get user submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('submissions')
        .select('*')
        .eq('user_id', userId)

      if (submissionsError) {
        console.error('Error loading submissions:', submissionsError)
        setSubmissions([])
      } else {
        setSubmissions(submissionsData || [])
      }

      // Get payment status
      const { data: paymentData } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'paid')
        .single()

      setPayment(paymentData)

      // Get certificate if exists
      const { data: certificateData } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', userId)
        .single()

      setCertificate(certificateData)

    } catch (error: any) {
      console.error('Error loading dashboard:', error)
      setError(error.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleDomainSelect = async (domain: string) => {
    try {
      if (!user) return

      // Update user domain
      const { error } = await supabase
        .from('users')
        .update({ domain })
        .eq('id', user.id)

      if (error) throw error

      setShowDomainSelector(false)
      loadDashboardData()
    } catch (error: any) {
      console.error('Error updating domain:', error)
      setError('Failed to update domain')
    }
  }

  const handleTaskSubmit = (task: any) => {
    setSelectedTask(task)
    setShowSubmissionModal(true)
  }

  const handlePayment = () => {
    setShowPaymentModal(true)
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

  const isTaskLocked = (task: any, index: number) => {
    if (index === 0) return false

    const previousTask = tasks[index - 1]
    if (!previousTask) return false

    const previousSubmission = submissions.find(s => s.task_id === previousTask.id)
    return !previousSubmission || previousSubmission.score < 60
  }

  const getTaskSubmission = (taskId: string) => {
    return submissions.find(s => s.task_id === taskId)
  }

  const allTasksCompleted = () => {
    return tasks.every(task => {
      const submission = getTaskSubmission(task.id)
      return submission && submission.score >= 60
    })
  }

  const canGetCertificate = () => {
    return allTasksCompleted() && !certificate
  }

  const getProgressPercentage = () => {
    if (tasks.length === 0) return 0
    const completedTasks = submissions.filter(s => s.score >= 60).length
    return Math.round((completedTasks / tasks.length) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
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
          <h1 className="text-2xl font-semibold mb-2">Error Loading Dashboard</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

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
              <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
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
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-500">
                {submissions.filter(s => s.score >= 60).length} of {tasks.length} tasks completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-tasks text-blue-600"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tasks Completed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {submissions.filter(s => s.score >= 60).length}/{tasks.length}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-chart-line text-green-600"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Average Score</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {submissions.length > 0
                    ? Math.round(submissions.reduce((acc, s) => acc + (s.score || 0), 0) / submissions.length)
                    : 0}%
                </p>
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
                <p className="text-sm font-medium text-gray-500">Payment Status</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {payment ? 'Paid' : 'Pending'}
                </p>
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
                <p className="text-sm font-medium text-gray-500">Certificate</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {certificate ? 'Issued' : 'Not Ready'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Section */}
        {certificate && (
          <div className="card mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-certificate text-green-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-green-800">
                    🎉 Congratulations! Your certificate is ready
                  </h3>
                  <p className="text-green-700">
                    Certificate ID: {certificate.certificate_id}
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <a
                  href={certificate.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  <i className="fas fa-download mr-2"></i>
                  Download Certificate
                </a>
                <a
                  href={`/verify?id=${certificate.certificate_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  <i className="fas fa-external-link-alt mr-2"></i>
                  Verify Certificate
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Payment Section */}
        {canGetCertificate() && !payment && (
          <div className="card mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-trophy text-blue-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-blue-800">
                    🎯 All tasks completed! Get your certificate
                  </h3>
                  <p className="text-blue-700">
                    Pay ₹99 to receive your official internship certificate
                  </p>
                </div>
              </div>
              <button
                onClick={handlePayment}
                className="btn-primary"
              >
                <i className="fas fa-credit-card mr-2"></i>
                Pay ₹99 for Certificate
              </button>
            </div>
          </div>
        )}

        {/* Tasks Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">
              {DOMAIN_MAPPINGS[user?.domain as keyof typeof DOMAIN_MAPPINGS]} Tasks
            </h2>
            <button
              onClick={() => setShowDomainSelector(true)}
              className="btn-secondary text-sm"
            >
              <i className="fas fa-exchange-alt mr-2"></i>
              Change Domain
            </button>
          </div>

          <div className="grid gap-6">
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                submission={getTaskSubmission(task.id)}
                isLocked={isTaskLocked(task, index)}
                onSubmit={() => handleTaskSubmit(task)}
              />
            ))}
          </div>
        </div>

        {/* Modals */}
        {showSubmissionModal && selectedTask && (
          <SubmissionModal
            task={selectedTask}
            submission={getTaskSubmission(selectedTask.id)}
            onClose={() => {
              setShowSubmissionModal(false)
              setSelectedTask(null)
              loadDashboardData()
            }}
          />
        )}

        {showPaymentModal && (
          <PaymentModal
            onClose={() => setShowPaymentModal(false)}
            onSuccess={() => {
              setShowPaymentModal(false)
              loadDashboardData()
            }}
          />
        )}

        {showDomainSelector && (
          <DomainSelector
            onSelect={handleDomainSelect}
            domains={DOMAIN_MAPPINGS}
            onClose={() => setShowDomainSelector(false)}
          />
        )}
      </div>
    </div>
  )
}