import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LinkedTransactionsPanel } from '../LinkedTransactionsPanel'
import type { IDebtTransactionLink } from '../../types/debt'

// Mock useDispatch
vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
}))

const mockLinkedTransactions: IDebtTransactionLink[] = [
  {
    _id: 'link1',
    transactionId: {
      _id: 'trans1',
      date: new Date('2024-01-05'),
      narration: 'EMI Payment - Jan 2024',
      amount: 10000,
      type: 'DEBIT',
      category: 'EMI',
    },
    linkType: 'AUTO',
    confidence: 0.95,
    linkedDate: new Date('2024-01-06'),
    createdBy: 'SYSTEM',
  },
  {
    _id: 'link2',
    transactionId: {
      _id: 'trans2',
      date: new Date('2024-02-05'),
      narration: 'Loan Payment February',
      amount: 10000,
      type: 'DEBIT',
      category: 'EMI',
    },
    linkType: 'MANUAL',
    linkedDate: new Date('2024-02-06'),
    notes: 'Manually linked February EMI',
    createdBy: 'USER',
  },
]

describe('LinkedTransactionsPanel', () => {
  it('should render loading state', () => {
    render(
      <LinkedTransactionsPanel
        transactions={null}
        debtId='123'
        loading={true}
      />
    )

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should render panel with linked transactions', () => {
    render(
      <LinkedTransactionsPanel
        transactions={mockLinkedTransactions}
        debtId='123'
        loading={false}
      />
    )

    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('should show empty state when no transactions linked', () => {
    render(
      <LinkedTransactionsPanel
        transactions={[]}
        debtId='123'
        loading={false}
      />
    )

    expect(screen.getByText(/No linked transactions/i)).toBeInTheDocument()
  })
})
