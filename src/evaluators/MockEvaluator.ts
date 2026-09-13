import type { Submission, Problem, Evaluation } from '../domain/types'
import type { Evaluator } from './types'

const GOOD_FEEDBACK = [
  'Good use of abstraction here.',
  'Solid understanding of the domain entities.',
  'The class responsibilities are well defined.',
  'Good separation of concerns observed.',
  'Clear and maintainable design.',
  'Appropriate use of design patterns.',
  'The approach is scalable and logical.',
]

const NEUTRAL_FEEDBACK = [
  'Consider adding more detail to edge cases.',
  'The relationships could be clearer.',
  'Might need some refinement for high concurrency.',
  'Some responsibilities seem slightly mixed.',
  'Could benefit from better dependency injection.',
  'Data flow could be explicitly stated.',
  'Keep in mind potential bottlenecks in storage.',
]

const BAD_FEEDBACK = [
  'Significant mixing of concerns detected.',
  'Lacks proper abstraction for core entities.',
  'Missing key requirements from the problem statement.',
  'Classes are too tightly coupled.',
  'Does not account for common edge cases.',
  'The design is overly monolithic.',
]

const STRENGTHS = [
  'Well-defined core entities.',
  'Good identification of key system components.',
  'Clear domain boundaries.',
  'Sensible approach to the problem.',
  'Easy to read pseudocode.',
  'Identified major tradeoffs.',
]

const WEAKNESSES = [
  'Missing some edge cases.',
  'Tight coupling between some classes.',
  'Could use more explicit design patterns.',
  'Data storage considerations are vague.',
  'Some classes do too much (God class anti-pattern).',
  'Error handling is not fully addressed.',
]

const SUGGESTIONS = [
  'Try applying the Strategy pattern for variable behaviors.',
  'Use Dependency Injection to decouple components.',
  'Consider breaking down the largest class into smaller ones.',
  'Think about how this scales with 1M concurrent users.',
  'Add interfaces to define contracts between layers.',
  'Document your assumptions about network latency.',
]

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomScore(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * MockEvaluator provides realistic, randomized evaluations.
 */
export class MockEvaluator implements Evaluator {
  async evaluate(_submission: Submission, _problem: Problem): Promise<Evaluation> {
    const scores = [
      randomScore(50, 100),
      randomScore(50, 100),
      randomScore(50, 100),
      randomScore(50, 100),
      randomScore(50, 100),
      randomScore(50, 100),
    ]

    const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)

    // Helper to ensure unique strengths/weaknesses
    const getUnique = (arr: string[], count: number) => {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    }

    return {
      score: overallScore,
      categoryScores: [
        {
          category: 'Requirement Coverage',
          score: scores[0],
          maxScore: 100,
          explanation: scores[0] > 75 ? randomItem(GOOD_FEEDBACK) : randomItem(NEUTRAL_FEEDBACK),
        },
        {
          category: 'Class Responsibility',
          score: scores[1],
          maxScore: 100,
          explanation: scores[1] > 75 ? randomItem(GOOD_FEEDBACK) : randomItem(NEUTRAL_FEEDBACK),
        },
        {
          category: 'Separation of Concerns',
          score: scores[2],
          maxScore: 100,
          explanation: scores[2] > 75 ? randomItem(GOOD_FEEDBACK) : randomItem(BAD_FEEDBACK),
        },
        {
          category: 'Extensibility',
          score: scores[3],
          maxScore: 100,
          explanation: scores[3] > 75 ? randomItem(GOOD_FEEDBACK) : randomItem(NEUTRAL_FEEDBACK),
        },
        {
          category: 'Abstraction',
          score: scores[4],
          maxScore: 100,
          explanation: scores[4] > 75 ? randomItem(GOOD_FEEDBACK) : randomItem(BAD_FEEDBACK),
        },
        {
          category: 'Edge Cases',
          score: scores[5],
          maxScore: 100,
          explanation: scores[5] > 75 ? randomItem(GOOD_FEEDBACK) : randomItem(NEUTRAL_FEEDBACK),
        },
      ],
      strengths: getUnique(STRENGTHS, 2),
      weaknesses: getUnique(WEAKNESSES, 2),
      suggestions: getUnique(SUGGESTIONS, 3),
      evaluatedAt: new Date().toISOString(),
      evaluatorType: 'mock',
    }
  }
}
