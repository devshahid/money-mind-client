/**
 * LedgerList Component
 *
 * Displays a list of ledgers in a responsive format:
 * - Table view for desktop (≥960px)
 * - Card view for mobile (<960px)
 */

import { JSX, useContext, useMemo, useState, useCallback } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import CloudSyncIcon from '@mui/icons-material/CloudSync'

import type { ILedger } from '../types/ledger'
import { calculateBalance, getBalanceDirection } from '../utils/ledgerBalance'
import { useAppSelector, useAppDispatch } from '@/shared/hooks/slice-hooks'
import { RootState } from '@/store'
import { selectHasLocalChanges, syncLedgers } from '../store/ledgerSlice'
import { spacing, colors } from '@/shared/theme'
import { LedgerSummaryTotals } from './LedgerSummaryTotals'
import { commonTableHeadingStyles } from '@/constants'
import { ColorModeContext } from '@/shared/contexts/ThemeContext'

interface LedgerListProps {
  ledgers: ILedger[]
  searchText?: string
  onSelectLedger: (ledgerId: string) => void
  loading?: boolean
  currency?: string
}

/**
 * Format date to DD/MM/YYYY
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Get balance direction badge color and label
 */
const getBalanceBadgeProps = (balance: number): { color: 'success' | 'error' | 'default'; label: string } => {
  const direction = getBalanceDirection(balance)
  if (direction === 'they_owe') {
    return { color: 'success', label: 'They owe you' }
  }
  if (direction === 'you_owe') {
    return { color: 'error', label: 'You owe them' }
  }
  return { color: 'default', label: 'Settled' }
}

/**
 * Desktop Table Row
 */
const LedgerTableRow = ({
  ledger,
  balance,
  entryCount,
  onSelect,
}: {
  ledger: ILedger
  balance: number
  entryCount: number
  onSelect: () => void
}): JSX.Element => {
  const badgeProps = getBalanceBadgeProps(balance)
  return (
    <TableRow
      hover
      onClick={onSelect}
      sx={{ cursor: 'pointer' }}
    >
      <TableCell>
        <Typography variant='body2'>{ledger.partyName}</Typography>
      </TableCell>
      <TableCell align='right'>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: spacing[1] }}>
          <Typography
            variant='body2'
            sx={{ fontWeight: 500 }}
          >
            ₹{Math.abs(balance).toFixed(2)}
          </Typography>
          <Chip
            label={badgeProps.label}
            size='small'
            color={badgeProps.color}
            variant='outlined'
          />
        </Box>
      </TableCell>
      <TableCell align='center'>
        <Typography variant='body2'>{entryCount}</Typography>
      </TableCell>
      <TableCell align='right'>
        <Typography
          variant='caption'
          color='text.secondary'
        >
          {formatDate(ledger.createdAt)}
        </Typography>
      </TableCell>
    </TableRow>
  )
}

/**
 * Mobile Card
 */
const LedgerCard = ({
  ledger,
  balance,
  entryCount,
  onSelect,
}: {
  ledger: ILedger
  balance: number
  entryCount: number
  onSelect: () => void
}): JSX.Element => {
  const badgeProps = getBalanceBadgeProps(balance)
  return (
    <Card
      onClick={onSelect}
      sx={{
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 2,
        },
        transition: 'boxShadow 0.3s',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing[2] }}>
          <Box>
            <Typography
              variant='subtitle1'
              sx={{ fontWeight: 600 }}
            >
              {ledger.partyName}
            </Typography>
            <Box sx={{ display: 'flex', gap: spacing[2], mt: spacing[1] }}>
              <Typography
                variant='caption'
                color='text.secondary'
              >
                {formatDate(ledger.createdAt)}
              </Typography>
              <Typography
                variant='caption'
                color='text.secondary'
              >
                {entryCount} transactions
              </Typography>
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography
              variant='h6'
              sx={{ fontWeight: 600, color: colors.semantic.success }}
            >
              ₹{Math.abs(balance).toFixed(2)}
            </Typography>
            <Chip
              label={badgeProps.label}
              size='small'
              color={badgeProps.color}
              variant='outlined'
              sx={{ mt: spacing[1] }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

/**
 * LedgerList - Responsive ledger list/table
 */
export const LedgerList = ({
  ledgers,
  searchText = '',
  onSelectLedger,
  loading = false,
  currency = '₹',
}: LedgerListProps): JSX.Element => {
  const theme = useTheme()
  const { mode } = useContext(ColorModeContext)
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const dispatch = useAppDispatch()
  const allEntries = useAppSelector((state: RootState) => state.ledgers.entries)
  const hasLocalChanges = useAppSelector(selectHasLocalChanges)

  const [syncing, setSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [syncMessage, setSyncMessage] = useState('')

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

  // Filter ledgers based on search text
  const filteredLedgers = useMemo(() => {
    if (!searchText.trim()) return ledgers
    const lowerSearch = searchText.toLowerCase()
    return ledgers.filter(l => l.partyName.toLowerCase().includes(lowerSearch))
  }, [ledgers, searchText])

  // Calculate balances for each ledger
  const ledgersWithBalances = useMemo(() => {
    return filteredLedgers.map(ledger => {
      const entries = allEntries.filter(e => e.ledgerId === ledger.id)
      const balance = calculateBalance(
        entries.map(e => ({
          direction: e.direction,
          amount: e.amount,
        }))
      )
      return { ledger, balance, entryCount: entries.length }
    })
  }, [filteredLedgers, allEntries])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: spacing[4] }}>
        <CircularProgress />
      </Box>
    )
  }

  if (ledgersWithBalances.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: spacing[4] }}>
        <Typography
          color='text.secondary'
          sx={{ mb: spacing[2] }}
        >
          {searchText
            ? `No ledgers found matching “${searchText}”`
            : 'No ledgers yet. Create your first ledger to get started!'}
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
      {/* Sync button - only show when there are local changes */}
      {hasLocalChanges && (
        <Stack
          direction='row'
          gap={spacing[2]}
          sx={{ alignItems: 'center' }}
        >
          <Alert
            severity='info'
            sx={{ flex: 1 }}
          >
            You have unsaved changes. Click “Sync to Server” to save them.
          </Alert>
          <Button
            variant='contained'
            startIcon={syncing ? <CircularProgress size={20} /> : <CloudSyncIcon />}
            onClick={() => {
              void handleSyncLedgers()
            }}
            disabled={syncing}
            sx={{ whiteSpace: 'nowrap' }}
          >
            {syncing ? 'Syncing...' : 'Sync to Server'}
          </Button>
        </Stack>
      )}

      {/* Summary totals */}
      <LedgerSummaryTotals
        ledgers={ledgersWithBalances.map(l => ({ balance: l.balance }))}
        currency={currency}
      />

      {/* List/Table */}
      {isMobile ? (
        // Mobile: Card view
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
          {ledgersWithBalances.map(({ ledger, balance, entryCount }) => (
            <LedgerCard
              key={ledger.id}
              ledger={ledger}
              balance={balance}
              entryCount={entryCount}
              onSelect={() => onSelectLedger(ledger.id)}
            />
          ))}
        </Box>
      ) : (
        // Desktop: Table view
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...commonTableHeadingStyles(mode) }}>Party Name</TableCell>
                <TableCell
                  align='right'
                  sx={{ ...commonTableHeadingStyles(mode) }}
                >
                  Outstanding Balance
                </TableCell>
                <TableCell
                  align='center'
                  sx={{ ...commonTableHeadingStyles(mode) }}
                >
                  Transactions
                </TableCell>
                <TableCell
                  align='right'
                  sx={{ ...commonTableHeadingStyles(mode) }}
                >
                  Created Date
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ledgersWithBalances.map(({ ledger, balance, entryCount }) => (
                <LedgerTableRow
                  key={ledger.id}
                  ledger={ledger}
                  balance={balance}
                  entryCount={entryCount}
                  onSelect={() => onSelectLedger(ledger.id)}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

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
