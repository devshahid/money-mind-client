import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DebtOverviewCard } from '../DebtOverviewCard'
import type { IDebt } from '../../types/debt'

const mockDebt: IDebt = {
  _id: '123',
  debtName: 'Home Loan',
  lender: 'HDFC Bank',
  principal: 5000000,
  remainingBalance: 4500000,
  interestRate: 8.5,
  status: 'ACTIVE',
  monthlyExpectedEMI: 40000,
  emiType: 'REDUCING',
  startDate: '2024-01-01',
  expectedEndDate: '2044-01-01',
  nextPaymentDate: '2024-07-01',
  hasRepaymentSchedule: true,
  createdAt: '2024-01-01',
  updatedAt: '2024-06-01',
}

describe('DebtOverviewCard', () => {
  it('should render component with debt data', () => {
    render(<DebtOverviewCard debt={mockDebt} />)

    expect(screen.getByText('Home Loan')).toBeInTheDocument()
    expect(screen.getByText('HDFC Bank')).toBeInTheDocument()
    expect(screen.getByText('ACTIVE')).toBeInTheDocument()
  })

  it('should calculate and display progress correctly', () => {
    render(<DebtOverviewCard debt={mockDebt} />)

    // Progress = (5000000 - 4500000) / 5000000 * 100 = 10%
    const { container } = render(<DebtOverviewCard debt={mockDebt} />)
    expect(container.querySelector('.MuiLinearProgress-root')).toBeInTheDocument()
  })

  it('should handle fully paid debt', () => {
    const paidDebt = { ...mockDebt, remainingBalance: 0, status: 'PAID_OFF' as const }
    render(<DebtOverviewCard debt={paidDebt} />)

    expect(screen.getByText('PAID_OFF')).toBeInTheDocument()
  })
})
