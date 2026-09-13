import type { Submission, Problem, Evaluation } from '../domain/types'

export interface Evaluator {
  evaluate(submission: Submission, problem: Problem): Promise<Evaluation>
}

export interface EvaluationResult {
  success: boolean
  evaluation?: Evaluation
  error?: string
}
