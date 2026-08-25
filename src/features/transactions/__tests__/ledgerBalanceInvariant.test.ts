/**
 * Balance Invariant Property-Based Tests
 *
 * Tests verify that balance invariants hold under various operations:
 * 1. Adding an entry increases/decreases balance by the entry amount
 * 2. Removing an entry reverses its contribution to the balance
 * 3. Balance transformation is reversible and deterministic
 */

import { calculateBalance } from '../utils/ledgerBalance'
import type { ILedgerEntry } from '../types/ledger'

describe('Balance Invariant - Property-Based Tests', () => {
  /**
   * Invariant 1: Adding an i_paid entry increases balance by that amount
   * Property: balance(entries) + newEntry.amount = balance(entries + newEntry)
   * when newEntry.direction = 'i_paid'
   */
  describe('Adding Entry Invariant - i_paid direction', () => {
    it('should increase balance by entry amount when adding i_paid entry', () => {
      const initialEntries = [
        { amount: 100, direction: 'i_paid' } as Partial<ILedgerEntry>,
        { amount: 50, direction: 'they_paid' } as Partial<ILedgerEntry>,
      ]

      const initialBalance = calculateBalance(initialEntries as ILedgerEntry[])

      const newEntry = { amount: 75, direction: 'i_paid' } as Partial<ILedgerEntry>
      const updatedEntries = [...(initialEntries as ILedgerEntry[]), newEntry as ILedgerEntry]
      const updatedBalance = calculateBalance(updatedEntries)

      // Invariant: updatedBalance = initialBalance + newEntry.amount
      expect(updatedBalance).toBe(initialBalance + 75)
      expect(updatedBalance).toBe(50 + 75)
      expect(updatedBalance).toBe(125)
    })

    it('should maintain invariant with multiple sequential additions', () => {
      let entries: ILedgerEntry[] = []
      let expectedBalance = 0

      const entriesToAdd = [
        { amount: 100, direction: 'i_paid' as const },
        { amount: 50, direction: 'i_paid' as const },
        { amount: 75, direction: 'i_paid' as const },
      ]

      entriesToAdd.forEach(entry => {
        entries.push(entry as unknown as ILedgerEntry)
        expectedBalance += entry.amount
        const actualBalance = calculateBalance(entries)
        expect(actualBalance).toBe(expectedBalance)
      })
    })
  })

  /**
   * Invariant 2: Adding a they_paid entry decreases balance by that amount
   * Property: balance(entries) - newEntry.amount = balance(entries + newEntry)
   * when newEntry.direction = 'they_paid'
   */
  describe('Adding Entry Invariant - they_paid direction', () => {
    it('should decrease balance by entry amount when adding they_paid entry', () => {
      const initialEntries = [
        { amount: 100, direction: 'i_paid' } as Partial<ILedgerEntry>,
        { amount: 50, direction: 'they_paid' } as Partial<ILedgerEntry>,
      ]

      const initialBalance = calculateBalance(initialEntries as ILedgerEntry[])

      const newEntry = { amount: 75, direction: 'they_paid' } as Partial<ILedgerEntry>
      const updatedEntries = [...(initialEntries as ILedgerEntry[]), newEntry as ILedgerEntry]
      const updatedBalance = calculateBalance(updatedEntries)

      // Invariant: updatedBalance = initialBalance - newEntry.amount
      expect(updatedBalance).toBe(initialBalance - 75)
      expect(updatedBalance).toBe(50 - 75)
      expect(updatedBalance).toBe(-25)
    })

    it('should maintain invariant with multiple sequential additions', () => {
      let entries: ILedgerEntry[] = [{ amount: 200, direction: 'i_paid' } as unknown as ILedgerEntry]
      let expectedBalance = 200

      const entriesToAdd = [
        { amount: 50, direction: 'they_paid' as const },
        { amount: 75, direction: 'they_paid' as const },
        { amount: 25, direction: 'they_paid' as const },
      ]

      entriesToAdd.forEach(entry => {
        entries.push(entry as unknown as ILedgerEntry)
        expectedBalance -= entry.amount
        const actualBalance = calculateBalance(entries)
        expect(actualBalance).toBe(expectedBalance)
      })
    })
  })

  /**
   * Invariant 3: Removing an entry reverses its balance contribution
   * Property: If we know balance(A) and balance(B), where B = A - {entry},
   * then balance(A) - balance(B) = entry.amount (for i_paid)
   * or balance(B) - balance(A) = entry.amount (for they_paid)
   */
  describe('Removing Entry Invariant', () => {
    it('should reverse balance change when removing i_paid entry', () => {
      const fullEntries = [
        { amount: 100, direction: 'i_paid' } as Partial<ILedgerEntry>,
        { amount: 50, direction: 'they_paid' } as Partial<ILedgerEntry>,
        { amount: 75, direction: 'i_paid' } as Partial<ILedgerEntry>,
      ]

      const fullBalance = calculateBalance(fullEntries as ILedgerEntry[])

      // Remove the 75 i_paid entry
      const remainingEntries = fullEntries.slice(0, 2)
      const remainingBalance = calculateBalance(remainingEntries as ILedgerEntry[])

      // Invariant: fullBalance - remainingBalance = 75
      expect(fullBalance - remainingBalance).toBe(75)
      expect(fullBalance).toBe(125)
      expect(remainingBalance).toBe(50)
    })

    it('should reverse balance change when removing they_paid entry', () => {
      const fullEntries = [
        { amount: 100, direction: 'i_paid' } as Partial<ILedgerEntry>,
        { amount: 50, direction: 'they_paid' } as Partial<ILedgerEntry>,
        { amount: 75, direction: 'i_paid' } as Partial<ILedgerEntry>,
      ]

      const fullBalance = calculateBalance(fullEntries as ILedgerEntry[])

      // Remove the 50 they_paid entry
      const remainingEntries = [fullEntries[0], fullEntries[2]]
      const remainingBalance = calculateBalance(remainingEntries as ILedgerEntry[])

      // Invariant: remainingBalance - fullBalance = 50
      expect(remainingBalance - fullBalance).toBe(50)
      expect(fullBalance).toBe(125)
      expect(remainingBalance).toBe(175)
    })
  })

  /**
   * Invariant 4: Determinism - same entry set always produces same balance
   * Property: balance is a pure function of the entry set
   */
  describe('Determinism Invariant', () => {
    it('should produce identical balance for identical entry sets', () => {
      const entries = [
        { amount: 100, direction: 'i_paid' } as Partial<ILedgerEntry>,
        { amount: 50, direction: 'they_paid' } as Partial<ILedgerEntry>,
        { amount: 75, direction: 'i_paid' } as Partial<ILedgerEntry>,
      ]

      const balance1 = calculateBalance(entries as ILedgerEntry[])
      const balance2 = calculateBalance(entries as ILedgerEntry[])
      const balance3 = calculateBalance(entries as ILedgerEntry[])

      expect(balance1).toBe(balance2)
      expect(balance2).toBe(balance3)
    })
  })

  /**
   * Invariant 5: Additivity - balance of combined entry sets equals sum of balances
   * Property: balance(A + B) = balance(A) + balance(B)
   * This is useful for partial calculations and caching
   */
  describe('Additivity Invariant', () => {
    it('should satisfy additivity property for non-overlapping entry sets', () => {
      const entriesA = [
        { amount: 100, direction: 'i_paid' } as Partial<ILedgerEntry>,
        { amount: 30, direction: 'they_paid' } as Partial<ILedgerEntry>,
      ]

      const entriesB = [
        { amount: 50, direction: 'i_paid' } as Partial<ILedgerEntry>,
        { amount: 20, direction: 'they_paid' } as Partial<ILedgerEntry>,
      ]

      const balanceA = calculateBalance(entriesA as ILedgerEntry[])
      const balanceB = calculateBalance(entriesB as ILedgerEntry[])
      const balanceAB = calculateBalance([...(entriesA as ILedgerEntry[]), ...(entriesB as ILedgerEntry[])])

      // Invariant: balance(A + B) = balance(A) + balance(B)
      expect(balanceAB).toBe(balanceA + balanceB)
      expect(balanceAB).toBe(70 + 30)
      expect(balanceAB).toBe(100)
    })

    it('should satisfy additivity across mixed-direction entry sets', () => {
      const entriesA = [{ amount: 100, direction: 'i_paid' } as Partial<ILedgerEntry>]

      const entriesB = [{ amount: 40, direction: 'they_paid' } as Partial<ILedgerEntry>]

      const balanceA = calculateBalance(entriesA as ILedgerEntry[])
      const balanceB = calculateBalance(entriesB as ILedgerEntry[])
      const balanceAB = calculateBalance([...(entriesA as ILedgerEntry[]), ...(entriesB as ILedgerEntry[])])

      expect(balanceAB).toBe(balanceA + balanceB)
      expect(balanceAB).toBe(100 - 40)
      expect(balanceAB).toBe(60)
    })
  })

  /**
   * Invariant 6: Single entry removal produces expected new balance
   * This is critical for the "remove entry" operation
   */
  describe('Single Entry Removal Invariant', () => {
    it('should calculate correct balance after removing single entry from set', () => {
      const allEntries = [
        { _id: '1', amount: 100, direction: 'i_paid' } as Partial<ILedgerEntry>,
        { _id: '2', amount: 50, direction: 'they_paid' } as Partial<ILedgerEntry>,
        { _id: '3', amount: 75, direction: 'i_paid' } as Partial<ILedgerEntry>,
      ]

      const initialBalance = calculateBalance(allEntries as ILedgerEntry[])

      // Remove entry with _id: '2'
      const afterRemoval = allEntries.filter(e => e._id !== '2')
      const balanceAfterRemoval = calculateBalance(afterRemoval as ILedgerEntry[])

      // Invariant: We know entry '2' had direction 'they_paid' and amount 50
      // So balanceAfterRemoval = initialBalance - (-50) = initialBalance + 50
      expect(balanceAfterRemoval).toBe(initialBalance + 50)
      expect(balanceAfterRemoval).toBe(175)
    })
  })

  /**
   * Invariant 7: Negation property - if we negate all directions, balance negates
   * Property: balance(A') = -balance(A) where A' = {(amount, flip(direction)) for each entry in A}
   */
  describe('Negation Invariant', () => {
    it('should satisfy negation property', () => {
      const entries = [
        { amount: 100, direction: 'i_paid' } as Partial<ILedgerEntry>,
        { amount: 50, direction: 'they_paid' } as Partial<ILedgerEntry>,
        { amount: 75, direction: 'i_paid' } as Partial<ILedgerEntry>,
      ]

      const balance = calculateBalance(entries as ILedgerEntry[])

      const negatedEntries = entries.map(
        e =>
          ({
            ...e,
            direction: e.direction === 'i_paid' ? 'they_paid' : 'i_paid',
          }) as Partial<ILedgerEntry>
      )

      const negatedBalance = calculateBalance(negatedEntries as ILedgerEntry[])

      // Invariant: negatedBalance = -balance
      expect(negatedBalance).toBe(-balance)
      expect(balance).toBe(125)
      expect(negatedBalance).toBe(-125)
    })
  })
})
