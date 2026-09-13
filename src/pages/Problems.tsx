import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Plus } from 'lucide-react'
import { ProblemService } from '../services/ProblemService'
import { DifficultyBadge } from '../components/Badge'
import type { Difficulty } from '../domain/types'

const DIFFICULTIES: Array<Difficulty | 'All'> = ['All', 'Easy', 'Medium', 'Hard']

export default function Problems() {
  const allProblems = ProblemService.getAllProblems()
  const [filter, setFilter] = useState<Difficulty | 'All'>('All')

  const filtered = useMemo(
    () => (filter === 'All' ? allProblems : allProblems.filter(p => p.difficulty === filter)),
    [filter],
  )

  return (
    <main className="page-container">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Problems</h1>
            <p className="text-gray-500 text-sm mt-1">
              {allProblems.length} curated LLD problems. Pick one and start designing.
            </p>
          </div>
          <Link to="/problems/new" className="btn-primary shrink-0 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Custom Project
          </Link>
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter by difficulty">
          {DIFFICULTIES.map(d => (
            <button
              key={d}
              type="button"
              onClick={() => setFilter(d)}
              className={
                filter === d
                  ? 'px-3 py-1.5 text-sm font-medium rounded-md bg-blue-600 text-white'
                  : 'px-3 py-1.5 text-sm font-medium rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors'
              }
              aria-pressed={filter === d}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Problem list */}
        <div className="space-y-3">
          {filtered.map(problem => (
            <div key={problem.id} className="card p-5 hover:border-gray-300 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-semibold text-gray-900">{problem.title}</h2>
                    <DifficultyBadge difficulty={problem.difficulty} />
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{problem.shortDescription}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                      ~{problem.estimatedMinutes} min
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {problem.concepts.map(c => (
                        <span key={c} className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <Link
                  to={`/problems/${problem.id}`}
                  className="btn-primary flex-shrink-0 sm:self-start"
                  aria-label={`Open ${problem.title} problem`}
                >
                  Practice
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
