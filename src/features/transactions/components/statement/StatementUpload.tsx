import React, { useState } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import * as XLSX from 'xlsx'

import { uploadStatementFile, parsePdf, checkDuplicates } from '../../services/statementService'
import { listTransactions } from '../../store/transactionSlice'
import { useAppDispatch, useAppSelector } from '../../../../shared/hooks/slice-hooks'
import { useSnackbar } from '../../../../shared/contexts/SnackBarContext'
import { RootState } from '../../../../store'
import { StatementPreviewTable } from './StatementPreviewTable'
import type { PreviewRow } from './StatementPreviewTable'
import { ITransaction } from '../../types/transaction'

const ACCEPTED_FORMATS = '.csv,.xls,.xlsx,.pdf'
const STEPS = ['Select File', 'Enter Bank Name', 'Preview & Confirm']

interface StatementUploadProps {
  open: boolean
  onClose: () => void
}

const StatementUpload: React.FC<StatementUploadProps> = ({ open, onClose }) => {
  const dispatch = useAppDispatch()
  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar()
  const { page, limit } = useAppSelector((state: RootState) => state.transactions)

  const [activeStep, setActiveStep] = useState(0)
  const [file, setFile] = useState<File | null>(null)
  const [bankName, setBankName] = useState('')
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)

  const resetState = (): void => {
    setActiveStep(0)
    setFile(null)
    setBankName('')
    setPreviewRows([])
    setLoading(false)
    setImporting(false)
  }

  const handleClose = (): void => {
    resetState()
    onClose()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const selected = e.target.files?.[0]
    if (!selected) return

    const ext = selected.name.split('.').pop()?.toLowerCase() ?? ''
    if (!['csv', 'xls', 'xlsx', 'pdf'].includes(ext)) {
      showErrorSnackbar('Unsupported file format. Please upload CSV, XLS, XLSX, or PDF.')
      return
    }

    setFile(selected)
    setActiveStep(1)
  }

  const handleBankNameConfirm = (): void => {
    if (!bankName.trim()) {
      showErrorSnackbar('Please enter a bank name before proceeding.')
      return
    }
    void parseAndPreview()
  }

  const parseClientSide = (fileToRead: File): Promise<Partial<ITransaction>[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (evt): void => {
        try {
          const arrayBuffer = evt.target?.result as ArrayBuffer
          const wb = XLSX.read(arrayBuffer, { type: 'array' })
          const ws = wb.Sheets[wb.SheetNames[0]]
          const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(ws, { defval: '' })

          if (rows.length === 0) {
            reject(new Error('The file contains no data rows.'))
            return
          }

          const transactions: Partial<ITransaction>[] = rows.map(row => {
            const keys = Object.keys(row)
            const dateKey: string = keys.find(k => /date/i.test(k)) ?? keys[0]
            const narrationKey: string = keys.find(k => /narration|description|particular/i.test(k)) ?? keys[1]
            const withdrawKey = keys.find(k => /withdraw|debit/i.test(k))
            const depositKey = keys.find(k => /deposit|credit/i.test(k))
            const amountKey = keys.find(k => /amount/i.test(k))

            let amount = '0'
            let isCredit = false

            if (depositKey && row[depositKey] && Number(row[depositKey]) > 0) {
              amount = String(row[depositKey])
              isCredit = true
            } else if (withdrawKey && row[withdrawKey] && Number(row[withdrawKey]) > 0) {
              amount = String(row[withdrawKey])
              isCredit = false
            } else if (amountKey) {
              const val = Number(row[amountKey])
              amount = String(Math.abs(val))
              isCredit = val > 0
            }

            return {
              transactionDate: row[dateKey] ?? '',
              narration: row[narrationKey] ?? '',
              amount,
              isCredit,
              bankName: bankName.trim(),
            }
          })

          resolve(transactions)
        } catch {
          reject(new Error('Failed to parse the file. Please check the format.'))
        }
      }
      reader.onerror = (): void => reject(new Error('Error reading the file.'))
      reader.readAsArrayBuffer(fileToRead)
    })
  }

  const parseAndPreview = async (): Promise<void> => {
    if (!file) return
    setLoading(true)

    try {
      let parsed: Partial<ITransaction>[]
      const ext = file.name.split('.').pop()?.toLowerCase() ?? ''

      if (ext === 'pdf') {
        parsed = await parsePdf(file, bankName.trim())
      } else {
        parsed = await parseClientSide(file)
      }

      if (parsed.length === 0) {
        showErrorSnackbar('No transactions found in the file.')
        setLoading(false)
        return
      }

      // Check for duplicates
      const checkPayload = parsed.map(tx => ({
        transactionDate: tx.transactionDate ?? '',
        narration: tx.narration ?? '',
        amount: tx.amount ?? '0',
        bankName: tx.bankName ?? bankName.trim(),
      }))

      let duplicateIds: string[] = []
      try {
        const dupResult = await checkDuplicates(checkPayload)
        duplicateIds = dupResult.duplicateIds ?? []
      } catch {
        // Non-critical — proceed without duplicate info
      }

      const rows: PreviewRow[] = parsed.map((tx, idx) => ({
        transactionDate: tx.transactionDate ?? '',
        narration: tx.narration ?? '',
        amount: tx.amount ?? '0',
        isCredit: tx.isCredit ?? false,
        bankName: tx.bankName ?? bankName.trim(),
        isDuplicate: duplicateIds.includes(String(idx)),
        duplicateAction: 'skip' as const,
      }))

      setPreviewRows(rows)
      setActiveStep(2)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to parse the statement file.'
      showErrorSnackbar(message)
    } finally {
      setLoading(false)
    }
  }

  const handleDuplicateActionChange = (index: number, action: 'skip' | 'overwrite'): void => {
    setPreviewRows(prev => prev.map((row, i) => (i === index ? { ...row, duplicateAction: action } : row)))
  }

  const handleConfirmImport = async (): Promise<void> => {
    if (!file) return
    setImporting(true)

    try {
      // Filter out skipped duplicates
      const rowsToImport = previewRows.filter(row => !row.isDuplicate || row.duplicateAction === 'overwrite')

      if (rowsToImport.length === 0) {
        showErrorSnackbar('No transactions to import after skipping duplicates.')
        setImporting(false)
        return
      }

      await uploadStatementFile(file, bankName.trim())

      showSuccessSnackbar(`Successfully imported ${rowsToImport.length} transaction(s).`)

      // Refresh the transaction list
      void dispatch(listTransactions({ page: String(page), limit }))

      // Dispatch AI annotation suggestions for newly imported transactions
      // const newIds = imported.map((tx) => tx._id).filter(Boolean);
      // if (newIds.length > 0) {
      //     void dispatch(fetchAnnotationSuggestions(newIds));
      // }

      handleClose()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to import transactions.'
      showErrorSnackbar(message)
    } finally {
      setImporting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='lg'
      fullWidth
    >
      <DialogTitle>Upload Bank Statement</DialogTitle>
      <DialogContent>
        <Stepper
          activeStep={activeStep}
          sx={{ my: 2 }}
        >
          {STEPS.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step 0: File Selection */}
        {activeStep === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <Typography
              variant='body1'
              color='text.secondary'
              mb={2}
            >
              Select a bank statement file (CSV, XLS, XLSX, or PDF)
            </Typography>
            <Button
              variant='contained'
              component='label'
              startIcon={<CloudUploadIcon />}
            >
              Choose File
              <input
                type='file'
                accept={ACCEPTED_FORMATS}
                hidden
                onChange={handleFileSelect}
              />
            </Button>
          </Box>
        )}

        {/* Step 1: Bank Name */}
        {activeStep === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, gap: 2 }}>
            <Typography
              variant='body1'
              color='text.secondary'
            >
              Enter the bank name for this statement
            </Typography>
            <TextField
              label='Bank Name'
              value={bankName}
              onChange={e => setBankName(e.target.value)}
              sx={{ width: 300 }}
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') handleBankNameConfirm()
              }}
            />
            {file && (
              <Typography
                variant='body2'
                color='text.secondary'
              >
                File: {file.name}
              </Typography>
            )}
          </Box>
        )}

        {/* Step 2: Preview */}
        {activeStep === 2 && (
          <Box>
            <Typography
              variant='body2'
              color='text.secondary'
              mb={1}
            >
              {previewRows.length} transaction(s) found.
              {previewRows.filter(r => r.isDuplicate).length > 0 &&
                ` ${previewRows.filter(r => r.isDuplicate).length} duplicate(s) detected.`}
            </Typography>
            <StatementPreviewTable
              rows={previewRows}
              onDuplicateActionChange={handleDuplicateActionChange}
            />
          </Box>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleClose}
          disabled={importing}
        >
          Cancel
        </Button>
        {activeStep === 1 && (
          <>
            <Button
              onClick={() => setActiveStep(0)}
              disabled={loading}
            >
              Back
            </Button>
            <Button
              variant='contained'
              onClick={handleBankNameConfirm}
              disabled={loading || !bankName.trim()}
            >
              {loading ? <CircularProgress size={20} /> : 'Parse & Preview'}
            </Button>
          </>
        )}
        {activeStep === 2 && (
          <>
            <Button
              onClick={() => setActiveStep(1)}
              disabled={importing}
            >
              Back
            </Button>
            <Button
              variant='contained'
              onClick={() => void handleConfirmImport()}
              disabled={importing}
            >
              {importing ? <CircularProgress size={20} /> : 'Confirm Import'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}

export { StatementUpload }
