/**
 * BulkLinkLedgerDialog Component
 *
 * Modal dialog for linking multiple selected transactions to a ledger at once.
 * Payment direction is automatically determined by transaction's credit/debit nature:
 * - Credit (money received) = "they_paid"
 * - Debit (money spent) = "i_paid"
 */

import { JSX, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  FormLabel,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material'

import type { ILedger } from '../types/ledger'
import { spacing } from '@/shared/theme'

interface BulkLinkLedgerDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (ledgerId: string) => void | Promise<void>
  ledgers: ILedger[]
  selectedCount: number
  loading?: boolean
}

/**
 * BulkLinkLedgerDialog - Modal for linking multiple transactions to a ledger
 * Direction is auto-determined from transaction credit/debit status
 */
export const BulkLinkLedgerDialog = ({
  open,
  onClose,
  onSubmit,
  ledgers,
  selectedCount,
  loading = false,
}: BulkLinkLedgerDialogProps): JSX.Element => {
  const [selectedLedgerId, setSelectedLedgerId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (): Promise<void> => {
    if (!selectedLedgerId) return
    setSubmitting(true)
    try {
      await onSubmit(selectedLedgerId)
      handleClose()
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = (): void => {
    if (!loading) {
      setSelectedLedgerId(null)
      onClose()
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='sm'
      fullWidth
    >
      <DialogTitle>Link {selectedCount} Transaction(s) to Ledger</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: spacing[2], pt: spacing[2] }}>
        {/* Info alert */}
        <Alert severity='info'>
          These {selectedCount} transaction(s) will be linked to the selected ledger. Payment direction is automatically
          determined by whether money was received or spent.
        </Alert>

        {/* Ledger selection */}
        <Box>
          <FormLabel sx={{ mb: spacing[1], display: 'block', fontWeight: 500 }}>Select Ledger</FormLabel>
          {ledgers.length === 0 ? (
            <Typography
              color='text.secondary'
              variant='body2'
            >
              No ledgers available. Create a ledger first.
            </Typography>
          ) : (
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                maxHeight: 250,
                overflowY: 'auto',
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: spacing[3] }}>
                  <CircularProgress size={32} />
                </Box>
              ) : (
                <List sx={{ width: '100%', m: 0, p: 0 }}>
                  {ledgers.map(ledger => (
                    <ListItem
                      key={ledger.id}
                      disablePadding
                    >
                      <ListItemButton
                        selected={selectedLedgerId === ledger.id}
                        onClick={() => setSelectedLedgerId(ledger.id)}
                        sx={{ py: spacing[1] }}
                      >
                        <ListItemText
                          primary={ledger.partyName}
                          secondary={`Created: ${new Date(ledger.createdAt).toLocaleDateString()}`}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: spacing[2] }}>
        <Button
          onClick={handleClose}
          disabled={loading || submitting}
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            void handleSubmit()
          }}
          variant='contained'
          disabled={!selectedLedgerId || loading || submitting || ledgers.length === 0}
        >
          {submitting ? 'Linking…' : 'Link Transaction(s)'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
