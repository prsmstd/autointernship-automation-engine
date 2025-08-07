'use client'

import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase'

interface SubmissionModalProps {
  task: any
  submission: any
  onClose: () => void
}

export function SubmissionModal({ task, submission, onClose }: SubmissionModalProps) {
  const [githubLink, setGithubLink] = useState(submission?.github_link || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createSupabaseClient()

  const validateGithubLink = (url: string) => {
    const githubRegex = /^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+/
    return githubRegex.test(url)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!validateGithubLink(githubLink)) {
      setError('Please enter a valid GitHub repository URL')
      setLoading(false)
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      if (submission) {
        // Update existing submission
        const { error: updateError } = await supabase
          .from('submissions')
          .update({
            github_link: githubLink,
            status: 'pending',
            ai_feedback: null,
            score: null,
            evaluated_at: null
          })
          .eq('id', submission.id)

        if (updateError) throw updateError
      } else {
        // Create new submission
        const { error: insertError } = await supabase
          .from('submissions')
          .insert({
            user_id: user.id,
            task_id: task.id,
            github_link: githubLink,
            status: 'pending'
          })

        if (insertError) throw insertError
      }

      // Trigger AI evaluation
      const evaluationResponse = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId: submission?.id,
          taskId: task.id,
          githubLink,
          userId: user.id
        }),
      })

      const evaluationResult = await evaluationResponse.json()
      
      if (!evaluationResponse.ok) {
        throw new Error(evaluationResult.error || 'Evaluation failed')
      }

      onClose()
    } catch (error: any) {
      console.error('Submission error:', error)
      setError(error.message || 'Failed to submit task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Submit Task</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">{task.title}</h3>
            <p className="text-gray-600 text-sm">{task.description}</p>
            {task.is_final && (
              <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center">
                  <i className="fas fa-star text-purple-600 mr-2"></i>
                  <span className="text-sm font-medium text-purple-800">
                    This is your final project task
                  </span>
                </div>
              </div>
            )}
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
                Make sure your repository is public so our AI can evaluate it
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-800 mb-2">
                <i className="fas fa-robot mr-2"></i>
                AI Evaluation Process
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Your code will be automatically analyzed by our AI</li>
                <li>• Evaluation typically takes 2-3 minutes</li>
                <li>• You'll receive detailed feedback and a score</li>
                <li>• Minimum 60/100 required to pass</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || !githubLink}
              >
                {loading ? (
                  <>
                    <div className="spinner mr-2"></div>
                    {submission ? 'Updating...' : 'Submitting...'}
                  </>
                ) : (
                  submission ? 'Update Submission' : 'Submit for Evaluation'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}