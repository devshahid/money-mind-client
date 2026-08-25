/**
 * LedgerEntrySummary Component
 *
 * Displays summary statistics for a specific ledger:
 * - Total paid by user ("I paid")
 * - Total received from party ("They paid")
 * - Net outstanding balance
 */

import React, { JSX, useMemo } from 'react'
import { Box, Card, CardContent, Grid, Typography } from '@mui/material'
import PaymentIcon from '@mui/icons-material/Payment'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'

import type { ILedgerEntry } from '../types/ledger'
import { spacing, colors, fontSize } from '@/shared/theme'

interface LedgerEntrySummaryProps {
  entries: ILedgerEntry[]
  currency?: string
}

interface IconProps {
  sx?: Record<string, unknown>
}

/**
 * Summary stat card for entry summary
 */
const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
  currency = '₹',
}: {
  label: string
  value: number
  icon: React.ComponentType<IconProps>
  color: string
  currency?: string
}): JSX.Element => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
        <Icon sx={{ fontSize: fontSize.lg, color }} />
        <Box>
          <Typography
            variant='caption'
            color='text.secondary'
          >
            {label}
          </Typography>
          <Typography
            variant='h6'
            sx={{ fontWeight: 600, color }}
          >
            {currency}
            {value.toFixed(2)}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
)

/**
 * LedgerEntrySummary - Display entry summary statistics
 */
export const LedgerEntrySummary = ({ entries, currency = '₹' }: LedgerEntrySummaryProps): JSX.Element => {
  const summary = useMemo(() => {
    let totalIPaid = 0
    let totalTheyPaid = 0

    for (const entry of entries) {
      if (entry.direction === 'i_paid') {
        totalIPaid += entry.amount
      } else {
        totalTheyPaid += entry.amount
      }
    }

    const net = totalIPaid - totalTheyPaid

    return {
      totalIPaid,
      totalTheyPaid,
      net,
    }
  }, [entries])

  return (
    <Grid
      container
      spacing={spacing[2]}
      sx={{ mb: spacing[3] }}
    >
      <Grid
        item
        xs={12}
        sm={6}
        md={4}
      >
        <StatCard
          label='Total I Paid'
          value={summary.totalIPaid}
          icon={PaymentIcon}
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
        <StatCard
          label='Total They Paid'
          value={summary.totalTheyPaid}
          icon={AttachMoneyIcon}
          color={colors.semantic.info}
          currency={currency}
        />
      </Grid>
      <Grid
        item
        xs={12}
        md={4}
      >
        <Card>
          <CardContent>
            <Box>
              <Typography
                variant='caption'
                color='text.secondary'
              >
                Net Outstanding
              </Typography>
              <Typography
                variant='h6'
                sx={{
                  fontWeight: 600,
                  color:
                    summary.net > 0
                      ? colors.semantic.success
                      : summary.net < 0
                        ? colors.semantic.error
                        : colors.grayscale.medium,
                }}
              >
                {currency}
                {Math.abs(summary.net).toFixed(2)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
