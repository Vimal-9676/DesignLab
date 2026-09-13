# RESEARCH.md — DesignLab Background Research

## The Learner Problem

Low-Level Design (LLD) interviews test a candidate's ability to model a real-world system using classes, interfaces, and relationships — without implementing full production code. This skill is distinct from algorithms (LeetCode-style) and system design (HLD).

Developers struggle with LLD preparation for several interconnected reasons:

1. **No clear evaluation criteria.** Unlike a sorting algorithm, there is no single correct LLD solution. A good design is judged on principles: single responsibility, open/closed, loose coupling, extensibility. These principles are described in books but rarely operationalized into actionable feedback.

2. **Existing resources teach solutions, not thinking.** Most LLD preparation content provides model answers (class diagrams, code). This teaches pattern recognition, not the reasoning behind design decisions.

3. **No feedback loop.** Developers practice by reviewing notes or model solutions. There is no mechanism to submit a design, receive feedback on it, and improve iteratively. This is the core gap.

---

## Survey of Existing Approaches

### LeetCode / Neetcode
These platforms focus on algorithmic problems and do not address LLD. Their submission model (executable code checked against test cases) does not translate to design problems where the primary output is a set of decisions, not executable logic.

### Educative.io / Grokking the Object-Oriented Design Interview
Well-researched course content. Provides detailed worked examples for common LLD problems (parking lot, elevator system, etc.). However:
- No interactive submission or feedback
- Learner reads a model solution rather than constructing their own
- No iteration or progress tracking

### AlgoExpert System Design
Video-based explanations of design problems. Same limitation — passive consumption, no active submission.

### GitHub Repositories ("LLD Interview Questions")
Collections of model solutions, often in Java. Useful as references but provide no learning structure or feedback mechanism.

---

## Key Gap

**None of these tools let a learner submit their own design and receive structured feedback on it.**

The closest analogy in adjacent spaces:
- Code review tools (which require executing code)
- Writing feedback tools (like Grammarly — domain-specific, not generalisable)
- Human mock interviews (effective but expensive and time-constrained)

DesignLab occupies the gap between passive content consumption and a full human mock interview: it accepts a structured design submission and returns explainable, principle-based feedback.

---

## Product Direction

The core product decision was to make feedback **explainable and principle-based**, not **answer-matching**. This matters because:

1. Multiple valid LLD solutions exist for any problem. Checking whether a learner's solution matches one expected answer would penalise creative but correct thinking.

2. The learning objective is to understand *why* a design is weak, not just that it is weak. "Your extensibility score is 58/100 because the allocation logic is directly embedded in ParkingLot rather than behind a strategy interface" is actionable. "Improve your design" is not.

3. A deterministic rule-based evaluator can deliver this quality of feedback without requiring a machine learning model. The evaluator looks for signals of good design thinking — vocabulary around strategies, interfaces, separation of concerns, edge cases — rather than trying to semantically understand a free-text response.

The feedback model is inspired by rubric-based academic assessment (where a professor evaluates against explicit criteria, not against a single model answer) and by structured code review (where the reviewer addresses specific aspects: maintainability, testability, coupling).

---

## Sources

- Martin Fowler, *Patterns of Enterprise Application Architecture*, 2002
- Robert Martin (Uncle Bob), *Clean Architecture*, 2017
- "Object-Oriented Design Interview" — Educative.io course outline (reviewed for problem scope)
- Grokking the Object-Oriented Design Interview — problem list and requirements reviewed for problem seeding
- Common LLD interview problem sets from public GitHub repositories (used to validate problem selection)
