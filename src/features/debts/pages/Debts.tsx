import { useEffect, useState } from 'react'
import { Box, Button, Typography, Container } from '@mui/material'
import { Plus } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useOutletContext } from 'react-router-dom'

import { spacing } from '../../../shared/theme'
import { AppDispatch, RootState } from '../../../store'
import { LayoutContextType } from '../../../layouts/main'
import {
  listDebts,
  getDebtSummary,
  recordPayment,
  getPaymentHistory,
  getDebtStrategy,
  deleteDebt,
  createDebt,
  clearPaymentHistory,
  clearPayoffProjection,
} from '../store/debtSlice'
import { DebtSummaryCards } from '../components/DebtSummaryCards'
import { DebtListTable } from '../components/DebtListTable'
import { RecordPaymentDialog } from '../components/RecordPaymentDialog'
import { PaymentHistoryDialog } from '../components/PaymentHistoryDialog'
import { PayoffProjectionDialog } from '../components/PayoffProjectionDialog'
import { DebtStrategyPanel } from '../components/DebtStrategyPanel'
import { CreateDebtDialog, type DebtFormData } from '../components/CreateDebtDialog'
import type { IDebt } from '../types/debt'

const DebtsPage = () => {
  const { setHeader } = useOutletContext<LayoutContextType>()
  const dispatch = useDispatch<AppDispatch>()
  const { debts, summary, paymentHistory, payoffProjection, strategy, loading, error } = useSelector(
    (state: RootState) => state.debts
  )

  const [selectedDebt, setSelectedDebt] = useState<IDebt | null>(null)
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false)
  const [paymentHistoryOpen, setPaymentHistoryOpen] = useState(false)
  const [payoffProjectionOpen, setPayoffProjectionOpen] = useState(false)
  const [createDebtOpen, setCreateDebtOpen] = useState(false)

  useEffect(() => {
    setHeader('Debt Management', 'Track and manage your debts to become debt-free')
  }, [setHeader])

  useEffect(() => {
    void dispatch(listDebts())
    void dispatch(getDebtSummary())
  }, [dispatch])

  const handleRecordPayment = (debt: IDebt) => {
    setSelectedDebt(debt)
    setRecordPaymentOpen(true)
  }

  const handleSubmitPayment = async (payment: {
    debtId: string
    amount: number
    paymentDate: string
    notes?: string
  }): Promise<void> => {
    await dispatch(recordPayment(payment))
    setRecordPaymentOpen(false)
    setSelectedDebt(null)
    // Refresh debts and summary after payment
    void dispatch(listDebts())
    void dispatch(getDebtSummary())
  }

  const handleViewDetails = async (debtId: string): Promise<void> => {
    const debt = debts.find(d => d._id === debtId)
    if (debt) {
      setSelectedDebt(debt)
      // Fetch payment history for this debt
      await dispatch(getPaymentHistory(debtId))
      setPaymentHistoryOpen(true)
    }
  }

  const handleDeleteDebt = async (debtId: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this debt?')) {
      await dispatch(deleteDebt(debtId))
      void dispatch(getDebtSummary())
    }
  }

  const handleFetchStrategy = (monthlyIncome?: number, monthlyExpenses?: number): void => {
    void dispatch(getDebtStrategy({ monthlyIncome, monthlyExpenses }))
  }

  const handleCreateDebt = async (debtData: DebtFormData): Promise<void> => {
    await dispatch(createDebt(debtData))
    // Refresh debts and summary after creation
    void dispatch(listDebts())
    void dispatch(getDebtSummary())
    setCreateDebtOpen(false)
  }

  const handleClosePaymentHistory = (): void => {
    setPaymentHistoryOpen(false)
    setSelectedDebt(null)
    dispatch(clearPaymentHistory())
  }

  const handleClosePayoffProjection = (): void => {
    setPayoffProjectionOpen(false)
    setSelectedDebt(null)
    dispatch(clearPayoffProjection())
  }

  return (
    <Container maxWidth='xl'>
      <Box sx={{ py: spacing[3] }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: spacing[3] }}>
          <Typography
            variant='h4'
            sx={{ fontWeight: 700 }}
          >
            Debt Management
          </Typography>
          <Button
            variant='contained'
            startIcon={<Plus size={20} />}
            onClick={(): void => setCreateDebtOpen(true)}
          >
            Add Debt
          </Button>
        </Box>

        <DebtSummaryCards
          summary={summary}
          loading={loading && !debts.length}
          error={error}
        />

        <DebtStrategyPanel
          strategy={strategy}
          loading={loading}
          error={null}
          onFetchStrategy={handleFetchStrategy}
        />

        <Box sx={{ mb: spacing[3] }}>
          <Typography
            variant='h5'
            sx={{ fontWeight: 600, mb: spacing[2] }}
          >
            Your Debts
          </Typography>
          <DebtListTable
            debts={debts}
            onViewDetails={(debtId): void => void handleViewDetails(debtId)}
            onRecordPayment={handleRecordPayment}
            onDelete={(debtId): void => void handleDeleteDebt(debtId)}
          />
        </Box>

        <RecordPaymentDialog
          open={recordPaymentOpen}
          debt={selectedDebt}
          onClose={() => {
            setRecordPaymentOpen(false)
            setSelectedDebt(null)
          }}
          onSubmit={(payment): void => void handleSubmitPayment(payment)}
          loading={loading}
        />

        <CreateDebtDialog
          open={createDebtOpen}
          onClose={() => setCreateDebtOpen(false)}
          onSubmit={(data): void => void handleCreateDebt(data)}
          loading={loading}
        />

        <PaymentHistoryDialog
          open={paymentHistoryOpen}
          debtName={selectedDebt?.debtName || ''}
          paymentHistory={paymentHistory}
          loading={loading}
          error={error}
          onClose={handleClosePaymentHistory}
        />

        <PayoffProjectionDialog
          open={payoffProjectionOpen}
          debtName={selectedDebt?.debtName || ''}
          projection={payoffProjection}
          loading={loading}
          error={error}
          onClose={handleClosePayoffProjection}
        />
      </Box>
    </Container>
  )
}

export { DebtsPage }
