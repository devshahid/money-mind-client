/**
 * IndexedDB store for ledgers
 * 
 * Provides offline-first storage and retrieval of ledger data
 */

import type { ILedger, ILedgerEntry } from '../../types/ledger'
import { initDB } from './db'

const DELETED_IDS_KEY = '__deleted_ledger_ids__'
const DELETED_ENTRY_IDS_KEY = '__deleted_ledger_entry_ids__'

/**
 * Ledger store for IndexedDB operations
 * Follows the same pattern as GroupStore for consistency
 */
class LedgerStore {
  /**
   * Save or update a ledger
   */
  async saveLedger(ledger: ILedger): Promise<void> {
    const db = await initDB()
    await db.put('ledgers', ledger)
  }

  /**
   * Save a ledger entry
   */
  async saveLedgerEntry(entry: ILedgerEntry): Promise<void> {
    const db = await initDB()
    await db.put('ledger_entries', entry)
  }

  /**
   * Get all ledgers (excluding deleted marker)
   */
  async getAllLedgers(): Promise<ILedger[]> {
    const db = await initDB()
    const all = await db.getAll('ledgers')
    return all.filter(l => l.id !== DELETED_IDS_KEY)
  }

  /**
   * Get a specific ledger by ID
   */
  async getLedger(id: string): Promise<ILedger | undefined> {
    const db = await initDB()
    return db.get('ledgers', id)
  }

  /**
   * Delete a ledger
   */
  async deleteLedger(id: string): Promise<void> {
    const db = await initDB()
    await db.delete('ledgers', id)
  }

  /**
   * Get all entries for a specific ledger
   */
  async getEntriesByLedgerId(ledgerId: string): Promise<ILedgerEntry[]> {
    const db = await initDB()
    const allEntries = await db.getAll('ledger_entries')
    return allEntries.filter(e => e.ledgerId === ledgerId)
  }

  /**
   * Get a specific ledger entry by ID
   */
  async getLedgerEntry(id: string): Promise<ILedgerEntry | undefined> {
    const db = await initDB()
    return db.get('ledger_entries', id)
  }

  /**
   * Delete a ledger entry
   */
  async deleteLedgerEntry(id: string): Promise<void> {
    const db = await initDB()
    await db.delete('ledger_entries', id)
  }

  /**
   * Get all deleted ledger IDs
   */
  async getDeletedIds(): Promise<string[]> {
    const db = await initDB()
    const entry = await db.get('ledgers', DELETED_IDS_KEY)
    return (entry && typeof entry === 'object' && 'deletedIds' in entry && Array.isArray((entry as Record<string, unknown>).deletedIds)) 
      ? ((entry as Record<string, unknown>).deletedIds as string[]) 
      : []
  }

  /**
   * Add a deleted ledger ID to the list
   */
  async addDeletedId(id: string): Promise<void> {
    const existing = await this.getDeletedIds()
    if (!existing.includes(id)) {
      existing.push(id)
    }
    const db = await initDB()
    await db.put('ledgers', {
      id: DELETED_IDS_KEY,
      partyName: '',
      createdAt: '',
      updatedAt: '',
      deletedIds: existing,
    } as unknown as ILedger)
  }

  /**
   * Clear the deleted IDs list (after sync)
   */
  async clearDeletedIds(): Promise<void> {
    const db = await initDB()
    await db.delete('ledgers', DELETED_IDS_KEY)
  }

  /**
   * Get all ledger entries
   */
  async getAllEntries(): Promise<ILedgerEntry[]> {
    const db = await initDB()
    const all = await db.getAll('ledger_entries')
    return all.filter(e => e.id !== DELETED_ENTRY_IDS_KEY)
  }

  /**
   * Get all deleted ledger entry IDs
   */
  async getDeletedEntryIds(): Promise<string[]> {
    const db = await initDB()
    const entry = await db.get('ledger_entries', DELETED_ENTRY_IDS_KEY)
    return (entry && typeof entry === 'object' && 'deletedIds' in entry && Array.isArray((entry as Record<string, unknown>).deletedIds))
      ? ((entry as Record<string, unknown>).deletedIds as string[])
      : []
  }

  /**
   * Add a deleted ledger entry ID to the list
   */
  async addDeletedEntryId(id: string): Promise<void> {
    const existing = await this.getDeletedEntryIds()
    if (!existing.includes(id)) {
      existing.push(id)
    }
    const db = await initDB()
    await db.put('ledger_entries', {
      id: DELETED_ENTRY_IDS_KEY,
      ledgerId: '',
      transactionId: '',
      direction: 'i_paid',
      amount: 0,
      narration: '',
      createdAt: '',
      deletedIds: existing,
    } as unknown as ILedgerEntry)
  }

  /**
   * Clear the deleted entry IDs list (after sync)
   */
  async clearDeletedEntryIds(): Promise<void> {
    const db = await initDB()
    await db.delete('ledger_entries', DELETED_ENTRY_IDS_KEY)
  }
}

const ledgerStore = new LedgerStore()
export { ledgerStore }
