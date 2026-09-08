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

type LedgerRootState = { ledgers: ILedgerState }
const LEDGER_ENTRIES_CACHE_TTL_MS = 5 * 60 * 1000
const ledgerEntriesCacheKey = (ledgerId: string): string => `ledger-entries-cache:${ledgerId}`

const invalidateLedgerEntriesCache = (ledgerId: string): void => {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(ledgerEntriesCacheKey(ledgerId))
}

const markLedgerEntriesCached = (ledgerId: string): void => {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(ledgerEntriesCacheKey(ledgerId), String(Date.now()))
}

const replaceCachedEntriesForLedger = async (ledgerId: string, entries: ILedgerEntry[]): Promise<void> => {
  const existingEntries = (await ledgerStore.getAllEntries()).filter(entry => entry.ledgerId === ledgerId)
  for (const entry of existingEntries) await ledgerStore.deleteLedgerEntry(entry.id)
  for (const entry of entries) await ledgerStore.saveLedgerEntry(entry)
}

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

    // Pending operations not yet accepted by the server. A queued
    // `delete_ledger` op means the ledger was removed locally but the server
    // still has it — without excluding it here, every reload merges the
    // "deleted" ledger back in from the server response, and it appears to
    // silently un-delete itself until a sync actually runs.
    const pendingOperations = await ledgerStore.getSyncOperations()
    const pendingDeletedLedgerIds = new Set(
      pendingOperations.filter(op => op.type === 'delete_ledger').map(op => op.ledgerId)
    )

    // Try to fetch from server and merge
    try {
      const rawServerLedgers = await ledgerService.listLedgers()
      // Normalize server ledgers so their canonical id is the clientId, matching
      // the id scheme used by locally-created ledgers.
      const serverLedgers = rawServerLedgers.map(l => fromApiLedger(l as unknown as Record<string, unknown>))
      const deletedIds = await ledgerStore.getDeletedIds()
      const filteredServerLedgers = serverLedgers.filter(
        l => !deletedIds.includes(l.id) && !pendingDeletedLedgerIds.has(l.id)
      )

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

      // `isLocalLedgers` drives the "Sync to Server" button. It must reflect
      // any durable pending operation (e.g. a queued ledger deletion), not
      // just locally-held ledgers, otherwise a pending delete has no way to
      // ever be synced — the button disappears on the very next reload.
      const hasLocal = localLedgers.length > 0 || deletedIds.length > 0 || pendingOperations.length > 0
      return { ledgers: merged, entries: allEntries, hasLocal }
    } catch {
      // If server fetch fails, return local data only
      return {
        ledgers: localLedgers,
        entries: allEntries,
        hasLocal: localLedgers.length > 0 || pendingOperations.length > 0,
      }
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
      invalidateLedgerEntriesCache(ledger.id)
      await ledgerStore.addSyncOperation({
        id: crypto.randomUUID(),
        type: 'upsert_ledger',
        ledger: { ...ledger, clientId: ledger.id },
      })
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
      invalidateLedgerEntriesCache(updated.id)
      await ledgerStore.addSyncOperation({
        id: crypto.randomUUID(),
        type: 'upsert_ledger',
        ledger: { ...updated, clientId: updated.id },
      })
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
      invalidateLedgerEntriesCache(id)
      await ledgerStore.addSyncOperation({ id: crypto.randomUUID(), type: 'delete_ledger', ledgerId: id })
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

      if (!(await ledgerStore.saveLedgerEntryIfAbsent(entry))) {
        return rejectWithValue('This transaction is already linked to this ledger.')
      }
      invalidateLedgerEntriesCache(ledgerId)
      await ledgerStore.addSyncOperation({ id: crypto.randomUUID(), type: 'link_entry', entry })
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
>('ledgers/removeLedgerEntry', async ({ ledgerId, entryId }, { rejectWithValue }) => {
  try {
    // Delete from local store
    await ledgerStore.deleteLedgerEntry(entryId)
    invalidateLedgerEntriesCache(ledgerId)
    await ledgerStore.addSyncOperation({ id: crypto.randomUUID(), type: 'unlink_entry', ledgerId, entryId })
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
>('ledgers/removeLedgerEntries', async ({ ledgerId, entryIds }, { rejectWithValue }) => {
  try {
    for (const entryId of entryIds) {
      await ledgerStore.deleteLedgerEntry(entryId)
      invalidateLedgerEntriesCache(ledgerId)
      await ledgerStore.addSyncOperation({ id: crypto.randomUUID(), type: 'unlink_entry', ledgerId, entryId })
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

    if (!(await ledgerStore.saveLedgerEntryIfAbsent(entry))) {
      return rejectWithValue('This transaction is already linked to this ledger.')
    }
    invalidateLedgerEntriesCache(payload.ledgerId)
    await ledgerStore.addSyncOperation({ id: crypto.randomUUID(), type: 'link_entry', entry })
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
    const operations = await ledgerStore.getSyncOperations()

    // Send only durable pending mutations; never the whole IndexedDB cache.
    // An empty operation list still fetches canonical server state, allowing an
    // upgraded client to discard legacy cache rows that never reached server.
    const response = await ledgerService.syncLedgers({
      operations,
    })

    await ledgerStore.removeSyncOperations(response.output.processedOperationIds)

    // Replace local IndexedDB with server canonical state
    const serverLedgers = response.output.ledgers.map(fromApiLedger)
    const serverEntries = response.output.entries

    const localLedgers = await ledgerStore.getAllLedgers()
    for (const ledger of localLedgers) {
      await ledgerStore.deleteLedger(ledger.id)
    }
    for (const ledger of serverLedgers) {
      await ledgerStore.saveLedger(ledger)
    }
    // This is a true replacement. The previous code only appended canonical
    // entries, leaving locally-rejected duplicates to be uploaded forever.
    await ledgerStore.replaceEntries(serverEntries)
    for (const ledger of serverLedgers) markLedgerEntriesCached(ledger.id)

    return { ledgers: serverLedgers, entries: serverEntries }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return rejectWithValue(error.message)
    }
    return rejectWithValue('Failed to sync ledgers')
  }
})

export const loadLedgerEntries = createAsyncThunk<ILedgerEntry[] | null, string, { rejectValue: string }>(
  'ledgers/loadLedgerEntries',
  async (ledgerId, { rejectWithValue }) => {
    try {
      const pendingOperations = await ledgerStore.getSyncOperations()
      const hasPendingLedgerMutation = pendingOperations.some(operation => {
        if (operation.type === 'upsert_ledger') return operation.ledger.clientId === ledgerId
        if (operation.type === 'delete_ledger') return operation.ledgerId === ledgerId
        return operation.type === 'link_entry' ? operation.entry.ledgerId === ledgerId : operation.ledgerId === ledgerId
      })
      if (hasPendingLedgerMutation) return null

      const cachedEntries = (await ledgerStore.getAllEntries()).filter(entry => entry.ledgerId === ledgerId)
      const cachedAt =
        typeof localStorage === 'undefined' ? Number.NaN : Number(localStorage.getItem(ledgerEntriesCacheKey(ledgerId)))
      if (Number.isFinite(cachedAt) && Date.now() - cachedAt < LEDGER_ENTRIES_CACHE_TTL_MS) {
        return cachedEntries
      }

      const response = await ledgerService.getLedgerDetail(ledgerId)
      await replaceCachedEntriesForLedger(ledgerId, response.entries)
      markLedgerEntriesCached(ledgerId)
      return response.entries
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to load ledger entries')
    }
  }
)

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

    // Load canonical entries when a ledger is opened
    builder.addCase(loadLedgerEntries.fulfilled, (state, action) => {
      if (!action.payload) return
      const ledgerId = action.meta.arg
      state.entries = [...state.entries.filter(entry => entry.ledgerId !== ledgerId), ...action.payload]
    })
  },
})

export const { selectLedger, clearError } = ledgerSlice.actions
export const ledgerReducer = ledgerSlice.reducer

// Selectors
export const selectAllLedgers = (state: LedgerRootState): ILedger[] => state.ledgers.ledgers
export const selectAllEntries = (state: LedgerRootState): ILedgerEntry[] => state.ledgers.entries
export const selectLedgerLoading = (state: LedgerRootState): boolean => state.ledgers.loading
export const selectLedgerError = (state: LedgerRootState): string | null => state.ledgers.error
export const selectSelectedLedgerId = (state: LedgerRootState): string | null => state.ledgers.selectedLedgerId
export const selectHasLocalChanges = (state: LedgerRootState): boolean => state.ledgers.isLocalLedgers

/**
 * Get ledger by ID
 */
export const selectLedgerById = createSelector(
  [selectAllLedgers, (_: LedgerRootState, ledgerId: string): string => ledgerId],
  (ledgers, ledgerId): ILedger | undefined => ledgers.find(l => l.id === ledgerId)
)

/**
 * Get all entries for a specific ledger
 */
export const selectEntriesByLedgerId = createSelector(
  [selectAllEntries, (_: LedgerRootState, ledgerId: string): string => ledgerId],
  (entries, ledgerId): ILedgerEntry[] => entries.filter(e => e.ledgerId === ledgerId)
)

/**
 * Get a map of transaction IDs to their ledger IDs
 */
export const selectTransactionLedgerMap = createSelector([selectAllEntries], (entries): Map<string, string> => {
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
    (_: LedgerRootState, ledgerId: string): string => ledgerId,
    (_: LedgerRootState, _ledgerId: string, transactionId: string): string => transactionId,
  ],
  (entries, ledgerId, transactionId): boolean => isTransactionLinked(entries, ledgerId, transactionId)
)

/**
 * Calculate balance for a specific ledger
 */
export const selectLedgerBalance = createSelector(
  [selectAllEntries, (_: LedgerRootState, ledgerId: string): string => ledgerId],
  (entries, ledgerId): number => {
    const ledgerEntries = entries.filter(e => e.ledgerId === ledgerId)
    return calculateBalance(
      ledgerEntries.map(e => ({
        direction: e.direction,
        amount: e.amount,
      }))
    )
  }
)
