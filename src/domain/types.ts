export type Difficulty = 'Easy' | 'Medium' | 'Hard'
export type AttemptStatus = 'draft' | 'submitted' | 'evaluated' | 'evaluation_failed'
export type EvaluatorType = 'deterministic' | 'ai' | 'mock'

export interface ClassDesign {
  id: string
  name: string
  responsibility: string
  methods: string[]
  relationships: string[]
}

export interface Submission {
  approach: string
  classes: ClassDesign[]
  pseudocode: string
  tradeoffs: string
}

export interface CategoryScore {
  category: string
  score: number
  maxScore: number
  explanation: string
}

export interface Evaluation {
  score: number
  categoryScores: CategoryScore[]
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  evaluatedAt: string
  evaluatorType: EvaluatorType
}

export interface Attempt {
  id: string
  problemId: string
  attemptNumber: number
  status: AttemptStatus
  createdAt: string
  updatedAt: string
  submission?: Submission
  evaluation?: Evaluation
}

export interface Problem {
  id: string
  title: string
  difficulty: Difficulty
  estimatedMinutes: number
  concepts: string[]
  shortDescription: string
  statement: string
  requirements: string[]
  assumptions: string[]
  constraints: string[]
  thinkingPrompts: string[]
  designConsiderations: string[]
  keywordsForEvaluation: string[]
}
