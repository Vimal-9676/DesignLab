import type { Attempt, Submission } from '../domain/types'

const STORAGE_KEY = 'designlab:attempts'

function loadAttempts(): Attempt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Attempt[]) : []
  } catch {
    return []
  }
}

function saveAttempts(attempts: Attempt[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts))
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const AttemptService = {
  getAll(): Attempt[] {
    return loadAttempts()
  },

  getById(id: string): Attempt | undefined {
    return loadAttempts().find(a => a.id === id)
  },

  getByProblem(problemId: string): Attempt[] {
    return loadAttempts()
      .filter(a => a.problemId === problemId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  startAttempt(problemId: string): Attempt {
    const attempts = loadAttempts()
    const existingCount = attempts.filter(a => a.problemId === problemId).length

    const attempt: Attempt = {
      id: generateId(),
      problemId,
      attemptNumber: existingCount + 1,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    saveAttempts([...attempts, attempt])
    return attempt
  },

  saveDraft(attemptId: string, submission: Submission): Attempt | null {
    const attempts = loadAttempts()
    const index = attempts.findIndex(a => a.id === attemptId)
    if (index === -1) return null

    const updated: Attempt = {
      ...attempts[index],
      submission,
      status: 'draft',
      updatedAt: new Date().toISOString(),
    }

    attempts[index] = updated
    saveAttempts(attempts)
    return updated
  },

  submitAttempt(attemptId: string, submission: Submission): Attempt | null {
    const attempts = loadAttempts()
    const index = attempts.findIndex(a => a.id === attemptId)
    if (index === -1) return null

    const updated: Attempt = {
      ...attempts[index],
      submission,
      status: 'submitted',
      updatedAt: new Date().toISOString(),
    }

    attempts[index] = updated
    saveAttempts(attempts)
    return updated
  },

  recordEvaluation(attemptId: string, evaluation: import('../domain/types').Evaluation): Attempt | null {
    const attempts = loadAttempts()
    const index = attempts.findIndex(a => a.id === attemptId)
    if (index === -1) return null

    const updated: Attempt = {
      ...attempts[index],
      evaluation,
      status: 'evaluated',
      updatedAt: new Date().toISOString(),
    }

    attempts[index] = updated
    saveAttempts(attempts)
    return updated
  },

  markEvaluationFailed(attemptId: string): Attempt | null {
    const attempts = loadAttempts()
    const index = attempts.findIndex(a => a.id === attemptId)
    if (index === -1) return null

    const updated: Attempt = {
      ...attempts[index],
      status: 'evaluation_failed',
      updatedAt: new Date().toISOString(),
    }

    attempts[index] = updated
    saveAttempts(attempts)
    return updated
  },

  getStats() {
    const attempts = loadAttempts()
    const evaluated = attempts.filter(a => a.status === 'evaluated' && a.evaluation)
    const scores = evaluated.map(a => a.evaluation!.score)
    const uniqueProblems = new Set(attempts.map(a => a.problemId)).size

    return {
      totalAttempts: attempts.length,
      problemsAttempted: uniqueProblems,
      averageScore: scores.length > 0 ? Math.round(scores.reduce((s, n) => s + n, 0) / scores.length) : 0,
      bestScore: scores.length > 0 ? Math.max(...scores) : 0,
    }
  },

  deleteAttempt(id: string): boolean {
    const attempts = loadAttempts()
    const filtered = attempts.filter(a => a.id !== id)
    if (filtered.length === attempts.length) return false
    saveAttempts(filtered)
    return true
  },

  clearAllAttempts(): void {
    saveAttempts([])
  },
}
