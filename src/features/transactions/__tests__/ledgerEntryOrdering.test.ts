/**
 * Ledger Entry Ordering Tests
 *
 * Verifies that ledger entries are ordered by the LINKED transaction's
 * `transactionDate` (newest first), NOT by the entry's `createdAt`.
 *
 * This covers the UI ordering behaviour (Requirement 4.1) and the display-date
 * source (Requirement 4.3), which resolve dates from the original transaction.
 *
 * Vitest globals (test, expect, describe) are enabled via config.
 */

import fc from 'fast-check'

import {
  sortEntriesByTransactionDate,
  parseTransactionDate,
  resolveEntryDate,
  resolveEntryNarration,
} from '../utils/ledgerBalance'
import type { ILedgerEntry } from '../types/ledger'
import type { ITransaction } from '../types/transaction'

const makeEntry = (
  id: string,
  transactionId: string,
  createdAt: string,
  snapshot: Partial<Pick<ILedgerEntry, 'narration' | 'transactionDate'>> = {}
): ILedgerEntry => ({
  id,
  ledgerId: 'ledger-1',
  transactionId,
  direction: 'i_paid',
  amount: 100,
  createdAt,
  ...snapshot,
})

describe('sortEntriesByTransactionDate', () => {
  it('orders by linked transactionDate descending, ignoring createdAt order', () => {
    // Entries are created in the SAME order today, so createdAt is ascending,
    // but the linked transactions have very different real dates.
    const entries: ILedgerEntry[] = [
      makeEntry('e1', 'tx-old', '2024-06-01T10:00:00Z'),
      makeEntry('e2', 'tx-new', '2024-06-01T10:00:01Z'),
      makeEntry('e3', 'tx-mid', '2024-06-01T10:00:02Z'),
    ]

    const transactions: Record<string, Partial<ITransaction>> = {
      'tx-old': { transactionDate: '01/01/2020' },
      'tx-new': { transactionDate: '31/12/2023' },
      'tx-mid': { transactionDate: '15/06/2022' },
    }

    const sorted = sortEntriesByTransactionDate(entries, transactions)

    expect(sorted.map(e => e.id)).toEqual(['e2', 'e3', 'e1'])
  })

  it('falls back to createdAt when the transaction is missing', () => {
    const entries: ILedgerEntry[] = [
      makeEntry('e1', 'tx-missing-a', '2020-01-01T00:00:00Z'),
      makeEntry('e2', 'tx-missing-b', '2023-01-01T00:00:00Z'),
    ]

    const sorted = sortEntriesByTransactionDate(entries, {})

    expect(sorted.map(e => e.id)).toEqual(['e2', 'e1'])
  })

  it('falls back to createdAt when the transaction has no date', () => {
    const entries: ILedgerEntry[] = [
      makeEntry('e1', 'tx-a', '2020-01-01T00:00:00Z'),
      makeEntry('e2', 'tx-b', '2023-01-01T00:00:00Z'),
    ]
    const transactions: Record<string, Partial<ITransaction>> = {
      'tx-a': { narration: 'no date' },
      'tx-b': { narration: 'no date' },
    }

    const sorted = sortEntriesByTransactionDate(entries, transactions)

    expect(sorted.map(e => e.id)).toEqual(['e2', 'e1'])
  })

  it('uses the entry snapshot transactionDate when the transaction is off-page', () => {
    // Neither transaction is present in the loaded map (e.g. off the current
    // page of 50), but each entry carries a snapshot of its real date.
    const entries: ILedgerEntry[] = [
      makeEntry('e-old', 'tx-old', '2024-06-01T10:00:00Z', { transactionDate: '01/01/2020' }),
      makeEntry('e-new', 'tx-new', '2024-06-01T10:00:01Z', { transactionDate: '31/12/2023' }),
    ]

    const sorted = sortEntriesByTransactionDate(entries, {})

    // Sorted by snapshot date, not by createdAt insertion order.
    expect(sorted.map(e => e.id)).toEqual(['e-new', 'e-old'])
    // Display date resolves from the snapshot too.
    expect(resolveEntryDate(entries[0], {})).toBe('01/01/2020')
  })

  it('handles mixed DD/MM/YYYY and ISO transaction date formats', () => {
    const entries: ILedgerEntry[] = [
      makeEntry('e1', 'tx-ddmmyyyy', '2024-01-01T00:00:00Z'),
      makeEntry('e2', 'tx-iso', '2024-01-01T00:00:00Z'),
    ]
    const transactions: Record<string, Partial<ITransaction>> = {
      // 10 Jan 2024 in DD/MM/YYYY
      'tx-ddmmyyyy': { transactionDate: '10/01/2024' },
      // 05 Jan 2024 as ISO
      'tx-iso': { transactionDate: '2024-01-05T00:00:00Z' },
    }

    const sorted = sortEntriesByTransactionDate(entries, transactions)

    // 10 Jan is newer than 05 Jan
    expect(sorted.map(e => e.id)).toEqual(['e1', 'e2'])
  })

  it('does not mutate the input array', () => {
    const entries: ILedgerEntry[] = [
      makeEntry('e1', 'tx-a', '2020-01-01T00:00:00Z'),
      makeEntry('e2', 'tx-b', '2023-01-01T00:00:00Z'),
    ]
    const original = [...entries]

    sortEntriesByTransactionDate(entries, {})

    expect(entries).toEqual(original)
  })
})

describe('sortEntriesByTransactionDate - property', () => {
  test('Property: entries ordered by effective transaction date descending (Validates: Requirements 4.1)', () => {
    // Feature: ledger, ordering by linked transactionDate (DD/MM/YYYY strings).
    // Distinct day offsets guarantee unambiguous ordering.
    fc.assert(
      fc.property(fc.uniqueArray(fc.integer({ min: 0, max: 20000 }), { minLength: 1, maxLength: 30 }), dayOffsets => {
        const base = parseTransactionDate('01/01/2000')
        const entries: ILedgerEntry[] = []
        const transactions: Record<string, Partial<ITransaction>> = {}
        const dateByTxId: Record<string, string> = {}

        dayOffsets.forEach((offset, i) => {
          const txId = `tx-${i}`
          const transactionDate = base.add(offset, 'day').format('DD/MM/YYYY')
          transactions[txId] = { transactionDate }
          dateByTxId[txId] = transactionDate
          // createdAt intentionally ascending (insertion order), unrelated to txDate
          entries.push(makeEntry(`e-${i}`, txId, base.add(i, 'second').toISOString()))
        })

        const sorted = sortEntriesByTransactionDate(entries, transactions)

        for (let i = 1; i < sorted.length; i++) {
          const prev = parseTransactionDate(dateByTxId[sorted[i - 1].transactionId]).valueOf()
          const curr = parseTransactionDate(dateByTxId[sorted[i].transactionId]).valueOf()
          if (prev < curr) return false
        }
        return true
      }),
      { numRuns: 100 }
    )
  })
})

describe('resolveEntryDate precedence (live -> snapshot -> createdAt)', () => {
  it('prefers the live transaction date over the snapshot and createdAt', () => {
    const entry = makeEntry('e1', 'tx-a', '2024-01-01T00:00:00Z', { transactionDate: '02/02/2022' })
    const transactions: Record<string, Partial<ITransaction>> = { 'tx-a': { transactionDate: '03/03/2023' } }

    expect(resolveEntryDate(entry, transactions)).toBe('03/03/2023')
  })

  it('falls back to the snapshot when the live transaction is absent', () => {
    const entry = makeEntry('e1', 'tx-a', '2024-01-01T00:00:00Z', { transactionDate: '02/02/2022' })

    expect(resolveEntryDate(entry, {})).toBe('02/02/2022')
  })

  it('falls back to createdAt when neither live nor snapshot date exists', () => {
    const entry = makeEntry('e1', 'tx-a', '2024-01-01T00:00:00Z')

    expect(resolveEntryDate(entry, {})).toBe('2024-01-01T00:00:00Z')
  })
})

describe('resolveEntryNarration precedence (live -> snapshot -> fallback)', () => {
  it('prefers the live transaction narration', () => {
    const entry = makeEntry('e1', 'tx-a', '2024-01-01T00:00:00Z', { narration: 'snapshot narration' })
    const transactions: Record<string, Partial<ITransaction>> = { 'tx-a': { narration: 'live narration' } }

    expect(resolveEntryNarration(entry, transactions)).toBe('live narration')
  })

  it('falls back to the snapshot narration when the live transaction is absent', () => {
    const entry = makeEntry('e1', 'tx-a', '2024-01-01T00:00:00Z', { narration: 'snapshot narration' })

    expect(resolveEntryNarration(entry, {})).toBe('snapshot narration')
  })

  it("falls back to 'Unnamed transaction' when neither live nor snapshot narration exists", () => {
    const entry = makeEntry('e1', 'tx-a', '2024-01-01T00:00:00Z')

    expect(resolveEntryNarration(entry, {})).toBe('Unnamed transaction')
  })
})
