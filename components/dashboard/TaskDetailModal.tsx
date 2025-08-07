'use client'

import { useState } from 'react'

interface TaskDetailModalProps {
  task: any
  isOpen: boolean
  onClose: () => void
  onSubmit: (githubUrl: string) => void
}

export function TaskDetailModal({ task, isOpen, onClose, onSubmit }: TaskDetailModalProps) {
  const [githubUrl, setGithubUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!githubUrl.trim()) return

    setSubmitting(true)
    try {
      await onSubmit(githubUrl)
      setGithubUrl('')
      onClose()
    } catch (error) {
      console.error('Submission error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">{task.title}</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
          {task.is_final && (
            <span className="inline-block mt-2 px-3 py-1 bg-white bg-opacity-20 text-white text-sm font-medium rounded-full">
              Final Task
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Task Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Task Description</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">{task.description}</p>
            </div>
          </div>

          {/* Requirements */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Requirements</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                Create a GitHub repository for your project
              </li>
              <li className="flex items-start">
                <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                Include a detailed README.md file
              </li>
              <li className="flex items-start">
                <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                Implement the solution according to the task description
              </li>
              <li className="flex items-start">
                <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                Ensure your code is well-commented and organized
              </li>
              <li className="flex items-start">
                <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                Test your implementation thoroughly
              </li>
            </ul>
          </div>

          {/* Evaluation Criteria */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Evaluation Criteria</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Code Quality (30%)</h4>
                <p className="text-blue-700 text-sm">Clean, readable, and well-structured code</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Functionality (40%)</h4>
                <p className="text-green-700 text-sm">Working implementation meeting requirements</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-2">Documentation (20%)</h4>
                <p className="text-purple-700 text-sm">Clear README and code comments</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-2">Innovation (10%)</h4>
                <p className="text-orange-700 text-sm">Creative solutions and best practices</p>
              </div>
            </div>
          </div>

          {/* Submission Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                GitHub Repository URL
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/yourusername/your-repo"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
              <p className="text-xs text-gray-500 mt-1">
                Make sure your repository is public so our AI can evaluate it
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !githubUrl.trim()}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane mr-2"></i>
                    Submit Task
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}