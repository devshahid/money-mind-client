/**
 * LedgerDetails Component Tests
 *
 * Tests for ledger detail view, delete functionality, sync button, and entry management
 */
/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { BrowserRouter } from 'react-router-dom'
import { LedgerDetails } from '../components/LedgerDetails'
import { ledgerReducer } from '../store/ledgerSlice'
import type { ILedger, ILedgerEntry } from '../types/ledger'

jest.mock('../store/ledgerSlice')
jest.mock('../helpers/indexDB/ledgerStore')
jest.mock('../services/ledgerService')
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useParams: jest.fn(() => ({ id: 'ledger-1' })),
}))

describe('LedgerDetails Component Tests', () => {
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
      isSettlement: false,
      createdAt: '2024-01-16T10:00:00Z',
    },
    {
      id: 'entry-2',
      ledgerId: 'ledger-1',
      transactionId: 'tx-2',
      direction: 'they_paid',
      amount: 50,
      isSettlement: false,
      createdAt: '2024-01-17T10:00:00Z',
    },
  ]

  const renderComponent = (props = {}) => {
    return render(
      <BrowserRouter>
        <Provider store={store}>
          <LedgerDetails
            ledger={mockLedger}
            entries={mockEntries}
            onAddTransaction={jest.fn()}
            onRecordSettlement={jest.fn()}
            {...props}
          />
        </Provider>
      </BrowserRouter>
    )
  }

  describe('Rendering', () => {
    it('should render ledger details', () => {
      renderComponent()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('should display entry list', () => {
      renderComponent()
      expect(screen.getByText('tx-1')).toBeInTheDocument()
      expect(screen.getByText('tx-2')).toBeInTheDocument()
    })

    it('should show outstanding balance', () => {
      renderComponent()
      expect(screen.getByText(/Outstanding Balance/i)).toBeInTheDocument()
    })

    it('should calculate balance correctly', () => {
      renderComponent()
      // i_paid: 100, they_paid: -50, so net is 50
      expect(screen.getByText('50')).toBeInTheDocument()
    })
  })

  describe('Sync Functionality', () => {
    it('should display sync button when there are local changes', async () => {
      const ledgerModule = require('../store/ledgerSlice')
      ledgerModule.selectHasLocalChanges = jest.fn(() => true)

      renderComponent()
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Sync/i })).toBeInTheDocument()
      })
    })

    it('should hide sync button when no local changes', () => {
      const ledgerModule = require('../store/ledgerSlice')
      ledgerModule.selectHasLocalChanges = jest.fn(() => false)

      renderComponent()
      expect(screen.queryByRole('button', { name: /Sync/i })).not.toBeInTheDocument()
    })

    it('should disable sync button while syncing', async () => {
      const ledgerModule = require('../store/ledgerSlice')
      ledgerModule.selectHasLocalChanges = jest.fn(() => true)

      renderComponent()

      const syncButton = await screen.findByRole('button', { name: /Sync/i })
      fireEvent.click(syncButton)

      await waitFor(() => {
        expect(syncButton).toBeDisabled()
      })
    })

    it('should show loading spinner during sync', async () => {
      const ledgerModule = require('../store/ledgerSlice')
      ledgerModule.selectHasLocalChanges = jest.fn(() => true)

      renderComponent()

      const syncButton = await screen.findByRole('button', { name: /Sync/i })
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
          ledgers: [mockLedger],
          entries: mockEntries,
        }),
      }))

      renderComponent()

      const syncButton = await screen.findByRole('button', { name: /Sync/i })
      fireEvent.click(syncButton)

      await waitFor(() => {
        expect(screen.getByText(/Changes synced/i)).toBeInTheDocument()
      })
    })
  })

  describe('Delete Functionality', () => {
    it('should display delete button', () => {
      renderComponent()
      expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument()
    })

    it('should disable delete button when ledger has entries', () => {
      renderComponent()
      const deleteButton = screen.getByRole('button', { name: /Delete/i })
      expect(deleteButton).toBeDisabled()
    })

    it('should show tooltip when delete is disabled', async () => {
      renderComponent()
      const deleteButton = screen.getByRole('button', { name: /Delete/i })

      fireEvent.mouseOver(deleteButton)

      await waitFor(() => {
        expect(screen.getByText(/Cannot delete ledger with active entries/i)).toBeInTheDocument()
      })
    })

    it('should enable delete button when ledger is empty', () => {
      renderComponent({ entries: [] })
      const deleteButton = screen.getByRole('button', { name: /Delete/i })
      expect(deleteButton).not.toBeDisabled()
    })

    it('should show delete confirmation dialog', async () => {
      const user = userEvent.setup()
      renderComponent({ entries: [] })

      const deleteButton = screen.getByRole('button', { name: /Delete/i })
      await user.click(deleteButton)

      expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument()
    })

    it('should show entry count in delete confirmation dialog', async () => {
      const user = userEvent.setup()
      renderComponent({ entries: [] })

      const deleteButton = screen.getByRole('button', { name: /Delete/i })
      await user.click(deleteButton)

      expect(screen.getByText(/0 transactions linked/i)).toBeInTheDocument()
    })

    it('should cancel delete and close dialog', async () => {
      const user = userEvent.setup()
      renderComponent({ entries: [] })

      const deleteButton = screen.getByRole('button', { name: /Delete/i })
      await user.click(deleteButton)

      const cancelButton = screen.getByRole('button', { name: /Cancel/i })
      await user.click(cancelButton)

      expect(screen.queryByText(/Are you sure you want to delete/i)).not.toBeInTheDocument()
    })

    it('should confirm delete and call thunk', async () => {
      const user = userEvent.setup()
      const ledgerModule = require('../store/ledgerSlice')
      ledgerModule.deleteLedger = jest.fn(() => ({
        unwrap: jest.fn().mockResolvedValue(undefined),
      }))
      const mockNavigate = jest.fn()
      require('react-router-dom').useNavigate = jest.fn(() => mockNavigate)

      renderComponent({ entries: [] })

      const deleteButton = screen.getByRole('button', { name: /Delete/i })
      await user.click(deleteButton)

      const confirmButton = screen.getByRole('button', { name: /Delete/i, selector: '[type="button"]' })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(ledgerModule.deleteLedger).toHaveBeenCalled()
      })
    })

    it('should navigate back after successful delete', async () => {
      const user = userEvent.setup()
      const ledgerModule = require('../store/ledgerSlice')
      ledgerModule.deleteLedger = jest.fn(() => ({
        unwrap: jest.fn().mockResolvedValue(undefined),
      }))
      const mockNavigate = jest.fn()
      require('react-router-dom').useNavigate = jest.fn(() => mockNavigate)

      renderComponent({ entries: [] })

      const deleteButton = screen.getByRole('button', { name: /Delete/i })
      await user.click(deleteButton)

      const confirmButton = screen.getAllByRole('button', { name: /Delete/i })[1]
      await user.click(confirmButton)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/ledgers')
      })
    })

    it('should show error notification if delete fails', async () => {
      const user = userEvent.setup()
      const ledgerModule = require('../store/ledgerSlice')
      ledgerModule.deleteLedger = jest.fn(() => ({
        unwrap: jest.fn().mockRejectedValue(new Error('Delete failed')),
      }))

      renderComponent({ entries: [] })

      const deleteButton = screen.getByRole('button', { name: /Delete/i })
      await user.click(deleteButton)

      const confirmButton = screen.getAllByRole('button', { name: /Delete/i })[1]
      await user.click(confirmButton)

      await waitFor(() => {
        expect(screen.getByText(/Delete failed/i)).toBeInTheDocument()
      })
    })
  })

  describe('Action Buttons', () => {
    it('should display Add Transaction button', () => {
      renderComponent()
      expect(screen.getByRole('button', { name: /Add Transaction/i })).toBeInTheDocument()
    })

    it('should display Record Settlement button', () => {
      renderComponent()
      expect(screen.getByRole('button', { name: /Record Settlement/i })).toBeInTheDocument()
    })

    it('should call onAddTransaction when clicked', async () => {
      const user = userEvent.setup()
      const onAddTransaction = jest.fn()
      renderComponent({ onAddTransaction })

      const addButton = screen.getByRole('button', { name: /Add Transaction/i })
      await user.click(addButton)

      expect(onAddTransaction).toHaveBeenCalled()
    })

    it('should call onRecordSettlement when clicked', async () => {
      const user = userEvent.setup()
      const onRecordSettlement = jest.fn()
      renderComponent({ onRecordSettlement })

      const settlementButton = screen.getByRole('button', { name: /Record Settlement/i })
      await user.click(settlementButton)

      expect(onRecordSettlement).toHaveBeenCalled()
    })
  })

  describe('Entry Management', () => {
    it('should display entry details', () => {
      renderComponent()
      expect(screen.getByText('100')).toBeInTheDocument()
      expect(screen.getByText('50')).toBeInTheDocument()
    })

    it('should show direction labels', () => {
      renderComponent()
      expect(screen.getByText(/I paid/i) || screen.getByText(/i_paid/i)).toBeInTheDocument()
      expect(screen.getByText(/They paid/i) || screen.getByText(/they_paid/i)).toBeInTheDocument()
    })

    it('should allow removing entries', async () => {
      const user = userEvent.setup()
      const ledgerModule = require('../store/ledgerSlice')
      ledgerModule.removeLedgerEntry = jest.fn(() => ({
        unwrap: jest.fn().mockResolvedValue(undefined),
      }))

      renderComponent()

      const removeButtons = screen.getAllByRole('button', { name: /Remove|Delete Entry/i })
      await user.click(removeButtons[0])

      expect(ledgerModule.removeLedgerEntry).toHaveBeenCalled()
    })
  })

  describe('Loading States', () => {
    it('should show loading spinner when loading', () => {
      renderComponent({ loading: true })
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('should hide content while loading', () => {
      renderComponent({ loading: true })
      expect(screen.queryByText('tx-1')).not.toBeInTheDocument()
    })
  })
})
