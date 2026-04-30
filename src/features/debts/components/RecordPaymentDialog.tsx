import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
} from '@mui/material'
import { DollarSign } from 'lucide-react'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { Dayjs } from 'dayjs'

import { spacing, colors } from '../../../shared/theme'
import type { IDebt } from '../types/debt'

interface RecordPaymentDialogProps {
  open: boolean
  debt: IDebt | null
  onClose: () => void
  onSubmit: (payment: { debtId: string; amount: number; paymentDate: string; notes?: string }) => void
  loading: boolean
}

export const RecordPaymentDialog = ({ open, debt, onClose, onSubmit, loading }: RecordPaymentDialogProps) => {
  const [amount, setAmount] = useState<string>('')
  const [paymentDate, setPaymentDate] = useState<Dayjs | null>(dayjs())
  const [notes, setNotes] = useState<string>('')
  const [error, setError] = useState<string>('')

  const handleSubmit = () => {
    if (!debt) return

    const paymentAmount = parseFloat(amount)
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (paymentAmount > debt.remainingBalance) {
      setError(`Payment amount cannot exceed remaining balance of ₹${debt.remainingBalance.toLocaleString('en-IN')}`)
      return
    }

    if (!paymentDate) {
      setError('Please select a payment date')
      return
    }

    setError('')
    onSubmit({
      debtId: debt._id,
      amount: paymentAmount,
      paymentDate: paymentDate.format('YYYY-MM-DD'),
      notes: notes.trim() || undefined,
    })

    // Reset form
    setAmount('')
    setPaymentDate(dayjs())
    setNotes('')
  }

  const handleClose = () => {
    setAmount('')
    setPaymentDate(dayjs())
    setNotes('')
    setError('')
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='sm'
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
        <DollarSign
          size={24}
          color={colors.semantic.success}
        />
        Record Payment - {debt?.debtName}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert
            severity='error'
            sx={{ mb: spacing[2] }}
          >
            {error}
          </Alert>
        )}

        {debt && (
          <Box sx={{ mb: spacing[3] }}>
            <Typography
              variant='body2'
              color='text.secondary'
            >
              Remaining Balance: ₹{debt.remainingBalance.toLocaleString('en-IN')}
            </Typography>
            <Typography
              variant='body2'
              color='text.secondary'
            >
              Expected Monthly EMI: ₹{debt.monthlyExpectedEMI.toLocaleString('en-IN')}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
          <TextField
            label='Payment Amount'
            type='number'
            value={amount}
            onChange={e => setAmount(e.target.value)}
            fullWidth
            required
            InputProps={{
              startAdornment: <Typography sx={{ mr: spacing[1] }}>₹</Typography>,
            }}
            helperText={
              debt?.monthlyExpectedEMI ? `Suggested: ₹${debt.monthlyExpectedEMI.toLocaleString('en-IN')}` : ''
            }
          />

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label='Payment Date'
              value={paymentDate}
              onChange={newValue => setPaymentDate(newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                },
              }}
            />
          </LocalizationProvider>

          <TextField
            label='Notes (Optional)'
            value={notes}
            onChange={e => setNotes(e.target.value)}
            multiline
            rows={3}
            fullWidth
            placeholder='Add any notes about this payment...'
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          disabled={loading}
        >
          {loading ? 'Recording...' : 'Record Payment'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
