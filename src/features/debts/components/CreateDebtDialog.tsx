import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Tooltip,
} from '@mui/material'
import { Plus, Info } from 'lucide-react'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { Dayjs } from 'dayjs'

import { spacing, colors } from '../../../shared/theme'
import type { EMIType } from '../types/debt'

interface CreateDebtDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (debtData: DebtFormData) => void
  loading: boolean
}

export interface DebtFormData {
  debtDetails: {
    debtName: string
    startDate: string
    expectedEndDate: string
    totalAmount: number
    remainingAmount: number
    interestRate: number
    debtStatus: 'ACTIVE' | 'PAID' | 'OVERDUE'
    monthlyExpectedEMI: number
    monthlyActualEMI: number
    partPayment: number
    paymentDate: string
    lender: string
    emiType?: EMIType
    principalComponent?: number
    interestComponent?: number
  }
}

export const CreateDebtDialog = ({ open, onClose, onSubmit, loading }: CreateDebtDialogProps) => {
  const [debtName, setDebtName] = useState<string>('')
  const [lender, setLender] = useState<string>('')
  const [totalAmount, setTotalAmount] = useState<string>('')
  const [interestRate, setInterestRate] = useState<string>('')
  const [monthlyEMI, setMonthlyEMI] = useState<string>('')
  const [emiType, setEmiType] = useState<EMIType>('PRINCIPAL_AND_INTEREST')
  const [principalComponent, setPrincipalComponent] = useState<string>('')
  const [interestComponent, setInterestComponent] = useState<string>('')
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs())
  const [expectedEndDate, setExpectedEndDate] = useState<Dayjs | null>(dayjs().add(1, 'year'))
  const [nextPaymentDate, setNextPaymentDate] = useState<Dayjs | null>(dayjs().add(1, 'month'))
  const [error, setError] = useState<string>('')

  // Auto-calculate EMI breakdown when EMI type or amount changes
  useEffect(() => {
    const emi = parseFloat(monthlyEMI)
    const rate = parseFloat(interestRate)
    const principal = parseFloat(totalAmount)

    if (!isNaN(emi) && !isNaN(rate) && !isNaN(principal) && emi > 0) {
      if (emiType === 'INTEREST_ONLY') {
        // For interest-only loans, entire EMI is interest
        const monthlyInterest = (principal * rate) / (12 * 100)
        setPrincipalComponent('0')
        setInterestComponent(monthlyInterest.toFixed(2))
      } else {
        // For principal+interest, calculate monthly interest
        const monthlyInterest = (principal * rate) / (12 * 100)
        const principalPart = emi - monthlyInterest
        if (principalPart >= 0) {
          setPrincipalComponent(principalPart.toFixed(2))
          setInterestComponent(monthlyInterest.toFixed(2))
        }
      }
    }
  }, [emiType, monthlyEMI, interestRate, totalAmount])

  const handleSubmit = () => {
    // Validation
    if (!debtName.trim()) {
      setError('Debt name is required')
      return
    }

    if (!lender.trim()) {
      setError('Lender name is required')
      return
    }

    const principal = parseFloat(totalAmount)
    if (isNaN(principal) || principal <= 0) {
      setError('Please enter a valid total amount')
      return
    }

    const rate = parseFloat(interestRate)
    if (isNaN(rate) || rate < 0 || rate > 100) {
      setError('Interest rate must be between 0 and 100')
      return
    }

    const emi = parseFloat(monthlyEMI)
    if (isNaN(emi) || emi <= 0) {
      setError('Please enter a valid monthly EMI')
      return
    }

    if (!startDate || !expectedEndDate || !nextPaymentDate) {
      setError('Please select all required dates')
      return
    }

    if (expectedEndDate.isBefore(startDate)) {
      setError('Expected end date must be after start date')
      return
    }

    setError('')

    const principal_part = parseFloat(principalComponent)
    const interest_part = parseFloat(interestComponent)

    const debtData: DebtFormData = {
      debtDetails: {
        debtName: debtName.trim(),
        lender: lender.trim(),
        startDate: startDate.format('YYYY-MM-DD'),
        expectedEndDate: expectedEndDate.format('YYYY-MM-DD'),
        totalAmount: principal,
        remainingAmount: principal,
        interestRate: rate,
        debtStatus: 'ACTIVE',
        monthlyExpectedEMI: emi,
        monthlyActualEMI: emi,
        partPayment: 0,
        paymentDate: nextPaymentDate.format('YYYY-MM-DD'),
        emiType: emiType,
        principalComponent: isNaN(principal_part) ? 0 : principal_part,
        interestComponent: isNaN(interest_part) ? 0 : interest_part,
      },
    }

    onSubmit(debtData)
    handleClose()
  }

  const handleClose = () => {
    setDebtName('')
    setLender('')
    setTotalAmount('')
    setInterestRate('')
    setMonthlyEMI('')
    setEmiType('PRINCIPAL_AND_INTEREST')
    setPrincipalComponent('')
    setInterestComponent('')
    setStartDate(dayjs())
    setExpectedEndDate(dayjs().add(1, 'year'))
    setNextPaymentDate(dayjs().add(1, 'month'))
    setError('')
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='md'
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
        <Plus
          size={24}
          color={colors.primary.blue}
        />
        Add New Debt
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert
            severity='error'
            sx={{ mb: spacing[2] }}
          >
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[2], mt: spacing[1] }}>
          <Typography
            variant='h6'
            sx={{ fontSize: '16px', fontWeight: 600 }}
          >
            Basic Information
          </Typography>

          <Box sx={{ display: 'flex', gap: spacing[2] }}>
            <TextField
              label='Debt Name'
              value={debtName}
              onChange={e => setDebtName(e.target.value)}
              fullWidth
              required
              placeholder='e.g., Home Loan, Car Loan, Personal Loan'
            />
            <TextField
              label='Lender'
              value={lender}
              onChange={e => setLender(e.target.value)}
              fullWidth
              required
              placeholder='e.g., HDFC Bank, SBI'
            />
          </Box>

          <Typography
            variant='h6'
            sx={{ fontSize: '16px', fontWeight: 600, mt: spacing[1] }}
          >
            Financial Details
          </Typography>

          <Box sx={{ display: 'flex', gap: spacing[2] }}>
            <TextField
              label='Total Amount (Principal)'
              type='number'
              value={totalAmount}
              onChange={e => setTotalAmount(e.target.value)}
              fullWidth
              required
              InputProps={{
                startAdornment: <Typography sx={{ mr: spacing[1] }}>₹</Typography>,
              }}
            />
            <TextField
              label='Interest Rate'
              type='number'
              value={interestRate}
              onChange={e => setInterestRate(e.target.value)}
              fullWidth
              required
              InputProps={{
                endAdornment: <Typography sx={{ ml: spacing[1] }}>% p.a.</Typography>,
              }}
            />
          </Box>

          <TextField
            label='Monthly EMI'
            type='number'
            value={monthlyEMI}
            onChange={e => setMonthlyEMI(e.target.value)}
            fullWidth
            required
            InputProps={{
              startAdornment: <Typography sx={{ mr: spacing[1] }}>₹</Typography>,
            }}
            helperText='Expected monthly payment amount'
          />

          <FormControl component='fieldset'>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[1], mb: spacing[1] }}>
              <FormLabel component='legend'>EMI Payment Type</FormLabel>
              <Tooltip title='Interest-only: Only interest is paid, principal remains same. Principal+Interest: Both principal and interest are paid monthly.'>
                <Info
                  size={16}
                  color={colors.grayscale.medium}
                />
              </Tooltip>
            </Box>
            <RadioGroup
              row
              value={emiType}
              onChange={e => setEmiType(e.target.value as EMIType)}
            >
              <FormControlLabel
                value='PRINCIPAL_AND_INTEREST'
                control={<Radio />}
                label='Principal + Interest (Standard)'
              />
              <FormControlLabel
                value='INTEREST_ONLY'
                control={<Radio />}
                label='Interest Only'
              />
            </RadioGroup>
          </FormControl>

          {monthlyEMI && interestRate && totalAmount && (
            <Box
              sx={{
                p: spacing[2],
                backgroundColor: theme =>
                  theme.palette.mode === 'light' ? colors.background.lavender : 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                border: `1px solid ${colors.grayscale.lightGray}`,
              }}
            >
              <Typography
                variant='body2'
                sx={{ fontWeight: 600, mb: spacing[1] }}
              >
                EMI Breakdown (Approximate)
              </Typography>
              <Box sx={{ display: 'flex', gap: spacing[3] }}>
                <Box>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                  >
                    Principal Component
                  </Typography>
                  <Typography
                    variant='body1'
                    sx={{ fontWeight: 600 }}
                  >
                    ₹{principalComponent ? parseFloat(principalComponent).toLocaleString('en-IN') : '0'}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                  >
                    Interest Component
                  </Typography>
                  <Typography
                    variant='body1'
                    sx={{ fontWeight: 600 }}
                  >
                    ₹{interestComponent ? parseFloat(interestComponent).toLocaleString('en-IN') : '0'}
                  </Typography>
                </Box>
              </Box>
              {emiType === 'INTEREST_ONLY' && (
                <Alert
                  severity='warning'
                  sx={{ mt: spacing[2] }}
                >
                  With interest-only payments, your principal balance will not reduce. This extends the debt timeline
                  significantly.
                </Alert>
              )}
            </Box>
          )}

          <Typography
            variant='h6'
            sx={{ fontSize: '16px', fontWeight: 600, mt: spacing[1] }}
          >
            Timeline
          </Typography>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: 'flex', gap: spacing[2] }}>
              <DatePicker
                label='Start Date'
                value={startDate}
                onChange={newValue => setStartDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
              <DatePicker
                label='Expected End Date'
                value={expectedEndDate}
                onChange={newValue => setExpectedEndDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
            </Box>

            <DatePicker
              label='Next Payment Date'
              value={nextPaymentDate}
              onChange={newValue => setNextPaymentDate(newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                },
              }}
            />
          </LocalizationProvider>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Debt'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
