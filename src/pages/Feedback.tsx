import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ThumbsUp, AlertCircle, Lightbulb, RotateCcw, Code, BookOpen, CheckCircle2 } from 'lucide-react'
import { AttemptService } from '../services/AttemptService'
import { ProblemService } from '../services/ProblemService'
import { ScoreBar, OverallScore } from '../components/ScoreBar'
import { StatusBadge, DifficultyBadge } from '../components/Badge'
import { ErrorMessage } from '../components/ErrorMessage'

export default function Feedback() {
  const { attemptId } = useParams<{ attemptId: string }>()

  const attempt = attemptId ? AttemptService.getById(attemptId) : undefined
  const problem = attempt ? ProblemService.getById(attempt.problemId) : undefined

  if (!attempt || !problem) {
    return (
      <main className="page-container">
        <ErrorMessage message="Attempt not found." />
        <Link to="/history" className="btn-ghost mt-4">
          ← History
        </Link>
      </main>
    )
  }

  if (attempt.status === 'draft' || attempt.status === 'submitted') {
    return (
      <main className="page-container space-y-4">
        <p className="text-gray-700">This attempt hasn't been evaluated yet.</p>
        <Link to={`/practice/${attempt.id}`} className="btn-primary">
          Continue Attempt
        </Link>
      </main>
    )
  }

  if (attempt.status === 'evaluation_failed') {
    return (
      <main className="page-container space-y-4">
        <ErrorMessage
          title="Evaluation failed"
          message="The evaluation could not be completed for this attempt. Your submission is saved."
          action={
            <Link to={`/practice/${attempt.id}`} className="btn-secondary text-xs py-1">
              Retry Evaluation
            </Link>
          }
        />
      </main>
    )
  }

  const { evaluation, submission } = attempt

  if (!evaluation || !submission) {
    return (
      <main className="page-container">
        <ErrorMessage message="Evaluation data is missing." />
      </main>
    )
  }

  return (
    <main className="page-container">
      <div className="space-y-8">
        {/* Header */}
          <div>
            <Link to={`/problems/${problem.id}`} className="btn-ghost -ml-3 mb-3 inline-flex">
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              {problem.title}
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">Feedback — {problem.title}</h1>
              <DifficultyBadge difficulty={problem.difficulty} />
              <StatusBadge status={attempt.status} />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Attempt #{attempt.attemptNumber} ·{' '}
              {new Date(evaluation.evaluatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })} ·{' '}
              <span className="capitalize">{evaluation.evaluatorType} evaluation</span>
            </p>
          </div>

          {/* Overall score */}
          <div className="card p-6 flex flex-col sm:flex-row items-center gap-6">
            <OverallScore score={evaluation.score} />
            <div className="flex-1 w-full">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Category Breakdown</h2>
              <div className="space-y-3">
                {evaluation.categoryScores.map(cat => (
                  <ScoreBar
                    key={cat.category}
                    label={cat.category}
                    score={cat.score}
                    maxScore={cat.maxScore}
                    size="sm"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Category explanations */}
          <section aria-labelledby="scores-heading">
            <h2 id="scores-heading" className="section-heading mb-3">Score Explanations</h2>
            <div className="space-y-3">
              {evaluation.categoryScores.map(cat => (
                <div key={cat.category} className="card p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-gray-900">{cat.category}</span>
                    <span className="text-sm font-semibold tabular-nums text-gray-700">
                      {cat.score}/{cat.maxScore}
                    </span>
                  </div>
                  <ScoreBar score={cat.score} maxScore={cat.maxScore} size="sm" />
                  <p className="text-sm text-gray-600 leading-relaxed">{cat.explanation}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Strengths + Weaknesses */}
          <div className="grid sm:grid-cols-2 gap-4">
            {evaluation.strengths.length > 0 && (
              <section aria-labelledby="strengths-heading">
                <div className="card p-4 h-full space-y-3">
                  <h2
                    id="strengths-heading"
                    className="text-sm font-semibold text-green-700 flex items-center gap-2"
                  >
                    <ThumbsUp className="w-4 h-4" aria-hidden="true" />
                    Strengths
                  </h2>
                  <ul className="space-y-2">
                    {evaluation.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {evaluation.weaknesses.length > 0 && (
              <section aria-labelledby="weaknesses-heading">
                <div className="card p-4 h-full space-y-3">
                  <h2
                    id="weaknesses-heading"
                    className="text-sm font-semibold text-amber-700 flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" aria-hidden="true" />
                    Areas to Improve
                  </h2>
                  <ul className="space-y-2">
                    {evaluation.weaknesses.map((w, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700">
                        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}
          </div>

          {/* Suggestions */}
          {evaluation.suggestions.length > 0 && (
            <section aria-labelledby="suggestions-heading">
              <div className="card p-4 space-y-3 border-blue-200 bg-blue-50">
                <h2
                  id="suggestions-heading"
                  className="text-sm font-semibold text-blue-800 flex items-center gap-2"
                >
                  <Lightbulb className="w-4 h-4" aria-hidden="true" />
                  Actionable Suggestions
                </h2>
                <ul className="space-y-3">
                  {evaluation.suggestions.map((s, i) => (
                    <li key={i} className="text-sm text-blue-900 leading-relaxed">
                      <span className="font-medium">#{i + 1}</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* Submitted solution */}
          <section aria-labelledby="submission-heading">
            <h2 id="submission-heading" className="section-heading mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              Your Submitted Design
            </h2>
            <div className="card divide-y divide-gray-100">
              {submission.approach && (
                <div className="p-4 space-y-1">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Approach</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {submission.approach}
                  </p>
                </div>
              )}

              {submission.classes.length > 0 && (
                <div className="p-4 space-y-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Classes ({submission.classes.length})
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {submission.classes.map(cls => (
                      <div key={cls.id} className="bg-gray-50 rounded-md p-3 space-y-1.5">
                        <div className="text-sm font-semibold text-gray-900">{cls.name}</div>
                        <div className="text-xs text-gray-600">{cls.responsibility}</div>
                        {cls.methods.length > 0 && (
                          <div className="text-xs text-gray-500 font-mono">
                            {cls.methods.map(m => (
                              <div key={m}>• {m}</div>
                            ))}
                          </div>
                        )}
                        {cls.relationships.length > 0 && (
                          <div className="text-xs text-blue-600">
                            {cls.relationships.map(r => (
                              <div key={r}>→ {r}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {submission.pseudocode && (
                <div className="p-4 space-y-1">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <Code className="w-3 h-3" aria-hidden="true" />
                    Code / Pseudocode
                  </h3>
                  <pre className="text-xs text-gray-700 bg-gray-50 rounded p-3 overflow-x-auto leading-relaxed whitespace-pre-wrap code-textarea">
                    {submission.pseudocode}
                  </pre>
                </div>
              )}

              {submission.tradeoffs && (
                <div className="p-4 space-y-1">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Trade-offs & Assumptions
                  </h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {submission.tradeoffs}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
            <Link to={`/problems/${problem.id}`} className="btn-primary">
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              Try Again
            </Link>
            <Link to="/problems" className="btn-secondary">
              Browse Problems
            </Link>
            <Link to="/history" className="btn-ghost">
              View History
            </Link>
          </div>
        </div>
    </main>
  )
}
