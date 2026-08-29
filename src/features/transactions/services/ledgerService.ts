/**
 * Ledger API service
 *
 * Provides API client functions for ledger operations
 */

import { axiosClient } from '@/shared/services/axiosClient'
import { API_ROUTES } from '@/routes'
import type { ILedger, ILedgerEntry, ILedgerSyncOperation, MoneyDirection } from '../types/ledger'

/**
 * List all ledgers for the current user
 */
export const listLedgers = async (): Promise<ILedger[]> => {
  const response = await axiosClient.get<{ output: ILedger[] }>(API_ROUTES.ledgers.list)
  return response.data.output
}

/**
 * Create a new ledger
 */
export const createLedger = async (partyName: string): Promise<ILedger> => {
  const response = await axiosClient.post<{ output: ILedger }>(API_ROUTES.ledgers.create, {
    partyName,
  })
  return response.data.output
}

/**
 * Get details of a specific ledger with all its entries
 */
export const getLedgerDetail = async (id: string): Promise<ILedger & { entries: ILedgerEntry[] }> => {
  const response = await axiosClient.get<{ output: ILedger & { entries: ILedgerEntry[] } }>(
    API_ROUTES.ledgers.detail(id)
  )
  return response.data.output
}

/**
 * Update a ledger
 */
export const updateLedger = async (id: string, data: Partial<ILedger>): Promise<ILedger> => {
  const response = await axiosClient.put<{ output: ILedger }>(API_ROUTES.ledgers.update(id), data)
  return response.data.output
}

/**
 * Delete a ledger
 */
export const deleteLedger = async (id: string): Promise<void> => {
  await axiosClient.delete(API_ROUTES.ledgers.delete(id))
}

/**
 * Add an entry to a ledger by linking a transaction
 */
export const addEntry = async (
  ledgerId: string,
  transactionId: string,
  direction: MoneyDirection
): Promise<ILedgerEntry> => {
  const response = await axiosClient.post<{ output: ILedgerEntry }>(API_ROUTES.ledgers.addEntry(ledgerId), {
    transactionId,
    direction,
  })
  return response.data.output
}

/**
 * Remove an entry from a ledger
 */
export const removeEntry = async (ledgerId: string, entryId: string): Promise<void> => {
  await axiosClient.delete(API_ROUTES.ledgers.removeEntry(ledgerId, entryId))
}

/**
 * Link a transaction to a ledger (creates an entry with specified direction)
 */
export const linkTransaction = async (
  ledgerId: string,
  transactionId: string,
  direction: MoneyDirection
): Promise<ILedgerEntry> => {
  const response = await axiosClient.post<{ output: ILedgerEntry }>(API_ROUTES.ledgers.linkTransaction(ledgerId), {
    transactionId,
    direction,
  })
  return response.data.output
}

/**
 * Sync ledgers with server
 * Sends local ledger state and entries to server for merge
 */
export const syncLedgers = async (payload: {
  operations: ILedgerSyncOperation[]
}): Promise<{
  output: { ledgers: Record<string, unknown>[]; entries: ILedgerEntry[]; processedOperationIds: string[] }
}> => {
  const response = await axiosClient.put<{
    output: { ledgers: Record<string, unknown>[]; entries: ILedgerEntry[]; processedOperationIds: string[] }
  }>(API_ROUTES.ledgers.sync, payload)
  return response.data
}
