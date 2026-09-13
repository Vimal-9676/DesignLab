# AI_USAGE.md — DesignLab

This document records AI-assisted decisions made during the design and implementation of DesignLab. It is written as an engineering decision log, not a marketing document.

**Note on AI integration:** DesignLab does not use any live AI API. The `MockEvaluator` generates randomized but realistic-looking feedback from a curated pool of engineering commentary, all computed locally in the browser. No external AI service is called at runtime.

---

## 1. Evaluator Abstraction — Accepted

**AI suggestion:** Introduce an `Evaluator` interface so deterministic and mock evaluations are interchangeable.

**Rationale for acceptance:** The assignment explicitly asks about extensibility. If the evaluator is a concrete class, swapping implementations would require modifying `EvaluationService` and potentially the UI. With the interface, the service selects the evaluator at construction time, and the UI remains unchanged.

**Result:** `src/evaluators/types.ts` defines the interface. `DeterministicEvaluator` and `MockEvaluator` both implement it. `EvaluationService` injects any implementation and falls back gracefully.

---

## 2. Structured Class-Design Submission Format — Accepted

**AI suggestion:** Let learners submit a structured class list (name, responsibility, methods, relationships) rather than just a free-text description.

**Rationale for acceptance:** Free-text submission makes deterministic evaluation unreliable. Structured fields give the evaluator concrete signals: Are there multiple classes? Do they have named responsibilities? Are relationships documented? The structured format also teaches the learner to think in class-responsibility terms.

**Partial modification:** Code and approach sections remain free-text. Only the class design section is structured — this avoids over-constraining the learner while enabling meaningful scoring.

---

## 3. LocalStorage for Persistence — Accepted

**AI suggestion:** Use `localStorage` rather than building a backend.

**Rationale for acceptance:** A backend would require authentication, a database schema, and deployment configuration — none of which add value to the learner journey being prototyped. `localStorage` provides sufficient persistence: attempts survive page refresh, history works, feedback is retained. The `AttemptService` is a pure service layer and could be re-implemented against a REST API with no UI changes.

---

## 4. Hybrid Scoring with Category Weights — Accepted

**AI suggestion:** Weight scoring categories differently rather than using an unweighted average.

**Rationale for acceptance:** Not all dimensions are equally important for LLD. Requirement coverage (25%) and separation of concerns (20%) matter more than abstraction vocabulary (10%). Weighted scoring makes results more meaningful and allows future tuning. The weights are explicit constants (`CATEGORY_WEIGHTS`) and can be adjusted without touching the scoring logic.

---

## 5. Accordion-Style Section Layout for the Practice Form — Rejected

**AI suggestion:** Use a step-by-step wizard (one section per page) instead of a single page with expandable sections.

**Rationale for rejection:** A wizard creates artificial breaks in the design process. A learner working on class design might simultaneously want to update their approach section. The accordion layout keeps all sections accessible without navigating between pages. It also avoids multi-step form state management across routes.

---

## 6. Gemini AI Integration — Removed

**AI suggestion:** Integrate the Gemini API for live, semantic evaluation of submissions.

**Rationale for removal:** The integration introduced a Content Security Policy (CSP) violation because the Gemini SDK used `eval()` internally. Fixing this would have required loosening CSP restrictions, which is a security trade-off unacceptable for a public-facing prototype. The `MockEvaluator` was implemented as a clean replacement that provides realistic, varied feedback without any network calls or security concerns.

---

## Reflection

The most impactful decisions were the evaluator abstraction and the structured class-design format. Together they solve the core challenge of the prototype: how to give meaningful feedback on a design answer without a live AI model. The structured format gives the deterministic evaluator concrete signals, while the interface keeps the system open to future improvement.

The Gemini removal is the clearest example of a pragmatic reversal — the feature was reasonable in concept but introduced unacceptable security complexity for the scope of this project.
