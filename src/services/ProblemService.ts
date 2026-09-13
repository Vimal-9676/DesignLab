import { problems as predefinedProblems } from '../data/problems'
import type { Problem } from '../domain/types'

const CUSTOM_PROBLEMS_KEY = 'designlab:custom_problems'

export class ProblemService {
  private static getCustomProblems(): Problem[] {
    try {
      const stored = localStorage.getItem(CUSTOM_PROBLEMS_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      console.warn('Failed to parse custom problems from localStorage')
    }
    return []
  }

  static getAllProblems(): Problem[] {
    return [...predefinedProblems, ...this.getCustomProblems()]
  }

  static getById(id: string): Problem | undefined {
    return this.getAllProblems().find(p => p.id === id)
  }

  static addCustomProblem(problem: Omit<Problem, 'id'>): Problem {
    const customProblems = this.getCustomProblems()
    
    // Generate a simple ID
    const id = `custom-${Date.now()}`
    
    const newProblem: Problem = {
      ...problem,
      id,
    }
    
    customProblems.push(newProblem)
    
    try {
      localStorage.setItem(CUSTOM_PROBLEMS_KEY, JSON.stringify(customProblems))
    } catch {
      console.warn('Failed to save custom problem to localStorage')
    }
    
    return newProblem
  }
}
