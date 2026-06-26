import React from 'react'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { CheckCircle, Clock, XCircle, AlertCircle, Plus } from 'lucide-react'
import dayjs from 'dayjs'
import { useDispatch } from 'react-redux'

import { formatCurrency } from '../utils/formatCurrency'
import type { IRepaymentScheduleItem } from '../types/debt'
import type { AppDispatch } from '../../../store'
import { generateSchedule } from '../store/debtSlice'

interface RepaymentScheduleTableProps {
  debtId: string
  schedule: IRepaymentScheduleItem[] | null
  loading: boolean
}

const RepaymentScheduleTable: React.FC<RepaymentScheduleTableProps> = ({ debtId, schedule, loading }) => {
  const dispatch = useDispatch<AppDispatch>()

  const getStatusIcon = (status: string): React.ReactNode => {
    switch (status) {
      case 'PAID':
        return (
          <CheckCircle
            size={18}
            color='green'
          />
        )
      case 'PARTIAL':
        return (
          <AlertCircle
            size={18}
            color='orange'
          />
        )
      case 'MISSED':
        return (
          <XCircle
            size={18}
            color='red'
          />
        )
      case 'UPCOMING':
        return (
          <Clock
            size={18}
            color='gray'
          />
        )
      case 'OVERPAID':
        return (
          <CheckCircle
            size={18}
            color='blue'
          />
        )
      default:
        return (
          <Clock
            size={18}
            color='gray'
          />
        )
    }
  }

  const getStatusColor = (
    status: string
  ): 'success' | 'warning' | 'error' | 'default' | 'info' | 'primary' | 'secondary' => {
    switch (status) {
      case 'PAID':
        return 'success'
      case 'PARTIAL':
        return 'warning'
      case 'MISSED':
        return 'error'
      case 'OVERPAID':
        return 'info'
      default:
        return 'default'
    }
  }

  const handleGenerateSchedule = (): void => {
    void dispatch(generateSchedule(debtId))
  }

  if (loading && !schedule) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        py={4}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (!schedule || schedule.length === 0) {
    return (
      <Box
        p={3}
        textAlign='center'
      >
        <Typography
          variant='h6'
          color='text.secondary'
          gutterBottom
        >
          No Repayment Schedule Found
        </Typography>
        <Typography
          variant='body2'
          color='text.secondary'
          mb={3}
        >
          Generate a schedule automatically based on your EMI amount or import your own.
        </Typography>
        <Button
          variant='contained'
          startIcon={<Plus size={20} />}
          onClick={handleGenerateSchedule}
        >
          Generate Schedule
        </Button>
      </Box>
    )
  }

  // Calculate totals
  const totals = schedule.reduce(
    (acc, item) => ({
      expectedAmount: acc.expectedAmount + item.expectedAmount,
      principalComponent: acc.principalComponent + item.principalComponent,
      interestComponent: acc.interestComponent + item.interestComponent,
      actualPaid: acc.actualPaid + (item.variance ? item.expectedAmount + item.variance : 0),
    }),
    {
      expectedAmount: 0,
      principalComponent: 0,
      interestComponent: 0,
      actualPaid: 0,
    }
  )

  const variance = totals.actualPaid - totals.expectedAmount

  return (
    <Box>
      {/* Summary Cards */}
      <Box
        display='flex'
        gap={2}
        mb={3}
        flexWrap='wrap'
      >
        <Paper sx={{ p: 2, flex: 1, minWidth: 200 }}>
          <Typography
            variant='caption'
            color='text.secondary'
          >
            Total Expected
          </Typography>
          <Typography
            variant='h6'
            fontWeight='600'
          >
            {formatCurrency(totals.expectedAmount)}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, minWidth: 200 }}>
          <Typography
            variant='caption'
            color='text.secondary'
          >
            Total Principal
          </Typography>
          <Typography
            variant='h6'
            fontWeight='600'
            color='primary.main'
          >
            {formatCurrency(totals.principalComponent)}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, minWidth: 200 }}>
          <Typography
            variant='caption'
            color='text.secondary'
          >
            Total Interest
          </Typography>
          <Typography
            variant='h6'
            fontWeight='600'
            color='error.main'
          >
            {formatCurrency(totals.interestComponent)}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, minWidth: 200 }}>
          <Typography
            variant='caption'
            color='text.secondary'
          >
            Actual Paid
          </Typography>
          <Typography
            variant='h6'
            fontWeight='600'
          >
            {formatCurrency(totals.actualPaid)}
          </Typography>
          {variance !== 0 && (
            <Typography
              variant='caption'
              color={variance > 0 ? 'success.main' : 'error.main'}
            >
              {variance > 0 ? '+' : ''}
              {formatCurrency(variance)} variance
            </Typography>
          )}
        </Paper>
      </Box>

      {/* Schedule Table */}
      <TableContainer component={Paper}>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Month</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell align='right'>Expected EMI</TableCell>
              <TableCell align='right'>Principal</TableCell>
              <TableCell align='right'>Interest</TableCell>
              <TableCell align='right'>Actual Paid</TableCell>
              <TableCell align='right'>Balance</TableCell>
              <TableCell align='center'>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedule.map(item => (
              <TableRow
                key={item.month}
                sx={{
                  '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                  '&:hover': { bgcolor: 'action.selected' },
                }}
              >
                <TableCell>
                  <Typography
                    variant='body2'
                    fontWeight='500'
                  >
                    {item.month}
                  </Typography>
                </TableCell>
                <TableCell>{dayjs(item.dueDate).format('DD MMM YYYY')}</TableCell>
                <TableCell align='right'>
                  <Typography
                    variant='body2'
                    fontWeight='500'
                  >
                    {formatCurrency(item.expectedAmount)}
                  </Typography>
                </TableCell>
                <TableCell align='right'>
                  <Typography
                    variant='body2'
                    color='primary.main'
                  >
                    {formatCurrency(item.principalComponent)}
                  </Typography>
                </TableCell>
                <TableCell align='right'>
                  <Typography
                    variant='body2'
                    color='error.main'
                  >
                    {formatCurrency(item.interestComponent)}
                  </Typography>
                </TableCell>
                <TableCell align='right'>
                  {item.status === 'PAID' || item.status === 'PARTIAL' || item.status === 'OVERPAID' ? (
                    <Box>
                      <Typography
                        variant='body2'
                        fontWeight='500'
                      >
                        {formatCurrency(item.expectedAmount + (item.variance || 0))}
                      </Typography>
                      {item.variance !== undefined && item.variance !== 0 && (
                        <Typography
                          variant='caption'
                          color={item.variance > 0 ? 'success.main' : 'error.main'}
                        >
                          {item.variance > 0 ? '+' : ''}
                          {formatCurrency(item.variance)}
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Typography
                      variant='body2'
                      color='text.secondary'
                    >
                      Pending
                    </Typography>
                  )}
                </TableCell>
                <TableCell align='right'>
                  <Typography variant='body2'>{formatCurrency(item.expectedBalance)}</Typography>
                </TableCell>
                <TableCell align='center'>
                  <Box
                    display='flex'
                    alignItems='center'
                    justifyContent='center'
                    gap={0.5}
                  >
                    {getStatusIcon(item.status)}
                    <Chip
                      label={item.status}
                      size='small'
                      color={getStatusColor(item.status)}
                    />
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export { RepaymentScheduleTable }
