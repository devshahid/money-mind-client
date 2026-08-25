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
import { calculateBalance, isTransactionLinked } from '../utils/ledgerBalance'

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
 * Transform ledger from API to internal format.
 *
 * `clientId` is the single canonical id shared between client and server. The
 * server now always sets it, so it is always preferred. The `_id`/`id`
 * fallbacks exist only to stay resilient to any legacy record that predates the
 * guarantee; a Mongo `_id` must never become the canonical id when a `clientId`
 * is present, otherwise a locally-created ledger (keyed by its UUID) would fail
 * to match its server twin and render as a phantom duplicate.
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

    // Load ALL persisted entries, not just those attached to a ledger that
    // currently exists in the local IndexedDB. A ledger can be present on the
    // server but absent locally (created on another device, synced-down-only,
    // or after the local store was cleared). Entries linked to such a ledger
    // are still saved to IndexedDB keyed by that ledger's id, so collecting
    // entries per-local-ledger would silently drop them and the ledger view
    // would render empty even though the link succeeded.
    const allEntries: ILedgerEntry[] = await ledgerStore.getAllEntries()

    // Try to fetch from server and merge
    try {
      const rawServerLedgers = await ledgerService.listLedgers()
      // Normalize server ledgers so their canonical id is the clientId, matching
      // the id scheme used by locally-created ledgers.
      const serverLedgers = rawServerLedgers.map(l => fromApiLedger(l as unknown as Record<string, unknown>))
      const deletedIds = await ledgerStore.getDeletedIds()
      const filteredServerLedgers = serverLedgers.filter(l => !deletedIds.includes(l.id))

      // Build a lookup keyed by EVERY identity a server ledger can be known by
      // (canonical id, Mongo _id, and clientId). This lets a locally-created
      // ledger — keyed by its UUID — find its server twin regardless of which id
      // was persisted locally, so it never renders as a phantom duplicate.
      const serverByAnyId = new Map<string, ILedger>()
      for (const s of filteredServerLedgers) {
        const raw = s as unknown as Record<string, unknown>
        serverByAnyId.set(s.id, s)
        if (typeof raw._id === 'string') serverByAnyId.set(raw._id, s)
        if (typeof raw.clientId === 'string') serverByAnyId.set(raw.clientId, s)
      }

      // Merge: local edits override server data, but always keep the server
      // ledger's canonical id so entries (keyed by clientId) stay attached.
      const merged = [...filteredServerLedgers]
      for (const local of localLedgers) {
        const twin = serverByAnyId.get(local.id)
        if (twin) {
          const idx = merged.findIndex(l => l.id === twin.id)
          if (idx !== -1) merged[idx] = { ...local, id: twin.id }
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
export const createLedger = createAsyncThunk<ILedger, { partyName: string }, { rejectValue: string }>(
  'ledgers/createLedger',
  async ({ partyName }, { rejectWithValue }) => {
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
  }
)

/**
 * Update a ledger
 */
export const updateLedger = createAsyncThunk<ILedger, Partial<ILedger> & { id: string }, { rejectValue: string }>(
  'ledgers/updateLedger',
  async ({ id, ...updates }, { rejectWithValue, getState }) => {
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
  }
)

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
  { ledgerId: string; transactionId: string; direction: MoneyDirection; narration?: string; transactionDate?: string },
  { rejectValue: string; state: { ledgers: ILedgerState } }
>(
  'ledgers/addLedgerEntry',
  async ({ ledgerId, transactionId, direction, narration, transactionDate }, { rejectWithValue, getState }) => {
    try {
      // Duplicate-prevention: a transaction may be linked to a ledger only once.
      if (isTransactionLinked(getState().ledgers.entries, ledgerId, transactionId)) {
        return rejectWithValue('This transaction is already linked to this ledger.')
      }

      const now = new Date().toISOString()
      const entry: ILedgerEntry = {
        id: crypto.randomUUID(),
        ledgerId,
        transactionId,
        direction,
        amount: 0, // Will be populated from transaction data
        createdAt: now,
        narration,
        transactionDate,
      }

      await ledgerStore.saveLedgerEntry(entry)
      return entry
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add entry')
    }
  }
)

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
 * Remove multiple entries from a ledger in one action
 */
export const removeLedgerEntries = createAsyncThunk<
  string[], // returns removed entry ids
  { ledgerId: string; entryIds: string[] },
  { rejectValue: string }
>('ledgers/removeLedgerEntries', async ({ entryIds }, { rejectWithValue }) => {
  try {
    for (const entryId of entryIds) {
      await ledgerStore.addDeletedEntryId(entryId)
      await ledgerStore.deleteLedgerEntry(entryId)
    }
    return entryIds
  } catch (error: unknown) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to remove entries')
  }
})

/**
 * Link a transaction to a ledger
 */
export const linkTransactionToLedger = createAsyncThunk<
  ILedgerEntry,
  {
    ledgerId: string
    transactionId: string
    direction: MoneyDirection
    amount: number
    narration?: string
    transactionDate?: string
  },
  { rejectValue: string; state: { ledgers: ILedgerState } }
>('ledgers/linkTransactionToLedger', async (payload, { rejectWithValue, getState }) => {
  try {
    // Duplicate-prevention: a transaction may be linked to a ledger only once.
    if (isTransactionLinked(getState().ledgers.entries, payload.ledgerId, payload.transactionId)) {
      return rejectWithValue('This transaction is already linked to this ledger.')
    }

    const now = new Date().toISOString()
    const entry: ILedgerEntry = {
      id: crypto.randomUUID(),
      ledgerId: payload.ledgerId,
      transactionId: payload.transactionId,
      direction: payload.direction,
      amount: payload.amount,
      createdAt: now,
      narration: payload.narration,
      transactionDate: payload.transactionDate,
    }

    await ledgerStore.saveLedgerEntry(entry)
    return entry
  } catch (error: unknown) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to link transaction')
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

    // Remove Multiple Entries
    builder
      .addCase(removeLedgerEntries.fulfilled, (state, action) => {
        const removedIds = new Set(action.payload)
        state.entries = state.entries.filter(e => !removedIds.has(e.id))
        state.isLocalLedgers = true
      })
      .addCase(removeLedgerEntries.rejected, (state, action) => {
        state.error = action.payload || 'Failed to remove entries'
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
export const selectSelectedLedgerId = (state: { ledgers: ILedgerState }) => state.ledgers.selectedLedgerId
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
 * Whether a transaction is already linked to a specific ledger.
 * Mirrors the duplicate-prevention guard used inside the link/add thunks.
 */
export const selectIsTransactionLinkedToLedger = createSelector(
  [
    selectAllEntries,
    (_: { ledgers: ILedgerState }, ledgerId: string) => ledgerId,
    (_, __, transactionId: string) => transactionId,
  ],
  (entries, ledgerId, transactionId) => isTransactionLinked(entries, ledgerId, transactionId)
)

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
