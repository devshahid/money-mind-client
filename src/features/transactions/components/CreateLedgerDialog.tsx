/**
 * CreateLedgerDialog Component
 *
 * Modal dialog for creating a new ledger.
 * Validates party name (1-100 characters) and prevents duplicates.
 */

import { JSX, useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material'

import { useAppDispatch, useAppSelector } from '@/shared/hooks/slice-hooks'
import { createLedger, selectLedgerLoading, selectLedgerError } from '../store/ledgerSlice'
import { spacing } from '@/shared/theme'

interface CreateLedgerDialogProps {
  open: boolean
  onClose: () => void
  onCreateSuccess?: () => void
  existingParties?: string[]
}

/**
 * CreateLedgerDialog - Modal form for creating new ledgers
 */
export const CreateLedgerDialog = ({
  open,
  onClose,
  onCreateSuccess,
  existingParties = [],
}: CreateLedgerDialogProps): JSX.Element => {
  const dispatch = useAppDispatch()
  const loading = useAppSelector(selectLedgerLoading)
  const error = useAppSelector(selectLedgerError)

  const [partyName, setPartyName] = useState('')
  const [validationError, setValidationError] = useState('')

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setPartyName('')
      setValidationError('')
    }
  }, [open])

  const validateInput = (value: string): string => {
    const trimmed = value.trim()

    // Check if empty
    if (!trimmed) {
      return 'Party name is required'
    }

    // Check length
    if (trimmed.length > 100) {
      return 'Party name cannot exceed 100 characters'
    }

    // Check for duplicates (case-insensitive)
    if (existingParties.some(p => p.toLowerCase() === trimmed.toLowerCase())) {
      return 'A ledger for this party already exists'
    }

    return ''
  }

  const handlePartyNameChange = (value: string): void => {
    setPartyName(value)
    if (validationError) {
      setValidationError(validateInput(value))
    }
  }

  const handleSubmit = async (): Promise<void> => {
    const error = validateInput(partyName)
    if (error) {
      setValidationError(error)
      return
    }

    const result = await dispatch(createLedger({ partyName: partyName.trim() }))

    if (result.meta.requestStatus === 'fulfilled') {
      setPartyName('')
      setValidationError('')
      onClose()
      onCreateSuccess?.()
    }
  }

  const handleClose = (): void => {
    if (!loading) {
      setPartyName('')
      setValidationError('')
      onClose()
    }
  }

  const isDisabled = loading || !partyName.trim() || Boolean(validationError && validationError.length > 0)

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='sm'
      fullWidth
    >
      <DialogTitle>Create Ledger</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: spacing[2], pt: spacing[2] }}>
        {error && <Alert severity='error'>{error}</Alert>}

        <TextField
          autoFocus
          label='Party Name'
          value={partyName}
          onChange={e => handlePartyNameChange(e.target.value)}
          placeholder='e.g., John, Restaurant ABC...'
          fullWidth
          error={Boolean(validationError)}
          helperText={validationError}
          disabled={loading}
          inputProps={{ maxLength: 100 }}
        />

        <TextField
          label='Characters'
          value={`${partyName.length}/100`}
          disabled
          size='small'
          slotProps={{ input: { readOnly: true } }}
        />
      </DialogContent>
      <DialogActions sx={{ p: spacing[2] }}>
        <Button
          onClick={handleClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            void handleSubmit()
          }}
          variant='contained'
          disabled={isDisabled}
          sx={{ minWidth: 100 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
