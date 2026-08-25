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
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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

import type { ILedgerEntry } from '../types/ledger'
import type { ITransaction } from '../types/transaction'
import { spacing } from '@/shared/theme'
import { commonTableHeadingStyles } from '@/constants'
import { ColorModeContext } from '@/shared/contexts/ThemeContext'
import {
  formatEntryDate,
  resolveEntryDate,
  resolveEntryNarration,
  sortEntriesByTransactionDate,
} from '../utils/ledgerBalance'
import { LedgerEntryItem } from './LedgerEntryItem'

interface LedgerEntryListProps {
  entries: ILedgerEntry[]
  transactions?: Record<string, Partial<ITransaction>>
  onTransactionClick?: (transactionId: string) => void
  onDeleteEntry?: (entryId: string) => void
  onBulkRemove?: (entryIds: string[]) => void
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
  onBulkRemove,
  currency = '₹',
}: LedgerEntryListProps): JSX.Element => {
  const theme = useTheme()
  const { mode } = useContext(ColorModeContext)
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(50)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkRemoveDialogOpen, setBulkRemoveDialogOpen] = useState(false)

  // Selection is only enabled when the parent provides a bulk-remove handler
  const selectable = Boolean(onBulkRemove)

  // Sort entries in reverse chronological order by the linked transaction's
  // date (newest transaction first), falling back to createdAt when missing.
  const sortedEntries = useMemo(() => {
    return sortEntriesByTransactionDate(rawEntries, transactions)
  }, [rawEntries, transactions])

  // Paginate entries
  const paginatedEntries = useMemo(() => {
    const startIdx = page * rowsPerPage
    const endIdx = startIdx + rowsPerPage
    return sortedEntries.slice(startIdx, endIdx)
  }, [sortedEntries, page, rowsPerPage])

  const handlePageChange = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Select-all spans the full sorted list (matches the transactions table behavior)
  const allSelected = sortedEntries.length > 0 && selectedIds.length === sortedEntries.length
  const someSelected = selectedIds.length > 0 && selectedIds.length < sortedEntries.length

  const handleSelectToggle = (entryId: string): void => {
    setSelectedIds(prev => (prev.includes(entryId) ? prev.filter(id => id !== entryId) : [...prev, entryId]))
  }

  const handleSelectAll = (): void => {
    setSelectedIds(prev => (prev.length === sortedEntries.length ? [] : sortedEntries.map(entry => entry.id)))
  }

  const handleClearSelection = (): void => {
    setSelectedIds([])
  }

  const handleConfirmBulkRemove = (): void => {
    onBulkRemove?.(selectedIds)
    setSelectedIds([])
    setBulkRemoveDialogOpen(false)
  }

  const selectionToolbar = selectable && selectedIds.length > 0 && (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing[2],
        px: spacing[2],
        py: spacing[1],
        mb: spacing[2],
        borderRadius: 1,
        bgcolor: 'action.selected',
        flexWrap: 'wrap',
      }}
    >
      <Typography
        variant='body2'
        sx={{ fontWeight: 500 }}
      >
        {selectedIds.length} selected
      </Typography>
      <Button
        size='small'
        variant='outlined'
        onClick={handleClearSelection}
      >
        Clear
      </Button>
      <Button
        size='small'
        variant='contained'
        color='error'
        startIcon={<DeleteIcon />}
        onClick={() => setBulkRemoveDialogOpen(true)}
      >
        Remove from ledger
      </Button>
    </Box>
  )

  const bulkRemoveDialog = selectable && (
    <Dialog
      open={bulkRemoveDialogOpen}
      onClose={() => setBulkRemoveDialogOpen(false)}
    >
      <DialogTitle>Remove entries</DialogTitle>
      <DialogContent>
        <Typography sx={{ mt: spacing[1] }}>
          Remove {selectedIds.length} {selectedIds.length === 1 ? 'entry' : 'entries'} from this ledger? This cannot be
          undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setBulkRemoveDialogOpen(false)}>Cancel</Button>
        <Button
          onClick={handleConfirmBulkRemove}
          color='error'
          variant='contained'
        >
          Remove
        </Button>
      </DialogActions>
    </Dialog>
  )

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
        {selectionToolbar}
        {paginatedEntries.map(entry => (
          <LedgerEntryItem
            key={entry.id}
            entry={entry}
            transactionNarration={resolveEntryNarration(entry, transactions)}
            transactionDate={resolveEntryDate(entry, transactions)}
            onTransactionClick={onTransactionClick ? () => onTransactionClick(entry.transactionId) : undefined}
            onDeleteEntry={onDeleteEntry ? () => onDeleteEntry(entry.id) : undefined}
            currency={currency}
            selectable={selectable}
            selected={selectedIds.includes(entry.id)}
            onSelectToggle={selectable ? () => handleSelectToggle(entry.id) : undefined}
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

        {bulkRemoveDialog}
      </Box>
    )
  }

  // Desktop: Table view
  return (
    <Box>
      {selectionToolbar}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {selectable && (
                  <TableCell
                    padding='checkbox'
                    sx={{ ...commonTableHeadingStyles(mode) }}
                  >
                    <Checkbox
                      color='primary'
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={handleSelectAll}
                      inputProps={{ 'aria-label': 'Select all entries' }}
                    />
                  </TableCell>
                )}
                <TableCell sx={{ ...commonTableHeadingStyles(mode) }}>Narration</TableCell>
                <TableCell
                  align='right'
                  sx={{ ...commonTableHeadingStyles(mode) }}
                >
                  Date
                </TableCell>
                <TableCell
                  align='right'
                  sx={{ ...commonTableHeadingStyles(mode) }}
                >
                  Amount
                </TableCell>
                <TableCell sx={{ ...commonTableHeadingStyles(mode) }}>Direction</TableCell>
                {onDeleteEntry && <TableCell sx={{ ...commonTableHeadingStyles(mode), width: 50 }}>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedEntries.map(entry => {
                return (
                  <TableRow
                    key={entry.id}
                    hover
                    onClick={onTransactionClick ? () => onTransactionClick(entry.transactionId) : undefined}
                    selected={selectable && selectedIds.includes(entry.id)}
                    sx={{ cursor: onTransactionClick ? 'pointer' : 'default' }}
                  >
                    {selectable && (
                      <TableCell padding='checkbox'>
                        <Checkbox
                          color='primary'
                          checked={selectedIds.includes(entry.id)}
                          onClick={e => e.stopPropagation()}
                          onChange={e => {
                            e.stopPropagation()
                            handleSelectToggle(entry.id)
                          }}
                          inputProps={{ 'aria-label': 'Select entry' }}
                        />
                      </TableCell>
                    )}
                    <TableCell>{resolveEntryNarration(entry, transactions)}</TableCell>
                    <TableCell align='right'>{formatEntryDate(entry, transactions)}</TableCell>
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
                            onClick={e => {
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

      {bulkRemoveDialog}
    </Box>
  )
}
