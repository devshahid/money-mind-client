import { JSX, useEffect, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useForm } from 'react-hook-form'
import { useOutletContext } from 'react-router-dom'

import { LayoutContextType } from '../../../layouts/main'
import { axiosClient } from '../../../shared/services/axiosClient'
import { useResponsive } from '../../../shared/hooks/useResponsive'
import { CustomModal } from '../../../shared/components/CustomModal'
import { spacing } from '../../../shared/theme'

type DebtDetails = {
  _id?: string
  debtName: string
  startDate: string
  expectedEndDate: string
  totalAmount: number
  remainingAmount: number
  interestRate: number
  debtStatus: string
  monthlyExpectedEMI: number
  monthlyActualEMI: number
  partPayment: number
  paymentDate: string
  lender: string
}

const columns = [
  { id: 'debtName', label: 'Debt Name' },
  { id: 'startDate', label: 'Start Date' },
  { id: 'expectedEndDate', label: 'End Date' },
  { id: 'totalAmount', label: 'Total' },
  { id: 'remainingAmount', label: 'Remaining' },
  { id: 'interestRate', label: 'Interest' },
  { id: 'debtStatus', label: 'Status' },
]

const DebtsPage = (): JSX.Element => {
  const { setHeader } = useOutletContext<LayoutContextType>()
  const { isMobile } = useResponsive()

  const [debts, setDebts] = useState<DebtDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [openModal, setOpenModal] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { register, handleSubmit, reset } = useForm<DebtDetails>()

  useEffect(() => {
    setHeader('Debts', 'Manage your loans and EMI schedules')
  }, [setHeader])

  useEffect(() => {
    void fetchDebts()
  }, [])

  const fetchDebts = async (): Promise<void> => {
    setLoading(true)
    try {
      type ApiResponse = {
        output: Array<{
          debtDetails: DebtDetails
          _id: string
        }>
      }
      const response = await axiosClient.get<ApiResponse>('debt/list-debts')
      const debtData = response.data.output.map(item => ({
        ...item.debtDetails,
        _id: item._id,
      }))
      setDebts(debtData)
    } catch (error) {
      console.error('Error fetching debts:', error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = (data: DebtDetails): void => {
    setDebts([...debts, data])
    setOpenModal(false)
    reset()
  }

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'warning'
      case 'paid':
      case 'completed':
        return 'success'
      case 'overdue':
        return 'error'
      default:
        return 'default'
    }
  }

  const formatCurrency = (amount: number): string => `₹${Number(amount || 0).toLocaleString('en-IN')}`

  // --- Mobile Card View ---
  const renderMobileCards = (): JSX.Element => {
    if (loading) {
      return (
        <Box sx={{ p: spacing[2] }}>
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton
              key={idx}
              variant='rounded'
              height={80}
              sx={{ mb: spacing[2], borderRadius: 2 }}
            />
          ))}
        </Box>
      )
    }

    if (debts.length === 0) {
      return (
        <Box sx={{ py: spacing[10], textAlign: 'center' }}>
          <Typography
            variant='h6'
            color='text.secondary'
          >
            No debt details available
          </Typography>
        </Box>
      )
    }

    return (
      <Box sx={{ p: spacing[1] }}>
        {debts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((debt, idx) => (
          <Card
            key={debt._id || idx}
            elevation={1}
            onClick={() => setExpandedId(expandedId === (debt._id || String(idx)) ? null : debt._id || String(idx))}
            sx={{ mb: spacing[2], cursor: 'pointer' }}
          >
            <CardContent sx={{ p: spacing[3], '&:last-child': { pb: spacing[3] } }}>
              {/* Summary */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing[2] }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant='body1'
                    fontWeight={600}
                  >
                    {debt.debtName || '—'}
                  </Typography>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                  >
                    {debt.lender ? `Lender: ${debt.lender}` : ''}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                  <Typography
                    variant='body1'
                    fontWeight='bold'
                    color='error.main'
                  >
                    {formatCurrency(debt.remainingAmount)}
                  </Typography>
                  <Chip
                    label={debt.debtStatus || 'Active'}
                    size='small'
                    color={getStatusColor(debt.debtStatus)}
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Box>

              {/* Expanded details */}
              <Collapse in={expandedId === (debt._id || String(idx))}>
                <Divider sx={{ my: spacing[2] }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                  <DetailRow
                    label='Total Amount'
                    value={formatCurrency(debt.totalAmount)}
                  />
                  <DetailRow
                    label='Interest Rate'
                    value={`${debt.interestRate}%`}
                  />
                  <DetailRow
                    label='Monthly EMI'
                    value={formatCurrency(debt.monthlyExpectedEMI)}
                  />
                  <DetailRow
                    label='Start Date'
                    value={debt.startDate ? new Date(debt.startDate).toLocaleDateString() : '—'}
                  />
                  <DetailRow
                    label='End Date'
                    value={debt.expectedEndDate ? new Date(debt.expectedEndDate).toLocaleDateString() : '—'}
                  />
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        ))}
      </Box>
    )
  }

  // --- Desktop Table View ---
  const renderDesktopTable = (): JSX.Element => {
    if (loading) {
      return <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />
    }

    if (debts.length === 0) {
      return (
        <Box sx={{ py: spacing[10], textAlign: 'center' }}>
          <Typography
            variant='h6'
            color='text.secondary'
          >
            No debt details available
          </Typography>
        </Box>
      )
    }

    return (
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map(col => (
                <TableCell
                  key={col.id}
                  sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {debts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((debt, idx) => (
              <TableRow
                hover
                key={debt._id || idx}
              >
                <TableCell>{debt.debtName}</TableCell>
                <TableCell>{debt.startDate ? new Date(debt.startDate).toLocaleDateString() : '—'}</TableCell>
                <TableCell>
                  {debt.expectedEndDate ? new Date(debt.expectedEndDate).toLocaleDateString() : '—'}
                </TableCell>
                <TableCell>{formatCurrency(debt.totalAmount)}</TableCell>
                <TableCell sx={{ color: 'error.main', fontWeight: 600 }}>
                  {formatCurrency(debt.remainingAmount)}
                </TableCell>
                <TableCell>{debt.interestRate}%</TableCell>
                <TableCell>
                  <Chip
                    label={debt.debtStatus || 'Active'}
                    size='small'
                    color={getStatusColor(debt.debtStatus)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )
  }

  return (
    <Box sx={{ p: spacing[2] }}>
      {/* Header Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: spacing[2] }}>
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
          sx={{ minHeight: 44 }}
        >
          Add Debt
        </Button>
      </Box>

      {/* Content */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {isMobile ? renderMobileCards() : renderDesktopTable()}

        <TablePagination
          component='div'
          count={debts.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => {
            setRowsPerPage(parseInt(e.target.value, 10))
            setPage(0)
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      {/* Create Debt Modal */}
      <CustomModal
        modalOpen={openModal}
        onClose={() => {
          setOpenModal(false)
          reset()
        }}
      >
        <Box
          component='form'
          onSubmit={e => {
            void handleSubmit(onSubmit)(e)
          }}
        >
          <Typography
            variant='h6'
            sx={{ mb: spacing[3] }}
          >
            Create Debt
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
            <TextField
              label='Debt Name'
              fullWidth
              {...register('debtName')}
            />
            <TextField
              label='Lender'
              fullWidth
              {...register('lender')}
            />

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: spacing[2] }}>
              <TextField
                label='Start Date'
                type='date'
                fullWidth
                InputLabelProps={{ shrink: true }}
                {...register('startDate')}
              />
              <TextField
                label='End Date'
                type='date'
                fullWidth
                InputLabelProps={{ shrink: true }}
                {...register('expectedEndDate')}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: spacing[2] }}>
              <TextField
                label='Total Amount'
                type='number'
                fullWidth
                {...register('totalAmount')}
              />
              <TextField
                label='Remaining'
                type='number'
                fullWidth
                {...register('remainingAmount')}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: spacing[2] }}>
              <TextField
                label='Interest Rate (%)'
                type='number'
                fullWidth
                {...register('interestRate')}
              />
              <TextField
                label='Status'
                fullWidth
                {...register('debtStatus')}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: spacing[2] }}>
              <TextField
                label='Monthly EMI'
                type='number'
                fullWidth
                {...register('monthlyExpectedEMI')}
              />
              <TextField
                label='Actual EMI'
                type='number'
                fullWidth
                {...register('monthlyActualEMI')}
              />
            </Box>

            <Button
              type='submit'
              variant='contained'
              fullWidth
              sx={{ mt: spacing[2], minHeight: 44 }}
            >
              Submit
            </Button>
          </Box>
        </Box>
      </CustomModal>
    </Box>
  )
}

// Helper component for mobile card details
const DetailRow = ({ label, value }: { label: string; value: string }): JSX.Element => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
    <Typography
      variant='caption'
      color='text.secondary'
    >
      {label}
    </Typography>
    <Typography
      variant='body2'
      fontWeight={500}
    >
      {value}
    </Typography>
  </Box>
)

export { DebtsPage }
