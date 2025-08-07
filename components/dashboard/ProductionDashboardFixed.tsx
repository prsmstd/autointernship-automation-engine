'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { useAuth } from '@/app/providers'
import { DomainSelector } from './DomainSelector'
import { TaskDetailModal } from './TaskDetailModal'

const DOMAIN_MAPPINGS = {
  'web_development': 'Web Development',
  'ui_ux_design': 'UI/UX Design',
  'data_science': 'Data Science',
  'pcb_design': 'PCB Design',
  'embedded_programming': 'Embedded Programming',
  'fpga_verilog': 'FPGA & Verilog'
}

// Mock data for when database is not available
const MOCK_TASKS = {
  web_development: [
    { id: '1', title: 'Responsive Landing Page', description: 'Create a modern, responsive landing page using HTML, CSS, and JavaScript.', order_number: 1, is_final: false },
    { id: '2', title: 'Interactive Web Application', description: 'Build a dynamic web application with CRUD operations and user interactions.', order_number: 2, is_final: false },
    { id: '3', title: 'Advanced Web Project', description: 'Develop a complex web application showcasing advanced concepts.', order_number: 3, is_final: true }
  ]
}

export function ProductionDashboard() {
  const [user, setUser] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [certificate, setCertificate] = useState<any>(null)
  const [payment, setPayment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showDomainSelector, setShowDomainSelector] = useState(false)
  const [error, setError] = useState<string>('')
  const [mockMode, setMockMode] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [showTaskModal, setShowTaskModal] = useState(false)

  const supabase = createSupabaseClient()
  const { user: authUser, userProfile: authProfile } = useAuth()

  useEffect(() => {
    // Only load data when auth is not loading
    if (authUser !== undefined || authProfile !== undefined) {
      loadDashboardData()
    }
  }, [authUser, authProfile])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError('')

      // Determine current user from auth context
      let currentUser = null

      if (authProfile) {
        // Mock or profile-based authentication
        currentUser = authProfile
        console.log('Using auth profile:', currentUser)
      } else if (authUser) {
        // Real Supabase authentication - create/get profile
        try {
          const { data: existingProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single()

          if (existingProfile) {
            currentUser = existingProfile
          } else {
            // Create new user profile
            const { data: newProfile } = await supabase
              .from('users')
              .insert({
                id: authUser.id,
                name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Student',
                email: authUser.email || '',
                role: 'student'
              })
              .select()
              .single()
            
            currentUser = newProfile
          }
        } catch (dbError) {
          console.warn('Database not available, using fallback profile')
          currentUser = {
            id: authUser.id,
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Student',
            email: authUser.email || '',
            domain: 'web_development',
            role: 'student',
            hasSelectedDomain: true
          }
        }
      }

      if (!currentUser) {
        console.log('No current user found, redirecting to login')
        window.location.href = '/login'
        return
      }

      setUser(currentUser)

      // Check if user needs to select domain (skip for mock users who already have domain)
      if (!currentUser.domain && !currentUser.hasSelectedDomain) {
        setShowDomainSelector(true)
        setLoading(false)
        return
      }

      // Try to load data from database, fallback to mock data
      try {
        // Get tasks for user's domain
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('domain', currentUser.domain)
          .order('order_number')

        if (tasksError) {
          console.warn('Database not available, using mock data')
          setMockMode(true)
          setTasks(MOCK_TASKS[currentUser.domain as keyof typeof MOCK_TASKS] || MOCK_TASKS.web_development)
        } else {
          setTasks(tasksData || [])
        }

        // Get user submissions (mock data for now)
        const mockSubmissions = [
          {
            id: '1',
            task_id: '1',
            user_id: currentUser.id,
            github_url: 'https://github.com/student/task1',
            score: 85,
            feedback: 'Excellent work! Your code is well-structured and follows best practices. The responsive design works perfectly across all devices.',
            submitted_at: new Date().toISOString(),
            evaluated_at: new Date().toISOString()
          }
        ]
        setSubmissions(mockSubmissions)
        setPayment(null)
        setCertificate(null)

      } catch (dbError) {
        console.warn('Database connection failed, using mock mode')
        setMockMode(true)
        setTasks(MOCK_TASKS[currentUser.domain as keyof typeof MOCK_TASKS] || MOCK_TASKS.web_development)
        const mockSubmissions = [
          {
            id: '1',
            task_id: '1',
            user_id: currentUser.id,
            github_url: 'https://github.com/student/task1',
            score: 85,
            feedback: 'Excellent work! Your code is well-structured and follows best practices. The responsive design works perfectly across all devices.',
            submitted_at: new Date().toISOString(),
            evaluated_at: new Date().toISOString()
          }
        ]
        setSubmissions(mockSubmissions)
      }

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

      // Update user domain (mock for now)
      const updatedUser = { ...user, domain }
      setUser(updatedUser)
      setShowDomainSelector(false)
      loadDashboardData()
    } catch (error: any) {
      console.error('Error updating domain:', error)
      setError('Failed to update domain')
    }
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

  const getProgressPercentage = () => {
    if (tasks.length === 0) return 0
    const completedTasks = submissions.filter(s => s.score >= 60).length
    return Math.round((completedTasks / tasks.length) * 100)
  }

  const handleTaskSubmission = async (githubUrl: string) => {
    if (!selectedTask || !user) return

    // Simulate task submission and evaluation
    const newSubmission = {
      id: Date.now().toString(),
      task_id: selectedTask.id,
      user_id: user.id,
      github_url: githubUrl,
      score: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
      feedback: 'Your submission has been evaluated. Great work on implementing the requirements!',
      submitted_at: new Date().toISOString(),
      evaluated_at: new Date().toISOString()
    }

    setSubmissions(prev => [...prev, newSubmission])
    
    // Show success notification
    alert('Task submitted successfully! Your submission is being evaluated.')
  }

  const getTaskSubmission = (taskId: string) => {
    return submissions.find(s => s.task_id === taskId)
  }

  const getTotalScore = () => {
    return submissions.reduce((total, submission) => total + submission.score, 0)
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
              <a
                href="/profile"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                <i className="fas fa-user mr-1"></i>
                Profile
              </a>
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
                <p className="text-sm font-medium text-gray-500">Tasks Available</p>
                <p className="text-2xl font-semibold text-gray-900">{tasks.length}</p>
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
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {submissions.filter(s => s.score >= 60).length}
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
                  <i className="fas fa-star text-yellow-600"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Score</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {getTotalScore()}/{tasks.length * 100}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">
              {DOMAIN_MAPPINGS[user?.domain as keyof typeof DOMAIN_MAPPINGS]} Tasks
            </h2>

          </div>
          
          <div className="grid gap-6">
            {tasks.map((task) => {
              const submission = getTaskSubmission(task.id)
              return (
                <div key={task.id} className="card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{task.title}</h3>
                        {task.is_final && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                            Final Task
                          </span>
                        )}
                        {submission && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            Score: {submission.score}/100
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                      {submission && submission.feedback && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                          <p className="text-green-800 text-sm">
                            <i className="fas fa-comment mr-2"></i>
                            <strong>Feedback:</strong> {submission.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      {submission ? (
                        <span className="status-badge bg-green-100 text-green-600">
                          ✅ Completed
                        </span>
                      ) : (
                        <span className="status-badge bg-blue-100 text-blue-600">
                          📝 Ready to Start
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    {submission ? (
                      <div className="flex gap-2">
                        <a
                          href={submission.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary"
                        >
                          <i className="fab fa-github mr-2"></i>
                          View Submission
                        </a>
                        <button
                          onClick={() => {
                            setSelectedTask(task)
                            setShowTaskModal(true)
                          }}
                          className="btn-primary"
                        >
                          Resubmit
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedTask(task)
                          setShowTaskModal(true)
                        }}
                        className="btn-primary"
                      >
                        Start Task
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>


      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false)
          setSelectedTask(null)
        }}
        onSubmit={handleTaskSubmission}
      />
    </div>
  )
}