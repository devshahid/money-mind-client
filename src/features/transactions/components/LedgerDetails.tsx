/**
 * LedgerDetails Component
 *
 * Shows details of a single ledger including:
 * - Header with party name and outstanding balance
 * - Summary statistics (total paid, total received, net)
 * - Paginated entry list (newest first, max 50 per page)
 * - Action buttons (Add Transaction, Sync, Delete Ledger)
 */

import { JSX, useState, useCallback } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'
import CloudSyncIcon from '@mui/icons-material/CloudSync'
import DeleteIcon from '@mui/icons-material/Delete'

import type { ILedger } from '../types/ledger'
import { useAppSelector, useAppDispatch } from '@/shared/hooks/slice-hooks'
import { RootState } from '@/store'
import {
  selectEntriesByLedgerId,
  selectLedgerLoading,
  selectHasLocalChanges,
  removeLedgerEntry,
  removeLedgerEntries,
  linkTransactionToLedger,
  syncLedgers,
  deleteLedger,
} from '../store/ledgerSlice'
import { calculateBalance } from '../utils/ledgerBalance'
import { spacing } from '@/shared/theme'
import { useSnackbar } from '@/shared/contexts/SnackBarContext'

import { LedgerDetailHeader } from './LedgerDetailHeader'
import { LedgerEntrySummary } from './LedgerEntrySummary'
import { LedgerEntryList } from './LedgerEntryList'
import { LinkTransactionDialog } from './LinkTransactionDialog'

interface LedgerDetailsProps {
  ledger: ILedger
  onBack: () => void
  onNavigateToTransaction?: (transactionId: string) => void
}

/**
 * LedgerDetails - Full detail view for a ledger
 */
export const LedgerDetails = ({ ledger, onBack, onNavigateToTransaction }: LedgerDetailsProps): JSX.Element => {
  const dispatch = useAppDispatch()
  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar()
  const loading = useAppSelector(selectLedgerLoading)
  const entries = useAppSelector((state: RootState) => selectEntriesByLedgerId(state, ledger.id))
  const transactions = useAppSelector((state: RootState) => state.transactions.transactions)

  // State for dialogs
  const [addTransactionDialogOpen, setAddTransactionDialogOpen] = useState(false)
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [syncMessage, setSyncMessage] = useState('')

  const hasLocalChanges = useAppSelector(selectHasLocalChanges)
  const canDeleteLedger = entries.length === 0

  // Create a map of transactions for easy lookup
  const transactionMap = transactions.reduce(
    (acc, tx) => {
      acc[tx._id] = tx
      return acc
    },
    {} as Record<string, (typeof transactions)[0]>
  )

  // Get linked transaction IDs so already-linked transactions are hidden from
  // the available list
  const linkedTransactionIds = new Set(entries.map(e => e.transactionId))

  // Get available transactions (not yet linked)
  const availableTransactions = transactions.filter(tx => !linkedTransactionIds.has(tx._id))

  // Calculate balance
  const balance = calculateBalance(
    entries.map(e => ({
      direction: e.direction,
      amount: e.amount,
    }))
  )

  const handleAddTransaction = useCallback(() => {
    setAddTransactionDialogOpen(true)
  }, [])

  const handleSyncLedgers = useCallback(async () => {
    setSyncing(true)
    try {
      const result = await dispatch(syncLedgers()).unwrap()
      setSyncStatus('success')
      setSyncMessage(`Synced ${result.ledgers.length} ledgers and ${result.entries.length} entries`)
      setTimeout(() => setSyncStatus('idle'), 4000)
    } catch (error: unknown) {
      setSyncStatus('error')
      setSyncMessage(error instanceof Error ? error.message : 'Failed to sync ledgers')
      setTimeout(() => setSyncStatus('idle'), 4000)
    } finally {
      setSyncing(false)
    }
  }, [dispatch])

  const handleDeleteLedger = useCallback(async () => {
    setDeleting(true)
    try {
      await dispatch(deleteLedger(ledger.id)).unwrap()
      setDeleteConfirmDialogOpen(false)
      setSyncStatus('success')
      setSyncMessage('Ledger deleted successfully')
      setTimeout(() => {
        setSyncStatus('idle')
        onBack()
      }, 2000)
    } catch (error: unknown) {
      setSyncStatus('error')
      setSyncMessage(error instanceof Error ? error.message : 'Failed to delete ledger')
      setTimeout(() => setSyncStatus('idle'), 4000)
    } finally {
      setDeleting(false)
    }
  }, [dispatch, ledger.id, onBack])

  const handleRemoveEntry = useCallback(
    (entryId: string) => {
      void dispatch(removeLedgerEntry({ ledgerId: ledger.id, entryId }))
    },
    [dispatch, ledger.id]
  )

  const handleBulkRemoveEntries = useCallback(
    (entryIds: string[]) => {
      const runBulkRemove = async (): Promise<void> => {
        try {
          const removed = await dispatch(removeLedgerEntries({ ledgerId: ledger.id, entryIds })).unwrap()
          showSuccessSnackbar(`${removed.length} ${removed.length === 1 ? 'entry' : 'entries'} removed`)
        } catch (error: unknown) {
          showErrorSnackbar(
            typeof error === 'string' ? error : error instanceof Error ? error.message : 'Failed to remove entries'
          )
        }
      }
      void runBulkRemove()
    },
    [dispatch, ledger.id, showSuccessSnackbar, showErrorSnackbar]
  )

  const handleLinkTransactionSubmit = useCallback(
    async (transactionId: string) => {
      const transaction = transactions.find(t => t._id === transactionId)
      if (!transaction) return
      const direction = transaction.isCredit ? 'they_paid' : 'i_paid'
      try {
        await dispatch(
          linkTransactionToLedger({
            ledgerId: ledger.id,
            transactionId,
            direction,
            amount: Number(transaction.amount) || 0,
            narration: transaction.narration,
            transactionDate: transaction.transactionDate,
          })
        ).unwrap()
      } catch (error: unknown) {
        showErrorSnackbar(typeof error === 'string' ? error : 'Failed to link transaction')
      }
    },
    [transactions, ledger.id, dispatch, showErrorSnackbar]
  )

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: spacing[4] }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
      {/* Header with back button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[1], mb: spacing[1] }}>
        <Tooltip title='Back to ledger list'>
          <IconButton
            onClick={onBack}
            size='small'
          >
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Party name and balance */}
      <LedgerDetailHeader
        partyName={ledger.partyName}
        balance={balance}
      />

      {/* Entry summary statistics */}
      <LedgerEntrySummary entries={entries} />

      {/* Action buttons */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        gap={spacing[2]}
        sx={{ mb: spacing[2] }}
      >
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={handleAddTransaction}
          fullWidth={false}
        >
          Add Transaction
        </Button>
        {hasLocalChanges && (
          <Button
            variant='outlined'
            startIcon={syncing ? <CircularProgress size={20} /> : <CloudSyncIcon />}
            onClick={() => {
              void handleSyncLedgers()
            }}
            disabled={syncing}
            fullWidth={false}
            sx={{ animation: syncing ? 'none' : 'pulse 2s infinite' }}
          >
            {syncing ? 'Syncing...' : 'Sync to Server'}
          </Button>
        )}
        <Button
          variant='outlined'
          color='error'
          startIcon={<DeleteIcon />}
          onClick={() => setDeleteConfirmDialogOpen(true)}
          disabled={!canDeleteLedger || deleting}
          fullWidth={false}
        >
          Delete Ledger
        </Button>
      </Stack>

      {/* Entry list */}
      <Box>
        <Typography
          variant='h6'
          sx={{ fontWeight: 600, mb: spacing[2] }}
        >
          Transaction History
        </Typography>
        <LedgerEntryList
          entries={entries}
          transactions={transactionMap}
          onTransactionClick={onNavigateToTransaction}
          onDeleteEntry={handleRemoveEntry}
          onBulkRemove={handleBulkRemoveEntries}
        />
      </Box>

      {/* Link Transaction Dialog */}
      <LinkTransactionDialog
        open={addTransactionDialogOpen}
        onClose={() => setAddTransactionDialogOpen(false)}
        onSubmit={transactionId => {
          void handleLinkTransactionSubmit(transactionId)
        }}
        availableTransactions={availableTransactions}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmDialogOpen}
        onClose={() => setDeleteConfirmDialogOpen(false)}
      >
        <DialogTitle>Delete Ledger</DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: spacing[1] }}>
            Are you sure you want to delete this ledger? This action cannot be undone.
          </Typography>
          {!canDeleteLedger && (
            <Alert
              severity='warning'
              sx={{ mt: spacing[2] }}
            >
              This ledger has {entries.length} active {entries.length === 1 ? 'entry' : 'entries'}. Please remove all
              entries before deleting.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmDialogOpen(false)}>Cancel</Button>
          {canDeleteLedger && (
            <Button
              onClick={() => {
                void handleDeleteLedger()
              }}
              disabled={deleting}
              color='error'
              variant='contained'
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Sync Status Notification */}
      <Snackbar
        open={syncStatus !== 'idle'}
        autoHideDuration={4000}
        onClose={() => setSyncStatus('idle')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={syncStatus === 'success' ? 'success' : 'error'}
          sx={{ width: '100%' }}
        >
          {syncMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}
