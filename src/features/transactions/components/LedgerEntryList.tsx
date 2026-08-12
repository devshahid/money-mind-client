/**
 * LedgerEntryList Component
 *
 * Displays paginated list of ledger entries.
 * - Entries shown in reverse chronological order (newest first)
 * - Maximum 50 entries per page with pagination controls
 */

import React, { JSX, useContext, useMemo, useState } from 'react'
import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'

import type { ILedgerEntry, ITransaction } from '../types/ledger'
import { spacing } from '@/shared/theme'
import { commonTableHeadingStyles } from '@/constants'
import { ColorModeContext } from '@/shared/contexts/ThemeContext'
import { LedgerEntryItem } from './LedgerEntryItem'

interface LedgerEntryListProps {
  entries: ILedgerEntry[]
  transactions?: Record<string, Partial<ITransaction>>
  onTransactionClick?: (transactionId: string) => void
  onDeleteEntry?: (entryId: string) => void
  currency?: string
}

/**
 * LedgerEntryList - Paginated entry list
 */
export const LedgerEntryList = ({
  entries: rawEntries,
  transactions = {},
  onTransactionClick,
  onDeleteEntry,
  currency = '₹',
}: LedgerEntryListProps): JSX.Element => {
  const theme = useTheme()
  const { mode } = useContext(ColorModeContext)
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(50)

  // Sort entries in reverse chronological order (newest first)
  const sortedEntries = useMemo(() => {
    return [...rawEntries].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [rawEntries])

  // Paginate entries
  const paginatedEntries = useMemo(() => {
    const startIdx = page * rowsPerPage
    const endIdx = startIdx + rowsPerPage
    return sortedEntries.slice(startIdx, endIdx)
  }, [sortedEntries, page, rowsPerPage])

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  if (sortedEntries.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: spacing[4] }}>
        <Typography color='text.secondary'>
          No entries in this ledger yet. Link a transaction to get started.
        </Typography>
      </Box>
    )
  }

  if (isMobile) {
    // Mobile: Card view
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
        {paginatedEntries.map(entry => (
          <LedgerEntryItem
            key={entry.id}
            entry={entry}
            transactionNarration={transactions[entry.transactionId]?.narration || 'Unnamed transaction'}
            onTransactionClick={onTransactionClick ? () => onTransactionClick(entry.transactionId) : undefined}
            onDeleteEntry={onDeleteEntry ? () => onDeleteEntry(entry.id) : undefined}
            currency={currency}
          />
        ))}

        {sortedEntries.length > rowsPerPage && (
          <TablePagination
            component='div'
            count={sortedEntries.length}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[25, 50, 100]}
            sx={{ mt: spacing[2] }}
          />
        )}
      </Box>
    )
  }

  // Desktop: Table view
  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...commonTableHeadingStyles(mode) }}>Narration</TableCell>
              <TableCell align='right' sx={{ ...commonTableHeadingStyles(mode) }}>Date</TableCell>
              <TableCell align='right' sx={{ ...commonTableHeadingStyles(mode) }}>Amount</TableCell>
              <TableCell sx={{ ...commonTableHeadingStyles(mode) }}>Direction</TableCell>
              {onDeleteEntry && <TableCell sx={{ ...commonTableHeadingStyles(mode), width: 50 }}>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedEntries.map(entry => {
              const transaction = transactions[entry.transactionId]
              return (
                <TableRow
                  key={entry.id}
                  hover
                  onClick={onTransactionClick ? () => onTransactionClick(entry.transactionId) : undefined}
                  sx={{ cursor: onTransactionClick ? 'pointer' : 'default' }}
                >
                  <TableCell>{transaction?.narration || 'Unnamed transaction'}</TableCell>
                  <TableCell align='right'>
                    {new Date(entry.createdAt).toLocaleDateString('en-GB', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    })}
                  </TableCell>
                  <TableCell align='right'>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: entry.direction === 'they_paid' ? '#2e7d32' : '#d32f2f',
                      }}
                    >
                      {currency}
                      {entry.amount.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>{entry.direction === 'i_paid' ? 'I paid' : 'They paid'}</TableCell>
                  {onDeleteEntry && (
                    <TableCell>
                      <Tooltip title='Remove from ledger'>
                        <IconButton
                          size='small'
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteEntry(entry.id)
                          }}
                          color='error'
                        >
                          <DeleteIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {sortedEntries.length > rowsPerPage && (
        <TablePagination
          component='div'
          count={sortedEntries.length}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[25, 50, 100]}
        />
      )}
    </Paper>
  )
}
