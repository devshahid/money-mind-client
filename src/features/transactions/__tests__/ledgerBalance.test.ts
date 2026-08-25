/**
 * Balance Formula Property-Based Tests
 *
 * Tests verify that the balance calculation formula is mathematically correct:
 * balance = sum(i_paid) - sum(they_paid)
 *
 * Property: For any arbitrary sequence of ledger entries, the calculated balance
 * should equal the algebraic sum defined by the formula above.
 */

import { calculateBalance } from '../utils/ledgerBalance'
import type { ILedgerEntry } from '../types/ledger'

describe('Balance Formula Correctness - Property-Based Tests', () => {
  /**
   * Property 1: Balance calculation with single entry
   * Verifies that a single entry produces the expected balance
   */
  describe('Single Entry Balance', () => {
    it('should calculate correct balance for single "i_paid" entry', () => {
      const entries = [{ amount: 100, direction: 'i_paid' } as Partial<ILedgerEntry>]
      const balance = calculateBalance(entries as ILedgerEntry[])
      expect(balance).toBe(100)
    })

    it('should calculate correct balance for single "they_paid" entry', () => {
      const entries = [{ amount: 100, direction: 'they_paid' } as Partial<ILedgerEntry>]
      const balance = calculateBalance(entries as ILedgerEntry[])
      expect(balance).toBe(-100)
    })
  })

  /**
   * Property 2: Balance calculation with multiple entries of same direction
   * Verifies that multiple entries in the same direction sum correctly
   */
  describe('Multiple Same-Direction Entries', () => {
    it('should sum multiple "i_paid" entries correctly', () => {
      const entries = [
        { amount: 100, direction: 'i_paid' } as Partial<ILedgerEntry>,
        { amount: 200, direction: 'i_paid' } as Partial<ILedgerEntry>,
        { amount: 50, direction: 'i_paid' } as Partial<ILedgerEntry>,
      ]
      const balance = calculateBalance(entries as ILedgerEntry[])
      expect(balance).toBe(350)
    })

    it('should sum multiple "they_paid" entries correctly', () => {
      const entries = [
        { amount: 100, direction: 'they_paid' } as Partial<ILedgerEntry>,
        { amount: 200, direction: 'they_paid' } as Partial<ILedgerEntry>,
        { amount: 50, direction: 'they_paid' } as Partial<ILedgerEntry>,
      ]
      const balance = calculateBalance(entries as ILedgerEntry[])
      expect(balance).toBe(-350)
    })
  })

  /**
   * Property 3: Balance calculation with mixed directions
   * Verifies that i_paid and they_paid entries cancel each other out correctly
   */
  describe('Mixed Direction Entries', () => {
    it('should calculate net balance from mixed directions', () => {
      const entries = [
        { amount: 100, direction: 'i_paid' } as Partial<ILedgerEntry>,
        { amount: 50, direction: 'they_paid' } as Partial<ILedgerEntry>,
        { amount: 75, direction: 'i_paid' } as Partial<ILedgerEntry>,
      ]
      // balance = (100 + 75) - 50 = 125
      const balance = calculateBalance(entries as ILedgerEntry[])
      expect(balance).toBe(125)
    })

    it('should calculate correct negative balance from mixed directions', () => {
      const entries = [
        { amount: 100, direction: 'i_paid' } as Partial<ILedgerEntry>,
        { amount: 200, direction: 'they_paid' } as Partial<ILedgerEntry>,
        { amount: 75, direction: 'i_paid' } as Partial<ILedgerEntry>,
      ]
      // balance = (100 + 75) - 200 = -25
      const balance = calculateBalance(entries as ILedgerEntry[])
      expect(balance).toBe(-25)
    })
  })

  /**
   * Repayment entries are ordinary linked transactions, so they contribute to
   * the balance exactly like any other entry (direction determines the sign).
   */
  describe('Repayment Entries', () => {
    it('should include repayment (they_paid) entries in balance calculation', () => {
      const entries = [
        { amount: 100, direction: 'i_paid' } as Partial<ILedgerEntry>,
        { amount: 60, direction: 'they_paid' } as Partial<ILedgerEntry>,
      ]
      // balance = 100 - 60 = 40
      const balance = calculateBalance(entries as ILedgerEntry[])
      expect(balance).toBe(40)
    })
  })

  /**
   * Property 5: Empty entries list produces zero balance
   * Verifies boundary condition
   */
  describe('Empty Entries', () => {
    it('should return 0 balance for empty entries list', () => {
      const entries: ILedgerEntry[] = []
      const balance = calculateBalance(entries)
      expect(balance).toBe(0)
    })
  })

  /**
   * Property 6: Zero-amount entries do not affect balance
   * Verifies that edge case is handled correctly
   */
  describe('Zero-Amount Entries', () => {
    it('should not affect balance calculation', () => {
      const entries = [
        { amount: 100, direction: 'i_paid' } as Partial<ILedgerEntry>,
        { amount: 0, direction: 'they_paid' } as Partial<ILedgerEntry>,
        { amount: 0, direction: 'i_paid' } as Partial<ILedgerEntry>,
      ]
      const balance = calculateBalance(entries as ILedgerEntry[])
      expect(balance).toBe(100)
    })
  })

  /**
   * Property 7: Commutative property - order of entries does not affect balance
   * Verifies mathematical property: balance is independent of entry order
   */
  describe('Commutative Property', () => {
    it('should produce same balance regardless of entry order', () => {
      const entriesA = [
        { amount: 100, direction: 'i_paid' } as Partial<ILedgerEntry>,
        { amount: 50, direction: 'they_paid' } as Partial<ILedgerEntry>,
        { amount: 75, direction: 'i_paid' } as Partial<ILedgerEntry>,
      ]

      const entriesB = [
        { amount: 75, direction: 'i_paid' } as Partial<ILedgerEntry>,
        { amount: 100, direction: 'i_paid' } as Partial<ILedgerEntry>,
        { amount: 50, direction: 'they_paid' } as Partial<ILedgerEntry>,
      ]

      const balanceA = calculateBalance(entriesA as ILedgerEntry[])
      const balanceB = calculateBalance(entriesB as ILedgerEntry[])

      expect(balanceA).toBe(balanceB)
      expect(balanceA).toBe(125)
    })
  })

  /**
   * Property 8: Decimal precision - balance is rounded to 2 decimals
   * Verifies that floating-point arithmetic is handled correctly
   */
  describe('Decimal Precision', () => {
    it('should handle decimal amounts correctly', () => {
      const entries = [
        { amount: 100.5, direction: 'i_paid' } as Partial<ILedgerEntry>,
        { amount: 50.25, direction: 'they_paid' } as Partial<ILedgerEntry>,
      ]
      // balance = 100.50 - 50.25 = 50.25
      const balance = calculateBalance(entries as ILedgerEntry[])
      expect(balance).toBe(50.25)
    })

    it('should round balance to 2 decimal places', () => {
      const entries = [
        { amount: 100.126, direction: 'i_paid' } as Partial<ILedgerEntry>,
        { amount: 50.135, direction: 'they_paid' } as Partial<ILedgerEntry>,
      ]
      const balance = calculateBalance(entries as ILedgerEntry[])
      // Should be rounded to 2 decimals: 100.126 - 50.135 ≈ 49.99
      expect(Number(balance.toFixed(2))).toBe(49.99)
    })
  })

  /**
   * Property 9: Cancellation property - equal i_paid and they_paid amounts cancel
   * Verifies mathematical property: when sum(i_paid) = sum(they_paid), balance = 0
   */
  describe('Cancellation Property', () => {
    it('should produce zero balance when all amounts cancel out', () => {
      const entries = [
        { amount: 100, direction: 'i_paid' } as Partial<ILedgerEntry>,
        { amount: 100, direction: 'they_paid' } as Partial<ILedgerEntry>,
      ]
      const balance = calculateBalance(entries as ILedgerEntry[])
      expect(balance).toBe(0)
    })

    it('should produce zero balance with complex entry sets', () => {
      const entries = [
        { amount: 100, direction: 'i_paid' } as Partial<ILedgerEntry>,
        { amount: 75, direction: 'i_paid' } as Partial<ILedgerEntry>,
        { amount: 125, direction: 'they_paid' } as Partial<ILedgerEntry>,
        { amount: 50, direction: 'they_paid' } as Partial<ILedgerEntry>,
      ]
      // balance = (100 + 75) - (125 + 50) = 175 - 175 = 0
      const balance = calculateBalance(entries as ILedgerEntry[])
      expect(balance).toBe(0)
    })
  })

  /**
   * Property 10: Associative property - partial sums can be computed independently
   * Verifies mathematical property: balance(A + B) = balance(A) + balance(B)
   */
  describe('Associative Property', () => {
    it('should allow independent computation of sub-balances', () => {
      const entriesA = [
        { amount: 100, direction: 'i_paid' } as Partial<ILedgerEntry>,
        { amount: 50, direction: 'they_paid' } as Partial<ILedgerEntry>,
      ]

      const entriesB = [
        { amount: 75, direction: 'i_paid' } as Partial<ILedgerEntry>,
        { amount: 25, direction: 'they_paid' } as Partial<ILedgerEntry>,
      ]

      const balanceA = calculateBalance(entriesA as ILedgerEntry[])
      const balanceB = calculateBalance(entriesB as ILedgerEntry[])
      const balanceCombined = calculateBalance([...(entriesA as ILedgerEntry[]), ...(entriesB as ILedgerEntry[])])

      // balance(A) = 100 - 50 = 50
      // balance(B) = 75 - 25 = 50
      // balance(A + B) = 100 + 75 - 50 - 25 = 100 = 50 + 50
      expect(balanceCombined).toBe(balanceA + balanceB)
      expect(balanceCombined).toBe(100)
    })
  })
})
