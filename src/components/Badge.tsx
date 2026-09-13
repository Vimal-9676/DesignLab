import type { Difficulty, AttemptStatus } from '../domain/types'

interface DifficultyBadgeProps {
  difficulty: Difficulty
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const cls =
    difficulty === 'Easy'
      ? 'badge-easy'
      : difficulty === 'Medium'
      ? 'badge-medium'
      : 'badge-hard'
  return <span className={cls}>{difficulty}</span>
}

interface StatusBadgeProps {
  status: AttemptStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const label: Record<AttemptStatus, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    evaluated: 'Evaluated',
    evaluation_failed: 'Evaluation Failed',
  }
  const cls: Record<AttemptStatus, string> = {
    draft: 'badge-draft',
    submitted: 'badge-submitted',
    evaluated: 'badge-evaluated',
    evaluation_failed: 'badge-failed',
  }
  return <span className={cls[status]}>{label[status]}</span>
}
