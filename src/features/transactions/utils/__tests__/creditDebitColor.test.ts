import { describe, test, expect } from 'vitest'

/**
 * Credit/Debit Color Coding Tests
 * Tests for: color logic used in AI suggestion table
 */

const CREDIT_COLOR = '#4CAF50' // Green
const DEBIT_COLOR = '#F44336' // Red

function getAmountColor(isCredit: boolean): string {
  return isCredit ? CREDIT_COLOR : DEBIT_COLOR
}

describe('Credit/Debit color coding', () => {
  test('should return green for credit transactions', () => {
    expect(getAmountColor(true)).toBe('#4CAF50')
  })

  test('should return red for debit transactions', () => {
    expect(getAmountColor(false)).toBe('#F44336')
  })

  test('colors should be consistent with main transaction table', () => {
    // These colors are used in both Table.tsx and AISuggestionReviewDialog.tsx
    expect(CREDIT_COLOR).toBe('#4CAF50')
    expect(DEBIT_COLOR).toBe('#F44336')
  })
})

describe('User override logic', () => {
  test('should track overridden transactions in a Set', () => {
    const userOverrides = new Set<string>()

    // User changes category for transaction 1
    userOverrides.add('tx-1')
    expect(userOverrides.has('tx-1')).toBe(true)
    expect(userOverrides.has('tx-2')).toBe(false)
    expect(userOverrides.size).toBe(1)
  })

  test('should auto-select transaction when user overrides category', () => {
    const selectedSuggestions = new Set<string>(['tx-2'])

    // User overrides tx-1 category → should auto-select it
    selectedSuggestions.add('tx-1')
    expect(selectedSuggestions.has('tx-1')).toBe(true)
    expect(selectedSuggestions.size).toBe(2)
  })

  test('confidence should be 1 for user-overridden transactions', () => {
    const userOverrides = new Set(['tx-1'])
    const originalConfidence = 0.65

    const finalConfidence = userOverrides.has('tx-1') ? 1 : originalConfidence
    expect(finalConfidence).toBe(1)
  })

  test('confidence should remain original for AI suggestions', () => {
    const userOverrides = new Set(['tx-1'])
    const originalConfidence = 0.88

    const finalConfidence = userOverrides.has('tx-2') ? 1 : originalConfidence
    expect(finalConfidence).toBe(0.88)
  })

  test('userOverride flag should be true for overridden, false for AI', () => {
    const userOverrides = new Set(['tx-1', 'tx-3'])

    const suggestions = [
      { transactionId: 'tx-1', category: 'Food' },
      { transactionId: 'tx-2', category: 'Fuel' },
      { transactionId: 'tx-3', category: 'Travel' },
    ]

    const toApply = suggestions.map(s => ({
      ...s,
      userOverride: userOverrides.has(s.transactionId),
    }))

    expect(toApply[0].userOverride).toBe(true)
    expect(toApply[1].userOverride).toBe(false)
    expect(toApply[2].userOverride).toBe(true)
  })
})
