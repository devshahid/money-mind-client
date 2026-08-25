/**
 * LedgerBadge Component
 *
 * Visual indicator badge displayed on transactions that are linked to a ledger.
 * Visually distinct from TransactionGroupBadge (different icon and color).
 */

import { JSX } from 'react'
import { Chip } from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'

interface LedgerBadgeProps {
  partyName?: string
  onClick?: () => void
}

/**
 * LedgerBadge - Display badge for transactions linked to a ledger
 * Uses a person icon and secondary color to distinguish from group badges
 */
export const LedgerBadge = ({ partyName, onClick }: LedgerBadgeProps): JSX.Element | null => {
  if (!partyName) return null

  return (
    <Chip
      icon={<PersonIcon fontSize='small' />}
      label={partyName}
      size='small'
      color='secondary'
      variant='outlined'
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        maxWidth: 150,
      }}
    />
  )
}
