/**
 * Ledger feature types
 * 
 * A ledger tracks the cumulative financial balance between the user and one specific party.
 * Each ledger entry references an existing transaction with a money direction.
 */

/**
 * Represents who paid for a transaction
 */
export type MoneyDirection = 'i_paid' | 'they_paid'

/**
 * A single entry within a ledger, always linked to an existing transaction
 */
export type ILedgerEntry = {
  id: string
  ledgerId: string
  transactionId: string
  direction: MoneyDirection
  amount: number
  isSettlement: boolean
  createdAt: string
}

/**
 * A ledger tracking the financial relationship between the user and one party
 */
export type ILedger = {
  id: string
  partyName: string
  createdAt: string
  updatedAt: string
}

/**
 * Redux state for ledgers
 */
export type ILedgerState = {
  ledgers: ILedger[]
  entries: ILedgerEntry[] // All entries across all ledgers
  loading: boolean
  error: string | null
  isLocalLedgers: boolean
  ledgerSyncStatus: 'idle' | 'success' | 'error'
  selectedLedgerId: string | null
}

/**
 * Represents the direction of balance: who owes whom
 */
export type BalanceDirection = 'they_owe' | 'you_owe' | 'settled'
