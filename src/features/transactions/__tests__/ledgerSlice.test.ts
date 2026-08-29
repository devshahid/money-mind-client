/**
 * Redux Ledger Slice Tests
 *
 * Tests for offline-first ledger management with IndexedDB sync
 */
/* eslint-disable @typescript-eslint/unbound-method */

import { configureStore } from '@reduxjs/toolkit'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import {
  ledgerReducer,
  loadLedgers,
  createLedger,
  deleteLedger,
  linkTransactionToLedger,
  removeLedgerEntry,
  syncLedgers,
  selectHasLocalChanges,
} from '../store/ledgerSlice'
import type { ILedgerState, ILedger } from '../types/ledger'

// The real module exports a class INSTANCE named `ledgerStore`, so the mock
// must mirror that shape and include every method the slice thunks call.
vi.mock('../helpers/indexDB/ledgerStore', () => ({
  ledgerStore: {
    saveLedger: vi.fn(),
    getAllLedgers: vi.fn(),
    getLedger: vi.fn(),
    deleteLedger: vi.fn(),
    addDeletedId: vi.fn(),
    getEntriesByLedgerId: vi.fn(),
    saveLedgerEntry: vi.fn(),
    getAllEntries: vi.fn(),
    getDeletedIds: vi.fn(),
    getDeletedEntryIds: vi.fn(),
    clearDeletedIds: vi.fn(),
    clearDeletedEntryIds: vi.fn(),
    addDeletedEntryId: vi.fn(),
    deleteLedgerEntry: vi.fn(),
    saveLedgerEntryIfAbsent: vi.fn(),
    replaceEntries: vi.fn(),
    addSyncOperation: vi.fn(),
    getSyncOperations: vi.fn(),
    removeSyncOperations: vi.fn(),
  },
}))

// The slice imports the service as `import * as ledgerService`, so a flat
// object of mocked functions is the correct shape here.
vi.mock('../services/ledgerService', () => ({
  listLedgers: vi.fn(),
  syncLedgers: vi.fn(),
  createLedger: vi.fn(),
  getLedgerDetail: vi.fn(),
}))

import { ledgerStore } from '../helpers/indexDB/ledgerStore'
import * as ledgerService from '../services/ledgerService'

// vi.mocked gives typed access to the mock functions on the instance/module.
const mockedStore = vi.mocked(ledgerStore)
const mockedService = vi.mocked(ledgerService)

describe('LedgerSlice (Redux Tests)', () => {
  let store: ReturnType<typeof configureStore>

  beforeEach(() => {
    vi.clearAllMocks()
    mockedStore.saveLedgerEntryIfAbsent.mockResolvedValue(true)
    mockedStore.addSyncOperation.mockResolvedValue(undefined)
    mockedStore.getSyncOperations.mockResolvedValue([])
    mockedStore.removeSyncOperations.mockResolvedValue(undefined)
    mockedStore.replaceEntries.mockResolvedValue(undefined)
    store = configureStore({
      reducer: {
        ledgers: ledgerReducer,
      },
    })
  })

  describe('loadLedgers thunk', () => {
    it('should load ledgers from IndexedDB', async () => {
      const mockLedgers: ILedger[] = [
        {
          id: 'ledger-1',
          partyName: 'John Doe',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      mockedStore.getAllLedgers.mockResolvedValue(mockLedgers)
      mockedStore.getDeletedIds.mockResolvedValue([])
      mockedStore.getEntriesByLedgerId.mockResolvedValue([])

      mockedService.listLedgers.mockRejectedValue(new Error('Network error'))

      await store.dispatch(loadLedgers())

      const state = store.getState().ledgers as ILedgerState
      expect(state.ledgers).toHaveLength(1)
      expect(state.ledgers[0].partyName).toBe('John Doe')
      expect(state.isLocalLedgers).toBe(true)
      expect(state.loading).toBe(false)
    })

    it('should merge server data with local data', async () => {
      const mockLocalLedgers: ILedger[] = [
        {
          id: 'ledger-1',
          partyName: 'Local John',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      const mockServerLedgers: ILedger[] = [
        {
          id: 'ledger-1',
          partyName: 'Server John',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      mockedStore.getAllLedgers.mockResolvedValue(mockLocalLedgers)
      mockedStore.getDeletedIds.mockResolvedValue([])
      mockedStore.getEntriesByLedgerId.mockResolvedValue([])

      mockedService.listLedgers.mockResolvedValue(mockServerLedgers)

      await store.dispatch(loadLedgers())

      const state = store.getState().ledgers as ILedgerState
      expect(state.ledgers).toHaveLength(1)
      // Local should override server
      expect(state.ledgers[0].partyName).toBe('Local John')
    })

    it('should handle loading error gracefully', async () => {
      mockedStore.getAllLedgers.mockRejectedValue(new Error('IndexedDB error'))

      await store.dispatch(loadLedgers())

      const state = store.getState().ledgers as ILedgerState
      expect(state.error).toBeTruthy()
      expect(state.loading).toBe(false)
    })

    it('should keep a locally-deleted ledger out of the merge and keep the sync flag on until it is synced', async () => {
      // Regression: deleteLedger only queues a `delete_ledger` operation; the
      // ledger still exists on the server until that operation is synced. A
      // reload must not resurrect it from the server response, and it must
      // keep showing the "Sync to Server" affordance so the deletion can
      // actually reach the server.
      const mockServerLedgers: ILedger[] = [
        {
          id: 'ledger-1',
          partyName: 'Deleted On Client',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      mockedStore.getAllLedgers.mockResolvedValue([])
      mockedStore.getDeletedIds.mockResolvedValue([])
      mockedStore.getEntriesByLedgerId.mockResolvedValue([])
      mockedStore.getSyncOperations.mockResolvedValue([{ id: 'op-1', type: 'delete_ledger', ledgerId: 'ledger-1' }])
      mockedService.listLedgers.mockResolvedValue(mockServerLedgers)

      await store.dispatch(loadLedgers())

      const state = store.getState().ledgers as ILedgerState
      expect(state.ledgers).toHaveLength(0)
      expect(state.isLocalLedgers).toBe(true)
    })
  })

  describe('createLedger thunk', () => {
    it('should create ledger and save to IndexedDB', async () => {
      mockedStore.saveLedger.mockResolvedValue(undefined)

      await store.dispatch(createLedger({ partyName: 'John Doe' }))

      const state = store.getState().ledgers as ILedgerState
      expect(state.ledgers).toHaveLength(1)
      expect(state.ledgers[0].partyName).toBe('John Doe')
      expect(mockedStore.saveLedger).toHaveBeenCalled()
    })

    it('should reject empty party name', async () => {
      await store.dispatch(createLedger({ partyName: '' }))

      const state = store.getState().ledgers as ILedgerState
      expect(state.error).toBe('Party name is required')
    })

    it('should reject partyName exceeding 100 characters', async () => {
      const longName = 'a'.repeat(101)
      await store.dispatch(createLedger({ partyName: longName }))

      const state = store.getState().ledgers as ILedgerState
      expect(state.error).toContain('cannot exceed 100 characters')
    })
  })

  describe('deleteLedger thunk', () => {
    it('should delete empty ledger', async () => {
      mockedStore.saveLedger.mockResolvedValue(undefined)
      mockedStore.deleteLedger.mockResolvedValue(undefined)
      mockedStore.addDeletedId.mockResolvedValue(undefined)

      await store.dispatch(createLedger({ partyName: 'John Doe' }))

      const state1 = store.getState().ledgers as ILedgerState
      const ledgerId = state1.ledgers[0].id

      // Now delete it (it's empty, so it should succeed)
      await store.dispatch(deleteLedger(ledgerId))

      expect(mockedStore.deleteLedger).toHaveBeenCalledWith(ledgerId)
      expect(mockedStore.addSyncOperation).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'delete_ledger', ledgerId })
      )
    })

    it('should reject deletion of ledger with entries', async () => {
      mockedStore.saveLedger.mockResolvedValue(undefined)
      mockedStore.saveLedgerEntry.mockResolvedValue(undefined)

      await store.dispatch(createLedger({ partyName: 'John Doe' }))

      const state1 = store.getState().ledgers as ILedgerState
      const ledgerId = state1.ledgers[0].id

      // Add an entry
      await store.dispatch(
        linkTransactionToLedger({
          ledgerId,
          transactionId: 'tx-1',
          direction: 'i_paid',
          amount: 100,
        })
      )

      // Now try to delete it (should fail because it has entries)
      await store.dispatch(deleteLedger(ledgerId))

      const state2 = store.getState().ledgers as ILedgerState
      expect(state2.error).toContain('Cannot delete ledger with active entries')
    })

    it('should mark ledger as having local changes after deletion', async () => {
      mockedStore.saveLedger.mockResolvedValue(undefined)
      mockedStore.deleteLedger.mockResolvedValue(undefined)
      mockedStore.addDeletedId.mockResolvedValue(undefined)

      await store.dispatch(createLedger({ partyName: 'John Doe' }))

      const state1 = store.getState().ledgers as ILedgerState
      const ledgerId = state1.ledgers[0].id

      await store.dispatch(deleteLedger(ledgerId))

      const state2 = store.getState().ledgers as ILedgerState
      expect(state2.isLocalLedgers).toBe(true)
    })
  })

  describe('linkTransactionToLedger thunk', () => {
    it('should add transaction entry to ledger', async () => {
      mockedStore.saveLedger.mockResolvedValue(undefined)
      mockedStore.saveLedgerEntry.mockResolvedValue(undefined)

      await store.dispatch(createLedger({ partyName: 'John Doe' }))

      const state1 = store.getState().ledgers as ILedgerState
      const ledgerId = state1.ledgers[0].id

      await store.dispatch(
        linkTransactionToLedger({
          ledgerId,
          transactionId: 'tx-1',
          direction: 'i_paid',
          amount: 100,
        })
      )

      const state2 = store.getState().ledgers as ILedgerState
      expect(state2.entries).toHaveLength(1)
      expect(state2.entries[0].direction).toBe('i_paid')
      expect(state2.isLocalLedgers).toBe(true)
    })
  })

  describe('removeLedgerEntry thunk', () => {
    it('should remove entry from ledger', async () => {
      mockedStore.saveLedger.mockResolvedValue(undefined)
      mockedStore.saveLedgerEntry.mockResolvedValue(undefined)
      mockedStore.addDeletedEntryId.mockResolvedValue(undefined)
      mockedStore.deleteLedgerEntry.mockResolvedValue(undefined)

      await store.dispatch(createLedger({ partyName: 'John Doe' }))

      const state1 = store.getState().ledgers as ILedgerState
      const ledgerId = state1.ledgers[0].id

      await store.dispatch(
        linkTransactionToLedger({
          ledgerId,
          transactionId: 'tx-1',
          direction: 'i_paid',
          amount: 100,
        })
      )

      const state2 = store.getState().ledgers as ILedgerState
      const entryId = state2.entries[0].id

      await store.dispatch(removeLedgerEntry({ ledgerId, entryId }))

      const state3 = store.getState().ledgers as ILedgerState
      expect(state3.entries).toHaveLength(0)
      expect(state3.isLocalLedgers).toBe(true)
      expect(mockedStore.addSyncOperation).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'unlink_entry', ledgerId, entryId })
      )
      expect(mockedStore.deleteLedgerEntry).toHaveBeenCalledWith(entryId)
    })
  })

  describe('syncLedgers thunk', () => {
    it('should sync local ledgers to server', async () => {
      mockedStore.saveLedger.mockResolvedValue(undefined)
      mockedStore.getAllLedgers.mockResolvedValue([
        {
          id: 'ledger-1',
          partyName: 'John Doe',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ])
      mockedStore.getAllEntries.mockResolvedValue([])
      mockedStore.getDeletedIds.mockResolvedValue([])
      mockedStore.getDeletedEntryIds.mockResolvedValue([])
      mockedStore.clearDeletedIds.mockResolvedValue(undefined)
      mockedStore.clearDeletedEntryIds.mockResolvedValue(undefined)
      mockedStore.deleteLedger.mockResolvedValue(undefined)
      mockedStore.getSyncOperations.mockResolvedValue([
        {
          id: 'op-1',
          type: 'upsert_ledger',
          ledger: {
            clientId: 'ledger-1',
            partyName: 'John Doe',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      ])

      mockedService.syncLedgers.mockResolvedValue({
        output: {
          ledgers: [
            {
              id: 'ledger-1',
              partyName: 'John Doe',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          entries: [],
          processedOperationIds: ['op-1'],
        },
      })

      // Create a ledger first
      await store.dispatch(createLedger({ partyName: 'John Doe' }))

      const state1 = store.getState().ledgers as ILedgerState
      expect(state1.isLocalLedgers).toBe(true)

      // Now sync
      await store.dispatch(syncLedgers())

      const state2 = store.getState().ledgers as ILedgerState
      expect(state2.isLocalLedgers).toBe(false)
      expect(state2.ledgerSyncStatus).toBe('success')
    })

    it('should handle sync errors', async () => {
      mockedStore.getAllLedgers.mockResolvedValue([])
      mockedStore.getAllEntries.mockResolvedValue([])
      mockedStore.getDeletedIds.mockResolvedValue([])
      mockedStore.getDeletedEntryIds.mockResolvedValue([])
      mockedStore.getSyncOperations.mockResolvedValue([
        {
          id: 'op-1',
          type: 'upsert_ledger',
          ledger: {
            clientId: 'ledger-1',
            partyName: 'John Doe',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      ])

      mockedService.syncLedgers.mockRejectedValue(new Error('Sync failed'))

      await store.dispatch(syncLedgers())

      const state = store.getState().ledgers as ILedgerState
      expect(state.ledgerSyncStatus).toBe('error')
      expect(state.error).toBeTruthy()
    })

    it('should replace local data with server canonical state', async () => {
      const localLedger = {
        id: 'ledger-1',
        partyName: 'Old Local Data',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const serverLedger = {
        id: 'ledger-1',
        partyName: 'Updated Server Data',
        createdAt: new Date().toISOString(),
        updatedAt: new Date(Date.now() + 3600000).toISOString(), // More recent
      }

      mockedStore.getAllLedgers.mockResolvedValue([localLedger])
      mockedStore.getAllEntries.mockResolvedValue([])
      mockedStore.getDeletedIds.mockResolvedValue([])
      mockedStore.getDeletedEntryIds.mockResolvedValue([])
      mockedStore.clearDeletedIds.mockResolvedValue(undefined)
      mockedStore.clearDeletedEntryIds.mockResolvedValue(undefined)
      mockedStore.deleteLedger.mockResolvedValue(undefined)
      mockedStore.saveLedger.mockResolvedValue(undefined)
      mockedStore.getSyncOperations.mockResolvedValue([
        {
          id: 'op-1',
          type: 'upsert_ledger',
          ledger: {
            clientId: 'ledger-1',
            partyName: 'John Doe',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      ])

      mockedService.syncLedgers.mockResolvedValue({
        output: {
          ledgers: [serverLedger],
          entries: [],
          processedOperationIds: ['op-1'],
        },
      })

      await store.dispatch(syncLedgers())

      const state = store.getState().ledgers as ILedgerState
      expect(state.ledgers[0].partyName).toBe('Updated Server Data')
    })
  })

  describe('selectHasLocalChanges selector', () => {
    it('should return true when there are local changes', async () => {
      mockedStore.saveLedger.mockResolvedValue(undefined)

      await store.dispatch(createLedger({ partyName: 'John Doe' }))

      const state = store.getState()
      const hasLocal = selectHasLocalChanges(state as { ledgers: ILedgerState })
      expect(hasLocal).toBe(true)
    })

    it('should return false after successful sync', async () => {
      mockedStore.saveLedger.mockResolvedValue(undefined)
      mockedStore.getAllLedgers.mockResolvedValue([])
      mockedStore.getAllEntries.mockResolvedValue([])
      mockedStore.getDeletedIds.mockResolvedValue([])
      mockedStore.getDeletedEntryIds.mockResolvedValue([])
      mockedStore.clearDeletedIds.mockResolvedValue(undefined)
      mockedStore.clearDeletedEntryIds.mockResolvedValue(undefined)
      mockedStore.getSyncOperations.mockResolvedValue([
        {
          id: 'op-1',
          type: 'upsert_ledger',
          ledger: {
            clientId: 'ledger-1',
            partyName: 'John Doe',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      ])

      mockedService.syncLedgers.mockResolvedValue({
        output: { ledgers: [], entries: [], processedOperationIds: ['op-1'] },
      })

      await store.dispatch(syncLedgers())

      const state = store.getState()
      const hasLocal = selectHasLocalChanges(state as { ledgers: ILedgerState })
      expect(hasLocal).toBe(false)
    })
  })
})
