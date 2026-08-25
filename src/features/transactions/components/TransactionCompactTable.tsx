import { JSX, useContext } from 'react'
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import dayjs from 'dayjs'

import { ITransactionLogs } from '../store/transactionSlice'
import { selectTransactionLedgerMap } from '../store/ledgerSlice'
import { ColorModeContext } from '../../../shared/contexts/ThemeContext'
import { getExpenseCategories } from '../../../constants'
import { useAppSelector } from '../../../shared/hooks/slice-hooks'
import { RootState } from '../../../store'
import { spacing } from '../../../shared/theme'
import { LedgerBadge } from './LedgerBadge'

type TransactionCompactTableProps = {
  transactions: ITransactionLogs[]
  onLedgerBadgeClick?: (ledgerId: string) => void
  highlightedTransactionId?: string | null
}

const compactHeadingStyles = (mode: string): Record<string, unknown> => ({
  fontWeight: 600,
  backgroundColor: mode === 'dark' ? '#222126' : '#F6F5FF',
  whiteSpace: 'nowrap' as const,
})

const TransactionCompactTable = ({
  transactions,
  onLedgerBadgeClick,
  highlightedTransactionId,
}: TransactionCompactTableProps): JSX.Element => {
  const { mode } = useContext(ColorModeContext)
  const transactionLedgerMap = useAppSelector((state: RootState) => selectTransactionLedgerMap(state))
  const ledgers = useAppSelector((state: RootState) => state.ledgers.ledgers)

  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table
        stickyHeader
        size='small'
      >
        <TableHead>
          <TableRow>
            <TableCell sx={compactHeadingStyles(mode)}>Date</TableCell>
            <TableCell sx={compactHeadingStyles(mode)}>Narration</TableCell>
            <TableCell sx={compactHeadingStyles(mode)}>Category</TableCell>
            <TableCell sx={compactHeadingStyles(mode)}>Amount</TableCell>
            <TableCell sx={compactHeadingStyles(mode)}>Type</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((tx: ITransactionLogs) => {
            const categoryData = getExpenseCategories().find(cat => cat.name === tx.category)
            const displayCategory = tx.category ? tx.category.charAt(0).toUpperCase() + tx.category.slice(1) : ''

            return (
              <TableRow
                key={tx._id}
                id={`transaction-row-${tx._id}`}
                hover
                sx={{
                  transition: 'background-color 0.6s ease',
                  ...(highlightedTransactionId === tx._id && { backgroundColor: 'action.selected' }),
                }}
              >
                <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
                  {dayjs(tx.transactionDate).format('DD/MM/YYYY')}
                </TableCell>
                <TableCell sx={{ fontSize: '0.875rem', maxWidth: 200 }}>
                  <Typography
                    variant='body2'
                    sx={{
                      fontSize: '0.875rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tx.narration}
                  </Typography>
                  {transactionLedgerMap.has(tx._id) &&
                    ((): JSX.Element | null => {
                      const ledgerId = transactionLedgerMap.get(tx._id)
                      const ledger = ledgerId ? ledgers.find(l => l.id === ledgerId) : null
                      return ledger ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: spacing[1], mt: spacing[1] }}>
                          <LedgerBadge
                            partyName={ledger.partyName}
                            onClick={() => onLedgerBadgeClick?.(ledger.id)}
                          />
                        </Box>
                      ) : null
                    })()}
                </TableCell>
                <TableCell sx={{ fontSize: '0.875rem' }}>
                  {categoryData ? (
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        backgroundColor: categoryData.backgroundColor,
                        px: 1,
                        py: 0.5,
                        borderRadius: '8px',
                        color: '#000',
                      }}
                    >
                      <categoryData.icon style={{ color: categoryData.color, fontSize: 14 }} />
                      <Typography
                        variant='caption'
                        sx={{ color: '#000' }}
                      >
                        {displayCategory}
                      </Typography>
                    </Box>
                  ) : (
                    displayCategory
                  )}
                </TableCell>
                <TableCell
                  sx={{
                    whiteSpace: 'nowrap',
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    color: tx.isCredit ? 'success.main' : 'error.main',
                  }}
                >
                  ₹{Number(tx.amount).toFixed(2)}
                </TableCell>
                <TableCell sx={{ fontSize: '0.875rem' }}>{tx.isCredit ? 'Credit' : 'Debit'}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export { TransactionCompactTable }
