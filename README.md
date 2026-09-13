# DesignLab

**Practice Low-Level Design. Get feedback. Improve your design.**

---

## Overview

DesignLab is a focused learning platform where software developers practice Low-Level Design (LLD) problems. Learners choose a problem, think through a design, submit a structured solution, receive explainable feedback, and then improve through iteration.

The platform runs entirely in the browser — no backend, no login, no setup.

---

## The Problem

LLD interviews are consistently among the hardest for developers to prepare for. Unlike algorithms, there is no single correct answer. Existing resources either:

- Provide model solutions without teaching the design thinking process
- Give vague feedback that doesn't explain *why* a design is weak
- Don't track iterative improvement over multiple attempts

DesignLab fills this gap with structured submission and rule-based explainable feedback.

---

## Features

- **6 curated LLD problems** — Parking Lot, Vending Machine, Elevator System, Library Management, Chess, and a custom problem creator
- **Custom problem support** — add any system design challenge and practice it immediately
- **Structured submission** — guided sections: Approach, Class Design, Pseudocode, Trade-offs
- **Deterministic evaluator** — scores submissions across 6 categories with textual explanations (no API key required)
- **Per-category scoring** — Requirement Coverage, Class Responsibility, Separation of Concerns, Extensibility, Abstraction, Edge Cases
- **Strengths, weaknesses, and actionable suggestions** per attempt
- **Draft auto-save** — saves every 30 seconds to localStorage
- **Attempt history** — all past attempts with scores, dates, and retry links
- **Delete history** — remove individual attempts or clear all history
- **Progress stats** — total attempts, problems attempted, average and best scores

---

## User Flow

```
Browse Problems (or Create a Custom Problem)
  → Open Problem Detail (requirements, assumptions, thinking prompts)
    → Start Attempt
      → Fill Approach / Class Design / Pseudocode / Trade-offs
        → Auto-saved as Draft every 30 seconds
          → Submit & Evaluate
            → Feedback Page (score, category breakdown, strengths, weaknesses, suggestions)
              → Try Again → new attempt on the same problem
History Page → view all past attempts, scores, delete entries
```

---

## Architecture

```
src/
  domain/         Core TypeScript types (Problem, Attempt, Submission, Evaluation)
  data/           Seeded problem definitions (6 problems with requirements, prompts, keywords)
  evaluators/     Evaluator interface, DeterministicEvaluator, MockEvaluator
  services/       AttemptService (localStorage CRUD) + EvaluationService (orchestration)
  hooks/          useSubmissionForm (form state management)
  components/     Nav, Badge, ScoreBar, LoadingSpinner, ErrorMessage, EmptyState
  pages/          Home, Problems, ProblemDetail, Practice, Feedback, History, CreateProblem
  utils/          validation.ts
  test/           vitest setup
```

**Key architectural principle:** UI components contain no business logic. All domain behaviour lives in `services/` and `evaluators/`. Pages are thin wrappers that call services and render results.

---

## Evaluation

### Deterministic Evaluator (default)

Scores submissions across 6 categories with no external dependencies:

| Category | Weight | How it's measured |
|---|---|---|
| Requirement Coverage | 25% | Keyword matching against problem-specific domain vocabulary |
| Class Responsibility | 20% | Class count, responsibility completeness, methods, relationships |
| Separation of Concerns | 20% | God-class detection, presence of service/strategy layers |
| Extensibility | 15% | Strategy/interface/abstract pattern signals |
| Abstraction | 10% | OOP abstraction vocabulary presence |
| Edge Cases | 10% | Failure scenario vocabulary (null, empty, exception, concurrent, etc.) |

Every score includes a textual explanation of *why* the score was given.

### Mock Evaluator (fallback)

If the deterministic evaluator fails, the `MockEvaluator` generates realistic-looking randomized feedback from a curated pool of engineering commentary. It mirrors the same `Evaluation` structure so the UI works identically.

---

## Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# Opens at http://localhost:5173

# Run tests
npm test

# Build for production
npm run build
```

No environment variables are required.

---

## Tests

```bash
npm test
```

43 tests across 4 test files:

| File | Tests | Coverage |
|---|---|---|
| `src/evaluators/DeterministicEvaluator.test.ts` | 17 | Scoring logic, feedback quality, edge inputs |
| `src/services/AttemptService.test.ts` | 11 | CRUD, persistence, stats, deletion |
| `src/services/EvaluationService.test.ts` | 6 | Orchestration, fallback, failure handling |
| `src/utils/validation.test.ts` | 9 | Field validation, empty detection |

---

## Trade-offs

| Decision | Reason |
|---|---|
| localStorage instead of backend | Sufficient for a prototype. No infrastructure overhead. |
| Rule-based evaluation | Works offline. Explainable and consistent output. |
| 6 curated problems + custom creator | Quality over quantity. Each problem has full requirements, prompts, and evaluation keywords. |
| Single-page application | Simplest architecture for the learner journey. |
| No undo in form | Out of scope. Drafts auto-save every 30 seconds. |

---

## Known Limitations

- Evaluation is keyword-based, not semantic. A well-designed solution using uncommon terminology may score lower than expected.
- localStorage is browser-local (~5 MB limit). History does not sync across devices.
- Draft auto-save happens every 30 seconds, not on every keystroke. A hard crash could lose up to 30 seconds of unsaved work.
