import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ScheduleImporter } from '../ScheduleImporter'

// Mock useDispatch
vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
}))

// Mock XLSX library
vi.mock('xlsx', () => ({
  default: {
    read: vi.fn(),
    utils: {
      sheet_to_json: vi.fn(() => []),
    },
  },
}))

describe('ScheduleImporter', () => {
  it('should render dialog when open', () => {
    render(
      <ScheduleImporter
        open={true}
        onClose={vi.fn()}
        debtId='123'
      />
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    const { container } = render(
      <ScheduleImporter
        open={false}
        onClose={vi.fn()}
        debtId='123'
      />
    )

    // Dialog should not be visible
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument()
  })

  it('should call onClose when cancel is clicked', () => {
    const onClose = vi.fn()
    render(
      <ScheduleImporter
        open={true}
        onClose={onClose}
        debtId='123'
      />
    )

    const cancelButton = screen.getByText('Cancel')
    cancelButton.click()

    expect(onClose).toHaveBeenCalled()
  })
})
