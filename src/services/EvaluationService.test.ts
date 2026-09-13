import { describe, it, expect, beforeEach, vi } from 'vitest'
import { EvaluationService } from '../services/EvaluationService'
import { MockEvaluator } from '../evaluators/MockEvaluator'
import { AttemptService } from '../services/AttemptService'
import type { Submission, Problem } from '../domain/types'

// Mock localStorage
const store: Record<string, string> = {}
vi.stubGlobal('localStorage', {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value },
  removeItem: (key: string) => { delete store[key] },
  clear: () => { Object.keys(store).forEach(k => delete store[k]) },
})

const problem: Problem = {
  id: 'parking-lot',
  title: 'Parking Lot',
  difficulty: 'Easy',
  estimatedMinutes: 45,
  concepts: [],
  shortDescription: '',
  statement: '',
  requirements: [],
  assumptions: [],
  constraints: [],
  thinkingPrompts: [],
  designConsiderations: [],
  keywordsForEvaluation: ['vehicle', 'spot', 'ticket'],
}

const submission: Submission = {
  approach: 'Vehicle enters and gets a spot. Ticket is issued. Fee is calculated on exit.',
  classes: [
    {
      id: '1',
      name: 'ParkingLot',
      responsibility: 'Manages floors and spot allocation',
      methods: ['park(vehicle)', 'exit(ticket)'],
      relationships: ['has-many ParkingFloor'],
    },
  ],
  pseudocode: '',
  tradeoffs: '',
}

describe('EvaluationService', () => {
  beforeEach(() => {
    Object.keys(store).forEach(k => delete store[k])
  })

  it('returns a successful result using the default deterministic evaluator', async () => {
    const service = new EvaluationService()
    const attempt = AttemptService.startAttempt('parking-lot')
    const result = await service.evaluate(attempt.id, submission, problem)

    expect(result.success).toBe(true)
    expect(result.evaluation).toBeDefined()
    expect(result.evaluation!.score).toBeGreaterThan(0)
  })

  it('uses a provided custom evaluator', async () => {
    const mock = new MockEvaluator()
    const service = new EvaluationService(mock)
    const attempt = AttemptService.startAttempt('parking-lot')
    const result = await service.evaluate(attempt.id, submission, problem)

    expect(result.success).toBe(true)
    expect(result.evaluation!.score).toBeGreaterThanOrEqual(50)
    expect(result.evaluation!.score).toBeLessThanOrEqual(100)
    expect(result.evaluation!.evaluatorType).toBe('ai-mock')
  })

  it('persists evaluation to the attempt after success', async () => {
    const service = new EvaluationService()
    const attempt = AttemptService.startAttempt('parking-lot')
    await service.evaluate(attempt.id, submission, problem)

    const saved = AttemptService.getById(attempt.id)
    expect(saved?.status).toBe('evaluated')
    expect(saved?.evaluation).toBeDefined()
  })

  it('falls back to deterministic evaluator when primary fails', async () => {
    const failingEvaluator = {
      evaluate: async () => {
        throw new Error('AI unavailable')
      },
    }
    const service = new EvaluationService(failingEvaluator)
    const attempt = AttemptService.startAttempt('parking-lot')
    const result = await service.evaluate(attempt.id, submission, problem)

    // Fallback should succeed
    expect(result.success).toBe(true)
    expect(result.evaluation?.evaluatorType).toBe('deterministic')
  })

  it('returns error result when all evaluators fail', async () => {
    // Override the fallback by pointing primary and fallback to the same failing evaluator
    const failingEvaluator = {
      evaluate: async () => {
        throw new Error('completely broken')
      },
    }
    // Inject a service where even the fallback (deterministic) is replaced
    // We achieve this by subclassing to expose it
    class BrokenService extends EvaluationService {
      constructor() {
        super(failingEvaluator)
        // Point fallback to same failing evaluator
        ;(this as unknown as { fallback: typeof failingEvaluator }).fallback = failingEvaluator
      }
    }

    const service = new BrokenService()
    const attempt = AttemptService.startAttempt('parking-lot')
    const result = await service.evaluate(attempt.id, submission, problem)

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('marks attempt as evaluation_failed when all evaluators fail', async () => {
    const failingEvaluator = {
      evaluate: async () => { throw new Error('fail') },
    }
    class BrokenService extends EvaluationService {
      constructor() {
        super(failingEvaluator)
        ;(this as unknown as { fallback: typeof failingEvaluator }).fallback = failingEvaluator
      }
    }

    const service = new BrokenService()
    const attempt = AttemptService.startAttempt('parking-lot')
    await service.evaluate(attempt.id, submission, problem)

    const saved = AttemptService.getById(attempt.id)
    expect(saved?.status).toBe('evaluation_failed')
  })
})
