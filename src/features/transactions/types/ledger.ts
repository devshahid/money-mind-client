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
  createdAt: string
  /**
   * Snapshot of the linked transaction's narration captured at link
   * time. Kept optional so entries created before snapshotting still typecheck
   * and fall back gracefully. Used as a robust fallback when the linked
   * transaction isn't on the currently loaded transactions page.
   */
  narration?: string
  /**
   * Snapshot of the linked transaction's transactionDate captured at
   * link time. Optional for backward compatibility; used as a
   * fallback when the live transaction can't be resolved.
   */
  transactionDate?: string
  /**
   * Optional AI suggestion metadata (Req 13.1).
   * Accepted-but-not-required; defaults to undefined when omitted.
   * True when this entry was created from an AI-suggested transaction match.
   */
  aiSuggestedMatch?: boolean
  /**
   * Optional AI match confidence (Req 13.1).
   * Accepted-but-not-required; defaults to undefined when omitted.
   * Must be a number between 0 and 1 inclusive; values outside this range
   * are rejected by the API service (Req 13.4).
   */
  aiConfidence?: number
}

/**
 * A durable, idempotent mutation waiting to be delivered to the server.
 * The local ledger cache is never uploaded wholesale during normal sync.
 */
export type ILedgerSyncOperation =
  | { id: string; type: 'upsert_ledger'; ledger: ILedger }
  | { id: string; type: 'delete_ledger'; ledgerId: string }
  | { id: string; type: 'link_entry'; entry: ILedgerEntry }
  | { id: string; type: 'unlink_entry'; ledgerId: string; entryId: string }

/**
 * A ledger tracking the financial relationship between the user and one party
 */
export type ILedger = {
  id: string
  partyName: string
  createdAt: string
  updatedAt: string
  /**
   * Optional free-form description for future AI matching (Req 13.2).
   * Accepted-but-not-required; plain text, maximum 500 characters.
   * The length limit is enforced at the API/validation layer.
   */
  description?: string
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
