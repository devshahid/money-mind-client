/**
 * LedgerEntryItem Component
 *
 * Displays a single ledger entry with:
 * - Transaction narration and date
 * - Amount with direction indicator (color-coded "I paid" vs "They paid")
 * - Settlement badge when applicable
 */

import { JSX } from 'react'
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import TaskAltIcon from '@mui/icons-material/TaskAlt'

import type { ILedgerEntry, MoneyDirection } from '../types/ledger'
import { spacing, colors } from '@/shared/theme'

interface LedgerEntryItemProps {
  entry: ILedgerEntry
  transactionNarration?: string
  onTransactionClick?: () => void
  onDeleteEntry?: () => void
  currency?: string
}

/**
 * Get money direction display properties
 */
interface DirectionDisplay {
  label: string
  color: string
  textColor: string
}

const getDirectionDisplay = (direction: MoneyDirection): DirectionDisplay => {
  const displays: Record<MoneyDirection, DirectionDisplay> = {
    'i_paid': {
      label: 'I paid',
      color: colors.semantic.success,
      textColor: 'white',
    },
    'they_paid': {
      label: 'They paid',
      color: colors.semantic.info,
      textColor: 'white',
    },
  }
  
  return displays[direction]
}

/**
 * LedgerEntryItem - Display single ledger entry
 */
export const LedgerEntryItem = ({
  entry,
  transactionNarration = 'Unnamed transaction',
  onTransactionClick,
  onDeleteEntry,
  currency = '₹',
}: LedgerEntryItemProps): JSX.Element => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const directionDisplay = getDirectionDisplay(entry.direction)
  const entryDate = new Date(entry.createdAt).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const amountColor = entry.direction === 'they_paid' ? '#2e7d32' : '#d32f2f'

  if (isMobile) {
    // Mobile: Card view
    return (
      <Card
        onClick={onTransactionClick}
        sx={{
          cursor: onTransactionClick ? 'pointer' : 'default',
          '&:hover': onTransactionClick ? { boxShadow: 2 } : {},
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing[2] }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                {transactionNarration}
              </Typography>
              <Typography variant='caption' color='text.secondary' sx={{ mt: spacing[0.5], display: 'block' }}>
                {entryDate}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: spacing[1] }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography
                  variant='subtitle2'
                  sx={{ fontWeight: 600, color: amountColor, mb: spacing[1] }}
                >
                  {currency}
                  {entry.amount.toFixed(2)}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
                  <Chip
                    label={directionDisplay.label}
                    size='small'
                    sx={{
                      backgroundColor: directionDisplay.color,
                      color: directionDisplay.textColor,
                    }}
                  />
                </Box>
              </Box>

              {onDeleteEntry && (
                <Tooltip title='Remove from ledger'>
                  <IconButton
                    size='small'
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteEntry()
                    }}
                    color='error'
                    sx={{ mt: '-8px' }}
                  >
                    <DeleteIcon fontSize='small' />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    )
  }

  // Desktop: Compact row view
  return (
    <Box
      onClick={onTransactionClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing[2],
        p: spacing[2],
        borderBottom: '1px solid',
        borderColor: 'divider',
        cursor: onTransactionClick ? 'pointer' : 'default',
        '&:hover': onTransactionClick ? { backgroundColor: 'action.hover' } : {},
        transition: 'background-color 0.2s',

        '&:last-child': {
          borderBottom: 'none',
        },
      }}
    >
      {/* Narration & Date */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant='body2' sx={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {transactionNarration}
        </Typography>
        <Typography variant='caption' color='text.secondary'>
          {entryDate}
        </Typography>
      </Box>

      {/* Amount */}
      <Typography
        variant='body2'
        sx={{ fontWeight: 600, color: directionDisplay.color, minWidth: 80, textAlign: 'right' }}
      >
        {currency}
        {entry.amount.toFixed(2)}
      </Typography>

      {/* Direction */}
      <Chip
        label={directionDisplay.label}
        size='small'
        sx={{
          backgroundColor: directionDisplay.color,
          color: directionDisplay.textColor,
          minWidth: 80,
        }}
      />

      {/* Settlement Badge */}
      {entry.isSettlement && (
        <Chip
          icon={<TaskAltIcon />}
          label='Settlement'
          size='small'
          variant='outlined'
          color='success'
        />
      )}
    </Box>
  )
}
