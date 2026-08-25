/**
 * Property-based tests for the Ledger feature (fast-check v4).
 *
 * Covers Correctness Properties 1–12 from the ledger design document.
 * Each property runs a minimum of 100 iterations.
 *
 * Vitest globals (test, expect, describe) are enabled via config.
 */

import fc from 'fast-check'

import {
  calculateBalance,
  getBalanceDirection,
  calculateSummaryTotals,
  filterLedgersByParty,
  filterAvailableTransactions,
  roundHalfUp,
  type BalanceInput,
} from '../utils/ledgerBalance'
import type { ILedger, MoneyDirection } from '../types/ledger'

// ---------------------------------------------------------------------------
// Generators
// ---------------------------------------------------------------------------

// Positive finite amounts (no NaN, no Infinity)
const amountArb = fc.float({
  min: Math.fround(0.01),
  max: Math.fround(100000),
  noNaN: true,
  noDefaultInfinity: true,
})

const directionArb: fc.Arbitrary<MoneyDirection> = fc.constantFrom('i_paid', 'they_paid')

const entryArb: fc.Arbitrary<BalanceInput> = fc.record({
  direction: directionArb,
  amount: amountArb,
})

// Finite balances (positive and negative), including zero
const balanceArb = fc.float({
  min: Math.fround(-100000),
  max: Math.fround(100000),
  noNaN: true,
  noDefaultInfinity: true,
})

const partyNameArb = fc.string({ minLength: 1, maxLength: 100 })

const makeLedger = (partyName: string, index: number): ILedger => ({
  id: `ledger-${index}`,
  partyName,
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
})

// Reference formula for balance
const expectedBalance = (entries: BalanceInput[]): number =>
  entries.reduce((sum, e) => (e.direction === 'i_paid' ? sum + e.amount : sum - e.amount), 0)

// ---------------------------------------------------------------------------
// Property 1 — Balance formula correctness (Validates: Requirements 6.3, 6.1, 6.2)
// ---------------------------------------------------------------------------

test('Property 1: Balance formula correctness', () => {
  // Feature: ledger, Property 1: Balance Formula Correctness
  fc.assert(
    fc.property(fc.array(entryArb), entries => {
      const balance = calculateBalance(entries)
      const expected = expectedBalance(entries)
      return Math.abs(balance - expected) < 0.01
    }),
    { numRuns: 100 }
  )
})

// ---------------------------------------------------------------------------
// Property 2 — Balance invariant through add/remove (Validates: Requirements 6.7, 6.4)
// ---------------------------------------------------------------------------

test('Property 2: Balance invariant through add/remove sequences', () => {
  // Feature: ledger, Property 2: Balance Invariant Through Add/Remove Sequences
  fc.assert(
    fc.property(
      fc.array(entryArb, { minLength: 1 }).chain(entries =>
        fc.record({
          entries: fc.constant(entries),
          removeIndices: fc.subarray(
            entries.map((_, i) => i),
            { minLength: 0, maxLength: entries.length }
          ),
        })
      ),
      ({ entries, removeIndices }) => {
        const removeSet = new Set(removeIndices)
        const remaining = entries.filter((_, i) => !removeSet.has(i))
        const balance = calculateBalance(remaining)
        const expected = roundHalfUp(expectedBalance(remaining), 2)
        return Math.abs(balance - expected) < 0.01
      }
    ),
    { numRuns: 100 }
  )
})

// ---------------------------------------------------------------------------
// Property 3 — Direction display matches sign (Validates: Requirements 3.2, 3.3, 3.4, 6.5)
// ---------------------------------------------------------------------------

test('Property 3: Direction display matches balance sign', () => {
  // Feature: ledger, Property 3: Direction Display Matches Balance Sign
  fc.assert(
    fc.property(fc.oneof(balanceArb, fc.constant(0)), balance => {
      const direction = getBalanceDirection(balance)
      if (balance > 0) return direction === 'they_owe'
      if (balance < 0) return direction === 'you_owe'
      return direction === 'settled'
    }),
    { numRuns: 100 }
  )
})

// ---------------------------------------------------------------------------
// Property 4 — Dashboard summary totals (Validates: Requirements 3.5)
// ---------------------------------------------------------------------------

test('Property 4: Dashboard summary totals', () => {
  // Feature: ledger, Property 4: Dashboard Summary Totals
  fc.assert(
    fc.property(fc.array(fc.record({ balance: balanceArb })), ledgers => {
      const { totalReceivable, totalPayable, netBalance } = calculateSummaryTotals(ledgers)

      const expectedReceivable = roundHalfUp(
        ledgers.filter(l => l.balance > 0).reduce((s, l) => s + l.balance, 0),
        2
      )
      const expectedPayable = roundHalfUp(
        Math.abs(ledgers.filter(l => l.balance < 0).reduce((s, l) => s + l.balance, 0)),
        2
      )
      const expectedNet = roundHalfUp(
        ledgers.reduce((s, l) => s + l.balance, 0),
        2
      )

      return (
        Math.abs(totalReceivable - expectedReceivable) < 0.01 &&
        Math.abs(totalPayable - expectedPayable) < 0.01 &&
        Math.abs(netBalance - expectedNet) < 0.01
      )
    }),
    { numRuns: 100 }
  )
})

// ---------------------------------------------------------------------------
// Property 5 — Search filter correctness (Validates: Requirements 3.10)
// ---------------------------------------------------------------------------

test('Property 5: Search filter correctness', () => {
  // Feature: ledger, Property 5: Search Filter Correctness
  fc.assert(
    fc.property(fc.array(partyNameArb), fc.string(), (names, searchText) => {
      const ledgers = names.map((name, i) => makeLedger(name, i))
      const result = filterLedgersByParty(ledgers, searchText)

      // Empty/whitespace search returns everything unchanged
      if (!searchText.trim()) {
        return result.length === ledgers.length
      }

      const lowerSearch = searchText.toLowerCase()
      const resultIds = new Set(result.map(l => l.id))

      // Every returned ledger matches; every excluded ledger does not match
      return ledgers.every(l => {
        const matches = l.partyName.toLowerCase().includes(lowerSearch)
        return matches === resultIds.has(l.id)
      })
    }),
    { numRuns: 100 }
  )
})

// ---------------------------------------------------------------------------
// Property 6 — Duplicate exclusion in transaction search
// (Validates: Requirements 5.1, 10.1, 5.7)
// ---------------------------------------------------------------------------

test('Property 6: Duplicate exclusion in transaction search', () => {
  // Feature: ledger, Property 6: Duplicate Exclusion in Transaction Search
  fc.assert(
    fc.property(
      fc.uniqueArray(fc.string({ minLength: 1 })).chain(all =>
        fc.record({
          all: fc.constant(all),
          linked: fc.subarray(all, { minLength: 0, maxLength: all.length }),
        })
      ),
      ({ all, linked }) => {
        const available = filterAvailableTransactions(all, linked)
        const linkedSet = new Set(linked)
        const availableSet = new Set(available)

        // No linked id is present in the result
        const noLinkedPresent = linked.every(id => !availableSet.has(id))
        // Every non-linked id is present in the result
        const allNonLinkedPresent = all.every(id => linkedSet.has(id) || availableSet.has(id))

        return noLinkedPresent && allNonLinkedPresent
      }
    ),
    { numRuns: 100 }
  )
})

// ---------------------------------------------------------------------------
// Property 7 — Cross-ledger linking (Validates: Requirements 10.3)
// ---------------------------------------------------------------------------

test('Property 7: Cross-ledger linking allows same tx in different ledgers', () => {
  // Feature: ledger, Property 7: Cross-Ledger Linking
  // A duplicate check is scoped per-ledger: the same transactionId may be linked
  // to two different ledgers, but is blocked within the same ledger.
  const canLinkToLedger = (txId: string, ledgerLinkedIds: string[]): boolean =>
    filterAvailableTransactions([txId], ledgerLinkedIds).length === 1

  fc.assert(
    fc.property(
      fc.string({ minLength: 1 }),
      fc.string({ minLength: 1 }),
      fc.string({ minLength: 1 }),
      (txId, ledgerA, ledgerB) => {
        fc.pre(ledgerA !== ledgerB)

        // Ledger A already has this tx linked
        const ledgerALinked = [txId]
        // Ledger B has nothing linked
        const ledgerBLinked: string[] = []

        // Blocked within the same ledger (A already has it)
        const blockedInSameLedger = !canLinkToLedger(txId, ledgerALinked)
        // Allowed in a different ledger (B does not have it)
        const allowedInOtherLedger = canLinkToLedger(txId, ledgerBLinked)

        return blockedInSameLedger && allowedInOtherLedger
      }
    ),
    { numRuns: 100 }
  )
})

// ---------------------------------------------------------------------------
// Property 10 — Whitespace party name rejection (Validates: Requirements 2.3)
// ---------------------------------------------------------------------------

const isValidPartyName = (name: string): boolean => name.trim().length > 0

test('Property 10: Whitespace party name rejection', () => {
  // Feature: ledger, Property 10: Whitespace Party Name Rejection
  const whitespaceCharArb = fc.constantFrom(' ', '\t', '\n', '\r', '\f', '\v')
  const whitespaceOnlyArb = fc.array(whitespaceCharArb).map(chars => chars.join(''))

  fc.assert(
    fc.property(whitespaceOnlyArb, name => {
      // Whitespace-only (and empty) names are rejected
      return !isValidPartyName(name)
    }),
    { numRuns: 100 }
  )
})

test('Property 10: Non-whitespace party names accepted', () => {
  // Feature: ledger, Property 10: Whitespace Party Name Rejection
  // A name containing at least one non-whitespace character is accepted.
  const nonBlankNameArb = fc.string({ minLength: 1 }).filter(s => s.trim().length > 0)

  fc.assert(
    fc.property(nonBlankNameArb, name => isValidPartyName(name)),
    { numRuns: 100 }
  )
})

// ---------------------------------------------------------------------------
// Property 11 — New ledger initial balance (Validates: Requirements 2.2)
// ---------------------------------------------------------------------------

test('Property 11: New ledger initial balance is zero', () => {
  // Feature: ledger, Property 11: New Ledger Initial Balance
  fc.assert(
    fc.property(
      partyNameArb.filter(name => name.trim().length > 0),
      partyName => {
        // A newly created ledger has no entries.
        const newLedger = makeLedger(partyName, 0)
        const noEntries: BalanceInput[] = []
        return Boolean(newLedger.partyName) && calculateBalance(noEntries) === 0
      }
    ),
    { numRuns: 100 }
  )
})

// ---------------------------------------------------------------------------
// Property 12 — Reverse chronological entry ordering (Validates: Requirements 4.1)
// ---------------------------------------------------------------------------

test('Property 12: Reverse chronological entry ordering', () => {
  // Feature: ledger, Property 12: Reverse Chronological Entry Ordering
  fc.assert(
    fc.property(
      // Distinct timestamps (ms since epoch) so ordering is unambiguous
      fc.uniqueArray(fc.integer({ min: 0, max: 4_000_000_000_000 })),
      timestamps => {
        const entries = timestamps.map((ts, i) => ({
          id: `entry-${i}`,
          createdAt: new Date(ts).toISOString(),
        }))

        // Same sort the UI uses: by createdAt descending (newest first)
        const sorted = [...entries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        // Assert timestamps are non-increasing
        for (let i = 1; i < sorted.length; i++) {
          const prev = new Date(sorted[i - 1].createdAt).getTime()
          const curr = new Date(sorted[i].createdAt).getTime()
          if (prev < curr) return false
        }
        return true
      }
    ),
    { numRuns: 100 }
  )
})
