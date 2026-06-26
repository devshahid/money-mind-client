import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Alert,
  Typography,
  Paper,
} from '@mui/material'
import { TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

import { spacing, colors } from '../../../shared/theme'
import type { IPayoffProjection } from '../types/debt'

interface PayoffProjectionDialogProps {
  open: boolean
  debtName: string
  projection: IPayoffProjection | null
  loading: boolean
  error: string | null
  onClose: () => void
}

export const PayoffProjectionDialog = ({
  open,
  debtName,
  projection,
  loading,
  error,
  onClose,
}: PayoffProjectionDialogProps) => {
  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='lg'
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
        <TrendingUp
          size={24}
          color={colors.primary.blue}
        />
        Payoff Projection - {debtName}
      </DialogTitle>
      <DialogContent>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: spacing[4] }}>
            <CircularProgress />
          </Box>
        )}

        {error && <Alert severity='error'>{error}</Alert>}

        {!loading && !error && projection && (
          <>
            <Box
              sx={{
                display: 'flex',
                gap: spacing[2],
                mb: spacing[3],
                flexWrap: 'wrap',
              }}
            >
              <Paper
                sx={{
                  p: spacing[2],
                  flex: '1 1 200px',
                  backgroundColor: colors.background.lavender,
                }}
              >
                <Typography
                  variant='body2'
                  color='text.secondary'
                >
                  Payoff Date
                </Typography>
                <Typography
                  variant='h6'
                  sx={{ fontWeight: 700, color: colors.semantic.success }}
                >
                  {formatDate(projection.payoffDate)}
                </Typography>
              </Paper>
              <Paper
                sx={{
                  p: spacing[2],
                  flex: '1 1 200px',
                  backgroundColor: colors.background.lavender,
                }}
              >
                <Typography
                  variant='body2'
                  color='text.secondary'
                >
                  Total Interest
                </Typography>
                <Typography
                  variant='h6'
                  sx={{ fontWeight: 700, color: colors.semantic.error }}
                >
                  {formatCurrency(projection.totalInterest)}
                </Typography>
              </Paper>
              <Paper
                sx={{
                  p: spacing[2],
                  flex: '1 1 200px',
                  backgroundColor: colors.background.lavender,
                }}
              >
                <Typography
                  variant='body2'
                  color='text.secondary'
                >
                  Total Payments
                </Typography>
                <Typography
                  variant='h6'
                  sx={{ fontWeight: 700, color: colors.primary.blue }}
                >
                  {formatCurrency(projection.totalPayments)}
                </Typography>
              </Paper>
            </Box>

            <Box sx={{ width: '100%', height: 400 }}>
              <ResponsiveContainer
                width='100%'
                height='100%'
              >
                <LineChart data={projection.monthlyBreakdown}>
                  <CartesianGrid
                    strokeDasharray='3 3'
                    stroke={colors.grayscale.lightGray}
                  />
                  <XAxis
                    dataKey='month'
                    label={{ value: 'Month', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    tickFormatter={val => `₹${(val / 1000).toFixed(0)}k`}
                    label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={label => `Month ${label}`}
                  />
                  <Legend />
                  <Line
                    type='monotone'
                    dataKey='remainingBalance'
                    stroke={colors.semantic.error}
                    strokeWidth={2}
                    name='Remaining Balance'
                    dot={false}
                  />
                  <Line
                    type='monotone'
                    dataKey='principal'
                    stroke={colors.semantic.success}
                    strokeWidth={2}
                    name='Principal Paid'
                    dot={false}
                  />
                  <Line
                    type='monotone'
                    dataKey='interest'
                    stroke={colors.semantic.warning}
                    strokeWidth={2}
                    name='Interest Paid'
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>

            <Alert
              severity='info'
              sx={{ mt: spacing[2] }}
            >
              This projection assumes consistent monthly payments of the expected EMI amount. Actual payoff may vary
              based on payment patterns.
            </Alert>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
