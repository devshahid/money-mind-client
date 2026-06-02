import fc from 'fast-check'
import { applyContribution } from '../goalUtils'
import { IGoal } from '../../types/goal'

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Positive amount for contributions */
const positiveAmountArb = fc.float({
  min: Math.fround(0.01),
  max: Math.fround(100000),
  noNaN: true,
  noDefaultInfinity: true,
})

/** A minimal IGoal with valid numeric fields */
const goalArb = fc
  .record({
    targetAmount: fc.float({
      min: Math.fround(1),
      max: Math.fround(1000000),
      noNaN: true,
      noDefaultInfinity: true,
    }),
    currentSavedAmount: fc.float({
      min: Math.fround(0),
      max: Math.fround(999999),
      noNaN: true,
      noDefaultInfinity: true,
    }),
  })
  .map(
    ({ targetAmount, currentSavedAmount }): IGoal => ({
      _id: 'goal-1',
      name: 'Test Goal',
      targetAmount,
      currentSavedAmount,
      isAchieved: currentSavedAmount >= targetAmount,
      linkedTransactionIds: [],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    })
  )

// ---------------------------------------------------------------------------
// Property 21: Goal contribution invariant
// ---------------------------------------------------------------------------

test('Property 21: currentSavedAmount increases by the contribution amount', () => {
  // Feature: money-mind-upgrade, Property 21: Goal contribution invariant
  fc.assert(
    fc.property(goalArb, positiveAmountArb, (goal, amount) => {
      const result = applyContribution(goal, amount)
      return Math.abs(result.currentSavedAmount - (goal.currentSavedAmount + amount)) < 0.001
    }),
    { numRuns: 100 }
  )
})

test('Property 21: remainingAmount equals targetAmount minus currentSavedAmount after contribution', () => {
  // Feature: money-mind-upgrade, Property 21: Goal contribution invariant
  fc.assert(
    fc.property(goalArb, positiveAmountArb, (goal, amount) => {
      const result = applyContribution(goal, amount)
      const expected = goal.targetAmount - result.currentSavedAmount
      return Math.abs(result.remainingAmount - expected) < 0.001
    }),
    { numRuns: 100 }
  )
})

test('Property 21: isAchieved is true if and only if currentSavedAmount >= targetAmount', () => {
  // Feature: money-mind-upgrade, Property 21: Goal contribution invariant
  fc.assert(
    fc.property(goalArb, positiveAmountArb, (goal, amount) => {
      const result = applyContribution(goal, amount)
      const shouldBeAchieved = result.currentSavedAmount >= goal.targetAmount
      return result.isAchieved === shouldBeAchieved
    }),
    { numRuns: 100 }
  )
})
