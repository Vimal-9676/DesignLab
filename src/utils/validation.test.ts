import { describe, it, expect } from 'vitest'
import { validateSubmission, isSubmissionEmpty } from '../utils/validation'
import type { Submission } from '../domain/types'

function makeSubmission(overrides: Partial<Submission> = {}): Submission {
  return {
    approach: '',
    classes: [],
    pseudocode: '',
    tradeoffs: '',
    ...overrides,
  }
}

describe('validateSubmission', () => {
  it('rejects an empty submission', () => {
    const result = validateSubmission(makeSubmission())
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('rejects approach under 50 characters', () => {
    const result = validateSubmission(makeSubmission({ approach: 'too short' }))
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('50'))).toBe(true)
  })

  it('rejects when no classes added', () => {
    const result = validateSubmission(
      makeSubmission({ approach: 'A sufficiently long approach description for the parking lot design with classes.' }),
    )
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.toLowerCase().includes('class'))).toBe(true)
  })

  it('rejects a class with empty name', () => {
    const result = validateSubmission(
      makeSubmission({
        approach: 'A sufficiently long approach description for the parking lot system design.',
        classes: [
          { id: '1', name: '', responsibility: 'Manages parking', methods: [], relationships: [] },
        ],
      }),
    )
    expect(result.valid).toBe(false)
  })

  it('rejects a class with empty responsibility', () => {
    const result = validateSubmission(
      makeSubmission({
        approach: 'A sufficiently long approach description for the parking lot system design.',
        classes: [
          { id: '1', name: 'ParkingLot', responsibility: '', methods: [], relationships: [] },
        ],
      }),
    )
    expect(result.valid).toBe(false)
  })

  it('passes with valid approach and at least one complete class', () => {
    const result = validateSubmission(
      makeSubmission({
        approach: 'ParkingLot manages floors. Vehicle is the base class. Ticket is issued on entry and used for payment.',
        classes: [
          {
            id: '1',
            name: 'ParkingLot',
            responsibility: 'Manages all parking floors and coordinates entry and exit',
            methods: ['park(vehicle)', 'exit(ticket)'],
            relationships: ['has-many ParkingFloor'],
          },
        ],
      }),
    )
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
})

describe('isSubmissionEmpty', () => {
  it('returns true for a completely empty submission', () => {
    expect(isSubmissionEmpty(makeSubmission())).toBe(true)
  })

  it('returns false if approach has text', () => {
    expect(isSubmissionEmpty(makeSubmission({ approach: 'some text' }))).toBe(false)
  })

  it('returns false if classes have entries', () => {
    expect(
      isSubmissionEmpty(
        makeSubmission({
          classes: [{ id: '1', name: 'Foo', responsibility: 'Bar', methods: [], relationships: [] }],
        }),
      ),
    ).toBe(false)
  })
})
