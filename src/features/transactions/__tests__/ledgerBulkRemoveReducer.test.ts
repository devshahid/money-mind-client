/**
 * Ledger Bulk Remove Reducer Tests
 *
 * Verifies the pure reducer behavior of the `removeLedgerEntries` (bulk)
 * thunk without touching IndexedDB. We apply the `fulfilled`/`rejected`
 * actions directly to the reducer, so no jest APIs or mocks are required.
 *
 * Vitest globals (test, expect, describe) are enabled via config.
 */

import { ledgerReducer, removeLedgerEntries } from '../store/ledgerSlice'
import type { ILedgerEntry, ILedgerState } from '../types/ledger'

const makeEntry = (id: string, ledgerId: string): ILedgerEntry => ({
  id,
  ledgerId,
  transactionId: `tx-${id}`,
  direction: 'i_paid',
  amount: 100,
  createdAt: '2024-01-01T00:00:00.000Z',
})

const makeState = (entries: ILedgerEntry[]): ILedgerState => ({
  ledgers: [],
  entries,
  loading: false,
  error: null,
  isLocalLedgers: false,
  ledgerSyncStatus: 'idle',
  selectedLedgerId: null,
})

describe('removeLedgerEntries reducer', () => {
  it('removes all returned entry ids from state and flags local changes', () => {
    const state = makeState([makeEntry('a', 'ledger-1'), makeEntry('b', 'ledger-1'), makeEntry('c', 'ledger-1')])

    const action = {
      type: removeLedgerEntries.fulfilled.type,
      payload: ['a', 'c'],
    }

    const next = ledgerReducer(state, action)

    expect(next.entries.map(e => e.id)).toEqual(['b'])
    expect(next.isLocalLedgers).toBe(true)
  })

  it('leaves entries untouched when the removed id list is empty', () => {
    const state = makeState([makeEntry('a', 'ledger-1'), makeEntry('b', 'ledger-1')])

    const action = {
      type: removeLedgerEntries.fulfilled.type,
      payload: [],
    }

    const next = ledgerReducer(state, action)

    expect(next.entries.map(e => e.id)).toEqual(['a', 'b'])
    expect(next.isLocalLedgers).toBe(true)
  })

  it('records an error message when the bulk remove is rejected', () => {
    const state = makeState([makeEntry('a', 'ledger-1')])

    const action = {
      type: removeLedgerEntries.rejected.type,
      payload: 'Failed to remove entries',
    }

    const next = ledgerReducer(state, action)

    expect(next.entries.map(e => e.id)).toEqual(['a'])
    expect(next.error).toBe('Failed to remove entries')
  })
})
