import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Box,
  Typography,
  IconButton,
  Chip,
} from '@mui/material'
import { Eye, Trash2, DollarSign } from 'lucide-react'

import { colors, spacing } from '../../../shared/theme'
import type { IDebt } from '../types/debt'

interface DebtListTableProps {
  debts: IDebt[]
  onViewDetails: (debtId: string) => void
  onRecordPayment: (debt: IDebt) => void
  onDelete: (debtId: string) => void
}

export const DebtListTable = ({ debts, onViewDetails, onRecordPayment, onDelete }: DebtListTableProps) => {
  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-IN')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return colors.semantic.warning
      case 'PAID':
        return colors.semantic.success
      case 'PAUSED':
        return colors.grayscale.gray
      default:
        return colors.grayscale.medium
    }
  }

  const calculateProgress = (debt: IDebt) => {
    const paid = debt.principal - debt.remainingBalance
    return (paid / debt.principal) * 100
  }

  if (debts.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: spacing[8] }}>
        <Typography
          variant='h6'
          color='text.secondary'
        >
          No debts found. Start by adding your first debt!
        </Typography>
      </Box>
    )
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Debt Name</TableCell>
            <TableCell>Lender</TableCell>
            <TableCell align='right'>Principal</TableCell>
            <TableCell align='right'>Remaining</TableCell>
            <TableCell align='center'>Progress</TableCell>
            <TableCell align='right'>Interest Rate</TableCell>
            <TableCell align='right'>Monthly EMI</TableCell>
            <TableCell align='center'>Status</TableCell>
            <TableCell align='center'>Next Payment</TableCell>
            <TableCell align='center'>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {debts.map(debt => {
            const progress = calculateProgress(debt)
            return (
              <TableRow key={debt._id}>
                <TableCell>
                  <Typography variant='body2'>{debt.debtName}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='body2'>{debt.lender}</Typography>
                </TableCell>
                <TableCell align='right'>
                  <Typography variant='body2'>{formatCurrency(debt.principal)}</Typography>
                </TableCell>
                <TableCell align='right'>
                  <Typography
                    variant='body2'
                    sx={{ fontWeight: 600, color: colors.semantic.error }}
                  >
                    {formatCurrency(debt.remainingBalance)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[1], minWidth: 120 }}>
                    <LinearProgress
                      variant='determinate'
                      value={progress}
                      sx={{ flex: 1, height: 8, borderRadius: 4 }}
                    />
                    <Typography
                      variant='caption'
                      sx={{ minWidth: 40 }}
                    >
                      {progress.toFixed(0)}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align='right'>
                  <Typography variant='body2'>{debt.interestRate}%</Typography>
                </TableCell>
                <TableCell align='right'>
                  <Typography variant='body2'>{formatCurrency(debt.monthlyExpectedEMI)}</Typography>
                </TableCell>
                <TableCell align='center'>
                  <Chip
                    label={debt.status}
                    size='small'
                    sx={{
                      backgroundColor: `${getStatusColor(debt.status)}20`,
                      color: getStatusColor(debt.status),
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
                <TableCell align='center'>
                  <Typography variant='body2'>{formatDate(debt.nextPaymentDate)}</Typography>
                </TableCell>
                <TableCell align='center'>
                  <Box sx={{ display: 'flex', gap: spacing[1], justifyContent: 'center' }}>
                    <IconButton
                      size='small'
                      onClick={() => onViewDetails(debt._id)}
                      title='View Details'
                    >
                      <Eye size={18} />
                    </IconButton>
                    {debt.status === 'ACTIVE' && (
                      <IconButton
                        size='small'
                        onClick={() => onRecordPayment(debt)}
                        title='Record Payment'
                        sx={{ color: colors.semantic.success }}
                      >
                        <DollarSign size={18} />
                      </IconButton>
                    )}
                    <IconButton
                      size='small'
                      onClick={() => onDelete(debt._id)}
                      title='Delete'
                      sx={{ color: colors.semantic.error }}
                    >
                      <Trash2 size={18} />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
