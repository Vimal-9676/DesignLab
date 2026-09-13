import type { Submission } from '../domain/types'

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export function validateSubmission(submission: Submission): ValidationResult {
  const errors: string[] = []

  if (submission.approach.trim().length < 50) {
    errors.push('Approach / Explanation must be at least 50 characters. Describe your design thinking.')
  }

  if (submission.classes.length === 0) {
    errors.push('Add at least one class to the Class Design section.')
  } else {
    const emptyNames = submission.classes.filter(c => !c.name.trim())
    if (emptyNames.length > 0) {
      errors.push('All classes must have a name.')
    }
    const emptyResponsibilities = submission.classes.filter(c => !c.responsibility.trim())
    if (emptyResponsibilities.length > 0) {
      errors.push('Each class must have a responsibility description.')
    }
  }

  return { valid: errors.length === 0, errors }
}

export function isSubmissionEmpty(submission: Submission): boolean {
  return (
    !submission.approach.trim() &&
    submission.classes.length === 0 &&
    !submission.pseudocode.trim() &&
    !submission.tradeoffs.trim()
  )
}
