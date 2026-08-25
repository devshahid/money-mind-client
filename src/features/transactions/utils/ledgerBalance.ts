/**
 * Ledger balance calculation utilities
 *
 * Pure functions for calculating balances, handling rounding, and determining balance directions.
 * These functions are free of side effects and suitable for property-based testing.
 */

import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

import type { MoneyDirection, BalanceDirection, ILedger, ILedgerEntry } from '../types/ledger'
import type { ITransaction } from '../types/transaction'

// Register the custom-parse-format plugin locally so `DD/MM/YYYY` strings
// (used by cash memos) parse reliably. `new Date('DD/MM/YYYY')` is unreliable
// across environments, so we always parse dates through dayjs.
dayjs.extend(customParseFormat)

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
export const calculateSummaryTotals = (ledgers: Array<{ balance: number }>): SummaryTotals => {
  const totalReceivable = roundHalfUp(
    ledgers.filter(l => l.balance > 0).reduce((sum, l) => sum + l.balance, 0),
    2
  )

  const totalPayable = roundHalfUp(
    Math.abs(ledgers.filter(l => l.balance < 0).reduce((sum, l) => sum + l.balance, 0)),
    2
  )

  const netBalance = roundHalfUp(
    ledgers.reduce((sum, l) => sum + l.balance, 0),
    2
  )

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
export const filterAvailableTransactions = (allTransactionIds: string[], linkedTransactionIds: string[]): string[] => {
  const linkedSet = new Set(linkedTransactionIds)
  return allTransactionIds.filter(id => !linkedSet.has(id))
}

/**
 * Minimal shape needed to evaluate the ledger duplicate-link rule.
 * Kept structural so both the Redux entry type and server-shaped entries work.
 */
export type LedgerLinkCheckEntry = {
  ledgerId: string
  transactionId: string
}

/**
 * Determines whether a transaction is already linked to a specific ledger.
 *
 * A transaction may be linked to a given ledger only ONCE. The same
 * transaction may still be linked to DIFFERENT ledgers.
 *
 * @param entries - All ledger entries (across every ledger)
 * @param ledgerId - The target ledger
 * @param transactionId - The transaction being linked
 * @returns True when an entry already links this transaction to this ledger
 *
 * Property: For any entry set, the result is true iff there exists an entry
 * with the same ledgerId and transactionId.
 */
export const isTransactionLinked = (
  entries: LedgerLinkCheckEntry[],
  ledgerId: string,
  transactionId: string
): boolean => {
  return entries.some(e => e.ledgerId === ledgerId && e.transactionId === transactionId)
}

/**
 * Robustly parses a date string used across the transactions feature.
 *
 * Transaction dates may be stored as `DD/MM/YYYY` (cash memos) or as an ISO
 * string (bank statements). `new Date('DD/MM/YYYY')` is unreliable, so we parse
 * with the `DD/MM/YYYY` format first and fall back to dayjs's default parsing.
 *
 * @param dateStr - The date string to parse
 * @returns A dayjs instance (may be invalid if the input is unparseable)
 */
export const parseTransactionDate = (dateStr: string): dayjs.Dayjs => {
  const strict = dayjs(dateStr, 'DD/MM/YYYY', true)
  return strict.isValid() ? strict : dayjs(dateStr)
}

/**
 * Resolves the display/sort date for a ledger entry.
 *
 * Precedence: the live linked transaction's `transactionDate` (so edits to the
 * transaction reflect immediately) → the entry's snapshot `transactionDate`
 * (a robust fallback when the transaction isn't on the currently loaded page)
 * → the entry's `createdAt`.
 *
 * @param entry - The ledger entry
 * @param transactions - Map of transactionId to (partial) transaction
 * @returns The effective date string for the entry
 */
export const resolveEntryDate = (entry: ILedgerEntry, transactions: Record<string, Partial<ITransaction>>): string => {
  const tx = transactions[entry.transactionId]
  return tx?.transactionDate || entry.transactionDate || entry.createdAt
}

/**
 * Resolves the display narration for a ledger entry.
 *
 * Precedence: the live linked transaction's `narration` (so edits reflect
 * immediately) → the entry's snapshot `narration` (fallback when the
 * transaction isn't on the currently loaded page) → `'Unnamed transaction'`.
 *
 * @param entry - The ledger entry
 * @param transactions - Map of transactionId to (partial) transaction
 * @returns The effective narration for the entry
 */
export const resolveEntryNarration = (
  entry: ILedgerEntry,
  transactions: Record<string, Partial<ITransaction>>
): string => {
  const tx = transactions[entry.transactionId]
  return tx?.narration || entry.narration || 'Unnamed transaction'
}

/**
 * Formats a ledger entry's effective date as `DD/MM/YYYY`.
 *
 * @param entry - The ledger entry
 * @param transactions - Map of transactionId to (partial) transaction
 * @returns Formatted date string
 */
export const formatEntryDate = (entry: ILedgerEntry, transactions: Record<string, Partial<ITransaction>>): string => {
  return parseTransactionDate(resolveEntryDate(entry, transactions)).format('DD/MM/YYYY')
}

/**
 * Formats a raw date value (transaction date or createdAt fallback) as
 * `DD/MM/YYYY`. Convenience wrapper for callers that already resolved the value.
 *
 * @param dateStr - The date string to format
 * @returns Formatted date string
 */
export const formatLedgerDate = (dateStr: string): string => {
  return parseTransactionDate(dateStr).format('DD/MM/YYYY')
}

/**
 * Sorts ledger entries in reverse chronological order by the LINKED
 * transaction's `transactionDate` (newest transaction first).
 *
 * When a transaction cannot be resolved or has no date, the entry's `createdAt`
 * is used as the fallback sort key. This is a pure function (does not mutate
 * the input array).
 *
 * @param entries - Ledger entries to sort
 * @param transactions - Map of transactionId to (partial) transaction
 * @returns A new array sorted by effective transaction date, descending
 *
 * Property: For any entries/transactions, the result is ordered such that each
 * entry's effective date (transactionDate, else createdAt) is greater than or
 * equal to the following entry's effective date.
 */
export const sortEntriesByTransactionDate = (
  entries: ILedgerEntry[],
  transactions: Record<string, Partial<ITransaction>>
): ILedgerEntry[] => {
  const sortKey = (entry: ILedgerEntry): number => parseTransactionDate(resolveEntryDate(entry, transactions)).valueOf()

  return [...entries].sort((a, b) => sortKey(b) - sortKey(a))
}
