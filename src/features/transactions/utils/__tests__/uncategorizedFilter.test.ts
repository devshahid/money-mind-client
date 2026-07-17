import { describe, test, expect } from 'vitest'

/**
 * Uncategorized Filter Tests
 * Tests for: uncategorizedOnPage computation logic
 */

interface MockTransaction {
  _id: string
  category?: string | null
  narration: string
}

// Replicate the logic from TransactionLogs.tsx
function getUncategorizedOnPage(transactions: MockTransaction[]): string[] {
  return transactions
    .filter(tx => !tx.category || tx.category === '' || tx.category === 'Others')
    .map(tx => tx._id)
    .filter((id): id is string => id !== undefined)
}

describe('uncategorizedOnPage computation', () => {
  test('should return IDs of transactions with empty category', () => {
    const transactions: MockTransaction[] = [
      { _id: '1', category: '', narration: 'Test 1' },
      { _id: '2', category: 'Food', narration: 'Test 2' },
      { _id: '3', category: '', narration: 'Test 3' },
    ]

    const result = getUncategorizedOnPage(transactions)
    expect(result).toEqual(['1', '3'])
  })

  test('should return IDs of transactions with null category', () => {
    const transactions: MockTransaction[] = [
      { _id: '1', category: null, narration: 'Test 1' },
      { _id: '2', category: 'Fuel', narration: 'Test 2' },
    ]

    const result = getUncategorizedOnPage(transactions)
    expect(result).toEqual(['1'])
  })

  test('should return IDs of transactions with undefined category', () => {
    const transactions: MockTransaction[] = [
      { _id: '1', narration: 'Test 1' }, // category is undefined
      { _id: '2', category: 'Travel', narration: 'Test 2' },
    ]

    const result = getUncategorizedOnPage(transactions)
    expect(result).toEqual(['1'])
  })

  test('should return IDs of transactions with Others category', () => {
    const transactions: MockTransaction[] = [
      { _id: '1', category: 'Others', narration: 'Test 1' },
      { _id: '2', category: 'Food', narration: 'Test 2' },
      { _id: '3', category: 'Others', narration: 'Test 3' },
    ]

    const result = getUncategorizedOnPage(transactions)
    expect(result).toEqual(['1', '3'])
  })

  test('should return empty array when all transactions are categorized', () => {
    const transactions: MockTransaction[] = [
      { _id: '1', category: 'Food', narration: 'Test 1' },
      { _id: '2', category: 'Fuel', narration: 'Test 2' },
      { _id: '3', category: 'Travel', narration: 'Test 3' },
    ]

    const result = getUncategorizedOnPage(transactions)
    expect(result).toEqual([])
  })

  test('should return all IDs when no transactions are categorized', () => {
    const transactions: MockTransaction[] = [
      { _id: '1', category: '', narration: 'Test 1' },
      { _id: '2', category: null, narration: 'Test 2' },
      { _id: '3', narration: 'Test 3' },
    ]

    const result = getUncategorizedOnPage(transactions)
    expect(result).toEqual(['1', '2', '3'])
  })

  test('should handle empty transactions array', () => {
    const result = getUncategorizedOnPage([])
    expect(result).toEqual([])
  })

  test('should not include Refunds & Reversals as uncategorized', () => {
    const transactions: MockTransaction[] = [
      { _id: '1', category: 'Refunds & Reversals', narration: 'IRCTC Refund' },
      { _id: '2', category: '', narration: 'Unknown' },
    ]

    const result = getUncategorizedOnPage(transactions)
    expect(result).toEqual(['2'])
  })
})
