# DESIGN.md — DesignLab Technical Design

## Scope

DesignLab is a single-page React application. The current implementation covers:

1. Problem browsing and detail view
2. Custom problem creation
3. Attempt creation, structured submission, and draft auto-save
4. Deterministic evaluation with category-level explanations
5. Mock fallback evaluator with randomized realistic feedback
6. Attempt history with individual and bulk deletion

Deliberately excluded: backend, authentication, admin panel, external AI APIs, analytics.

---

## User Flow

```
Home
  └── Problems List (+ Create Custom Problem)
        └── Problem Detail (requirements, assumptions, thinking prompts)
              └── Start Attempt → Practice Page
                    ├── Auto-save Draft (localStorage, every 30s)
                    └── Submit & Evaluate → EvaluationService → Feedback Page
                          └── Try Again → Problem Detail
History Page (all attempts, scores, delete individual or clear all)
```

---

## Domain Model

```typescript
Problem {
  id, title, difficulty, estimatedMinutes, concepts[]
  statement, requirements[], assumptions[], constraints[]
  thinkingPrompts[], designConsiderations[], keywordsForEvaluation[]
  isCustom?: boolean   // true for user-created problems
}

Attempt {
  id, problemId, attemptNumber
  status: 'draft' | 'submitted' | 'evaluated' | 'evaluation_failed'
  createdAt, updatedAt
  submission?: Submission
  evaluation?: Evaluation
}

Submission {
  approach: string        // free-text design narrative
  classes: ClassDesign[]  // structured class entries
  pseudocode: string      // optional code sketch
  tradeoffs: string       // optional trade-off documentation
}

ClassDesign {
  id, name, responsibility
  methods: string[]       // one per line
  relationships: string[] // one per line
}

Evaluation {
  score: number           // 0–100 weighted composite
  categoryScores: CategoryScore[]
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  evaluatedAt: string
  evaluatorType: 'deterministic' | 'mock'
}

CategoryScore {
  category: string
  score: number
  maxScore: number
  explanation: string     // required — every score must explain itself
}
```

---

## Evaluator Architecture

```
interface Evaluator {
  evaluate(submission: Submission, problem: Problem): Promise<Evaluation>
}

DeterministicEvaluator implements Evaluator  // default; keyword-based rule engine
MockEvaluator implements Evaluator           // fallback; randomized realistic feedback
```

`EvaluationService` accepts an optional `Evaluator` via constructor injection. It:

1. Tries the primary evaluator (`MockEvaluator` by default)
2. If that fails, falls back to `DeterministicEvaluator`
3. If both fail, marks the attempt as `evaluation_failed` and returns a user-friendly error
4. On success, persists the evaluation via `AttemptService`

---

## Deterministic Evaluation Logic

Six scoring categories, each with a weight:

| Category | Weight | Logic |
|---|---|---|
| Requirement Coverage | 25% | Keywords from `problem.keywordsForEvaluation` matched in full submission text |
| Class Responsibility | 20% | Class count, responsibility length, method count, relationship count |
| Separation of Concerns | 20% | God-class detection (many methods or compound responsibilities); service/strategy layer signals |
| Extensibility | 15% | Presence of `strategy`, `interface`, `abstract`, `inject` vocabulary |
| Abstraction | 10% | Presence of OOP abstraction vocabulary (inherit, polymorphi, SOLID, etc.) |
| Edge Cases | 10% | Failure vocabulary: null, empty, full, exception, concurrent, invalid, timeout |

Overall score = Σ (category_score / max_score × weight × 100), rounded.

Keyword matching is case-insensitive and covers the full submission text (approach + class names + methods + relationships + pseudocode + trade-offs).

---

## Persistence

`AttemptService` wraps all `localStorage` operations. Storage key: `designlab:attempts`.

| Method | Description |
|---|---|
| `getAll()` | Returns all attempts |
| `getById(id)` | Returns a single attempt |
| `startAttempt(problemId)` | Creates a new draft attempt |
| `saveDraft(id, submission)` | Saves in-progress work |
| `submitAttempt(id, submission)` | Marks as submitted |
| `recordEvaluation(id, evaluation)` | Marks as evaluated, stores result |
| `markEvaluationFailed(id)` | Marks as evaluation_failed |
| `deleteAttempt(id)` | Removes a single attempt |
| `clearAllAttempts()` | Removes all attempts |
| `getStats()` | Computes aggregate stats from evaluated attempts |

If `localStorage` returns corrupted JSON, `loadAttempts()` catches the error and returns an empty array (no crash).

---

## Failure Handling

| Failure | Handling |
|---|---|
| Empty submission | Validation in `validateSubmission()` before evaluation |
| Evaluation error (primary) | Falls back to `DeterministicEvaluator` |
| Evaluation error (both) | Marks attempt as `evaluation_failed`; shows actionable error |
| localStorage full | Error caught; submission not persisted; no crash |
| Attempt not found | Error page with navigation back to problems |
| Unknown route | `<Navigate to="/" replace />` |

---

## Key Trade-offs

**Deterministic vs semantic evaluation:** The rule-based evaluator is consistent and explainable, but rewards vocabulary over design quality. A learner who understands strategy patterns but doesn't use the word "strategy" may score lower than expected. This is acceptable for a prototype — the feedback is still useful and actionable.

**localStorage vs backend:** localStorage is browser-local and not shared across devices. For a single-session learning prototype this is acceptable. The `AttemptService` abstraction means a backend swap would require no UI changes.

**No AI integration:** Gemini API was removed after it introduced CSP violations via internal `eval()` usage. The `MockEvaluator` provides realistic varied feedback without external calls or security trade-offs.

**No pagination in History:** The history page loads all attempts. For a learning tool with dozens of attempts, this is fine. A production system would paginate.
