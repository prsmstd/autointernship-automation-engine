'use client'

import { useState } from 'react'
import { DomainSelector } from './DomainSelector'

const DOMAIN_MAPPINGS = {
  'web_development': 'Web Development',
  'ui_ux_design': 'UI/UX Design',
  'data_science': 'Data Science',
  'pcb_design': 'PCB Design',
  'embedded_programming': 'Embedded Programming',
  'fpga_verilog': 'FPGA & Verilog'
}

const MOCK_TASKS = {
  web_development: [
    {
      id: '1',
      title: 'Responsive Landing Page',
      description: 'Create a modern, responsive landing page using HTML, CSS, and JavaScript.',
      order_number: 1,
      is_final: false
    },
    {
      id: '2',
      title: 'Interactive Web Application',
      description: 'Build a dynamic web application with CRUD operations and user interactions.',
      order_number: 2,
      is_final: false
    },
    {
      id: '3',
      title: 'Advanced Web Project',
      description: 'Develop a complex web application showcasing advanced concepts.',
      order_number: 3,
      is_final: true
    }
  ],
  ui_ux_design: [
    {
      id: '4',
      title: 'Mobile App Wireframes',
      description: 'Design comprehensive wireframes and interactive prototypes for a mobile application.',
      order_number: 1,
      is_final: false
    },
    {
      id: '5',
      title: 'Design System Creation',
      description: 'Create a comprehensive design system with components and style guides.',
      order_number: 2,
      is_final: false
    },
    {
      id: '6',
      title: 'Complete Product Design',
      description: 'Design a complete digital product from concept to high-fidelity prototypes.',
      order_number: 3,
      is_final: true
    }
  ]
}

export function MockDashboard() {
  const [selectedDomain, setSelectedDomain] = useState<string>('')
  const [showDomainSelector, setShowDomainSelector] = useState(true)
  const [mockSubmissions, setMockSubmissions] = useState<any[]>([])

  const handleDomainSelect = (domain: string) => {
    setSelectedDomain(domain)
    setShowDomainSelector(false)
  }

  const handleTaskSubmit = async (taskId: string, githubLink: string) => {
    // Mock submission
    const newSubmission = {
      id: Date.now().toString(),
      task_id: taskId,
      github_link: githubLink,
      status: 'pending',
      submitted_at: new Date().toISOString()
    }

    setMockSubmissions(prev => [...prev, newSubmission])

    // Mock AI evaluation after 3 seconds
    setTimeout(() => {
      const score = Math.floor(Math.random() * 40) + 60 // 60-100
      setMockSubmissions(prev => 
        prev.map(sub => 
          sub.id === newSubmission.id 
            ? {
                ...sub,
                status: 'evaluated',
                score,
                ai_feedback: {
                  functionality: Math.floor(score / 10),
                  code_quality: Math.floor(score / 10),
                  best_practices: Math.floor(score / 10),
                  feedback: `Mock AI evaluation: Score ${score}/100. Good work with room for improvement.`,
                  strengths: ['Working functionality', 'Good structure'],
                  improvements: ['Add documentation', 'Improve error handling']
                },
                evaluated_at: new Date().toISOString()
              }
            : sub
        )
      )
    }, 3000)
  }

  if (showDomainSelector) {
    return (
      <DomainSelector
        onSelect={handleDomainSelect}
        domains={DOMAIN_MAPPINGS}
      />
    )
  }

  const tasks = MOCK_TASKS[selectedDomain as keyof typeof MOCK_TASKS] || []
  const completedTasks = mockSubmissions.filter(s => s.score >= 60).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-900">PrismStudio</h1>
              <span className="ml-4 text-sm text-gray-500">
                {DOMAIN_MAPPINGS[selectedDomain as keyof typeof DOMAIN_MAPPINGS]} Internship (Mock)
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
              <span className="text-sm text-gray-700">Welcome, Mock Student</span>
              <button className="text-sm text-gray-500 hover:text-gray-700">
                Sign Out
              </button>
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
                {DOMAIN_MAPPINGS[selectedDomain as keyof typeof DOMAIN_MAPPINGS]} Progress (Mock)
              </h2>
              <span className="text-sm text-gray-500">
                {completedTasks} of {tasks.length} tasks completed
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary-600">{completedTasks}</div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{tasks.length - completedTasks}</div>
                <div className="text-sm text-gray-500">Remaining</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-500">Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {mockSubmissions.length > 0 
                    ? Math.round(mockSubmissions.reduce((acc, s) => acc + (s.score || 0), 0) / mockSubmissions.length)
                    : 0}%
                </div>
                <div className="text-sm text-gray-500">Avg Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">
              {DOMAIN_MAPPINGS[selectedDomain as keyof typeof DOMAIN_MAPPINGS]} Tasks
            </h2>
            <div className="text-sm text-gray-500">
              Mock Environment - No real evaluation
            </div>
          </div>
          
          <div className="grid gap-6">
            {tasks.map((task, index) => {
              const submission = mockSubmissions.find(s => s.task_id === task.id)
              const isLocked = index > 0 && !mockSubmissions.find(s => 
                s.task_id === tasks[index - 1]?.id && s.score >= 60
              )
              
              return (
                <MockTaskCard
                  key={task.id}
                  task={task}
                  submission={submission}
                  isLocked={isLocked}
                  onSubmit={(githubLink: string) => handleTaskSubmit(task.id, githubLink)}
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function MockTaskCard({ task, submission, isLocked, onSubmit }: any) {
  const [showModal, setShowModal] = useState(false)
  const [githubLink, setGithubLink] = useState('')

  const getStatusBadge = () => {
    if (isLocked) {
      return <span className="status-badge bg-gray-100 text-gray-600">🔒 Locked</span>
    }
    if (!submission) {
      return <span className="status-badge bg-blue-100 text-blue-600">📝 Not Started</span>
    }
    switch (submission.status) {
      case 'pending':
        return <span className="status-badge status-pending">⏳ Evaluating (Mock)</span>
      case 'evaluated':
        const score = submission.score || 0
        const passed = score >= 60
        return (
          <span className={`status-badge ${passed ? 'status-approved' : 'bg-red-100 text-red-600'}`}>
            {passed ? '✅' : '❌'} {score}/100 (Mock)
          </span>
        )
      default:
        return <span className="status-badge bg-gray-100 text-gray-600">Unknown</span>
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (githubLink) {
      onSubmit(githubLink)
      setShowModal(false)
      setGithubLink('')
    }
  }

  return (
    <>
      <div className={`card ${isLocked ? 'opacity-60' : ''}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold">{task.title}</h3>
              {task.is_final && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                  Final Task
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm mb-3">{task.description}</p>
          </div>
          <div className="ml-4">
            {getStatusBadge()}
          </div>
        </div>

        {/* Submission Details */}
        {submission && submission.status === 'evaluated' && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Mock AI Evaluation Results</span>
              <span className="text-lg font-bold text-green-600">
                {submission.score}/100
              </span>
            </div>
            {submission.ai_feedback && (
              <div className="space-y-2">
                <div className="mt-3">
                  <p className="text-sm text-gray-700">{submission.ai_feedback.feedback}</p>
                </div>
                <div className="mt-2">
                  <span className="text-xs font-medium text-green-700">Strengths:</span>
                  <ul className="text-xs text-green-600 ml-2">
                    {submission.ai_feedback.strengths?.map((strength: string, index: number) => (
                      <li key={index}>• {strength}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-2">
                  <span className="text-xs font-medium text-orange-700">Areas for Improvement:</span>
                  <ul className="text-xs text-orange-600 ml-2">
                    {submission.ai_feedback.improvements?.map((improvement: string, index: number) => (
                      <li key={index}>• {improvement}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* GitHub Link */}
        {submission?.github_link && (
          <div className="mb-4">
            <a
              href={submission.github_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
            >
              <i className="fab fa-github mr-2"></i>
              View Submission
              <i className="fas fa-external-link-alt ml-1 text-xs"></i>
            </a>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end">
          {!isLocked && (
            <button
              onClick={() => setShowModal(true)}
              className={`btn-primary ${submission?.status === 'pending' ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={submission?.status === 'pending'}
            >
              {submission?.status === 'pending' ? (
                <>
                  <div className="spinner mr-2"></div>
                  Evaluating...
                </>
              ) : submission ? (
                'Update Submission'
              ) : (
                'Submit Task'
              )}
            </button>
          )}
          {isLocked && (
            <div className="text-sm text-gray-500">
              Complete previous tasks to unlock
            </div>
          )}
        </div>
      </div>

      {/* Submission Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Submit Task (Mock)</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="githubLink" className="block text-sm font-medium text-gray-700 mb-2">
                    GitHub Repository URL
                  </label>
                  <input
                    id="githubLink"
                    type="url"
                    value={githubLink}
                    onChange={(e) => setGithubLink(e.target.value)}
                    className="input-field"
                    placeholder="https://github.com/username/repository"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This is a mock environment - any GitHub URL will work for testing
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-blue-800 mb-2">
                    <i className="fas fa-robot mr-2"></i>
                    Mock AI Evaluation Process
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Mock AI will simulate evaluation in 3 seconds</li>
                    <li>• Random score between 60-100 will be assigned</li>
                    <li>• This is for testing the UI only</li>
                    <li>• No real GitHub analysis is performed</li>
                  </ul>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={!githubLink}
                  >
                    Submit for Mock Evaluation
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}