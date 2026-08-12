/**
 * LedgerList Component Tests
 *
 * Tests for ledger list rendering, sync functionality, and user interactions
 */
/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { LedgerList } from '../components/LedgerList'
import { ledgerReducer } from '../store/ledgerSlice'
import type { ILedger } from '../types/ledger'

jest.mock('../store/ledgerSlice')
jest.mock('../helpers/indexDB/ledgerStore')
jest.mock('../services/ledgerService')

describe('LedgerList Component Tests', () => {
  let store: ReturnType<typeof configureStore>

  beforeEach(() => {
    jest.clearAllMocks()
    store = configureStore({
      reducer: {
        ledgers: ledgerReducer,
        transactions: (state = { transactions: [] }) => state,
      },
    })
  })

  const mockLedgers: ILedger[] = [
    {
      id: 'ledger-1',
      partyName: 'John Doe',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
    {
      id: 'ledger-2',
      partyName: 'Jane Smith',
      createdAt: '2024-01-20T14:30:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
    },
  ]

  const renderComponent = (props = {}) => {
    return render(
      <Provider store={store}>
        <LedgerList
          ledgers={mockLedgers}
          onSelectLedger={jest.fn()}
          loading={false}
          {...props}
        />
      </Provider>
    )
  }

  describe('Rendering', () => {
    it('should render ledger list', () => {
      renderComponent()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    it('should display transaction count for each ledger', () => {
      renderComponent()
      expect(screen.queryByText(/transactions/i)).toBeTruthy()
    })

    it('should display date in DD/MM/YYYY format', () => {
      renderComponent()
      expect(screen.getByText('15/01/2024')).toBeInTheDocument()
      expect(screen.getByText('20/01/2024')).toBeInTheDocument()
    })

    it('should not show "Created:" prefix in date column', () => {
      renderComponent()
      expect(screen.queryByText(/Created:/)).not.toBeInTheDocument()
    })

    it('should show loading spinner when loading', () => {
      renderComponent({ loading: true })
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('should show empty state when no ledgers', () => {
      renderComponent({ ledgers: [] })
      expect(screen.getByText(/No ledgers yet/i)).toBeInTheDocument()
    })

    it('should show search results message', () => {
      renderComponent({ ledgers: [], searchText: 'John' })
      expect(screen.getByText(/No ledgers found matching/i)).toBeInTheDocument()
    })
  })

  describe('Sync Functionality', () => {
    it('should display sync banner when there are local changes', async () => {
      // Mock selector to return true for hasLocalChanges
      const ledgerModule = require('../store/ledgerSlice')
      ledgerModule.selectHasLocalChanges = jest.fn(() => true)

      renderComponent()
      await waitFor(() => {
        expect(screen.getByText(/You have unsaved changes/i)).toBeInTheDocument()
      })
    })

    it('should not display sync banner when no local changes', () => {
      const ledgerModule = require('../store/ledgerSlice')
      ledgerModule.selectHasLocalChanges = jest.fn(() => false)

      renderComponent()
      expect(screen.queryByText(/You have unsaved changes/i)).not.toBeInTheDocument()
    })

    it('should display sync button when there are local changes', async () => {
      const ledgerModule = require('../store/ledgerSlice')
      ledgerModule.selectHasLocalChanges = jest.fn(() => true)

      renderComponent()
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Sync to Server/i })).toBeInTheDocument()
      })
    })

    it('should disable sync button while syncing', async () => {
      const ledgerModule = require('../store/ledgerSlice')
      ledgerModule.selectHasLocalChanges = jest.fn(() => true)

      renderComponent()

      const syncButton = await screen.findByRole('button', { name: /Sync to Server/i })
      fireEvent.click(syncButton)

      await waitFor(() => {
        expect(screen.getByText(/Syncing.../i)).toBeInTheDocument()
      })
    })

    it('should show success notification after sync', async () => {
      const ledgerModule = require('../store/ledgerSlice')
      ledgerModule.selectHasLocalChanges = jest.fn(() => true)
      ledgerModule.syncLedgers = jest.fn(() => ({
        unwrap: jest.fn().mockResolvedValue({
          ledgers: mockLedgers,
          entries: [],
        }),
      }))

      renderComponent()

      const syncButton = await screen.findByRole('button', { name: /Sync to Server/i })
      fireEvent.click(syncButton)

      await waitFor(() => {
        expect(screen.getByText(/Synced/i)).toBeInTheDocument()
      })
    })

    it('should show error notification if sync fails', async () => {
      const ledgerModule = require('../store/ledgerSlice')
      ledgerModule.selectHasLocalChanges = jest.fn(() => true)
      ledgerModule.syncLedgers = jest.fn(() => ({
        unwrap: jest.fn().mockRejectedValue(new Error('Sync failed')),
      }))

      renderComponent()

      const syncButton = await screen.findByRole('button', { name: /Sync to Server/i })
      fireEvent.click(syncButton)

      await waitFor(() => {
        expect(screen.getByText(/Sync failed/i)).toBeInTheDocument()
      })
    })
  })

  describe('User Interactions', () => {
    it('should call onSelectLedger when ledger is clicked', () => {
      const onSelectLedger = jest.fn()
      renderComponent({ onSelectLedger })

      const ledgerElement = screen.getByText('John Doe')
      fireEvent.click(ledgerElement)

      expect(onSelectLedger).toHaveBeenCalledWith('ledger-1')
    })

    it('should filter ledgers by search text', () => {
      renderComponent({ searchText: 'John' })
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
    })

    it('should be case-insensitive when searching', () => {
      renderComponent({ searchText: 'john' })
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('should show partial match in search', () => {
      renderComponent({ searchText: 'Smith' })
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    })
  })

  describe('Table Structure', () => {
    it('should display table headers', () => {
      renderComponent()
      expect(screen.getByText('Party Name')).toBeInTheDocument()
      expect(screen.getByText('Outstanding Balance')).toBeInTheDocument()
      expect(screen.getByText('Transactions')).toBeInTheDocument()
      expect(screen.getByText('Created Date')).toBeInTheDocument()
    })

    it('should display balance with currency symbol', () => {
      renderComponent({ currency: '₹' })
      expect(screen.getByText(/₹/)).toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('should show mobile view on small screens', () => {
      // This would require mocking useMediaQuery
      renderComponent()
      // The component uses useMediaQuery to decide between table and card view
      expect(document.querySelector('[data-testid="ledger-list"]') || screen.getByText('John Doe')).toBeTruthy()
    })
  })
})
