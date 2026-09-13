import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, RotateCcw, Trash2 } from 'lucide-react'
import { AttemptService } from '../services/AttemptService'
import { ProblemService } from '../services/ProblemService'
import { DifficultyBadge, StatusBadge } from '../components/Badge'
import { EmptyState } from '../components/EmptyState'
import type { Attempt } from '../domain/types'

export default function History() {
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [stats, setStats] = useState(AttemptService.getStats())

  const loadData = () => {
    const all = AttemptService.getAll()
    setAttempts(all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    setStats(AttemptService.getStats())
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this attempt?')) {
      AttemptService.deleteAttempt(id)
      loadData()
    }
  }

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete ALL your history? This cannot be undone.')) {
      AttemptService.clearAllAttempts()
      loadData()
    }
  }

  if (attempts.length === 0) {
    return (
      <main className="page-container">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">History</h1>
        <EmptyState
          icon={<ClipboardList className="w-10 h-10" />}
          title="No attempts yet"
          description="Start practicing to see your attempt history here."
          action={
            <Link to="/problems" className="btn-primary">
              Browse Problems
            </Link>
          }
        />
      </main>
    )
  }

  return (
    <main className="page-container">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">History</h1>
            <p className="text-sm text-gray-500 mt-1">
              {attempts.length} attempt{attempts.length !== 1 ? 's' : ''} across {stats.problemsAttempted} problem{stats.problemsAttempted !== 1 ? 's' : ''}
            </p>
          </div>
          
          <button 
            onClick={handleClearAll}
            className="btn-danger sm:self-start"
            aria-label="Clear all history"
          >
            <Trash2 className="w-4 h-4" />
            Clear All History
          </button>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Attempts', value: stats.totalAttempts },
            { label: 'Problems', value: stats.problemsAttempted },
            { label: 'Avg Score', value: stats.averageScore > 0 ? stats.averageScore : '—' },
            { label: 'Best Score', value: stats.bestScore > 0 ? stats.bestScore : '—' },
          ].map(item => (
            <div key={item.label} className="card p-4 text-center">
              <div className="text-xl font-bold text-gray-900 tabular-nums">{item.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Attempt list */}
        <div className="space-y-2" role="list" aria-label="Attempt history">
          {attempts.map(attempt => {
            const problem = ProblemService.getById(attempt.problemId)
            if (!problem) return null

            return (
              <div
                key={attempt.id}
                className="card p-4 hover:border-gray-300 transition-colors"
                role="listitem"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-gray-900">{problem.title}</span>
                      <DifficultyBadge difficulty={problem.difficulty} />
                      <StatusBadge status={attempt.status} />
                    </div>
                    <div className="text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-0.5">
                      <span>Attempt #{attempt.attemptNumber}</span>
                      <span>
                        {new Date(attempt.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      {attempt.evaluation && (
                        <span className="font-semibold text-gray-700">
                          Score: {attempt.evaluation.score}/100
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {attempt.status === 'evaluated' && (
                      <Link
                        to={`/feedback/${attempt.id}`}
                        className="btn-secondary text-xs py-1.5"
                        aria-label={`View feedback for ${problem.title} attempt ${attempt.attemptNumber}`}
                      >
                        View Feedback
                      </Link>
                    )}
                    {(attempt.status === 'draft' || attempt.status === 'submitted' || attempt.status === 'evaluation_failed') && (
                      <Link
                        to={`/practice/${attempt.id}`}
                        className="btn-secondary text-xs py-1.5"
                        aria-label={`Continue ${problem.title} attempt ${attempt.attemptNumber}`}
                      >
                        Continue
                      </Link>
                    )}
                    <Link
                      to={`/problems/${problem.id}`}
                      className="btn-ghost text-xs py-1.5"
                      aria-label={`Try ${problem.title} again`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                      Try Again
                    </Link>
                    
                    <button
                      onClick={() => handleDelete(attempt.id)}
                      className="btn-ghost text-xs py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 ml-2 border-l border-gray-200 pl-4 rounded-l-none"
                      aria-label={`Delete attempt ${attempt.attemptNumber}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
