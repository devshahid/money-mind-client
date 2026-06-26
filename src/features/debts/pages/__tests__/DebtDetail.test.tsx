/// <reference types="../../../../vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { DebtDetailPage } from '../DebtDetail'

// Mock react-router-dom hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ debtId: '123' }),
    useOutletContext: () => ({
      setHeader: vi.fn(),
    }),
  }
})

// Mock useSelector and useDispatch
vi.mock('react-redux', () => ({
  useSelector: vi.fn(() => ({
    currentDebt: null,
    loading: true,
  })),
  useDispatch: () => vi.fn(),
}))

describe('DebtDetailPage', () => {
  it('should render loading state', () => {
    render(
      <MemoryRouter initialEntries={['/debts/123']}>
        <Routes>
          <Route
            path='/debts/:debtId'
            element={<DebtDetailPage />}
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })
})
