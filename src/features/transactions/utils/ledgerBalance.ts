/**
 * Ledger balance calculation utilities
 * 
 * Pure functions for calculating balances, handling rounding, and determining balance directions.
 * These functions are free of side effects and suitable for property-based testing.
 */

import type { MoneyDirection, BalanceDirection, ILedger } from '../types/ledger'

/**
 * Input type for balance calculation
 */
export type BalanceInput = {
  direction: MoneyDirection
  amount: number
}

/**
 * Rounds a number to the specified number of decimal places using half-up rounding
 * 
 * @param value - The value to round
 * @param decimals - Number of decimal places (default: 2)
 * @returns Rounded value
 * 
 * Property: For any valid number and decimals, roundHalfUp produces a value
 * with at most `decimals` decimal places
 */
export const roundHalfUp = (value: number, decimals: number = 2): number => {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor + Number.EPSILON) / factor
}

/**
 * Calculates the outstanding balance from a sequence of ledger entries
 * 
 * Balance = sum of 'i_paid' amounts - sum of 'they_paid' amounts
 * Result is rounded to 2 decimal places using half-up rounding
 * 
 * @param entries - Array of ledger entry inputs
 * @returns Net balance (positive = they owe you, negative = you owe them)
 * 
 * Property: For any sequence of entries, the balance equals the sum of 'i_paid' amounts
 * minus the sum of 'they_paid' amounts, rounded to 2 decimal places
 */
export const calculateBalance = (entries: BalanceInput[]): number => {
  const raw = entries.reduce((sum, entry) => {
    if (entry.direction === 'i_paid') {
      return sum + entry.amount
    } else {
      return sum - entry.amount
    }
  }, 0)
  return roundHalfUp(raw, 2)
}

/**
 * Determines who owes whom based on the balance
 * 
 * @param balance - The outstanding balance
 * @returns Direction indicator
 * 
 * Property: For balance > 0 returns 'they_owe', for balance < 0 returns 'you_owe',
 * for balance === 0 returns 'settled'
 */
export const getBalanceDirection = (balance: number): BalanceDirection => {
  if (balance > 0) return 'they_owe'
  if (balance < 0) return 'you_owe'
  return 'settled'
}

/**
 * Determines the direction of a settlement transaction to reduce outstanding balance
 * 
 * If they owe you (positive balance), settlement entry should be 'they_paid'
 * If you owe them (negative balance), settlement entry should be 'i_paid'
 * 
 * @param balance - The current outstanding balance
 * @returns Direction for settlement entry
 * 
 * Property: For positive balance, returns 'they_paid'; for negative balance, returns 'i_paid'
 */
export const getSettlementDirection = (balance: number): MoneyDirection => {
  return balance > 0 ? 'they_paid' : 'i_paid'
}

/**
 * Summary totals across multiple ledgers
 */
export type SummaryTotals = {
  totalReceivable: number
  totalPayable: number
  netBalance: number
}

/**
 * Calculates summary totals across all ledgers
 * 
 * @param ledgers - Array of ledgers with their current balances
 * @returns Summary totals (total receivable, total payable, net)
 * 
 * Property: For any collection of ledgers:
 * - totalReceivable = sum of all positive balances
 * - totalPayable = sum of absolute values of all negative balances
 * - netBalance = sum of all balances
 */
export const calculateSummaryTotals = (
  ledgers: Array<{ balance: number }>
): SummaryTotals => {
  const totalReceivable = roundHalfUp(
    ledgers
      .filter(l => l.balance > 0)
      .reduce((sum, l) => sum + l.balance, 0),
    2
  )

  const totalPayable = roundHalfUp(
    Math.abs(
      ledgers
        .filter(l => l.balance < 0)
        .reduce((sum, l) => sum + l.balance, 0)
    ),
    2
  )

  const netBalance = roundHalfUp(ledgers.reduce((sum, l) => sum + l.balance, 0), 2)

  return {
    totalReceivable,
    totalPayable,
    netBalance,
  }
}

/**
 * Filters ledgers by party name (case-insensitive substring match)
 * 
 * @param ledgers - Array of ledgers
 * @param searchText - Search string
 * @returns Filtered ledgers
 * 
 * Property: For any ledger array and search text, returned ledgers have party names
 * that contain the search text as a case-insensitive substring
 */
export const filterLedgersByParty = (ledgers: ILedger[], searchText: string): ILedger[] => {
  if (!searchText.trim()) return ledgers
  const lowerSearch = searchText.toLowerCase()
  return ledgers.filter(l => l.partyName.toLowerCase().includes(lowerSearch))
}

/**
 * Filters transactions to exclude those already linked to the ledger
 * 
 * @param allTransactionIds - All available transaction IDs
 * @param linkedTransactionIds - Transaction IDs already linked to this ledger
 * @returns Available transaction IDs for linking
 * 
 * Property: For any transaction set and linked set, returned transactions are exactly
 * those in allTransactionIds but not in linkedTransactionIds
 */
export const filterAvailableTransactions = (
  allTransactionIds: string[],
  linkedTransactionIds: string[]
): string[] => {
  const linkedSet = new Set(linkedTransactionIds)
  return allTransactionIds.filter(id => !linkedSet.has(id))
}
