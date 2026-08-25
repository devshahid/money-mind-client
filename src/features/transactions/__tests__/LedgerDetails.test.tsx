/**
 * LedgerDetails Component Tests
 *
 * Tests the real LedgerDetails component against a real Redux store and the
 * real Snackbar provider (no router, no removed props).
 *
 * @vitest-environment jsdom
 */
/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

import { render, screen, fireEvent, waitForElementToBeRemoved } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { vi } from 'vitest'

import { LedgerDetails } from '../components/LedgerDetails'
import { ledgerReducer } from '../store/ledgerSlice'
import { SnackbarProvider } from '@/shared/contexts/SnackBarContext'
import type { ILedger, ILedgerEntry, ILedgerState } from '../types/ledger'
import type { ITransaction } from '../types/transaction'

// The delete/sync thunks awaited by the component touch IndexedDB helpers,
// which do not exist under jsdom. Mock the helper module boundary so the
// component mounts and its handlers can run without a real IndexedDB.
vi.mock('../helpers/indexDB/ledgerStore', () => ({
  ledgerStore: {
    getAllLedgers: vi.fn().mockResolvedValue([]),
    getAllEntries: vi.fn().mockResolvedValue([]),
    getDeletedIds: vi.fn().mockResolvedValue([]),
    getDeletedEntryIds: vi.fn().mockResolvedValue([]),
    clearDeletedIds: vi.fn().mockResolvedValue(undefined),
    clearDeletedEntryIds: vi.fn().mockResolvedValue(undefined),
    deleteLedger: vi.fn().mockResolvedValue(undefined),
    addDeletedId: vi.fn().mockResolvedValue(undefined),
    addDeletedEntryId: vi.fn().mockResolvedValue(undefined),
    deleteLedgerEntry: vi.fn().mockResolvedValue(undefined),
    saveLedger: vi.fn().mockResolvedValue(undefined),
    saveLedgerEntry: vi.fn().mockResolvedValue(undefined),
    getEntriesByLedgerId: vi.fn().mockResolvedValue([]),
  },
}))

const mockLedger: ILedger = {
  id: 'ledger-1',
  partyName: 'John Doe',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
}

const mockEntries: ILedgerEntry[] = [
  {
    id: 'entry-1',
    ledgerId: 'ledger-1',
    transactionId: 'tx-1',
    direction: 'i_paid',
    amount: 100,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'entry-2',
    ledgerId: 'ledger-1',
    transactionId: 'tx-2',
    direction: 'they_paid',
    amount: 50,
    createdAt: '2024-01-16T10:00:00Z',
  },
]

const mockTransactions: ITransaction[] = [
  {
    _id: 'tx-1',
    transactionDate: '2024-01-15T10:00:00Z',
    narration: 'Lunch payment',
    notes: '',
    category: 'Food',
    label: [],
    amount: '100',
    bankName: 'Test Bank',
    isCredit: false,
    isCash: false,
  },
  {
    _id: 'tx-2',
    transactionDate: '2024-01-16T10:00:00Z',
    narration: 'Refund received',
    notes: '',
    category: 'Other',
    label: [],
    amount: '50',
    bankName: 'Test Bank',
    isCredit: true,
    isCash: false,
  },
]

const initialLedgerState: ILedgerState = {
  ledgers: [mockLedger],
  entries: [],
  loading: false,
  error: null,
  isLocalLedgers: false,
  ledgerSyncStatus: 'idle',
  selectedLedgerId: null,
}

type Overrides = { entries?: ILedgerEntry[]; isLocalLedgers?: boolean; transactions?: ITransaction[] }

const makeStore = ({
  entries = mockEntries,
  isLocalLedgers = false,
  transactions = mockTransactions,
}: Overrides = {}) =>
  configureStore({
    reducer: {
      ledgers: ledgerReducer,
      transactions: (state = { transactions }) => state,
    },
    preloadedState: {
      ledgers: { ...initialLedgerState, entries, isLocalLedgers },
      transactions: { transactions },
    },
  })

type RenderProps = {
  onBack?: () => void
  onNavigateToTransaction?: (transactionId: string) => void
}

const renderComponent = (props: RenderProps = {}, storeOverrides: Overrides = {}) => {
  const store = makeStore(storeOverrides)
  const onBack = props.onBack ?? vi.fn()
  const utils = render(
    <Provider store={store}>
      <SnackbarProvider>
        <LedgerDetails
          ledger={mockLedger}
          onBack={onBack}
          onNavigateToTransaction={props.onNavigateToTransaction}
        />
      </SnackbarProvider>
    </Provider>
  )
  return { ...utils, store, onBack }
}

describe('LedgerDetails Component', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the party name', () => {
    renderComponent()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('renders entry narrations resolved from the linked transactions', () => {
    renderComponent()
    expect(screen.getByText('Lunch payment')).toBeInTheDocument()
    expect(screen.getByText('Refund received')).toBeInTheDocument()
  })

  it('disables the Delete Ledger button when the ledger has entries', () => {
    renderComponent({}, { entries: mockEntries })
    const deleteButton = screen.getByRole('button', { name: /Delete Ledger/i })
    expect(deleteButton).toBeDisabled()
  })

  it('enables the Delete Ledger button when the ledger has no entries', () => {
    renderComponent({}, { entries: [] })
    const deleteButton = screen.getByRole('button', { name: /Delete Ledger/i })
    expect(deleteButton).toBeEnabled()
  })

  it('opens the delete confirmation dialog and closes it on Cancel', async () => {
    renderComponent({}, { entries: [] })
    fireEvent.click(screen.getByRole('button', { name: /Delete Ledger/i }))

    const confirmText = screen.getByText(/Are you sure you want to delete this ledger\?/i)
    expect(confirmText).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }))
    // MUI Dialog closes via a transition, so wait for the confirmation text to
    // leave the DOM rather than asserting synchronously.
    await waitForElementToBeRemoved(() => screen.queryByText(/Are you sure you want to delete this ledger\?/i))
  })

  it('opens the link transaction dialog when Add Transaction is clicked', () => {
    renderComponent()
    fireEvent.click(screen.getByRole('button', { name: /Add Transaction/i }))
    expect(screen.getByText('Link Transaction to Ledger')).toBeInTheDocument()
  })

  it('shows the Sync to Server button only when there are local changes', () => {
    const { unmount } = renderComponent({}, { isLocalLedgers: false })
    expect(screen.queryByRole('button', { name: /Sync to Server/i })).not.toBeInTheDocument()
    unmount()

    renderComponent({}, { isLocalLedgers: true })
    expect(screen.getByRole('button', { name: /Sync to Server/i })).toBeInTheDocument()
  })
})
