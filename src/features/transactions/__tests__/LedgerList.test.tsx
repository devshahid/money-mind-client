/**
 * LedgerList Component Tests
 *
 * Tests ledger list rendering, search filtering, sync UI, and selection
 * against the REAL component + a real Redux store (no module mocking).
 *
 * @vitest-environment jsdom
 */
/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { vi } from 'vitest'

import { LedgerList } from '../components/LedgerList'
import { ledgerReducer } from '../store/ledgerSlice'
import * as ledgerService from '../services/ledgerService'
import type { ILedger, ILedgerEntry, ILedgerState } from '../types/ledger'

// The syncLedgers thunk awaits several IndexedDB helper methods before/after
// the network call. jsdom has no IndexedDB, so we mock the helper at the
// module boundary the thunk actually awaits, letting the thunk resolve and
// exercise the real success/error snackbar paths driven by the service mock.
vi.mock('../helpers/indexDB/ledgerStore', () => ({
  ledgerStore: {
    getAllLedgers: vi.fn().mockResolvedValue([]),
    getAllEntries: vi.fn().mockResolvedValue([]),
    getDeletedIds: vi.fn().mockResolvedValue([]),
    getDeletedEntryIds: vi.fn().mockResolvedValue([]),
    clearDeletedIds: vi.fn().mockResolvedValue(undefined),
    clearDeletedEntryIds: vi.fn().mockResolvedValue(undefined),
    deleteLedger: vi.fn().mockResolvedValue(undefined),
    saveLedger: vi.fn().mockResolvedValue(undefined),
    saveLedgerEntry: vi.fn().mockResolvedValue(undefined),
    getEntriesByLedgerId: vi.fn().mockResolvedValue([]),
    getSyncOperations: vi.fn().mockResolvedValue([]),
    removeSyncOperations: vi.fn().mockResolvedValue(undefined),
    replaceEntries: vi.fn().mockResolvedValue(undefined),
  },
}))

const mockLedgers: ILedger[] = [
  { id: 'ledger-1', partyName: 'John Doe', createdAt: '2024-01-15T10:00:00Z', updatedAt: '2024-01-15T10:00:00Z' },
  { id: 'ledger-2', partyName: 'Jane Smith', createdAt: '2024-01-20T14:30:00Z', updatedAt: '2024-01-20T14:30:00Z' },
]

const initialLedgerState: ILedgerState = {
  ledgers: [],
  entries: [],
  loading: false,
  error: null,
  isLocalLedgers: false,
  ledgerSyncStatus: 'idle',
  selectedLedgerId: null,
}

type Overrides = { entries?: ILedgerEntry[]; isLocalLedgers?: boolean }

const makeStore = ({ entries = [], isLocalLedgers = false }: Overrides = {}) =>
  configureStore({
    reducer: {
      ledgers: ledgerReducer,
      transactions: (state = { transactions: [] }) => state,
    },
    preloadedState: { ledgers: { ...initialLedgerState, entries, isLocalLedgers } },
  })

type RenderProps = {
  ledgers?: ILedger[]
  searchText?: string
  loading?: boolean
  onSelectLedger?: (id: string) => void
  currency?: string
}

const renderComponent = (props: RenderProps = {}, storeOverrides: Overrides = {}) => {
  const store = makeStore(storeOverrides)
  const onSelectLedger = props.onSelectLedger ?? vi.fn()
  const utils = render(
    <Provider store={store}>
      <LedgerList
        ledgers={props.ledgers ?? mockLedgers}
        onSelectLedger={onSelectLedger}
        loading={props.loading ?? false}
        searchText={props.searchText}
        currency={props.currency}
      />
    </Provider>
  )
  return { ...utils, store, onSelectLedger }
}

const expectedDate = (iso: string): string => {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${d.getFullYear()}`
}

describe('LedgerList Component', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('renders the ledger rows', () => {
      renderComponent()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    it('renders created dates in DD/MM/YYYY format', () => {
      renderComponent()
      expect(screen.getByText(expectedDate('2024-01-15T10:00:00Z'))).toBeInTheDocument()
      expect(screen.getByText(expectedDate('2024-01-20T14:30:00Z'))).toBeInTheDocument()
    })

    it('shows a loading spinner when loading', () => {
      renderComponent({ loading: true })
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('shows the empty state when there are no ledgers', () => {
      renderComponent({ ledgers: [] })
      expect(screen.getByText(/No ledgers yet/i)).toBeInTheDocument()
    })

    it('shows a search-empty message when a search matches nothing', () => {
      renderComponent({ ledgers: [], searchText: 'John' })
      expect(screen.getByText(/No ledgers found matching/i)).toBeInTheDocument()
    })

    it('renders the table headers', () => {
      renderComponent()
      expect(screen.getByText('Party Name')).toBeInTheDocument()
      expect(screen.getByText('Outstanding Balance')).toBeInTheDocument()
      expect(screen.getByText('Transactions')).toBeInTheDocument()
      expect(screen.getByText('Created Date')).toBeInTheDocument()
    })
  })

  describe('Search filtering', () => {
    it('filters ledgers by search text', () => {
      renderComponent({ searchText: 'John' })
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
    })

    it('is case-insensitive', () => {
      renderComponent({ searchText: 'john' })
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('matches partial text', () => {
      renderComponent({ searchText: 'Smith' })
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    })
  })

  describe('Selection', () => {
    it('calls onSelectLedger with the ledger id when a row is clicked', () => {
      const onSelectLedger = vi.fn()
      renderComponent({ onSelectLedger })
      fireEvent.click(screen.getByText('John Doe'))
      expect(onSelectLedger).toHaveBeenCalledWith('ledger-1')
    })
  })

  describe('Sync UI', () => {
    it('hides the sync banner when there are no local changes', () => {
      renderComponent({}, { isLocalLedgers: false })
      expect(screen.queryByText(/You have unsaved changes/i)).not.toBeInTheDocument()
    })

    it('shows the sync banner and button when there are local changes', () => {
      renderComponent({}, { isLocalLedgers: true })
      expect(screen.getByText(/You have unsaved changes/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Sync to Server/i })).toBeInTheDocument()
    })

    it('shows a success notification after a successful sync', async () => {
      vi.spyOn(ledgerService, 'syncLedgers').mockResolvedValue({
        output: { ledgers: mockLedgers as never, entries: [] },
      } as never)
      renderComponent({}, { isLocalLedgers: true })
      fireEvent.click(screen.getByRole('button', { name: /Sync to Server/i }))
      expect(await screen.findByText(/Synced/i)).toBeInTheDocument()
    })

    it('shows an error notification if sync fails', async () => {
      vi.spyOn(ledgerService, 'syncLedgers').mockRejectedValue(new Error('Sync failed'))
      renderComponent({}, { isLocalLedgers: true })
      fireEvent.click(screen.getByRole('button', { name: /Sync to Server/i }))
      // The thunk rejects via rejectWithValue(string); `.unwrap()` surfaces a
      // non-Error value, so the component falls back to its default message.
      expect(await screen.findByText(/Failed to sync ledgers/i)).toBeInTheDocument()
    })
  })
})
