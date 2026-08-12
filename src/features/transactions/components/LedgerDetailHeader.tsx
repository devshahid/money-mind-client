/**
 * LedgerDetailHeader Component
 *
 * Displays the party name and outstanding balance with direction indicator.
 * Balance color-coded: green (they owe you), red (you owe them), gray (settled)
 */

import { JSX } from 'react'
import { Box, Typography } from '@mui/material'

import { getBalanceDirection } from '../utils/ledgerBalance'
import type { BalanceDirection } from '../types/ledger'
import { spacing, colors } from '@/shared/theme'

interface LedgerDetailHeaderProps {
  partyName: string
  balance: number
  currency?: string
}

/**
 * Get balance direction label and color
 */
interface BalanceDisplay {
  text: string
  color: string
  textColor: string
}

const getBalanceDisplay = (balance: number, partyName: string): BalanceDisplay => {
  const direction = getBalanceDirection(balance)
  
  if (direction === 'they_owe') {
    return {
      text: `${partyName} owes you`,
      color: colors.semantic.success,
      textColor: 'white',
    }
  }
  
  if (direction === 'you_owe') {
    return {
      text: `You owe ${partyName}`,
      color: colors.semantic.error,
      textColor: 'white',
    }
  }
  
  return {
    text: 'Settled',
    color: colors.grayscale[300],
    textColor: colors.grayscale[700],
  }
}

/**
 * LedgerDetailHeader - Display ledger title and balance
 */
export const LedgerDetailHeader = ({
  partyName,
  balance,
  currency = '₹',
}: LedgerDetailHeaderProps): JSX.Element => {
  const balanceDisplay = getBalanceDisplay(balance, partyName)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[2], mb: spacing[3] }}>
      <Typography variant='h5' sx={{ fontWeight: 700 }}>
        {partyName}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[2], flexWrap: 'wrap' }}>
        <Box
          sx={{
            p: spacing[2],
            borderRadius: 1,
            backgroundColor: balanceDisplay.color,
            display: 'flex',
            alignItems: 'center',
            gap: spacing[1],
          }}
        >
          <Typography
            variant='h6'
            sx={{
              fontWeight: 700,
              color: balanceDisplay.textColor,
            }}
          >
            {currency}
            {Math.abs(balance).toFixed(2)}
          </Typography>
          <Typography
            variant='body2'
            sx={{
              color: balanceDisplay.textColor,
            }}
          >
            {balanceDisplay.text}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
