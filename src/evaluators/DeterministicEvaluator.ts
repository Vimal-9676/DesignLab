import type { Submission, Problem, Evaluation, CategoryScore } from '../domain/types'
import type { Evaluator } from './types'

/**
 * DeterministicEvaluator performs rule-based scoring of LLD submissions.
 *
 * Scoring is based on:
 * 1. Requirement Coverage  — how many problem keywords appear in the submission
 * 2. Class Responsibility  — quality of class entries (names, responsibilities, methods)
 * 3. Separation of Concerns — whether responsibilities are distributed across multiple classes
 * 4. Extensibility         — presence of strategy/interface/abstract patterns
 * 5. Abstraction           — use of interfaces, abstract concepts, dependency inversion signals
 * 6. Edge Cases            — whether edge/failure cases are mentioned in approach or trade-offs
 *
 * Feedback explains WHY the score was given, not just the number.
 */
export class DeterministicEvaluator implements Evaluator {
  async evaluate(submission: Submission, problem: Problem): Promise<Evaluation> {
    const fullText = buildFullText(submission)
    const lowerText = fullText.toLowerCase()

    const requirementCoverage = scoreRequirementCoverage(lowerText, problem.keywordsForEvaluation)
    const classResponsibility = scoreClassResponsibility(submission.classes)
    const separationOfConcerns = scoreSeparationOfConcerns(submission.classes, lowerText)
    const extensibility = scoreExtensibility(lowerText, submission.classes)
    const abstraction = scoreAbstraction(lowerText, submission.classes)
    const edgeCases = scoreEdgeCases(lowerText)

    const categoryScores: CategoryScore[] = [
      requirementCoverage,
      classResponsibility,
      separationOfConcerns,
      extensibility,
      abstraction,
      edgeCases,
    ]

    const totalScore = computeOverallScore(categoryScores)
    const strengths = deriveStrengths(submission, categoryScores, lowerText)
    const weaknesses = deriveWeaknesses(submission, categoryScores, lowerText)
    const suggestions = deriveSuggestions(categoryScores, submission, problem)

    return {
      score: totalScore,
      categoryScores,
      strengths,
      weaknesses,
      suggestions,
      evaluatedAt: new Date().toISOString(),
      evaluatorType: 'deterministic',
    }
  }
}

// ─── Text helpers ────────────────────────────────────────────────────────────

function buildFullText(submission: Submission): string {
  const classText = submission.classes
    .map(c => `${c.name} ${c.responsibility} ${c.methods.join(' ')} ${c.relationships.join(' ')}`)
    .join(' ')
  return `${submission.approach} ${classText} ${submission.pseudocode} ${submission.tradeoffs}`
}

// ─── Category scorers ─────────────────────────────────────────────────────────

function scoreRequirementCoverage(text: string, keywords: string[]): CategoryScore {
  if (keywords.length === 0) {
    return {
      category: 'Requirement Coverage',
      score: 70,
      maxScore: 100,
      explanation: 'No specific keywords to evaluate for this problem.',
    }
  }

  const matched = keywords.filter(kw => text.includes(kw.toLowerCase()))
  const ratio = matched.length / keywords.length
  const score = Math.round(40 + ratio * 60)

  const unmatched = keywords.filter(kw => !text.includes(kw.toLowerCase())).slice(0, 3)
  const unmatchedNote =
    unmatched.length > 0
      ? ` Key concepts not mentioned: ${unmatched.join(', ')}.`
      : ' All key domain concepts are addressed.'

  return {
    category: 'Requirement Coverage',
    score,
    maxScore: 100,
    explanation:
      `Your design addresses ${matched.length} of ${keywords.length} domain concepts (${Math.round(ratio * 100)}%).${unmatchedNote}`,
  }
}

function scoreClassResponsibility(classes: ClassDesign[]): CategoryScore {
  if (classes.length === 0) {
    return {
      category: 'Class Responsibility',
      score: 20,
      maxScore: 100,
      explanation:
        'No structured class entries were provided. A class diagram or list of responsibilities is essential for evaluating LLD.',
    }
  }

  let score = 0
  const issues: string[] = []

  // Having classes at all
  score += Math.min(classes.length * 10, 40)

  // Each class has a non-empty responsibility
  const withResponsibility = classes.filter(c => c.responsibility.trim().length > 10)
  score += Math.min(withResponsibility.length * 7, 25)

  // Each class has methods
  const withMethods = classes.filter(c => c.methods.length > 0)
  score += Math.min(withMethods.length * 6, 25)

  // Each class has relationships
  const withRelationships = classes.filter(c => c.relationships.length > 0)
  score += Math.min(withRelationships.length * 4, 15)

  score = Math.min(score, 100)

  if (withResponsibility.length < classes.length) {
    issues.push('some classes lack a clear single responsibility description')
  }
  if (withMethods.length < classes.length) {
    issues.push('some classes are missing key methods')
  }

  const explanation =
    issues.length > 0
      ? `${classes.length} classes defined. Issues: ${issues.join('; ')}.`
      : `${classes.length} classes with responsibilities, methods, and relationships defined — good structural coverage.`

  return { category: 'Class Responsibility', score, maxScore: 100, explanation }
}

import type { ClassDesign } from '../domain/types'

function scoreSeparationOfConcerns(classes: ClassDesign[], text: string): CategoryScore {
  if (classes.length < 2) {
    return {
      category: 'Separation of Concerns',
      score: 25,
      maxScore: 100,
      explanation:
        'With fewer than 2 classes defined, it is difficult to assess separation of concerns. Consider splitting responsibilities across dedicated classes.',
    }
  }

  // Check for god-class smell: single class with many responsibilities
  const godClassCandidates = classes.filter(
    c => c.responsibility.split('.').length > 3 || c.methods.length > 8,
  )

  let score = 60
  const notes: string[] = []

  if (godClassCandidates.length === 0) {
    score += 20
    notes.push('No obvious god-class detected.')
  } else {
    score -= godClassCandidates.length * 10
    const names = godClassCandidates.map(c => c.name).join(', ')
    notes.push(`${names} may have too many responsibilities.`)
  }

  // Bonus for separating concerns explicitly (persistence, logic, presentation)
  const separationKeywords = ['service', 'repository', 'controller', 'manager', 'handler', 'strategy', 'calculator', 'processor']
  const hasSeparation = separationKeywords.some(kw => text.includes(kw))
  if (hasSeparation) {
    score += 15
    notes.push('Distinct service/strategy/handler layers are present.')
  }

  score = Math.max(10, Math.min(score, 100))

  return {
    category: 'Separation of Concerns',
    score,
    maxScore: 100,
    explanation: notes.join(' '),
  }
}

function scoreExtensibility(text: string, classes: ClassDesign[]): CategoryScore {
  const strategySignals = ['strategy', 'interface', 'abstract', 'plugin', 'extensib', 'open/closed', 'ocp', 'inject']
  const hasStrategyPattern = strategySignals.some(s => text.includes(s))

  const interfaceClasses = classes.filter(c =>
    c.name.toLowerCase().includes('strategy') ||
    c.name.toLowerCase().includes('interface') ||
    c.name.toLowerCase().includes('abstract') ||
    c.responsibility.toLowerCase().includes('interface') ||
    c.responsibility.toLowerCase().includes('abstract'),
  )

  let score = 50
  const notes: string[] = []

  if (hasStrategyPattern) {
    score += 25
    notes.push('Strategy/interface abstraction signals are present — the design appears extensible.')
  } else {
    notes.push('No explicit extensibility patterns detected (strategy, interface, abstract).')
  }

  if (interfaceClasses.length > 0) {
    score += 20
    notes.push(`${interfaceClasses.map(c => c.name).join(', ')} suggest pluggable behaviour.`)
  }

  if (score < 70 && text.includes('future')) {
    score += 5
    notes.push('Future extensibility is mentioned, but not backed by concrete abstractions.')
  }

  score = Math.min(score, 100)

  return {
    category: 'Extensibility',
    score,
    maxScore: 100,
    explanation: notes.join(' '),
  }
}

function scoreAbstraction(text: string, classes: ClassDesign[]): CategoryScore {
  const abstractionSignals = [
    'interface', 'abstract', 'polymorphi', 'inherit', 'extend', 'implement',
    'dependency injection', 'di', 'solid', 'liskov', 'srp', 'isp',
  ]
  const matched = abstractionSignals.filter(s => text.includes(s))

  let score = 45 + Math.min(matched.length * 8, 40)

  // Check for over-abstraction smell (too many single-method interfaces or tiny classes)
  const tinyClasses = classes.filter(c => c.methods.length <= 1 && c.responsibility.length < 20)
  if (tinyClasses.length > classes.length / 2 && classes.length > 3) {
    score -= 10
  }

  score = Math.min(score, 100)

  const explanation =
    matched.length > 0
      ? `Good abstraction signals: ${matched.slice(0, 3).join(', ')} found in the design.`
      : 'Limited abstraction vocabulary detected. Consider explicitly mentioning interfaces, inheritance, or SOLID principles where applicable.'

  return { category: 'Abstraction', score, maxScore: 100, explanation }
}

function scoreEdgeCases(text: string): CategoryScore {
  const edgeSignals = [
    'null', 'empty', 'full', 'error', 'fail', 'invalid', 'exception',
    'edge', 'boundary', 'overflow', 'unavailable', 'not found', 'missing',
    'timeout', 'concurrent', 'race condition', 'duplicate',
  ]
  const matched = edgeSignals.filter(s => text.includes(s))

  const score = Math.min(30 + matched.length * 10, 100)

  const explanation =
    matched.length >= 3
      ? `Edge cases addressed: ${matched.slice(0, 4).join(', ')}. Good defensive thinking.`
      : matched.length > 0
      ? `Some edge cases noted (${matched.join(', ')}), but more failure scenarios would strengthen the design.`
      : 'No explicit edge cases or failure scenarios detected. Strong LLD designs always address what can go wrong.'

  return { category: 'Edge Cases', score, maxScore: 100, explanation }
}

// ─── Overall score ─────────────────────────────────────────────────────────────

const CATEGORY_WEIGHTS: Record<string, number> = {
  'Requirement Coverage': 0.25,
  'Class Responsibility': 0.20,
  'Separation of Concerns': 0.20,
  'Extensibility': 0.15,
  'Abstraction': 0.10,
  'Edge Cases': 0.10,
}

function computeOverallScore(categories: CategoryScore[]): number {
  const weightedSum = categories.reduce((sum, cat) => {
    const weight = CATEGORY_WEIGHTS[cat.category] ?? 0.1
    return sum + (cat.score / cat.maxScore) * weight * 100
  }, 0)
  return Math.round(weightedSum)
}

// ─── Narrative generation ──────────────────────────────────────────────────────

function deriveStrengths(submission: Submission, categoryScores: CategoryScore[], _text: string): string[] {
  const strengths: string[] = []

  const highCategories = categoryScores.filter(c => c.score / c.maxScore >= 0.75)
  highCategories.forEach(cat => {
    if (cat.category === 'Requirement Coverage') {
      strengths.push('The submission addresses the core domain concepts of the problem.')
    }
    if (cat.category === 'Class Responsibility') {
      strengths.push(`${submission.classes.length} classes are defined with clear responsibilities and methods.`)
    }
    if (cat.category === 'Extensibility') {
      strengths.push('The design shows awareness of extensibility through strategy or interface abstractions.')
    }
    if (cat.category === 'Separation of Concerns') {
      strengths.push('Responsibilities are distributed across separate classes — no obvious god class.')
    }
    if (cat.category === 'Edge Cases') {
      strengths.push('Edge cases and failure scenarios are explicitly considered.')
    }
  })

  if (submission.tradeoffs.trim().length > 50) {
    strengths.push('Trade-offs and assumptions are clearly documented, which shows design maturity.')
  }

  if (submission.pseudocode.trim().length > 100) {
    strengths.push('Pseudocode or code examples add concrete detail to the abstract design.')
  }

  return strengths.length > 0 ? strengths : ['The submission demonstrates an initial attempt at the problem domain.']
}

function deriveWeaknesses(_submission: Submission, categories: CategoryScore[], _text: string): string[] {
  const weaknesses: string[] = []

  const lowCategories = categories.filter(c => c.score / c.maxScore < 0.55)
  lowCategories.forEach(cat => {
    if (cat.category === 'Class Responsibility') {
      weaknesses.push('Class definitions are thin — more detailed responsibilities and methods are needed.')
    }
    if (cat.category === 'Requirement Coverage') {
      weaknesses.push('Not all domain concepts from the problem statement are addressed in the design.')
    }
    if (cat.category === 'Extensibility') {
      weaknesses.push('The design lacks explicit extensibility hooks (e.g., strategy patterns, interfaces) that would allow future changes without modifying core classes.')
    }
    if (cat.category === 'Separation of Concerns') {
      weaknesses.push('Some classes appear to carry multiple responsibilities. Splitting these would improve cohesion.')
    }
    if (cat.category === 'Edge Cases') {
      weaknesses.push('Failure scenarios and edge cases are not explicitly addressed in the design.')
    }
    if (cat.category === 'Abstraction') {
      weaknesses.push('The design would benefit from explicit interfaces or abstract base classes to decouple components.')
    }
  })

  return weaknesses
}

function deriveSuggestions(categoryScores: CategoryScore[], submission: Submission, problem: Problem): string[] {
  const suggestions: string[] = []

  const extensibility = categoryScores.find(c => c.category === 'Extensibility')
  if (extensibility && extensibility.score < 70) {
    suggestions.push(
      `Introduce a dedicated Strategy interface for the key variable behaviour in this design. ` +
      `For example, in ${problem.title}, the primary allocation or calculation logic could be extracted ` +
      `into a strategy so it can vary without modifying the host class.`,
    )
  }

  const separation = categoryScores.find(c => c.category === 'Separation of Concerns')
  if (separation && separation.score < 65) {
    suggestions.push(
      'Review each class for single-responsibility adherence. If a class manages both data and operations, ' +
      'consider splitting into a data model and a dedicated service/handler class.',
    )
  }

  const edgeCases = categoryScores.find(c => c.category === 'Edge Cases')
  if (edgeCases && edgeCases.score < 60) {
    suggestions.push(
      'Add a section to your design addressing at least 3 failure scenarios: what happens when a resource is unavailable, ' +
      'when invalid input is provided, and when a concurrent access conflict occurs.',
    )
  }

  const abstraction = categoryScores.find(c => c.category === 'Abstraction')
  if (abstraction && abstraction.score < 60) {
    suggestions.push(
      'Define explicit interfaces for key collaborators. This makes the design testable and allows components to be swapped without cascading changes.',
    )
  }

  if (submission.tradeoffs.trim().length < 30) {
    suggestions.push(
      'Document the trade-offs you made consciously. For example: why did you choose this data structure over another? ' +
      'What did you deprioritize and why?',
    )
  }

  return suggestions
}
