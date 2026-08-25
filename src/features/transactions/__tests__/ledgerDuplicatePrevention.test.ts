/**
 * Duplicate-prevention tests for ledger links.
 *
 * Rule: a given transaction may be linked to a ledger only ONCE. The same
 * transaction may be linked to DIFFERENT ledgers. ALL entries count toward
 * duplicate detection.
 *
 * Covers the pure helper `isTransactionLinked` with example-based unit tests
 * and a property test.
 *
 * Vitest globals (test, expect, describe) are enabled via config.
 */

import fc from 'fast-check'

import { isTransactionLinked, type LedgerLinkCheckEntry } from '../utils/ledgerBalance'

const entry = (ledgerId: string, transactionId: string): LedgerLinkCheckEntry => ({
  ledgerId,
  transactionId,
})

describe('isTransactionLinked - duplicate prevention (unit)', () => {
  it('blocks a transaction already linked to the same ledger', () => {
    const entries = [entry('L1', 'T1')]
    expect(isTransactionLinked(entries, 'L1', 'T1')).toBe(true)
  })

  it('allows the same transaction in a different ledger', () => {
    const entries = [entry('L1', 'T1')]
    expect(isTransactionLinked(entries, 'L2', 'T1')).toBe(false)
  })

  it('detects a duplicate regardless of how many other entries exist', () => {
    const entries = [entry('L1', 'T2'), entry('L2', 'T1'), entry('L1', 'T1')]
    expect(isTransactionLinked(entries, 'L1', 'T1')).toBe(true)
  })

  it('returns false when there are no entries', () => {
    expect(isTransactionLinked([], 'L1', 'T1')).toBe(false)
  })

  it('does not block a different transaction in the same ledger', () => {
    const entries = [entry('L1', 'T1')]
    expect(isTransactionLinked(entries, 'L1', 'T2')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Property test
// Feature: ledger, duplicate prevention (Validates: Requirements 10.1, 11.1, 11.3)
// ---------------------------------------------------------------------------

const idArb = fc.string({ minLength: 1, maxLength: 8 })

const linkEntryArb: fc.Arbitrary<LedgerLinkCheckEntry> = fc.record({
  ledgerId: idArb,
  transactionId: idArb,
})

describe('isTransactionLinked - duplicate prevention (property)', () => {
  test('result is true iff a matching entry exists', () => {
    // Feature: ledger, duplicate prevention (Validates: Requirements 10.1, 11.1, 11.3)
    fc.assert(
      fc.property(fc.array(linkEntryArb), idArb, idArb, (entries, ledgerId, transactionId) => {
        const expected = entries.some(e => e.ledgerId === ledgerId && e.transactionId === transactionId)
        return isTransactionLinked(entries, ledgerId, transactionId) === expected
      }),
      { numRuns: 100 }
    )
  })

  test('same tx blocked within same ledger but allowed in a different ledger', () => {
    // Feature: ledger, duplicate prevention (Validates: Requirements 10.1, 11.1, 11.3)
    fc.assert(
      fc.property(idArb, idArb, idArb, (txId, ledgerA, ledgerB) => {
        fc.pre(ledgerA !== ledgerB)

        // A link in ledger A blocks re-linking to A, but allows B.
        const linked = [entry(ledgerA, txId)]
        const blockedInA = isTransactionLinked(linked, ledgerA, txId)
        const allowedInB = !isTransactionLinked(linked, ledgerB, txId)

        return blockedInA && allowedInB
      }),
      { numRuns: 100 }
    )
  })
})
