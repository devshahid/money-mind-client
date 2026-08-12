/**
 * LedgerSummaryTotals Component
 *
 * Displays aggregate statistics across all ledgers:
 * - Total receivable (sum of positive balances)
 * - Total payable (sum of absolute values of negative balances)
 * - Net balance
 */

import React, { JSX, useMemo } from 'react'
import { Box, Card, CardContent, Grid, Typography } from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'

import { calculateSummaryTotals } from '../utils/ledgerBalance'
import { spacing, colors, fontSize } from '@/shared/theme'

interface LedgerSummaryTotalsProps {
  ledgers: Array<{ balance: number }>
  currency?: string
}

/**
 * Summary stat card component
 */
interface StatCardProps {
  label: string
  value: number
  icon: React.ComponentType<{ sx?: Record<string, unknown> }>
  color: string
  currency?: string
}

const SummaryStatCard = ({
  label,
  value,
  icon: Icon,
  color,
  currency = '₹',
}: StatCardProps): JSX.Element => (
  <Card sx={{ flex: 1, minWidth: { xs: '100%', sm: 150 } }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
      <Icon sx={{ fontSize: fontSize.xl, color }} />
      <Box>
        <Typography variant='caption' color='text.secondary'>
          {label}
        </Typography>
        <Typography
          variant='h6'
          sx={{
            fontWeight: 600,
            color,
          }}
        >
          {currency}
          {Math.abs(value).toFixed(2)}
        </Typography>
      </Box>
    </CardContent>
  </Card>
)

/**
 * LedgerSummaryTotals - Display aggregate ledger statistics
 */
export const LedgerSummaryTotals = ({
  ledgers,
  currency = '₹',
}: LedgerSummaryTotalsProps): JSX.Element => {
  const totals = useMemo(() => calculateSummaryTotals(ledgers), [ledgers])

  if (ledgers.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: spacing[3] }}>
        <Typography variant='body2' color='text.secondary'>
          No ledgers to display
        </Typography>
      </Box>
    )
  }

  return (
    <Grid
      container
      spacing={spacing[2]}
      sx={{
        width: '100%',
      }}
    >
      <Grid
        item
        xs={12}
        sm={6}
        md={4}
      >
        <SummaryStatCard
          label='Total Receivable'
          value={totals.totalReceivable}
          icon={TrendingUpIcon}
          color={colors.semantic.success}
          currency={currency}
        />
      </Grid>
      <Grid
        item
        xs={12}
        sm={6}
        md={4}
      >
        <SummaryStatCard
          label='Total Payable'
          value={totals.totalPayable}
          icon={TrendingDownIcon}
          color={colors.semantic.error}
          currency={currency}
        />
      </Grid>
      <Grid
        item
        xs={12}
        md={4}
      >
        <Card>
          <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant='caption' color='text.secondary'>
                Net Balance
              </Typography>
              <Typography
                variant='h6'
                sx={{
                  fontWeight: 600,
                  color:
                    totals.netBalance > 0
                      ? colors.semantic.success
                      : totals.netBalance < 0
                        ? colors.semantic.error
                        : colors.grayscale[500],
                }}
              >
                {currency}
                {Math.abs(totals.netBalance).toFixed(2)}
              </Typography>
            </Box>
            <Typography variant='caption' color='text.secondary'>
              {totals.netBalance > 0
                ? 'They owe you'
                : totals.netBalance < 0
                  ? 'You owe them'
                  : 'Settled'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
