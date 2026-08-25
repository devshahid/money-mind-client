/**
 * LinkTransactionDialog Component
 *
 * Modal dialog for linking an existing transaction to a ledger.
 * Features:
 * - Searchable transaction list (filterable by date, narration, amount)
 * - Payment direction is automatically determined by transaction's credit/debit nature:
 *   - Credit (money received) = "they_paid"
 *   - Debit (money spent) = "i_paid"
 * - Maximum 50 transactions per search result
 * - Shows only unlinked transactions
 */

import { JSX, useState, useMemo } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  InputAdornment,
  Alert,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

import type { ITransaction } from '../types/transaction'
import { spacing } from '@/shared/theme'

interface LinkTransactionDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (transactionId: string) => void
  availableTransactions: ITransaction[]
  loading?: boolean
  currency?: string
}

/**
 * LinkTransactionDialog - Modal for linking transactions to ledger
 * Direction is automatically determined from transaction's credit/debit status
 */
export const LinkTransactionDialog = ({
  open,
  onClose,
  onSubmit,
  availableTransactions,
  loading = false,
  currency = '₹',
}: LinkTransactionDialogProps): JSX.Element => {
  const [searchText, setSearchText] = useState('')
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null)

  // Filter transactions based on search text
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

  const handleSubmit = () => {
    if (!selectedTransactionId) {
      return
    }

    onSubmit(selectedTransactionId)

    // Reset state
    setSearchText('')
    setSelectedTransactionId(null)
  }

  const handleClose = () => {
    if (!loading) {
      setSearchText('')
      setSelectedTransactionId(null)
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth PaperProps={{ sx: { maxHeight: '90vh' } }}>
      <DialogTitle>Link Transaction to Ledger</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: spacing[2], pt: spacing[2], maxHeight: 'calc(90vh - 120px)', overflowY: 'auto' }}>
        {/* Info alert */}
        <Alert severity='info' sx={{ fontSize: '0.875rem' }}>
          Payment direction is automatically determined. Credit transactions = they paid, Debit = you paid.
        </Alert>

        {/* Search field */}
        <TextField
          label='Search transactions'
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
            maxHeight: 250,
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
                  : 'No available transactions to link'}
              </Typography>
            </Box>
          ) : (
            <List sx={{ width: '100%', m: 0, p: 0 }}>
              {filteredTransactions.map(transaction => (
                <ListItem
                  key={transaction._id}
                  disablePadding
                >
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
      </DialogContent>
      <DialogActions sx={{ p: spacing[2] }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          disabled={!selectedTransactionId || loading}
        >
          Link Transaction
        </Button>
      </DialogActions>
    </Dialog>
  )
}
