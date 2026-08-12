/**
 * SettlementDialog Component
 *
 * Modal dialog for recording a settlement (repayment) for a ledger.
 * Features:
 * - Searchable transaction list for selecting settlement payment
 * - Pre-filled settlement amount input
 * - Validates amount is <= absolute outstanding balance
 */

import { JSX, useState, useMemo } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  CircularProgress,
  Alert,
  InputAdornment,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

import type { ITransaction } from '../types/transaction'
import { spacing } from '@/shared/theme'

interface SettlementDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (transactionId: string, amount: number) => void
  availableTransactions: ITransaction[]
  currentBalance: number
  loading?: boolean
  currency?: string
}

/**
 * SettlementDialog - Modal for recording settlement payments
 */
export const SettlementDialog = ({
  open,
  onClose,
  onSubmit,
  availableTransactions,
  currentBalance,
  loading = false,
  currency = '₹',
}: SettlementDialogProps): JSX.Element => {
  const [searchText, setSearchText] = useState('')
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [amountError, setAmountError] = useState('')

  const maxSettlementAmount = Math.abs(currentBalance)

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    if (!searchText.trim()) {
      return availableTransactions.slice(0, 50)
    }

    const lowerSearch = searchText.toLowerCase()
    const filtered = availableTransactions.filter(t => {
      const narrationMatch = t.narration.toLowerCase().includes(lowerSearch)
      const amountMatch = t.amount.toString().includes(lowerSearch)
      const dateMatch = t.transactionDate.includes(searchText)
      return narrationMatch || amountMatch || dateMatch
    })

    return filtered.slice(0, 50)
  }, [searchText, availableTransactions])

  const validateAmount = (value: string): string => {
    if (!value.trim()) {
      return 'Settlement amount is required'
    }

    const numAmount = parseFloat(value)

    if (isNaN(numAmount) || numAmount <= 0) {
      return 'Settlement amount must be positive'
    }

    if (numAmount > maxSettlementAmount) {
      return `Settlement cannot exceed ${currency}${maxSettlementAmount.toFixed(2)}`
    }

    return ''
  }

  const handleAmountChange = (value: string) => {
    setAmount(value)
    if (amountError) {
      setAmountError(validateAmount(value))
    }
  }

  const handleSubmit = () => {
    if (!selectedTransactionId || !amount.trim()) {
      return
    }

    const error = validateAmount(amount)
    if (error) {
      setAmountError(error)
      return
    }

    onSubmit(selectedTransactionId, parseFloat(amount))

    // Reset state
    setSearchText('')
    setSelectedTransactionId(null)
    setAmount('')
    setAmountError('')
  }

  const handleClose = () => {
    if (!loading) {
      setSearchText('')
      setSelectedTransactionId(null)
      setAmount('')
      setAmountError('')
      onClose()
    }
  }

  const isDisabled =
    loading ||
    !selectedTransactionId ||
    !amount.trim() ||
    Boolean(amountError)

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle>Record Settlement</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: spacing[2], pt: spacing[2] }}>
        {/* Info box */}
        <Alert severity='info'>
          Outstanding balance: <strong>{currency}{Math.abs(currentBalance).toFixed(2)}</strong>
        </Alert>

        {/* Search field */}
        <TextField
          label='Search payment transaction'
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          placeholder='By narration, amount, or date...'
          fullWidth
          size='small'
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* Transaction list */}
        <Box
          sx={{
            maxHeight: 300,
            overflowY: 'auto',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: spacing[3] }}>
              <CircularProgress size={32} />
            </Box>
          ) : filteredTransactions.length === 0 ? (
            <Box sx={{ p: spacing[2], textAlign: 'center' }}>
              <Typography color='text.secondary' variant='body2'>
                {searchText
                  ? 'No matching transactions found'
                  : 'No available transactions'}
              </Typography>
            </Box>
          ) : (
            <List sx={{ width: '100%', m: 0, p: 0 }}>
              {filteredTransactions.map(transaction => (
                <ListItem key={transaction._id} disablePadding>
                  <ListItemButton
                    selected={selectedTransactionId === transaction._id}
                    onClick={() => setSelectedTransactionId(transaction._id)}
                    sx={{ py: spacing[1] }}
                  >
                    <ListItemText
                      primary={transaction.narration}
                      secondary={`${new Date(transaction.transactionDate).toLocaleDateString()} • ${currency}${parseFloat(transaction.amount).toFixed(2)}`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        {/* Settlement amount input */}
        <TextField
          label='Settlement Amount'
          value={amount}
          onChange={e => handleAmountChange(e.target.value)}
          placeholder={`Max: ${currency}${maxSettlementAmount.toFixed(2)}`}
          fullWidth
          type='number'
          disabled={loading}
          error={Boolean(amountError)}
          helperText={amountError}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                {currency}
              </InputAdornment>
            ),
          }}
          inputProps={{
            step: '0.01',
            min: '0',
            max: maxSettlementAmount.toFixed(2),
          }}
        />
      </DialogContent>
      <DialogActions sx={{ p: spacing[2] }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          disabled={isDisabled}
        >
          Record Settlement
        </Button>
      </DialogActions>
    </Dialog>
  )
}
