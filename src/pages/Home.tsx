import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, MessageSquare, RotateCcw, ChevronRight, ListChecks, PenTool, Send, RefreshCw } from 'lucide-react'
import { ProblemService } from '../services/ProblemService'
import { AttemptService } from '../services/AttemptService'
import { DifficultyBadge } from '../components/Badge'

const FEATURED_IDS = ['parking-lot', 'elevator-system', 'ride-sharing']

const steps = [
  { icon: <ListChecks className="w-4 h-4 text-gray-500" />, label: 'Choose a problem' },
  { icon: <PenTool className="w-4 h-4 text-gray-500" />, label: 'Design your solution' },
  { icon: <Send className="w-4 h-4 text-gray-500" />, label: 'Submit' },
  { icon: <MessageSquare className="w-4 h-4 text-gray-500" />, label: 'Get structured feedback' },
  { icon: <RefreshCw className="w-4 h-4 text-gray-500" />, label: 'Improve and retry' },
]

export default function Home() {
  const stats = AttemptService.getStats()
  const featuredProblems = ProblemService.getAllProblems().filter(p => FEATURED_IDS.includes(p.id))

  return (
    <main className="page-container space-y-12">
      {/* Hero */}
      <section className="pt-4 pb-2 space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
          Practice Low-Level Design.
          <br />
          <span className="text-blue-600">Get feedback. Improve your design.</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-xl leading-relaxed">
          Work through real LLD problems, submit structured solutions, and receive explainable feedback on your design decisions.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/problems" className="btn-primary">
            Start Practicing
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          {stats.totalAttempts > 0 && (
            <Link to="/history" className="btn-secondary">
              View My Attempts
            </Link>
          )}
        </div>
      </section>

      {/* Practice loop */}
      <section aria-labelledby="loop-heading">
        <h2 id="loop-heading" className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          The Practice Loop
        </h2>
        <div className="flex flex-wrap gap-2 items-center">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-2">
                <span aria-hidden="true">{step.icon}</span>
                <span className="text-sm text-gray-700">{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Progress summary — only shown after first attempt */}
      {stats.totalAttempts > 0 && (
        <section aria-labelledby="progress-heading">
          <h2 id="progress-heading" className="section-heading mb-4">Your Progress</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Attempts', value: stats.totalAttempts },
              { label: 'Problems', value: stats.problemsAttempted },
              { label: 'Avg Score', value: stats.averageScore > 0 ? `${stats.averageScore}` : '—' },
              { label: 'Best Score', value: stats.bestScore > 0 ? `${stats.bestScore}` : '—' },
            ].map(item => (
              <div key={item.label} className="card p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 tabular-nums">{item.value}</div>
                <div className="text-xs text-gray-500 mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured problems */}
      <section aria-labelledby="problems-heading">
        <div className="flex items-center justify-between mb-4">
          <h2 id="problems-heading" className="section-heading">Featured Problems</h2>
          <Link to="/problems" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View all →
          </Link>
        </div>
        <div className="space-y-3">
          {featuredProblems.map(problem => (
            <div key={problem.id} className="card p-4 hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-gray-900">{problem.title}</h3>
                    <DifficultyBadge difficulty={problem.difficulty} />
                  </div>
                  <p className="text-sm text-gray-500">{problem.shortDescription}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {problem.concepts.map(c => (
                      <span key={c} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                <Link
                  to={`/problems/${problem.id}`}
                  className="btn-secondary flex-shrink-0"
                  aria-label={`Practice ${problem.title}`}
                >
                  Practice
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How evaluation works */}
      <section aria-labelledby="eval-heading" className="border-t border-gray-100 pt-8">
        <h2 id="eval-heading" className="section-heading mb-4">How Feedback Works</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
              title: 'Requirement Coverage',
              desc: "Does your design address the problem's key domain concepts?",
            },
            {
              icon: <MessageSquare className="w-5 h-5 text-blue-500" />,
              title: 'Design Quality',
              desc: 'Are responsibilities well-separated? Are abstractions meaningful?',
            },
            {
              icon: <RotateCcw className="w-5 h-5 text-purple-500" />,
              title: 'Extensibility',
              desc: 'Can the design adapt to new requirements without a rewrite?',
            },
          ].map(item => (
            <div key={item.title} className="card p-4 space-y-2">
              {item.icon}
              <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
