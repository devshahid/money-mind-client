/**
 * IndexedDB Ledger Store Tests
 * 
 * Tests for offline-first persistence layer with IndexedDB
 */
/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

import 'fake-indexeddb/auto'
import { IDBDatabase } from 'fake-indexeddb'
import type { ILedger, ILedgerEntry } from '../types/ledger'
import * as ledgerStore from '../helpers/indexDB/ledgerStore'

describe('LedgerStore (IndexedDB Tests)', () => {
  let db: IDBDatabase

  beforeEach(async () => {
    // Clear all stores before each test
    const dbRequest = indexedDB.deleteDatabase('money-mind')
    
    return new Promise<void>((resolve) => {
      dbRequest.onsuccess = () => {
        resolve()
      }
      dbRequest.onerror = () => {
        resolve()
      }
    })
  })

  afterEach(() => {
    if (db) {
      db.close()
    }
  })

  describe('saveLedger', () => {
    it('should save a new ledger', async () => {
      const ledger: ILedger = {
        id: 'ledger-1',
        partyName: 'John Doe',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await ledgerStore.saveLedger(ledger)

      const saved = await ledgerStore.getLedger('ledger-1')
      expect(saved?.partyName).toBe('John Doe')
    })

    it('should update an existing ledger', async () => {
      const ledger1: ILedger = {
        id: 'ledger-1',
        partyName: 'John Doe',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await ledgerStore.saveLedger(ledger1)

      const ledger2: ILedger = {
        id: 'ledger-1',
        partyName: 'John Smith',
        createdAt: ledger1.createdAt,
        updatedAt: new Date().toISOString(),
      }

      await ledgerStore.saveLedger(ledger2)

      const saved = await ledgerStore.getLedger('ledger-1')
      expect(saved?.partyName).toBe('John Smith')
    })

    it('should handle batch save of multiple ledgers', async () => {
      const ledgers: ILedger[] = [
        {
          id: 'ledger-1',
          partyName: 'John Doe',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'ledger-2',
          partyName: 'Jane Doe',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      for (const ledger of ledgers) {
        await ledgerStore.saveLedger(ledger)
      }

      const all = await ledgerStore.getAllLedgers()
      expect(all).toHaveLength(2)
    })
  })

  describe('getLedger', () => {
    it('should retrieve a saved ledger', async () => {
      const ledger: ILedger = {
        id: 'ledger-1',
        partyName: 'John Doe',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await ledgerStore.saveLedger(ledger)

      const retrieved = await ledgerStore.getLedger('ledger-1')
      expect(retrieved).toEqual(ledger)
    })

    it('should return null for non-existent ledger', async () => {
      const retrieved = await ledgerStore.getLedger('non-existent')
      expect(retrieved).toBeNull()
    })
  })

  describe('getAllLedgers', () => {
    it('should retrieve all saved ledgers', async () => {
      const ledgers: ILedger[] = [
        {
          id: 'ledger-1',
          partyName: 'John Doe',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'ledger-2',
          partyName: 'Jane Doe',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      for (const ledger of ledgers) {
        await ledgerStore.saveLedger(ledger)
      }

      const all = await ledgerStore.getAllLedgers()
      expect(all).toHaveLength(2)
      expect(all[0].partyName).toBe('John Doe')
      expect(all[1].partyName).toBe('Jane Doe')
    })

    it('should return empty array when no ledgers exist', async () => {
      const all = await ledgerStore.getAllLedgers()
      expect(all).toEqual([])
    })
  })

  describe('deleteLedger', () => {
    it('should delete a saved ledger', async () => {
      const ledger: ILedger = {
        id: 'ledger-1',
        partyName: 'John Doe',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await ledgerStore.saveLedger(ledger)

      const before = await ledgerStore.getLedger('ledger-1')
      expect(before).toBeTruthy()

      await ledgerStore.deleteLedger('ledger-1')

      const after = await ledgerStore.getLedger('ledger-1')
      expect(after).toBeNull()
    })

    it('should silently handle deletion of non-existent ledger', async () => {
      // Should not throw
      await expect(ledgerStore.deleteLedger('non-existent')).resolves.not.toThrow()
    })
  })

  describe('saveLedgerEntry', () => {
    it('should save a new entry', async () => {
      const entry: ILedgerEntry = {
        id: 'entry-1',
        ledgerId: 'ledger-1',
        transactionId: 'tx-1',
        direction: 'i_paid',
        amount: 100,
        isSettlement: false,
        createdAt: new Date().toISOString(),
      }

      await ledgerStore.saveLedgerEntry(entry)

      const entries = await ledgerStore.getEntriesByLedgerId('ledger-1')
      expect(entries).toHaveLength(1)
      expect(entries[0].amount).toBe(100)
    })

    it('should update an existing entry', async () => {
      const entry1: ILedgerEntry = {
        id: 'entry-1',
        ledgerId: 'ledger-1',
        transactionId: 'tx-1',
        direction: 'i_paid',
        amount: 100,
        isSettlement: false,
        createdAt: new Date().toISOString(),
      }

      await ledgerStore.saveLedgerEntry(entry1)

      const entry2: ILedgerEntry = {
        ...entry1,
        amount: 150,
      }

      await ledgerStore.saveLedgerEntry(entry2)

      const entries = await ledgerStore.getEntriesByLedgerId('ledger-1')
      expect(entries).toHaveLength(1)
      expect(entries[0].amount).toBe(150)
    })
  })

  describe('getEntriesByLedgerId', () => {
    it('should retrieve all entries for a ledger', async () => {
      const entries: ILedgerEntry[] = [
        {
          id: 'entry-1',
          ledgerId: 'ledger-1',
          transactionId: 'tx-1',
          direction: 'i_paid',
          amount: 100,
          isSettlement: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'entry-2',
          ledgerId: 'ledger-1',
          transactionId: 'tx-2',
          direction: 'they_paid',
          amount: 50,
          isSettlement: false,
          createdAt: new Date().toISOString(),
        },
      ]

      for (const entry of entries) {
        await ledgerStore.saveLedgerEntry(entry)
      }

      const retrieved = await ledgerStore.getEntriesByLedgerId('ledger-1')
      expect(retrieved).toHaveLength(2)
    })

    it('should return empty array for ledger with no entries', async () => {
      const entries = await ledgerStore.getEntriesByLedgerId('non-existent')
      expect(entries).toEqual([])
    })

    it('should not return entries from other ledgers', async () => {
      const entry1: ILedgerEntry = {
        id: 'entry-1',
        ledgerId: 'ledger-1',
        transactionId: 'tx-1',
        direction: 'i_paid',
        amount: 100,
        isSettlement: false,
        createdAt: new Date().toISOString(),
      }

      const entry2: ILedgerEntry = {
        id: 'entry-2',
        ledgerId: 'ledger-2',
        transactionId: 'tx-2',
        direction: 'they_paid',
        amount: 50,
        isSettlement: false,
        createdAt: new Date().toISOString(),
      }

      await ledgerStore.saveLedgerEntry(entry1)
      await ledgerStore.saveLedgerEntry(entry2)

      const ledger1Entries = await ledgerStore.getEntriesByLedgerId('ledger-1')
      expect(ledger1Entries).toHaveLength(1)
      expect(ledger1Entries[0].ledgerId).toBe('ledger-1')
    })
  })

  describe('Deleted IDs Tracking', () => {
    it('should add a deleted ledger ID', async () => {
      await ledgerStore.addDeletedId('ledger-1')

      const deletedIds = await ledgerStore.getDeletedIds()
      expect(deletedIds).toContain('ledger-1')
    })

    it('should track multiple deleted ledger IDs', async () => {
      await ledgerStore.addDeletedId('ledger-1')
      await ledgerStore.addDeletedId('ledger-2')

      const deletedIds = await ledgerStore.getDeletedIds()
      expect(deletedIds).toHaveLength(2)
      expect(deletedIds).toContain('ledger-1')
      expect(deletedIds).toContain('ledger-2')
    })

    it('should clear deleted ledger IDs after sync', async () => {
      await ledgerStore.addDeletedId('ledger-1')

      let deletedIds = await ledgerStore.getDeletedIds()
      expect(deletedIds).toHaveLength(1)

      await ledgerStore.clearDeletedIds()

      deletedIds = await ledgerStore.getDeletedIds()
      expect(deletedIds).toHaveLength(0)
    })
  })

  describe('Deleted Entry IDs Tracking', () => {
    it('should add a deleted entry ID', async () => {
      await ledgerStore.addDeletedEntryId('entry-1')

      const deletedIds = await ledgerStore.getDeletedEntryIds()
      expect(deletedIds).toContain('entry-1')
    })

    it('should track multiple deleted entry IDs', async () => {
      await ledgerStore.addDeletedEntryId('entry-1')
      await ledgerStore.addDeletedEntryId('entry-2')

      const deletedIds = await ledgerStore.getDeletedEntryIds()
      expect(deletedIds).toHaveLength(2)
    })

    it('should clear deleted entry IDs after sync', async () => {
      await ledgerStore.addDeletedEntryId('entry-1')

      let deletedIds = await ledgerStore.getDeletedEntryIds()
      expect(deletedIds).toHaveLength(1)

      await ledgerStore.clearDeletedEntryIds()

      deletedIds = await ledgerStore.getDeletedEntryIds()
      expect(deletedIds).toHaveLength(0)
    })
  })

  describe('Transaction Integrity', () => {
    it('should maintain consistency during concurrent operations', async () => {
      const ledger: ILedger = {
        id: 'ledger-1',
        partyName: 'John Doe',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const promises = []

      // Simulate concurrent saves
      for (let i = 0; i < 10; i++) {
        promises.push(ledgerStore.saveLedger(ledger))
      }

      await Promise.all(promises)

      const saved = await ledgerStore.getLedger('ledger-1')
      expect(saved).toBeTruthy()
      expect(saved?.partyName).toBe('John Doe')
    })

    it('should handle mixed operations on same ledger', async () => {
      const ledger: ILedger = {
        id: 'ledger-1',
        partyName: 'John Doe',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await ledgerStore.saveLedger(ledger)

      const entry: ILedgerEntry = {
        id: 'entry-1',
        ledgerId: 'ledger-1',
        transactionId: 'tx-1',
        direction: 'i_paid',
        amount: 100,
        isSettlement: false,
        createdAt: new Date().toISOString(),
      }

      await ledgerStore.saveLedgerEntry(entry)

      const saved = await ledgerStore.getLedger('ledger-1')
      const entries = await ledgerStore.getEntriesByLedgerId('ledger-1')

      expect(saved).toBeTruthy()
      expect(entries).toHaveLength(1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty party name', async () => {
      const ledger: ILedger = {
        id: 'ledger-1',
        partyName: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await ledgerStore.saveLedger(ledger)

      const saved = await ledgerStore.getLedger('ledger-1')
      expect(saved?.partyName).toBe('')
    })

    it('should handle very large amounts', async () => {
      const entry: ILedgerEntry = {
        id: 'entry-1',
        ledgerId: 'ledger-1',
        transactionId: 'tx-1',
        direction: 'i_paid',
        amount: 999999999.99,
        isSettlement: false,
        createdAt: new Date().toISOString(),
      }

      await ledgerStore.saveLedgerEntry(entry)

      const entries = await ledgerStore.getEntriesByLedgerId('ledger-1')
      expect(entries[0].amount).toBe(999999999.99)
    })

    it('should handle special characters in party name', async () => {
      const ledger: ILedger = {
        id: 'ledger-1',
        partyName: 'John O\'Brien & Co. (Pvt) Ltd.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await ledgerStore.saveLedger(ledger)

      const saved = await ledgerStore.getLedger('ledger-1')
      expect(saved?.partyName).toBe('John O\'Brien & Co. (Pvt) Ltd.')
    })
  })
})
