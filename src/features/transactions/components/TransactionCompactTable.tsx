import { JSX, useContext } from 'react'
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import dayjs from 'dayjs'

import { ITransactionLogs } from '../store/transactionSlice'
import { ColorModeContext } from '../../../shared/contexts/ThemeContext'
import { getExpenseCategories } from '../../../constants'

type TransactionCompactTableProps = {
  transactions: ITransactionLogs[]
}

const compactHeadingStyles = (mode: string): Record<string, unknown> => ({
  fontWeight: 600,
  backgroundColor: mode === 'dark' ? '#222126' : '#F6F5FF',
  whiteSpace: 'nowrap' as const,
})

const TransactionCompactTable = ({ transactions }: TransactionCompactTableProps): JSX.Element => {
  const { mode } = useContext(ColorModeContext)

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
                hover
              >
                <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
                  {dayjs(tx.transactionDate).format('DD/MM/YYYY')}
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: '0.875rem',
                    maxWidth: 200,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tx.narration}
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
