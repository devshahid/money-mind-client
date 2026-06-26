import React from 'react'
import { Box, Card, CardContent, Chip, Grid, LinearProgress, Typography } from '@mui/material'
import { Calendar, TrendingDown, Percent, AlertCircle } from 'lucide-react'
import dayjs from 'dayjs'

import type { IDebt } from '../types/debt'
import { formatCurrency } from '../utils/formatCurrency'

interface DebtOverviewCardProps {
  debt: IDebt
}

const DebtOverviewCard: React.FC<DebtOverviewCardProps> = ({ debt }) => {
  const remainingBalance = debt.remainingBalance
  const totalPaid = debt.principal - remainingBalance
  const progressPercentage = (totalPaid / debt.principal) * 100

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'ACTIVE':
        return 'success'
      case 'PAID_OFF':
        return 'success'
      case 'OVERDUE':
        return 'error'
      default:
        return 'default'
    }
  }

  return (
    <Card elevation={2}>
      <CardContent>
        <Grid
          container
          spacing={3}
        >
          {/* Header Row */}
          <Grid
            item
            xs={12}
          >
            <Box
              display='flex'
              justifyContent='space-between'
              alignItems='center'
            >
              <Box>
                <Typography
                  variant='h5'
                  fontWeight='600'
                >
                  {debt.debtName}
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  mt={0.5}
                >
                  {debt.lender}
                </Typography>
              </Box>
              <Chip
                label={debt.status}
                color={getStatusColor(debt.status)}
                size='small'
              />
            </Box>
          </Grid>

          {/* Key Metrics */}
          <Grid
            item
            xs={12}
            md={3}
          >
            <Box>
              <Typography
                variant='caption'
                color='text.secondary'
              >
                Principal Amount
              </Typography>
              <Typography
                variant='h6'
                fontWeight='600'
              >
                {formatCurrency(debt.principal)}
              </Typography>
            </Box>
          </Grid>

          <Grid
            item
            xs={12}
            md={3}
          >
            <Box>
              <Typography
                variant='caption'
                color='text.secondary'
              >
                Current Balance
              </Typography>
              <Typography
                variant='h6'
                fontWeight='600'
                color='error.main'
              >
                {formatCurrency(remainingBalance)}
              </Typography>
            </Box>
          </Grid>

          <Grid
            item
            xs={12}
            md={3}
          >
            <Box>
              <Typography
                variant='caption'
                color='text.secondary'
              >
                Monthly EMI
              </Typography>
              <Typography
                variant='h6'
                fontWeight='600'
              >
                {formatCurrency(debt.monthlyExpectedEMI)}
              </Typography>
              {debt.emiType && (
                <Chip
                  label={debt.emiType === 'INTEREST_ONLY' ? 'Interest Only' : 'Principal + Interest'}
                  size='small'
                  variant='outlined'
                  sx={{ mt: 0.5 }}
                  color={debt.emiType === 'INTEREST_ONLY' ? 'warning' : 'default'}
                />
              )}
            </Box>
          </Grid>

          <Grid
            item
            xs={12}
            md={3}
          >
            <Box>
              <Typography
                variant='caption'
                color='text.secondary'
              >
                Interest Rate
              </Typography>
              <Box
                display='flex'
                alignItems='center'
                gap={0.5}
              >
                <Percent size={18} />
                <Typography
                  variant='h6'
                  fontWeight='600'
                >
                  {debt.interestRate}%
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Progress Bar */}
          <Grid
            item
            xs={12}
          >
            <Box>
              <Box
                display='flex'
                justifyContent='space-between'
                mb={1}
              >
                <Typography
                  variant='body2'
                  color='text.secondary'
                >
                  Repayment Progress
                </Typography>
                <Typography
                  variant='body2'
                  fontWeight='600'
                >
                  {progressPercentage.toFixed(1)}% Complete
                </Typography>
              </Box>
              <LinearProgress
                variant='determinate'
                value={progressPercentage}
                sx={{ height: 8, borderRadius: 1 }}
              />
              <Box
                display='flex'
                justifyContent='space-between'
                mt={1}
              >
                <Typography
                  variant='caption'
                  color='text.secondary'
                >
                  Paid: {formatCurrency(totalPaid)}
                </Typography>
                <Typography
                  variant='caption'
                  color='text.secondary'
                >
                  Remaining: {formatCurrency(remainingBalance)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Timeline Info */}
          <Grid
            item
            xs={12}
            md={4}
          >
            <Box
              display='flex'
              alignItems='center'
              gap={1}
            >
              <Calendar size={18} />
              <Box>
                <Typography
                  variant='caption'
                  color='text.secondary'
                >
                  Start Date
                </Typography>
                <Typography variant='body2'>{dayjs(debt.startDate).format('DD MMM YYYY')}</Typography>
              </Box>
            </Box>
          </Grid>

          <Grid
            item
            xs={12}
            md={4}
          >
            <Box
              display='flex'
              alignItems='center'
              gap={1}
            >
              <Calendar size={18} />
              <Box>
                <Typography
                  variant='caption'
                  color='text.secondary'
                >
                  Next Payment
                </Typography>
                <Typography variant='body2'>
                  {debt.nextPaymentDate ? dayjs(debt.nextPaymentDate).format('DD MMM YYYY') : 'Not set'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid
            item
            xs={12}
            md={4}
          >
            <Box
              display='flex'
              alignItems='center'
              gap={1}
            >
              <TrendingDown size={18} />
              <Box>
                <Typography
                  variant='caption'
                  color='text.secondary'
                >
                  Total Paid
                </Typography>
                <Typography variant='body2'>{formatCurrency(totalPaid)}</Typography>
              </Box>
            </Box>
          </Grid>

          {/* Warning for Interest-Only Loans */}
          {debt.emiType === 'INTEREST_ONLY' && (
            <Grid
              item
              xs={12}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 2,
                  bgcolor: 'warning.lighter',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'warning.main',
                }}
              >
                <AlertCircle
                  size={20}
                  color='orange'
                />
                <Typography
                  variant='body2'
                  color='warning.dark'
                >
                  <strong>Interest-Only Loan:</strong> Your EMI payments cover only interest. Principal balance remains
                  unchanged. Consider making additional principal payments to reduce the loan faster.
                </Typography>
              </Box>
            </Grid>
          )}

          {/* Notes section removed - not part of IDebt type */}
        </Grid>
      </CardContent>
    </Card>
  )
}

export { DebtOverviewCard }
