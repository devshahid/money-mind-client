import React, { useState } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material'
import { Upload, FileText, CheckCircle } from 'lucide-react'
import * as XLSX from 'xlsx'
import dayjs from 'dayjs'
import { useDispatch } from 'react-redux'

import type { AppDispatch } from '../../../store'
import { importSchedule } from '../store/debtSlice'
import { formatCurrency } from '../utils/formatCurrency'

interface ScheduleImporterProps {
  open: boolean
  onClose: () => void
  debtId: string
  onSuccess: () => void
}

interface ParsedScheduleItem {
  month: number
  dueDate: string
  expectedAmount: number
  principalComponent: number
  interestComponent: number
  expectedBalance: number
}

const ScheduleImporter: React.FC<ScheduleImporterProps> = ({ open, onClose, debtId, onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>()
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedScheduleItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'upload' | 'preview' | 'success'>('upload')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    const ext = selectedFile.name.split('.').pop()?.toLowerCase()
    if (!['csv', 'xls', 'xlsx'].includes(ext || '')) {
      setError('Please upload a CSV or Excel file')
      return
    }

    setFile(selectedFile)
    setError(null)
    void parseFile(selectedFile)
  }

  const parseFile = (fileToRead: File): void => {
    setLoading(true)
    setError(null)

    try {
      const reader = new FileReader()
      reader.onload = (evt): void => {
        try {
          const arrayBuffer = evt.target?.result as ArrayBuffer
          const wb = XLSX.read(arrayBuffer, { type: 'array' })
          const ws = wb.Sheets[wb.SheetNames[0]]
          const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws, { defval: '' })

          if (rows.length === 0) {
            setError('The file contains no data rows.')
            setLoading(false)
            return
          }

          // Parse and validate rows
          const parsed: ParsedScheduleItem[] = rows
            .map((row, index) => {
              const keys = Object.keys(row)
              const monthKey = keys.find(k => /month/i.test(k)) || keys[0]
              const dateKey = keys.find(k => /date|due/i.test(k)) || keys[1]
              const amountKey = keys.find(k => /amount|emi|payment/i.test(k)) || keys[2]
              const principalKey = keys.find(k => /principal/i.test(k))
              const interestKey = keys.find(k => /interest/i.test(k))
              const balanceKey = keys.find(k => /balance/i.test(k))

              return {
                month: Number(row[monthKey]) || index + 1,
                dueDate: dayjs(row[dateKey] as string).format('YYYY-MM-DD'),
                expectedAmount: Number(row[amountKey]) || 0,
                principalComponent: principalKey ? Number(row[principalKey]) || 0 : 0,
                interestComponent: interestKey ? Number(row[interestKey]) || 0 : 0,
                expectedBalance: balanceKey ? Number(row[balanceKey]) || 0 : 0,
              }
            })
            .filter(item => item.expectedAmount > 0)

          if (parsed.length === 0) {
            setError('No valid schedule items found in the file.')
            setLoading(false)
            return
          }

          setParsedData(parsed)
          setStep('preview')
          setLoading(false)
        } catch {
          setError('Failed to parse the file. Please check the format.')
          setLoading(false)
        }
      }

      reader.onerror = (): void => {
        setError('Error reading the file.')
        setLoading(false)
      }

      reader.readAsArrayBuffer(fileToRead)
    } catch {
      setError('Failed to read the file.')
      setLoading(false)
    }
  }

  const handleImport = async (): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      await dispatch(importSchedule({ debtId, scheduleData: parsedData })).unwrap()
      setStep('success')
      setTimeout(() => {
        onSuccess()
        handleClose()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import schedule')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = (): void => {
    setFile(null)
    setParsedData([])
    setError(null)
    setStep('upload')
    setLoading(false)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='md'
      fullWidth
    >
      <DialogTitle>Import Repayment Schedule</DialogTitle>

      <DialogContent>
        {/* Upload Step */}
        {step === 'upload' && (
          <Box>
            <Typography
              variant='body2'
              color='text.secondary'
              mb={3}
            >
              Upload a CSV or Excel file with your repayment schedule. The file should include columns for: Month, Due
              Date, EMI Amount, Principal, Interest, and Balance.
            </Typography>

            {error && (
              <Alert
                severity='error'
                sx={{ mb: 2 }}
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}

            <Box
              sx={{
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Button
                component='label'
                variant='contained'
                startIcon={loading ? <CircularProgress size={20} /> : <Upload size={20} />}
                disabled={loading}
              >
                {loading ? 'Parsing...' : 'Choose File'}
                <input
                  type='file'
                  accept='.csv,.xls,.xlsx'
                  hidden
                  onChange={handleFileSelect}
                  disabled={loading}
                />
              </Button>
              {file && (
                <Box
                  mt={2}
                  display='flex'
                  alignItems='center'
                  justifyContent='center'
                  gap={1}
                >
                  <FileText size={18} />
                  <Typography variant='body2'>{file.name}</Typography>
                </Box>
              )}
            </Box>

            <Alert
              severity='info'
              sx={{ mt: 2 }}
            >
              <Typography
                variant='caption'
                display='block'
              >
                <strong>Example CSV format:</strong>
              </Typography>
              <Typography
                variant='caption'
                display='block'
                fontFamily='monospace'
              >
                Month, Due Date, EMI Amount, Principal, Interest, Balance
              </Typography>
              <Typography
                variant='caption'
                display='block'
                fontFamily='monospace'
              >
                1, 2026-01-15, 40000, 25000, 15000, 475000
              </Typography>
            </Alert>
          </Box>
        )}

        {/* Preview Step */}
        {step === 'preview' && (
          <Box>
            <Alert
              severity='success'
              sx={{ mb: 2 }}
            >
              Successfully parsed {parsedData.length} schedule items. Review and confirm to import.
            </Alert>

            <TableContainer
              component={Paper}
              sx={{ maxHeight: 400 }}
            >
              <Table
                stickyHeader
                size='small'
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Month</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell align='right'>EMI</TableCell>
                    <TableCell align='right'>Principal</TableCell>
                    <TableCell align='right'>Interest</TableCell>
                    <TableCell align='right'>Balance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parsedData.slice(0, 10).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.month}</TableCell>
                      <TableCell>{dayjs(item.dueDate).format('DD MMM YYYY')}</TableCell>
                      <TableCell align='right'>{formatCurrency(item.expectedAmount)}</TableCell>
                      <TableCell align='right'>{formatCurrency(item.principalComponent)}</TableCell>
                      <TableCell align='right'>{formatCurrency(item.interestComponent)}</TableCell>
                      <TableCell align='right'>{formatCurrency(item.expectedBalance)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {parsedData.length > 10 && (
              <Typography
                variant='caption'
                color='text.secondary'
                mt={1}
                display='block'
              >
                Showing first 10 of {parsedData.length} items...
              </Typography>
            )}

            {error && (
              <Alert
                severity='error'
                sx={{ mt: 2 }}
              >
                {error}
              </Alert>
            )}
          </Box>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <Box
            textAlign='center'
            py={4}
          >
            <CheckCircle
              size={64}
              color='green'
            />
            <Typography
              variant='h6'
              mt={2}
            >
              Schedule Imported Successfully!
            </Typography>
            <Typography
              variant='body2'
              color='text.secondary'
            >
              {parsedData.length} schedule items have been imported.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleClose}
          disabled={loading}
        >
          {step === 'success' ? 'Close' : 'Cancel'}
        </Button>
        {step === 'preview' && (
          <Button
            variant='contained'
            onClick={() => void handleImport()}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Confirm Import'}
          </Button>
        )}
        {step === 'upload' && (
          <Button
            onClick={() => setStep('preview')}
            disabled
          >
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export { ScheduleImporter }
