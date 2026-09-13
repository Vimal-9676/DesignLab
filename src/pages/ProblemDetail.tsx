import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Clock, CheckSquare, AlertTriangle, HelpCircle } from 'lucide-react'
import { ProblemService } from '../services/ProblemService'
import { AttemptService } from '../services/AttemptService'
import { DifficultyBadge } from '../components/Badge'

export default function ProblemDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const problem = id ? ProblemService.getById(id) : undefined

  if (!problem) {
    return (
      <main className="page-container">
        <p className="text-gray-500">Problem not found.</p>
        <Link to="/problems" className="btn-ghost mt-4">
          ← Back to Problems
        </Link>
      </main>
    )
  }

  function startAttempt() {
    const attempt = AttemptService.startAttempt(problem!.id)
    navigate(`/practice/${attempt.id}`)
  }

  const existingAttempts = AttemptService.getByProblem(problem.id)

  return (
    <main className="page-container">
      <div className="space-y-8">
        {/* Back + header */}
        <div>
          <Link to="/problems" className="btn-ghost -ml-3 mb-4 inline-flex">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Problems
          </Link>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{problem.title}</h1>
              <DifficultyBadge difficulty={problem.difficulty} />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" aria-hidden="true" />
                ~{problem.estimatedMinutes} min
              </span>
              <div className="flex flex-wrap gap-1.5">
                {problem.concepts.map(c => (
                  <span key={c} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Problem statement */}
        <section aria-labelledby="statement-heading">
          <h2 id="statement-heading" className="section-heading mb-3">Problem Statement</h2>
          <p className="text-gray-700 leading-relaxed">{problem.statement}</p>
        </section>

        {/* Two-column layout for requirements + assumptions */}
        <div className="grid sm:grid-cols-2 gap-6">
          <section aria-labelledby="req-heading">
            <h2 id="req-heading" className="section-heading mb-3 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-blue-500" aria-hidden="true" />
              Functional Requirements
            </h2>
            <ul className="space-y-2">
              {problem.requirements.map((r, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-gray-400 flex-shrink-0 mt-0.5">•</span>
                  {r}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="assume-heading">
            <h2 id="assume-heading" className="section-heading mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" aria-hidden="true" />
              Assumptions
            </h2>
            <ul className="space-y-2">
              {problem.assumptions.map((a, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-gray-400 flex-shrink-0 mt-0.5">•</span>
                  {a}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Constraints */}
        <section aria-labelledby="constraints-heading">
          <h2 id="constraints-heading" className="section-heading mb-3">Constraints</h2>
          <ul className="space-y-2">
            {problem.constraints.map((c, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <span className="text-gray-400 flex-shrink-0 mt-0.5">•</span>
                {c}
              </li>
            ))}
          </ul>
        </section>

        {/* Design considerations */}
        <section aria-labelledby="design-heading">
          <h2 id="design-heading" className="section-heading mb-3">Design Considerations</h2>
          <p className="text-sm text-gray-500 mb-3">
            These are starting points — not the only valid solution. Use them to guide your thinking.
          </p>
          <div className="flex flex-wrap gap-2">
            {problem.designConsiderations.map(d => (
              <span key={d} className="text-sm px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-md">
                {d}
              </span>
            ))}
          </div>
        </section>

        {/* Thinking prompts */}
        <section aria-labelledby="prompts-heading" className="card p-5 bg-amber-50 border-amber-200">
          <h2 id="prompts-heading" className="section-heading mb-3 flex items-center gap-2 text-amber-900">
            <HelpCircle className="w-4 h-4" aria-hidden="true" />
            Think Before You Design
          </h2>
          <ul className="space-y-2">
            {problem.thinkingPrompts.map((prompt, i) => (
              <li key={i} className="flex gap-2 text-sm text-amber-800">
                <span className="flex-shrink-0 font-medium">{i + 1}.</span>
                {prompt}
              </li>
            ))}
          </ul>
        </section>

        {/* Previous attempts */}
        {existingAttempts.length > 0 && (
          <section aria-labelledby="attempts-heading">
            <h2 id="attempts-heading" className="section-heading mb-3">Your Previous Attempts</h2>
            <div className="space-y-2">
              {existingAttempts.slice(0, 3).map(attempt => (
                <div key={attempt.id} className="card p-3 flex items-center justify-between gap-4">
                  <div className="text-sm text-gray-700">
                    Attempt #{attempt.attemptNumber} —{' '}
                    {new Date(attempt.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-3">
                    {attempt.evaluation && (
                      <span className="text-sm font-semibold text-gray-900 tabular-nums">
                        {attempt.evaluation.score}/100
                      </span>
                    )}
                    <Link to={`/feedback/${attempt.id}`} className="btn-ghost text-xs py-1">
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="pt-2 flex flex-wrap gap-3">
          <button type="button" onClick={startAttempt} className="btn-primary">
            {existingAttempts.length === 0 ? 'Start Attempt' : 'Start New Attempt'}
          </button>
          {existingAttempts.length > 0 && (
            <Link to="/history" className="btn-secondary">
              View All Attempts
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}
