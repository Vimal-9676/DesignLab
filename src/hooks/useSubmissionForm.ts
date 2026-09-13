import { useState, useCallback } from 'react'
import type { Submission, ClassDesign } from '../domain/types'

const emptyClass = (): ClassDesign => ({
  id: `class-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  name: '',
  responsibility: '',
  methods: [],
  relationships: [],
})

const emptySubmission = (): Submission => ({
  approach: `# Core Entities\n- \n- \n\n# Design Patterns\n- \n- \n\n# Database/Storage (Optional)\n- \n`,
  classes: [],
  pseudocode: `// Define main interfaces and classes here\n\ninterface Example {\n  doSomething(): void;\n}\n\nclass ExampleImpl implements Example {\n  doSomething() {\n    // logic\n  }\n}\n`,
  tradeoffs: `- **Choice**: \n  **Reason**: \n  **Trade-off**: \n\n- **Assumption**: \n`,
})

export function useSubmissionForm(initial?: Partial<Submission>) {
  const [submission, setSubmission] = useState<Submission>({
    ...emptySubmission(),
    ...initial,
  })

  const updateField = useCallback(<K extends keyof Submission>(field: K, value: Submission[K]) => {
    setSubmission(prev => ({ ...prev, [field]: value }))
  }, [])

  const addClass = useCallback(() => {
    setSubmission(prev => ({ ...prev, classes: [...prev.classes, emptyClass()] }))
  }, [])

  const updateClass = useCallback((id: string, updates: Partial<ClassDesign>) => {
    setSubmission(prev => ({
      ...prev,
      classes: prev.classes.map(c => (c.id === id ? { ...c, ...updates } : c)),
    }))
  }, [])

  const removeClass = useCallback((id: string) => {
    setSubmission(prev => ({
      ...prev,
      classes: prev.classes.filter(c => c.id !== id),
    }))
  }, [])

  const reset = useCallback(() => {
    setSubmission(emptySubmission())
  }, [])

  return {
    submission,
    updateField,
    addClass,
    updateClass,
    removeClass,
    reset,
  }
}
