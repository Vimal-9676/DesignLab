import type { Submission, Problem } from '../domain/types'
import type { Evaluator, EvaluationResult } from '../evaluators/types'
import { DeterministicEvaluator } from '../evaluators/DeterministicEvaluator'
import { MockEvaluator } from '../evaluators/MockEvaluator'
import { AttemptService } from './AttemptService'

/**
 * EvaluationService orchestrates which evaluator runs and handles failures gracefully.
 *
 * The evaluator is injected, making it easy to swap in an AI evaluator or mock
 * without touching this service. The deterministic evaluator is always the fallback.
 */
export class EvaluationService {
  private readonly primary: Evaluator
  private readonly fallback: Evaluator

  constructor(primary?: Evaluator) {
    this.fallback = new DeterministicEvaluator()
    
    if (primary) {
      this.primary = primary
    } else {
      // Use the randomized MockEvaluator to generate realistic dummy feedback
      this.primary = new MockEvaluator()
    }
  }

  async evaluate(
    attemptId: string,
    submission: Submission,
    problem: Problem,
  ): Promise<EvaluationResult> {
    try {
      const evaluation = await this.primary.evaluate(submission, problem)
      AttemptService.recordEvaluation(attemptId, evaluation)
      return { success: true, evaluation }
    } catch (primaryError) {
      // If primary fails and it isn't already the fallback, try deterministic
      if (this.primary !== this.fallback) {
        try {
          const evaluation = await this.fallback.evaluate(submission, problem)
          AttemptService.recordEvaluation(attemptId, evaluation)
          return { success: true, evaluation }
        } catch {
          // Both evaluators failed
        }
      }

      AttemptService.markEvaluationFailed(attemptId)
      return {
        success: false,
        error: 'Evaluation could not be completed. Your submission has been saved. You can retry evaluation.',
      }
    }
  }
}

export type { EvaluationResult }
