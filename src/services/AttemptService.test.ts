import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AttemptService } from '../services/AttemptService'
import type { Submission } from '../domain/types'

// Mock localStorage
const store: Record<string, string> = {}
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value },
  removeItem: (key: string) => { delete store[key] },
  clear: () => { Object.keys(store).forEach(k => delete store[k]) },
}

vi.stubGlobal('localStorage', localStorageMock)

const baseSubmission: Submission = {
  approach: 'ParkingLot manages floors and uses a strategy for spot allocation.',
  classes: [
    {
      id: 'c1',
      name: 'ParkingLot',
      responsibility: 'Top-level coordinator',
      methods: ['park(vehicle)', 'exit(ticket)'],
      relationships: ['has-many ParkingFloor'],
    },
  ],
  pseudocode: '',
  tradeoffs: '',
}

describe('AttemptService', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  describe('startAttempt', () => {
    it('creates a new attempt with draft status', () => {
      const attempt = AttemptService.startAttempt('parking-lot')
      expect(attempt.status).toBe('draft')
      expect(attempt.problemId).toBe('parking-lot')
      expect(attempt.attemptNumber).toBe(1)
    })

    it('increments attempt number for subsequent attempts on same problem', () => {
      AttemptService.startAttempt('parking-lot')
      AttemptService.startAttempt('parking-lot')
      const third = AttemptService.startAttempt('parking-lot')
      expect(third.attemptNumber).toBe(3)
    })

    it('persists across calls (simulates page refresh)', () => {
      const a = AttemptService.startAttempt('parking-lot')
      const found = AttemptService.getById(a.id)
      expect(found).toBeDefined()
      expect(found!.id).toBe(a.id)
    })
  })

  describe('saveDraft', () => {
    it('saves submission and keeps draft status', () => {
      const attempt = AttemptService.startAttempt('parking-lot')
      const updated = AttemptService.saveDraft(attempt.id, baseSubmission)
      expect(updated?.status).toBe('draft')
      expect(updated?.submission?.approach).toBe(baseSubmission.approach)
    })

    it('returns null for a non-existent attempt id', () => {
      const result = AttemptService.saveDraft('does-not-exist', baseSubmission)
      expect(result).toBeNull()
    })
  })

  describe('submitAttempt', () => {
    it('changes status to submitted', () => {
      const attempt = AttemptService.startAttempt('parking-lot')
      const updated = AttemptService.submitAttempt(attempt.id, baseSubmission)
      expect(updated?.status).toBe('submitted')
    })
  })

  describe('recordEvaluation', () => {
    it('saves evaluation and sets status to evaluated', () => {
      const attempt = AttemptService.startAttempt('parking-lot')
      AttemptService.submitAttempt(attempt.id, baseSubmission)

      const evaluation = {
        score: 78,
        categoryScores: [],
        strengths: ['Good structure'],
        weaknesses: [],
        suggestions: [],
        evaluatedAt: new Date().toISOString(),
        evaluatorType: 'deterministic' as const,
      }

      const updated = AttemptService.recordEvaluation(attempt.id, evaluation)
      expect(updated?.status).toBe('evaluated')
      expect(updated?.evaluation?.score).toBe(78)
    })
  })

  describe('markEvaluationFailed', () => {
    it('sets status to evaluation_failed', () => {
      const attempt = AttemptService.startAttempt('parking-lot')
      const updated = AttemptService.markEvaluationFailed(attempt.id)
      expect(updated?.status).toBe('evaluation_failed')
    })
  })

  describe('getByProblem', () => {
    it('returns only attempts for the specified problem', () => {
      AttemptService.startAttempt('parking-lot')
      AttemptService.startAttempt('vending-machine')
      const parkingAttempts = AttemptService.getByProblem('parking-lot')
      expect(parkingAttempts.every(a => a.problemId === 'parking-lot')).toBe(true)
    })
  })

  describe('getStats', () => {
    it('returns zero stats when no attempts', () => {
      const stats = AttemptService.getStats()
      expect(stats.totalAttempts).toBe(0)
      expect(stats.averageScore).toBe(0)
    })

    it('calculates average score from evaluated attempts only', () => {
      const a = AttemptService.startAttempt('parking-lot')
      AttemptService.recordEvaluation(a.id, {
        score: 80,
        categoryScores: [],
        strengths: [],
        weaknesses: [],
        suggestions: [],
        evaluatedAt: new Date().toISOString(),
        evaluatorType: 'deterministic',
      })

      AttemptService.startAttempt('parking-lot')
      // Second attempt is a draft — should not affect average

      const stats = AttemptService.getStats()
      expect(stats.averageScore).toBe(80)
    })
  })
})
