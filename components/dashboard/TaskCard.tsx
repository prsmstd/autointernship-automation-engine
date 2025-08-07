'use client'

interface TaskCardProps {
  task: any
  submission: any
  isLocked: boolean
  onSubmit: () => void
}

export function TaskCard({ task, submission, isLocked, onSubmit }: TaskCardProps) {
  const getStatusBadge = () => {
    if (isLocked) {
      return <span className="status-badge bg-gray-100 text-gray-600">🔒 Locked</span>
    }
    if (!submission) {
      return <span className="status-badge bg-blue-100 text-blue-600">📝 Not Started</span>
    }
    switch (submission.status) {
      case 'pending':
        return <span className="status-badge status-pending">⏳ Evaluating</span>
      case 'evaluated':
        const score = submission.score || 0
        const passed = score >= 60
        return (
          <span className={`status-badge ${passed ? 'status-approved' : 'bg-red-100 text-red-600'}`}>
            {passed ? '✅' : '❌'} {Math.round(score)}/100
          </span>
        )
      default:
        return <span className="status-badge bg-gray-100 text-gray-600">Unknown</span>
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
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
      {submission && submission.status === 'evaluated' && submission.ai_feedback && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">AI Evaluation Results</span>
            <span className={`text-lg font-bold ${getScoreColor(submission.score)}`}>
              {Math.round(submission.score)}/100
            </span>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Functionality:</span>
                <span className="ml-1 font-medium">{submission.ai_feedback.functionality || 'N/A'}/10</span>
              </div>
              <div>
                <span className="text-gray-500">Code Quality:</span>
                <span className="ml-1 font-medium">{submission.ai_feedback.code_quality || 'N/A'}/10</span>
              </div>
              <div>
                <span className="text-gray-500">Best Practices:</span>
                <span className="ml-1 font-medium">{submission.ai_feedback.best_practices || 'N/A'}/10</span>
              </div>
            </div>

            {submission.ai_feedback.feedback && (
              <div className="mt-3">
                <p className="text-sm text-gray-700">{submission.ai_feedback.feedback}</p>
              </div>
            )}

            {submission.ai_feedback.strengths?.length > 0 && (
              <div className="mt-2">
                <span className="text-xs font-medium text-green-700">Strengths:</span>
                <ul className="text-xs text-green-600 ml-2">
                  {submission.ai_feedback.strengths.map((strength: string, index: number) => (
                    <li key={index}>• {strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {submission.ai_feedback.improvements?.length > 0 && (
              <div className="mt-2">
                <span className="text-xs font-medium text-orange-700">Areas for Improvement:</span>
                <ul className="text-xs text-orange-600 ml-2">
                  {submission.ai_feedback.improvements.map((improvement: string, index: number) => (
                    <li key={index}>• {improvement}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
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
            onClick={onSubmit}
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
  )
}