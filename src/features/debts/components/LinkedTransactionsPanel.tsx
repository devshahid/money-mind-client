import React, { useState } from 'react'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { Link as LinkIcon, Unlink, Search, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import dayjs from 'dayjs'
import { useDispatch } from 'react-redux'

import { formatCurrency } from '../utils/formatCurrency'
import type { IDebtTransactionLink } from '../types/debt'
import type { AppDispatch } from '../../../store'
import { unlinkTransaction } from '../store/debtSlice'

interface LinkedTransactionsPanelProps {
  debtId: string
  transactions: IDebtTransactionLink[] | null
  loading: boolean
}

const LinkedTransactionsPanel: React.FC<LinkedTransactionsPanelProps> = ({ debtId, transactions, loading }) => {
  const dispatch = useDispatch<AppDispatch>()
  const [searchTerm, setSearchTerm] = useState('')

  const handleUnlink = async (transactionId: string): Promise<void> => {
    if (window.confirm('Are you sure you want to unlink this transaction?')) {
      await dispatch(unlinkTransaction({ debtId, transactionId }))
    }
  }

  const filteredTransactions = transactions?.filter(link => {
    const tx = typeof link.transactionId === 'object' ? link.transactionId : null
    if (!tx) return false

    const searchLower = searchTerm.toLowerCase()
    const narrationMatch = tx.narration?.toLowerCase().includes(searchLower) ?? false
    const amountMatch = tx.amount.toString().includes(searchTerm)
    return narrationMatch || amountMatch
  })

  if (loading && !transactions) {
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

  const totalLinked =
    filteredTransactions?.reduce((sum, link) => {
      const tx = typeof link.transactionId === 'object' ? link.transactionId : null
      return sum + (tx?.amount || 0)
    }, 0) || 0

  return (
    <Box>
      {/* Header with Stats */}
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        mb={3}
      >
        <Box>
          <Typography
            variant='h6'
            gutterBottom
          >
            Linked Transactions
          </Typography>
          <Typography
            variant='body2'
            color='text.secondary'
          >
            {filteredTransactions?.length || 0} transaction(s) linked • Total: {formatCurrency(totalLinked)}
          </Typography>
        </Box>
        <Button
          variant='outlined'
          startIcon={<LinkIcon size={18} />}
          disabled
        >
          Link Transaction
        </Button>
      </Box>

      {/* Search */}
      <Box mb={2}>
        <TextField
          fullWidth
          size='small'
          placeholder='Search transactions...'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <Search
                size={18}
                style={{ marginRight: 8, color: '#666' }}
              />
            ),
          }}
        />
      </Box>

      {/* Transactions Table */}
      {!filteredTransactions || filteredTransactions.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography
            variant='h6'
            color='text.secondary'
            gutterBottom
          >
            No Linked Transactions
          </Typography>
          <Typography
            variant='body2'
            color='text.secondary'
            mb={2}
          >
            Link your EMI payment transactions to track them here.
          </Typography>
          <Button
            variant='contained'
            startIcon={<LinkIcon size={18} />}
            disabled
          >
            Link Your First Transaction
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Narration</TableCell>
                <TableCell align='right'>Amount</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Link Type</TableCell>
                <TableCell align='center'>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.map(link => {
                const tx = typeof link.transactionId === 'object' ? link.transactionId : null
                if (!tx) return null

                return (
                  <TableRow
                    key={link._id}
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
                        {dayjs(tx.transactionDate).format('DD MMM YYYY')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{tx.narration || 'No description'}</Typography>
                      {tx.bankName && (
                        <Typography
                          variant='caption'
                          color='text.secondary'
                        >
                          {tx.bankName}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align='right'>
                      <Box
                        display='flex'
                        alignItems='center'
                        justifyContent='flex-end'
                        gap={0.5}
                      >
                        {tx.isCredit ? (
                          <ArrowDownCircle
                            size={16}
                            color='green'
                          />
                        ) : (
                          <ArrowUpCircle
                            size={16}
                            color='red'
                          />
                        )}
                        <Typography
                          variant='body2'
                          fontWeight='600'
                          color={tx.isCredit ? 'success.main' : 'error.main'}
                        >
                          {formatCurrency(tx.amount)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tx.isCredit ? 'Credit' : 'Debit'}
                        size='small'
                        color={tx.isCredit ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={link.linkType || 'MANUAL'}
                        size='small'
                        variant='outlined'
                        color={link.linkType === 'AUTO' ? 'info' : 'default'}
                      />
                      {link.linkType === 'AUTO' && link.confidence && (
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          display='block'
                        >
                          {(link.confidence * 100).toFixed(0)}% confidence
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align='center'>
                      <Tooltip title='Unlink transaction'>
                        <IconButton
                          size='small'
                          color='error'
                          onClick={() =>
                            void handleUnlink(
                              typeof link.transactionId === 'string' ? link.transactionId : link.transactionId._id
                            )
                          }
                        >
                          <Unlink size={18} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}

export { LinkedTransactionsPanel }
