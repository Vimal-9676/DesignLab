import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Plus, Trash2, Save, Send, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react'
import { ProblemService } from '../services/ProblemService'
import { AttemptService } from '../services/AttemptService'
import { EvaluationService } from '../services/EvaluationService'
import { useSubmissionForm } from '../hooks/useSubmissionForm'
import { validateSubmission } from '../utils/validation'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { DifficultyBadge } from '../components/Badge'
import type { ClassDesign } from '../domain/types'

const evaluationService = new EvaluationService()

type SectionKey = 'approach' | 'classes' | 'code' | 'tradeoffs'

interface Section {
  key: SectionKey
  title: string
  description: string
}

const SECTIONS: Section[] = [
  {
    key: 'approach',
    title: '1. Approach & Explanation',
    description: 'Describe your overall design: what classes you have, how they relate, what patterns you apply, and why.',
  },
  {
    key: 'classes',
    title: '2. Class Design',
    description: 'Add the main classes in your design. Include responsibilities, key methods, and relationships.',
  },
  {
    key: 'code',
    title: '3. Code / Pseudocode',
    description: 'Optional but recommended. Sketch key class definitions, method signatures, or important logic.',
  },
  {
    key: 'tradeoffs',
    title: '4. Trade-offs & Assumptions',
    description: 'Document choices you made, alternatives you considered, and assumptions you relied on.',
  },
]

export default function Practice() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [expandedSection, setExpandedSection] = useState<SectionKey>('approach')

  const attempt = attemptId ? AttemptService.getById(attemptId) : undefined
  const problem = attempt ? ProblemService.getById(attempt.problemId) : undefined

  const { submission, updateField, addClass, updateClass, removeClass } = useSubmissionForm(
    attempt?.submission,
  )

  useEffect(() => {
    setLoading(false)
  }, [])

  // Auto-save draft every 30 seconds if there is content
  useEffect(() => {
    const timer = setInterval(() => {
      if (attemptId && (submission.approach || submission.classes.length > 0)) {
        AttemptService.saveDraft(attemptId, submission)
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      }
    }, 30000)
    return () => clearInterval(timer)
  }, [attemptId, submission])

  const handleSaveDraft = useCallback(() => {
    if (!attemptId) return
    AttemptService.saveDraft(attemptId, submission)
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 2000)
  }, [attemptId, submission])

  async function handleSubmit() {
    if (!attemptId || !problem) return

    const { valid, errors } = validateSubmission(submission)
    if (!valid) {
      setValidationErrors(errors)
      return
    }

    setValidationErrors([])
    setSubmitting(true)
    setSubmitError(null)

    AttemptService.submitAttempt(attemptId, submission)

    const result = await evaluationService.evaluate(attemptId, submission, problem)

    setSubmitting(false)

    if (result.success) {
      navigate(`/feedback/${attemptId}`)
    } else {
      setSubmitError(result.error ?? 'Evaluation failed. Your submission has been saved.')
    }
  }

  if (loading) return <LoadingSpinner message="Loading attempt..." />

  if (!attempt || !problem) {
    return (
      <main className="page-container">
        <ErrorMessage message="Attempt not found. It may have been deleted." />
        <Link to="/problems" className="btn-ghost mt-4">
          ← Back to Problems
        </Link>
      </main>
    )
  }

  if (attempt.status === 'evaluated') {
    return (
      <main className="page-container space-y-4">
        <p className="text-gray-700">This attempt has already been evaluated.</p>
        <div className="flex gap-3">
          <Link to={`/feedback/${attemptId}`} className="btn-primary">
            View Feedback
          </Link>
          <Link to={`/problems/${problem.id}`} className="btn-secondary">
            Try Again
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="page-container">
      <div className="space-y-6">
      {/* Header */}
        <div>
          <Link to={`/problems/${problem.id}`} className="btn-ghost -ml-3 mb-3 inline-flex">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            {problem.title}
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">{problem.title}</h1>
            <DifficultyBadge difficulty={problem.difficulty} />
            <span className="text-sm text-gray-400">Attempt #{attempt.attemptNumber}</span>
          </div>
        </div>

        {/* Validation errors */}
        {validationErrors.length > 0 && (
          <ErrorMessage
            title="Please fix these issues before submitting"
            message={validationErrors.join(' ')}
          />
        )}

        {/* Submit error */}
        {submitError && (
          <ErrorMessage
            title="Evaluation could not be completed"
            message={submitError}
            action={
              <button type="button" className="btn-secondary text-xs py-1" onClick={handleSubmit}>
                Retry Evaluation
              </button>
            }
          />
        )}

        {/* Sections */}
        <div className="space-y-3">
          {SECTIONS.map(section => (
            <SectionAccordion
              key={section.key}
              section={section}
              isExpanded={expandedSection === section.key}
              onToggle={() =>
                setExpandedSection(prev => (prev === section.key ? 'approach' : section.key))
              }
            >
              {section.key === 'approach' && (
                <div>
                  <label htmlFor="approach" className="label">
                    Design Approach <span className="text-red-500" aria-label="required">*</span>
                  </label>
                  <textarea
                    id="approach"
                    className="textarea min-h-[180px]"
                    placeholder="Explain your overall design. What are the main classes? How do they interact? What patterns did you use and why? What assumptions are you making?"
                    value={submission.approach}
                    onChange={e => updateField('approach', e.target.value)}
                    aria-required="true"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {submission.approach.length} chars — minimum 50 required
                  </p>
                </div>
              )}

              {section.key === 'classes' && (
                <ClassDesignSection
                  classes={submission.classes}
                  onAdd={addClass}
                  onUpdate={updateClass}
                  onRemove={removeClass}
                />
              )}

              {section.key === 'code' && (
                <div>
                  <label htmlFor="pseudocode" className="label">
                    Code / Pseudocode <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="pseudocode"
                    className="textarea code-textarea min-h-[220px]"
                    placeholder={`class ParkingLot:\n  def __init__(self, floors):\n    self.floors = floors\n    self.allocation_strategy = NearestSpotStrategy()\n\n  def park(self, vehicle):\n    spot = self.allocation_strategy.find_spot(self.floors, vehicle)\n    if spot is None:\n      raise ParkingLotFullException()\n    return spot.assign(vehicle)`}
                    value={submission.pseudocode}
                    onChange={e => updateField('pseudocode', e.target.value)}
                    spellCheck={false}
                  />
                </div>
              )}

              {section.key === 'tradeoffs' && (
                <div>
                  <label htmlFor="tradeoffs" className="label">
                    Trade-offs & Assumptions <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="tradeoffs"
                    className="textarea min-h-[140px]"
                    placeholder="What trade-offs did you make? What alternatives did you consider and reject? What assumptions is your design relying on?"
                    value={submission.tradeoffs}
                    onChange={e => updateField('tradeoffs', e.target.value)}
                  />
                </div>
              )}
            </SectionAccordion>
          ))}
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="btn-secondary"
            disabled={submitting}
          >
            <Save className="w-4 h-4" aria-hidden="true" />
            {saveStatus === 'saved' ? 'Saved!' : 'Save Draft'}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="btn-primary"
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                Evaluating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" aria-hidden="true" />
                Submit & Evaluate
              </>
            )}
          </button>
          </div>
      </div>
    </main>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

interface SectionAccordionProps {
  section: Section
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

function SectionAccordion({ section, isExpanded, onToggle, children }: SectionAccordionProps) {
  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={`section-${section.key}`}
        id={`section-${section.key}-header`}
      >
        <div>
          <div className="text-sm font-semibold text-gray-900">{section.title}</div>
          <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{section.description}</div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
        )}
      </button>
      {isExpanded && (
        <div id={`section-${section.key}`} className="px-5 pb-5 border-t border-gray-100 pt-4">
          {children}
        </div>
      )}
    </div>
  )
}

interface ClassDesignSectionProps {
  classes: ClassDesign[]
  onAdd: () => void
  onUpdate: (id: string, updates: Partial<ClassDesign>) => void
  onRemove: (id: string) => void
}

function ClassDesignSection({ classes, onAdd, onUpdate, onRemove }: ClassDesignSectionProps) {
  return (
    <div className="space-y-4">
      {classes.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4 border border-dashed border-gray-200 rounded-md">
          No classes added yet. Click "Add Class" to define your first class.
        </p>
      )}

      {classes.map((cls, index) => (
        <ClassEntry
          key={cls.id}
          cls={cls}
          index={index}
          onUpdate={(updates) => onUpdate(cls.id, updates)}
          onRemove={() => onRemove(cls.id)}
        />
      ))}

      <button type="button" onClick={onAdd} className="btn-secondary w-full sm:w-auto">
        <Plus className="w-4 h-4" aria-hidden="true" />
        Add Class
      </button>
    </div>
  )
}

interface ClassEntryProps {
  cls: ClassDesign
  index: number
  onUpdate: (updates: Partial<ClassDesign>) => void
  onRemove: () => void
}

function ClassEntry({ cls, index, onUpdate, onRemove }: ClassEntryProps) {
  function updateMethods(raw: string) {
    const methods = raw.split('\n').map(s => s.trim()).filter(Boolean)
    onUpdate({ methods })
  }

  function updateRelationships(raw: string) {
    const relationships = raw.split('\n').map(s => s.trim()).filter(Boolean)
    onUpdate({ relationships })
  }

  return (
    <div className="border border-gray-200 rounded-md p-4 space-y-3 bg-gray-50">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Class {index + 1}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="btn-danger py-0.5 text-xs"
          aria-label={`Remove class ${cls.name || index + 1}`}
        >
          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          Remove
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor={`class-name-${cls.id}`} className="label">
            Class Name <span className="text-red-500" aria-label="required">*</span>
          </label>
          <input
            id={`class-name-${cls.id}`}
            type="text"
            className="input"
            placeholder="e.g. ParkingLot"
            value={cls.name}
            onChange={e => onUpdate({ name: e.target.value })}
            aria-required="true"
          />
        </div>
        <div>
          <label htmlFor={`class-resp-${cls.id}`} className="label">
            Responsibility <span className="text-red-500" aria-label="required">*</span>
          </label>
          <input
            id={`class-resp-${cls.id}`}
            type="text"
            className="input"
            placeholder="e.g. Manages floors and spot allocation"
            value={cls.responsibility}
            onChange={e => onUpdate({ responsibility: e.target.value })}
            aria-required="true"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor={`class-methods-${cls.id}`} className="label">
            Key Methods <span className="text-gray-400 font-normal">(one per line)</span>
          </label>
          <textarea
            id={`class-methods-${cls.id}`}
            className="textarea min-h-[80px] font-mono text-xs"
            placeholder={`park(vehicle)\nexit(ticket)\nisAvailable()`}
            value={cls.methods.join('\n')}
            onChange={e => updateMethods(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor={`class-rels-${cls.id}`} className="label">
            Relationships <span className="text-gray-400 font-normal">(one per line)</span>
          </label>
          <textarea
            id={`class-rels-${cls.id}`}
            className="textarea min-h-[80px] font-mono text-xs"
            placeholder={`has-many ParkingFloor\nuses SpotAllocationStrategy\ncreates Ticket`}
            value={cls.relationships.join('\n')}
            onChange={e => updateRelationships(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
