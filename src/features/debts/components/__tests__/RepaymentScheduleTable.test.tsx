import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RepaymentScheduleTable } from '../RepaymentScheduleTable'
import type { IRepaymentScheduleItem } from '../../types/debt'

// Mock useDispatch
vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
}))

const mockScheduleItems: IRepaymentScheduleItem[] = [
  {
    month: 1,
    dueDate: new Date('2024-02-01'),
    expectedAmount: 10000,
    principalComponent: 9000,
    interestComponent: 1000,
    expectedBalance: 91000,
    status: 'PAID',
    actualPaid: 10000,
    variance: 0,
  },
  {
    month: 2,
    dueDate: new Date('2024-03-01'),
    expectedAmount: 10000,
    principalComponent: 9100,
    interestComponent: 900,
    expectedBalance: 81900,
    status: 'UPCOMING',
    variance: 0,
  },
]

describe('RepaymentScheduleTable', () => {
  it('should render loading state', () => {
    render(
      <RepaymentScheduleTable
        schedule={null}
        debtId='123'
        loading={true}
      />
    )

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should render table with schedule items', () => {
    render(
      <RepaymentScheduleTable
        schedule={mockScheduleItems}
        debtId='123'
        loading={false}
      />
    )

    // Should show the table
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('should show empty state when no schedule and not loading', () => {
    render(
      <RepaymentScheduleTable
        schedule={null}
        debtId='123'
        loading={false}
      />
    )

    expect(screen.getByText(/Generate Schedule/i)).toBeInTheDocument()
  })
})
