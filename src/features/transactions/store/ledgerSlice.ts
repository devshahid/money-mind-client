/**
 * Redux Ledger Slice
 * 
 * Manages ledger state with offline-first pattern:
 * - Load from IndexedDB first
 * - Fetch from server and merge
 * - Local modifications write to IndexedDB immediately
 * - Sync with server on demand
 */

import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit'

import { ledgerStore } from '../helpers/indexDB/ledgerStore'
import * as ledgerService from '../services/ledgerService'
import type { ILedger, ILedgerEntry, MoneyDirection, ILedgerState } from '../types/ledger'
import { calculateBalance } from '../utils/ledgerBalance'

const initialState: ILedgerState = {
  ledgers: [],
  entries: [],
  loading: false,
  error: null,
  isLocalLedgers: false,
  ledgerSyncStatus: 'idle',
  selectedLedgerId: null,
}

/**
 * Transform ledger from API to internal format
 */
const fromApiLedger = (apiLedger: Record<string, unknown>): ILedger => ({
  ...(apiLedger as unknown as ILedger),
  id: (apiLedger.clientId as string) || (apiLedger._id as string) || (apiLedger.id as string),
})

/**
 * Transform ledger from internal format to API format
 */
const toApiLedger = ({ id, ...rest }: ILedger): Record<string, unknown> => ({
  ...rest,
  clientId: id,
})

/**
 * Load ledgers from IndexedDB and merge with server data
 */
export const loadLedgers = createAsyncThunk<
  { ledgers: ILedger[]; entries: ILedgerEntry[]; hasLocal: boolean },
  void,
  { rejectValue: string }
>('ledgers/loadLedgers', async (_, { rejectWithValue }) => {
  try {
    // Load from IndexedDB first
    const localLedgers = await ledgerStore.getAllLedgers()
    const allEntries: ILedgerEntry[] = []

    // Collect all entries from local ledgers
    for (const ledger of localLedgers) {
      const entries = await ledgerStore.getEntriesByLedgerId(ledger.id)
      allEntries.push(...entries)
    }

    // Try to fetch from server and merge
    try {
      const serverLedgers = await ledgerService.listLedgers()
      const deletedIds = await ledgerStore.getDeletedIds()
      const filteredServerLedgers = serverLedgers.filter(l => !deletedIds.includes(l.id))

      // Merge: local edits override server data
      const serverMap = new Map(filteredServerLedgers.map(l => [l.id, l]))
      const merged = [...filteredServerLedgers]

      for (const local of localLedgers) {
        if (serverMap.has(local.id)) {
          const idx = merged.findIndex(l => l.id === local.id)
          if (idx !== -1) merged[idx] = local
        } else {
          merged.push(local)
        }
      }

      const hasLocal = localLedgers.length > 0 || deletedIds.length > 0
      return { ledgers: merged, entries: allEntries, hasLocal }
    } catch {
      // If server fetch fails, return local data only
      return { ledgers: localLedgers, entries: allEntries, hasLocal: localLedgers.length > 0 }
    }
  } catch (error: unknown) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to load ledgers')
  }
})

/**
 * Create a new ledger
 */
export const createLedger = createAsyncThunk<
  ILedger,
  { partyName: string },
  { rejectValue: string }
>('ledgers/createLedger', async ({ partyName }, { rejectWithValue }) => {
  try {
    // Validate party name
    if (!partyName.trim()) {
      return rejectWithValue('Party name is required')
    }
    if (partyName.trim().length > 100) {
      return rejectWithValue('Party name cannot exceed 100 characters')
    }

    const now = new Date().toISOString()
    const ledger: ILedger = {
      id: crypto.randomUUID(),
      partyName: partyName.trim(),
      createdAt: now,
      updatedAt: now,
    }

    // Save to IndexedDB first (optimistic)
    await ledgerStore.saveLedger(ledger)
    return ledger
  } catch (error: unknown) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to create ledger')
  }
})

/**
 * Update a ledger
 */
export const updateLedger = createAsyncThunk<
  ILedger,
  Partial<ILedger> & { id: string },
  { rejectValue: string }
>('ledgers/updateLedger', async ({ id, ...updates }, { rejectWithValue, getState }) => {
  try {
    let existing = await ledgerStore.getLedger(id)
    if (!existing) {
      const state = getState() as { ledgers: ILedgerState }
      existing = state.ledgers.ledgers.find(l => l.id === id)
    }
    if (!existing) return rejectWithValue('Ledger not found')

    const updated: ILedger = { ...existing, ...updates, updatedAt: new Date().toISOString() }
    await ledgerStore.saveLedger(updated)
    return updated
  } catch (error: unknown) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to update ledger')
  }
})

/**
 * Delete a ledger (only if it has no entries)
 */
export const deleteLedger = createAsyncThunk<string, string, { rejectValue: string; state: { ledgers: ILedgerState } }>(
  'ledgers/deleteLedger',
  async (id, { rejectWithValue, getState }) => {
    try {
      // Check if ledger has any entries
      const state = getState()
      const ledgerEntries = state.ledgers.entries.filter(e => e.ledgerId === id)
      if (ledgerEntries.length > 0) {
        return rejectWithValue('Cannot delete ledger with active entries. Please remove all entries first.')
      }

      await ledgerStore.deleteLedger(id)
      await ledgerStore.addDeletedId(id)
      return id
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete ledger')
    }
  }
)

/**
 * Add an entry to a ledger
 */
export const addLedgerEntry = createAsyncThunk<
  ILedgerEntry,
  { ledgerId: string; transactionId: string; direction: MoneyDirection },
  { rejectValue: string }
>('ledgers/addLedgerEntry', async ({ ledgerId, transactionId, direction }, { rejectWithValue }) => {
  try {
    const now = new Date().toISOString()
    const entry: ILedgerEntry = {
      id: crypto.randomUUID(),
      ledgerId,
      transactionId,
      direction,
      amount: 0, // Will be populated from transaction data
      isSettlement: false,
      createdAt: now,
    }

    await ledgerStore.saveLedgerEntry(entry)
    return entry
  } catch (error: unknown) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to add entry')
  }
})

/**
 * Remove an entry from a ledger
 */
export const removeLedgerEntry = createAsyncThunk<
  string,
  { ledgerId: string; entryId: string },
  { rejectValue: string }
>('ledgers/removeLedgerEntry', async ({ entryId }, { rejectWithValue }) => {
  try {
    // Track deleted entry ID for sync
    await ledgerStore.addDeletedEntryId(entryId)
    // Delete from local store
    await ledgerStore.deleteLedgerEntry(entryId)
    return entryId
  } catch (error: unknown) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to remove entry')
  }
})

/**
 * Link a transaction to a ledger
 */
export const linkTransactionToLedger = createAsyncThunk<
  ILedgerEntry,
  { ledgerId: string; transactionId: string; direction: MoneyDirection; amount: number },
  { rejectValue: string }
>('ledgers/linkTransactionToLedger', async (payload, { rejectWithValue }) => {
  try {
    const now = new Date().toISOString()
    const entry: ILedgerEntry = {
      id: crypto.randomUUID(),
      ledgerId: payload.ledgerId,
      transactionId: payload.transactionId,
      direction: payload.direction,
      amount: payload.amount,
      isSettlement: false,
      createdAt: now,
    }

    await ledgerStore.saveLedgerEntry(entry)
    return entry
  } catch (error: unknown) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to link transaction')
  }
})

/**
 * Settle a ledger balance
 */
export const settleLedger = createAsyncThunk<
  ILedgerEntry,
  { ledgerId: string; transactionId: string; direction: MoneyDirection },
  { rejectValue: string }
>('ledgers/settleLedger', async ({ ledgerId, transactionId, direction }, { rejectWithValue }) => {
  try {
    const now = new Date().toISOString()
    const entry: ILedgerEntry = {
      id: crypto.randomUUID(),
      ledgerId,
      transactionId,
      direction,
      amount: 0, // Will be set from transaction data
      isSettlement: true,
      createdAt: now,
    }

    await ledgerStore.saveLedgerEntry(entry)
    return entry
  } catch (error: unknown) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to settle ledger')
  }
})

/**
 * Sync ledgers with server
 * Sends local ledger state + entries + deleted IDs to server for merge
 * Server returns canonical state which replaces local IndexedDB
 */
export const syncLedgers = createAsyncThunk<
  { ledgers: ILedger[]; entries: ILedgerEntry[] },
  void,
  { rejectValue: string }
>('ledgers/syncLedgers', async (_, { rejectWithValue }) => {
  try {
    const localLedgers = await ledgerStore.getAllLedgers()
    const localEntries = await ledgerStore.getAllEntries()
    const deletedLedgerIds: string[] = await ledgerStore.getDeletedIds()
    const deletedEntryIds: string[] = await ledgerStore.getDeletedEntryIds()
    const apiPayload = localLedgers.map(toApiLedger)

    // Send local state to server
    const response = await ledgerService.syncLedgers({
      ledgers: apiPayload,
      entries: localEntries,
      deletedLedgerIds,
      deletedEntryIds,
    })

    // Clear local deletion tracking
    await ledgerStore.clearDeletedIds()
    await ledgerStore.clearDeletedEntryIds()

    // Replace local IndexedDB with server canonical state
    const serverLedgers = response.output.ledgers.map(fromApiLedger)
    const serverEntries = response.output.entries

    for (const ledger of localLedgers) {
      await ledgerStore.deleteLedger(ledger.id)
    }
    for (const ledger of serverLedgers) {
      await ledgerStore.saveLedger(ledger)
    }
    for (const entry of serverEntries) {
      await ledgerStore.saveLedgerEntry(entry)
    }

    return { ledgers: serverLedgers, entries: serverEntries }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return rejectWithValue(error.message)
    }
    return rejectWithValue('Failed to sync ledgers')
  }
})

const ledgerSlice = createSlice({
  name: 'ledgers',
  initialState,
  reducers: {
    selectLedger: (state, action: PayloadAction<string | null>) => {
      state.selectedLedgerId = action.payload
    },
    clearError: state => {
      state.error = null
    },
  },
  extraReducers: builder => {
    // Load Ledgers
    builder
      .addCase(loadLedgers.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(loadLedgers.fulfilled, (state, action) => {
        state.ledgers = action.payload.ledgers
        state.entries = action.payload.entries
        state.isLocalLedgers = action.payload.hasLocal
        state.loading = false
      })
      .addCase(loadLedgers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to load ledgers'
      })

    // Create Ledger
    builder
      .addCase(createLedger.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(createLedger.fulfilled, (state, action) => {
        state.ledgers.push(action.payload)
        state.isLocalLedgers = true
        state.loading = false
      })
      .addCase(createLedger.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to create ledger'
      })

    // Update Ledger
    builder
      .addCase(updateLedger.fulfilled, (state, action) => {
        const idx = state.ledgers.findIndex(l => l.id === action.payload.id)
        if (idx !== -1) {
          state.ledgers[idx] = action.payload
        }
        state.isLocalLedgers = true
      })
      .addCase(updateLedger.rejected, (state, action) => {
        state.error = action.payload || 'Failed to update ledger'
      })

    // Delete Ledger
    builder
      .addCase(deleteLedger.fulfilled, (state, action) => {
        state.ledgers = state.ledgers.filter(l => l.id !== action.payload)
        state.entries = state.entries.filter(e => e.ledgerId !== action.payload)
        state.isLocalLedgers = true
      })
      .addCase(deleteLedger.rejected, (state, action) => {
        state.error = action.payload || 'Failed to delete ledger'
      })

    // Add Entry
    builder
      .addCase(addLedgerEntry.fulfilled, (state, action) => {
        state.entries.push(action.payload)
        state.isLocalLedgers = true
      })
      .addCase(addLedgerEntry.rejected, (state, action) => {
        state.error = action.payload || 'Failed to add entry'
      })

    // Remove Entry
    builder
      .addCase(removeLedgerEntry.fulfilled, (state, action) => {
        state.entries = state.entries.filter(e => e.id !== action.payload)
        state.isLocalLedgers = true
      })
      .addCase(removeLedgerEntry.rejected, (state, action) => {
        state.error = action.payload || 'Failed to remove entry'
      })

    // Link Transaction
    builder
      .addCase(linkTransactionToLedger.fulfilled, (state, action) => {
        state.entries.push(action.payload)
        state.isLocalLedgers = true
      })
      .addCase(linkTransactionToLedger.rejected, (state, action) => {
        state.error = action.payload || 'Failed to link transaction'
      })

    // Settle Ledger
    builder
      .addCase(settleLedger.fulfilled, (state, action) => {
        state.entries.push(action.payload)
        state.isLocalLedgers = true
      })
      .addCase(settleLedger.rejected, (state, action) => {
        state.error = action.payload || 'Failed to settle ledger'
      })

    // Sync Ledgers
    builder
      .addCase(syncLedgers.pending, state => {
        state.ledgerSyncStatus = 'idle'
      })
      .addCase(syncLedgers.fulfilled, (state, action) => {
        state.ledgers = action.payload.ledgers
        state.entries = action.payload.entries
        state.isLocalLedgers = false
        state.ledgerSyncStatus = 'success'
      })
      .addCase(syncLedgers.rejected, (state, action) => {
        state.ledgerSyncStatus = 'error'
        state.error = action.payload || 'Failed to sync ledgers'
      })
  },
})

export const { selectLedger, clearError } = ledgerSlice.actions
export const ledgerReducer = ledgerSlice.reducer

// Selectors
export const selectAllLedgers = (state: { ledgers: ILedgerState }) => state.ledgers.ledgers
export const selectAllEntries = (state: { ledgers: ILedgerState }) => state.ledgers.entries
export const selectLedgerLoading = (state: { ledgers: ILedgerState }) => state.ledgers.loading
export const selectLedgerError = (state: { ledgers: ILedgerState }) => state.ledgers.error
export const selectSelectedLedgerId = (state: { ledgers: ILedgerState }) =>
  state.ledgers.selectedLedgerId
export const selectHasLocalChanges = (state: { ledgers: ILedgerState }) => state.ledgers.isLocalLedgers

/**
 * Get ledger by ID
 */
export const selectLedgerById = createSelector(
  [selectAllLedgers, (_, ledgerId: string) => ledgerId],
  (ledgers, ledgerId) => ledgers.find(l => l.id === ledgerId)
)

/**
 * Get all entries for a specific ledger
 */
export const selectEntriesByLedgerId = createSelector(
  [selectAllEntries, (_, ledgerId: string) => ledgerId],
  (entries, ledgerId) => entries.filter(e => e.ledgerId === ledgerId)
)

/**
 * Get a map of transaction IDs to their ledger IDs
 */
export const selectTransactionLedgerMap = createSelector([selectAllEntries], entries => {
  const map = new Map<string, string>()
  for (const entry of entries) {
    if (!map.has(entry.transactionId)) {
      map.set(entry.transactionId, entry.ledgerId)
    }
  }
  return map
})

/**
 * Calculate balance for a specific ledger
 */
export const selectLedgerBalance = createSelector(
  [selectAllEntries, (_, ledgerId: string) => ledgerId],
  (entries, ledgerId) => {
    const ledgerEntries = entries.filter(e => e.ledgerId === ledgerId)
    return calculateBalance(
      ledgerEntries.map(e => ({
        direction: e.direction,
        amount: e.amount,
      }))
    )
  }
)
