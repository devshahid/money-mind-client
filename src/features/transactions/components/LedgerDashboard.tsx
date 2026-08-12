/**
 * LedgerDashboard Component
 *
 * Top-level container for the Ledger tab on Transaction Logs page.
 * Manages the display of ledgers list and detail views with search functionality.
 */

import { JSX, useCallback, useEffect, useState } from 'react'
import { Box, Typography, Button, TextField, InputAdornment } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'

import { useAppDispatch, useAppSelector } from '@/shared/hooks/slice-hooks'
import { RootState } from '@/store'
import {
  loadLedgers,
  selectAllLedgers,
  selectSelectedLedgerId,
  selectLedgerLoading,
  selectLedgerError,
  selectLedger,
} from '../store/ledgerSlice'
import { spacing } from '@/shared/theme'
import { CreateLedgerDialog } from './CreateLedgerDialog'
import { LedgerList } from './LedgerList'
import { LedgerDetails } from './LedgerDetails'

interface LedgerDashboardProps {
  onNavigateToTransaction?: (transactionId: string) => void
}

/**
 * LedgerDashboard - Main container for ledger management
 *
 * Displays:
 * - List of all ledgers (or details of selected ledger)
 * - Search functionality
 * - Create ledger button
 * - Empty state when no ledgers exist
 */
export const LedgerDashboard = ({ onNavigateToTransaction }: LedgerDashboardProps): JSX.Element => {
  const dispatch = useAppDispatch()
  const ledgers = useAppSelector(selectAllLedgers)
  const selectedLedgerId = useAppSelector(selectSelectedLedgerId)
  const loading = useAppSelector(selectLedgerLoading)
  const error = useAppSelector(selectLedgerError)

  const [searchText, setSearchText] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Load ledgers on mount
  useEffect(() => {
    void dispatch(loadLedgers())
  }, [dispatch])

  const handleSelectLedger = useCallback(
    (ledgerId: string) => {
      dispatch(selectLedger(ledgerId))
    },
    [dispatch]
  )

  const handleBackToList = useCallback(() => {
    dispatch(selectLedger(null))
  }, [dispatch])

  const handleCreateLedger = useCallback((partyName: string) => {
    setCreateDialogOpen(false)
    setSearchText('')
  }, [])

  const selectedLedger = ledgers.find(l => l.id === selectedLedgerId)

  // Show details view if a ledger is selected
  if (selectedLedger) {
    return (
      <LedgerDetails
        ledger={selectedLedger}
        onBack={handleBackToList}
        onNavigateToTransaction={onNavigateToTransaction}
      />
    )
  }

  // Show list view with search
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
      {/* Error message */}
      {error && (
        <Box
          sx={{
            p: spacing[2],
            backgroundColor: 'error.light',
            color: 'error.main',
            borderRadius: 1,
          }}
        >
          <Typography variant='body2'>{error}</Typography>
        </Box>
      )}

      {/* Header with search and create button */}
      <Box
        sx={{
          display: 'flex',
          gap: spacing[2],
          alignItems: 'flex-end',
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        <TextField
          label='Search by party name'
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          placeholder='e.g., John, Restaurant...'
          size='small'
          sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 200 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Create Ledger
        </Button>
      </Box>

      {/* Ledger list */}
      <LedgerList
        ledgers={ledgers}
        searchText={searchText}
        onSelectLedger={handleSelectLedger}
        loading={loading}
      />

      {/* Create ledger dialog */}
      <CreateLedgerDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreateSuccess={handleCreateLedger}
        existingParties={ledgers.map(l => l.partyName)}
      />
    </Box>
  )
}
