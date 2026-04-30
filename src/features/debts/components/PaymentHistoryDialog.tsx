import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  Divider,
} from '@mui/material'
import { History, DollarSign } from 'lucide-react'

import { spacing, colors } from '../../../shared/theme'
import type { IPaymentHistory } from '../types/debt'

interface PaymentHistoryDialogProps {
  open: boolean
  debtName: string
  paymentHistory: IPaymentHistory | null
  loading: boolean
  error: string | null
  onClose: () => void
}

export const PaymentHistoryDialog = ({
  open,
  debtName,
  paymentHistory,
  loading,
  error,
  onClose,
}: PaymentHistoryDialogProps) => {
  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
        <History
          size={24}
          color={colors.primary.blue}
        />
        Payment History - {debtName}
      </DialogTitle>
      <DialogContent>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: spacing[4] }}>
            <CircularProgress />
          </Box>
        )}

        {error && <Alert severity='error'>{error}</Alert>}

        {!loading && !error && paymentHistory && (
          <>
            <Paper
              sx={{
                p: spacing[2],
                mb: spacing[3],
                backgroundColor: colors.background.lavender,
                display: 'flex',
                justifyContent: 'space-around',
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant='h5'
                  sx={{ fontWeight: 700, color: colors.semantic.success }}
                >
                  {formatCurrency(paymentHistory.totalPaid)}
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'
                >
                  Total Paid
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant='h5'
                  sx={{ fontWeight: 700, color: colors.primary.blue }}
                >
                  {paymentHistory.paymentCount}
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'
                >
                  Payments Made
                </Typography>
              </Box>
            </Paper>

            {paymentHistory.payments.length === 0 ? (
              <Alert severity='info'>No payment history available yet.</Alert>
            ) : (
              <List sx={{ width: '100%' }}>
                {paymentHistory.payments.map((payment, index) => (
                  <Box key={payment._id}>
                    <ListItem
                      sx={{
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: spacing[1],
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Typography
                          variant='h6'
                          sx={{ fontWeight: 600, color: colors.semantic.success }}
                        >
                          <DollarSign
                            size={20}
                            style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}
                          />
                          {formatCurrency(payment.amount)}
                        </Typography>
                        <Typography
                          variant='body2'
                          color='text.secondary'
                        >
                          {formatDate(payment.paymentDate)}
                        </Typography>
                      </Box>
                      {payment.notes && (
                        <Typography
                          variant='body2'
                          color='text.secondary'
                        >
                          {payment.notes}
                        </Typography>
                      )}
                    </ListItem>
                    {index < paymentHistory.payments.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
