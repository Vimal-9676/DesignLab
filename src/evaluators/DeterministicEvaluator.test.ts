import { describe, it, expect } from 'vitest'
import { DeterministicEvaluator } from '../evaluators/DeterministicEvaluator'
import type { Submission, Problem } from '../domain/types'

const evaluator = new DeterministicEvaluator()

const parkingLotProblem: Problem = {
  id: 'parking-lot',
  title: 'Parking Lot',
  difficulty: 'Easy',
  estimatedMinutes: 45,
  concepts: ['OOP', 'Strategy Pattern'],
  shortDescription: 'Design a parking lot',
  statement: 'Design a parking lot',
  requirements: ['Vehicle enters', 'Spot assigned', 'Vehicle exits', 'Fee calculated'],
  assumptions: ['Payment always succeeds'],
  constraints: ['Spot cannot be double-assigned'],
  thinkingPrompts: ['Think about entities'],
  designConsiderations: ['ParkingLot', 'ParkingSpot', 'Vehicle', 'Ticket'],
  keywordsForEvaluation: ['vehicle', 'spot', 'parking', 'ticket', 'payment', 'floor'],
}

function makeSubmission(overrides: Partial<Submission> = {}): Submission {
  return {
    approach: '',
    classes: [],
    pseudocode: '',
    tradeoffs: '',
    ...overrides,
  }
}

describe('DeterministicEvaluator', () => {
  describe('empty submission', () => {
    it('gives a low overall score', async () => {
      const result = await evaluator.evaluate(makeSubmission(), parkingLotProblem)
      expect(result.score).toBeLessThan(50)
    })

    it('gives low requirement coverage when nothing is written', async () => {
      const result = await evaluator.evaluate(makeSubmission(), parkingLotProblem)
      const coverage = result.categoryScores.find(c => c.category === 'Requirement Coverage')!
      expect(coverage.score).toBeLessThan(60)
    })

    it('gives low class responsibility score when no classes provided', async () => {
      const result = await evaluator.evaluate(makeSubmission(), parkingLotProblem)
      const classScore = result.categoryScores.find(c => c.category === 'Class Responsibility')!
      expect(classScore.score).toBeLessThanOrEqual(20)
    })
  })

  describe('requirement coverage', () => {
    it('increases score when keywords are mentioned', async () => {
      const approach = 'vehicle enters parking lot and gets assigned a spot. ticket is created for payment.'
      const result = await evaluator.evaluate(makeSubmission({ approach }), parkingLotProblem)
      const coverage = result.categoryScores.find(c => c.category === 'Requirement Coverage')!
      expect(coverage.score).toBeGreaterThan(60)
    })

    it('gives high score when all keywords covered', async () => {
      const approach =
        'vehicle arrives at parking lot entrance. the system finds an available spot on a parking floor. a ticket is issued. on exit, payment is calculated based on time.'
      const result = await evaluator.evaluate(makeSubmission({ approach }), parkingLotProblem)
      const coverage = result.categoryScores.find(c => c.category === 'Requirement Coverage')!
      expect(coverage.score).toBeGreaterThan(80)
    })

    it('provides explanation of unmatched keywords', async () => {
      const result = await evaluator.evaluate(makeSubmission({ approach: 'vehicle system' }), parkingLotProblem)
      const coverage = result.categoryScores.find(c => c.category === 'Requirement Coverage')!
      expect(coverage.explanation).toBeTruthy()
      expect(coverage.explanation.length).toBeGreaterThan(10)
    })
  })

  describe('class responsibility scoring', () => {
    it('scores higher with well-defined classes', async () => {
      const classes = [
        {
          id: '1',
          name: 'ParkingLot',
          responsibility: 'Manages all floors and handles vehicle entry/exit',
          methods: ['park(vehicle)', 'exit(ticket)', 'isAvailable()'],
          relationships: ['has-many ParkingFloor'],
        },
        {
          id: '2',
          name: 'ParkingSpot',
          responsibility: 'Represents a single physical parking spot',
          methods: ['assign(vehicle)', 'vacate()'],
          relationships: ['belongs-to ParkingFloor'],
        },
      ]
      const result = await evaluator.evaluate(makeSubmission({ classes }), parkingLotProblem)
      const classScore = result.categoryScores.find(c => c.category === 'Class Responsibility')!
      expect(classScore.score).toBeGreaterThan(50)
    })
  })

  describe('separation of concerns', () => {
    it('detects potential god-class when too many methods in one class', async () => {
      const classes = [
        {
          id: '1',
          name: 'GodParkingManager',
          responsibility:
            'Handles everything. Manages vehicles, spots, payments, tickets, reports, admin, receipts.',
          methods: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'm10'],
          relationships: [],
        },
      ]
      const result = await evaluator.evaluate(makeSubmission({ classes }), parkingLotProblem)
      const separation = result.categoryScores.find(c => c.category === 'Separation of Concerns')!
      // Should give lower score due to too many methods in single class
      expect(separation.score).toBeLessThan(70)
    })
  })

  describe('extensibility scoring', () => {
    it('recognizes strategy pattern', async () => {
      const approach =
        'I use a SpotAllocationStrategy interface so the allocation algorithm can vary. The ParkingLot depends on the abstract interface rather than a concrete implementation.'
      const result = await evaluator.evaluate(makeSubmission({ approach }), parkingLotProblem)
      const ext = result.categoryScores.find(c => c.category === 'Extensibility')!
      expect(ext.score).toBeGreaterThan(70)
    })

    it('gives lower extensibility score without strategy signals', async () => {
      const result = await evaluator.evaluate(
        makeSubmission({ approach: 'ParkingLot assigns spots directly in the park() method.' }),
        parkingLotProblem,
      )
      const ext = result.categoryScores.find(c => c.category === 'Extensibility')!
      expect(ext.score).toBeLessThan(75)
    })
  })

  describe('edge case detection', () => {
    it('gives higher score when failure scenarios mentioned', async () => {
      const approach =
        'Handle the case where the parking lot is full. Raise an exception if no spot is available. Handle invalid ticket numbers. Address concurrent parking requests.'
      const result = await evaluator.evaluate(makeSubmission({ approach }), parkingLotProblem)
      const edge = result.categoryScores.find(c => c.category === 'Edge Cases')!
      expect(edge.score).toBeGreaterThan(60)
    })

    it('gives low score when no edge cases mentioned', async () => {
      const result = await evaluator.evaluate(
        makeSubmission({ approach: 'ParkingLot has ParkingFloor which has ParkingSpot.' }),
        parkingLotProblem,
      )
      const edge = result.categoryScores.find(c => c.category === 'Edge Cases')!
      expect(edge.score).toBeLessThan(50)
    })
  })

  describe('overall score', () => {
    it('returns a number between 0 and 100', async () => {
      const result = await evaluator.evaluate(makeSubmission(), parkingLotProblem)
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)
    })

    it('returns higher score for a comprehensive submission', async () => {
      const classes = [
        {
          id: '1',
          name: 'ParkingLot',
          responsibility: 'Coordinates vehicle entry and exit across all floors using a strategy',
          methods: ['park(vehicle)', 'exit(ticket)', 'isAvailable()', 'getAvailableSpot()'],
          relationships: ['has-many ParkingFloor', 'uses SpotAllocationStrategy'],
        },
        {
          id: '2',
          name: 'SpotAllocationStrategy',
          responsibility: 'Abstract interface for spot selection algorithms',
          methods: ['findSpot(floors, vehicle)'],
          relationships: [],
        },
        {
          id: '3',
          name: 'Ticket',
          responsibility: 'Represents a parking session with entry time and spot reference',
          methods: ['calculateFee()'],
          relationships: ['references ParkingSpot', 'references Vehicle'],
        },
      ]
      const approach =
        'I define a ParkingLot that depends on a SpotAllocationStrategy interface. Vehicle types (motorcycle, car, truck) are modelled as subclasses. A Ticket is created on entry and used for payment calculation on exit. I handle the edge case where the lot is full by throwing a ParkingLotFullException. Payment is abstracted via a PricingStrategy.'
      const tradeoffs =
        'I chose a strategy pattern for allocation because different floors might use different algorithms in the future. Trade-off: adds a layer of indirection but makes the lot easier to extend.'

      const result = await evaluator.evaluate(
        makeSubmission({ approach, classes, tradeoffs }),
        parkingLotProblem,
      )
      expect(result.score).toBeGreaterThan(60)
    })

    it('sets evaluatorType to deterministic', async () => {
      const result = await evaluator.evaluate(makeSubmission(), parkingLotProblem)
      expect(result.evaluatorType).toBe('deterministic')
    })
  })

  describe('feedback quality', () => {
    it('always provides a non-empty explanation for each category', async () => {
      const result = await evaluator.evaluate(makeSubmission(), parkingLotProblem)
      result.categoryScores.forEach(cat => {
        expect(cat.explanation.length).toBeGreaterThan(0)
      })
    })

    it('always returns a populated evaluatedAt timestamp', async () => {
      const result = await evaluator.evaluate(makeSubmission(), parkingLotProblem)
      expect(new Date(result.evaluatedAt).getTime()).not.toBeNaN()
    })
  })
})
