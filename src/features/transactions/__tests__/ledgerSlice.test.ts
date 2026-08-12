/**
 * Redux Ledger Slice Tests
 * 
 * Tests for offline-first ledger management with IndexedDB sync
 */
/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

import { configureStore } from '@reduxjs/toolkit'
import { ledgerReducer, loadLedgers, createLedger, deleteLedger, linkTransactionToLedger, removeLedgerEntry, syncLedgers } from '../store/ledgerSlice'
import type { ILedgerState, ILedger } from '../types/ledger'

// Mock the services
jest.mock('../helpers/indexDB/ledgerStore', () => ({
  getAllLedgers: jest.fn(),
  getAllEntries: jest.fn(),
  getDeletedIds: jest.fn(),
  getDeletedEntryIds: jest.fn(),
  saveLedger: jest.fn(),
  deleteLedger: jest.fn(),
  addDeletedId: jest.fn(),
  getEntriesByLedgerId: jest.fn(),
  saveLedgerEntry: jest.fn(),
  clearDeletedIds: jest.fn(),
  clearDeletedEntryIds: jest.fn(),
  getLedger: jest.fn(),
}))

jest.mock('../services/ledgerService', () => ({
  listLedgers: jest.fn(),
  syncLedgers: jest.fn(),
  createLedger: jest.fn(),
  getLedger: jest.fn(),
}))

describe('LedgerSlice (Redux Tests)', () => {
  let store: ReturnType<typeof configureStore>

  beforeEach(() => {
    jest.clearAllMocks()
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

      const ledgerStore = require('../helpers/indexDB/ledgerStore')
      ledgerStore.getAllLedgers.mockResolvedValue(mockLedgers)
      ledgerStore.getDeletedIds.mockResolvedValue([])
      ledgerStore.getEntriesByLedgerId.mockResolvedValue([])

      const ledgerService = require('../services/ledgerService')
      ledgerService.listLedgers.mockRejectedValue(new Error('Network error'))

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

      const ledgerStore = require('../helpers/indexDB/ledgerStore')
      ledgerStore.getAllLedgers.mockResolvedValue(mockLocalLedgers)
      ledgerStore.getDeletedIds.mockResolvedValue([])
      ledgerStore.getEntriesByLedgerId.mockResolvedValue([])

      const ledgerService = require('../services/ledgerService')
      ledgerService.listLedgers.mockResolvedValue(mockServerLedgers)

      await store.dispatch(loadLedgers())

      const state = store.getState().ledgers as ILedgerState
      expect(state.ledgers).toHaveLength(1)
      // Local should override server
      expect(state.ledgers[0].partyName).toBe('Local John')
    })

    it('should handle loading error gracefully', async () => {
      const ledgerStore = require('../helpers/indexDB/ledgerStore')
      ledgerStore.getAllLedgers.mockRejectedValue(new Error('IndexedDB error'))

      await store.dispatch(loadLedgers())

      const state = store.getState().ledgers as ILedgerState
      expect(state.error).toBeTruthy()
      expect(state.loading).toBe(false)
    })
  })

  describe('createLedger thunk', () => {
    it('should create ledger and save to IndexedDB', async () => {
      const ledgerStore = require('../helpers/indexDB/ledgerStore')
      ledgerStore.saveLedger.mockResolvedValue(undefined)

      await store.dispatch(createLedger({ partyName: 'John Doe' }))

      const state = store.getState().ledgers as ILedgerState
      expect(state.ledgers).toHaveLength(1)
      expect(state.ledgers[0].partyName).toBe('John Doe')
      expect(ledgerStore.saveLedger).toHaveBeenCalled()
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
      // First add a ledger
      const ledgerStore = require('../helpers/indexDB/ledgerStore')
      ledgerStore.saveLedger.mockResolvedValue(undefined)
      ledgerStore.deleteLedger.mockResolvedValue(undefined)
      ledgerStore.addDeletedId.mockResolvedValue(undefined)

      await store.dispatch(createLedger({ partyName: 'John Doe' }))

      const state1 = store.getState().ledgers as ILedgerState
      const ledgerId = state1.ledgers[0].id

      // Now delete it (it's empty, so it should succeed)
      await store.dispatch(deleteLedger(ledgerId))

      expect(ledgerStore.deleteLedger).toHaveBeenCalledWith(ledgerId)
      expect(ledgerStore.addDeletedId).toHaveBeenCalledWith(ledgerId)
    })

    it('should reject deletion of ledger with entries', async () => {
      // First add a ledger
      const ledgerStore = require('../helpers/indexDB/ledgerStore')
      ledgerStore.saveLedger.mockResolvedValue(undefined)

      await store.dispatch(createLedger({ partyName: 'John Doe' }))

      const state1 = store.getState().ledgers as ILedgerState
      const ledgerId = state1.ledgers[0].id

      // Add an entry
      await store.dispatch(linkTransactionToLedger({
        ledgerId,
        transactionId: 'tx-1',
        direction: 'i_paid',
        amount: 100,
      }))

      // Now try to delete it (should fail because it has entries)
      await store.dispatch(deleteLedger(ledgerId))

      const state2 = store.getState().ledgers as ILedgerState
      expect(state2.error).toContain('Cannot delete ledger with active entries')
    })

    it('should mark ledger as having local changes after deletion', async () => {
      const ledgerStore = require('../helpers/indexDB/ledgerStore')
      ledgerStore.saveLedger.mockResolvedValue(undefined)
      ledgerStore.deleteLedger.mockResolvedValue(undefined)
      ledgerStore.addDeletedId.mockResolvedValue(undefined)

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
      const ledgerStore = require('../helpers/indexDB/ledgerStore')
      ledgerStore.saveLedger.mockResolvedValue(undefined)
      ledgerStore.saveLedgerEntry.mockResolvedValue(undefined)

      await store.dispatch(createLedger({ partyName: 'John Doe' }))

      const state1 = store.getState().ledgers as ILedgerState
      const ledgerId = state1.ledgers[0].id

      await store.dispatch(linkTransactionToLedger({
        ledgerId,
        transactionId: 'tx-1',
        direction: 'i_paid',
        amount: 100,
      }))

      const state2 = store.getState().ledgers as ILedgerState
      expect(state2.entries).toHaveLength(1)
      expect(state2.entries[0].direction).toBe('i_paid')
      expect(state2.isLocalLedgers).toBe(true)
    })
  })

  describe('removeLedgerEntry thunk', () => {
    it('should remove entry from ledger', async () => {
      const ledgerStore = require('../helpers/indexDB/ledgerStore')
      ledgerStore.saveLedger.mockResolvedValue(undefined)
      ledgerStore.saveLedgerEntry.mockResolvedValue(undefined)
      ledgerStore.deleteEntry = jest.fn().mockResolvedValue(undefined)

      await store.dispatch(createLedger({ partyName: 'John Doe' }))

      const state1 = store.getState().ledgers as ILedgerState
      const ledgerId = state1.ledgers[0].id

      await store.dispatch(linkTransactionToLedger({
        ledgerId,
        transactionId: 'tx-1',
        direction: 'i_paid',
        amount: 100,
      }))

      const state2 = store.getState().ledgers as ILedgerState
      const entryId = state2.entries[0].id

      await store.dispatch(removeLedgerEntry({ ledgerId, entryId }))

      const state3 = store.getState().ledgers as ILedgerState
      expect(state3.entries).toHaveLength(0)
      expect(state3.isLocalLedgers).toBe(true)
    })
  })

  describe('syncLedgers thunk', () => {
    it('should sync local ledgers to server', async () => {
      const ledgerStore = require('../helpers/indexDB/ledgerStore')
      const ledgerService = require('../services/ledgerService')

      ledgerStore.saveLedger.mockResolvedValue(undefined)
      ledgerStore.getAllLedgers.mockResolvedValue([
        {
          id: 'ledger-1',
          partyName: 'John Doe',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ])
      ledgerStore.getAllEntries.mockResolvedValue([])
      ledgerStore.getDeletedIds.mockResolvedValue([])
      ledgerStore.getDeletedEntryIds.mockResolvedValue([])
      ledgerStore.clearDeletedIds.mockResolvedValue(undefined)
      ledgerStore.clearDeletedEntryIds.mockResolvedValue(undefined)
      ledgerStore.deleteLedger.mockResolvedValue(undefined)

      ledgerService.syncLedgers.mockResolvedValue({
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
      const ledgerStore = require('../helpers/indexDB/ledgerStore')
      const ledgerService = require('../services/ledgerService')

      ledgerStore.getAllLedgers.mockResolvedValue([])
      ledgerStore.getAllEntries.mockResolvedValue([])
      ledgerStore.getDeletedIds.mockResolvedValue([])
      ledgerStore.getDeletedEntryIds.mockResolvedValue([])

      ledgerService.syncLedgers.mockRejectedValue(new Error('Sync failed'))

      await store.dispatch(syncLedgers())

      const state = store.getState().ledgers as ILedgerState
      expect(state.ledgerSyncStatus).toBe('error')
      expect(state.error).toBeTruthy()
    })

    it('should replace local data with server canonical state', async () => {
      const ledgerStore = require('../helpers/indexDB/ledgerStore')
      const ledgerService = require('../services/ledgerService')

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

      ledgerStore.getAllLedgers.mockResolvedValue([localLedger])
      ledgerStore.getAllEntries.mockResolvedValue([])
      ledgerStore.getDeletedIds.mockResolvedValue([])
      ledgerStore.getDeletedEntryIds.mockResolvedValue([])
      ledgerStore.clearDeletedIds.mockResolvedValue(undefined)
      ledgerStore.clearDeletedEntryIds.mockResolvedValue(undefined)
      ledgerStore.deleteLedger.mockResolvedValue(undefined)
      ledgerStore.saveLedger.mockResolvedValue(undefined)

      ledgerService.syncLedgers.mockResolvedValue({
        output: {
          ledgers: [serverLedger],
          entries: [],
        },
      })

      await store.dispatch(syncLedgers())

      const state = store.getState().ledgers as ILedgerState
      expect(state.ledgers[0].partyName).toBe('Updated Server Data')
    })
  })

  describe('selectHasLocalChanges selector', () => {
    it('should return true when there are local changes', async () => {
      const { selectHasLocalChanges } = await import('../store/ledgerSlice')
      const ledgerStore = require('../helpers/indexDB/ledgerStore')
      ledgerStore.saveLedger.mockResolvedValue(undefined)

      await store.dispatch(createLedger({ partyName: 'John Doe' }))

      const state = store.getState()
      const hasLocal = selectHasLocalChanges(state)
      expect(hasLocal).toBe(true)
    })

    it('should return false after successful sync', async () => {
      const { selectHasLocalChanges } = await import('../store/ledgerSlice')
      const ledgerStore = require('../helpers/indexDB/ledgerStore')
      const ledgerService = require('../services/ledgerService')

      ledgerStore.saveLedger.mockResolvedValue(undefined)
      ledgerStore.getAllLedgers.mockResolvedValue([])
      ledgerStore.getAllEntries.mockResolvedValue([])
      ledgerStore.getDeletedIds.mockResolvedValue([])
      ledgerStore.getDeletedEntryIds.mockResolvedValue([])
      ledgerStore.clearDeletedIds.mockResolvedValue(undefined)
      ledgerStore.clearDeletedEntryIds.mockResolvedValue(undefined)

      ledgerService.syncLedgers.mockResolvedValue({
        output: { ledgers: [], entries: [] },
      })

      await store.dispatch(syncLedgers())

      const state = store.getState()
      const hasLocal = selectHasLocalChanges(state)
      expect(hasLocal).toBe(false)
    })
  })
})
