import React, { useEffect, useState } from 'react'
import { Box, Button, CircularProgress, Container, Paper, Tab, Tabs, Typography } from '@mui/material'
import { ArrowLeft, Download, Upload } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams, useOutletContext } from 'react-router-dom'

import { AppDispatch, RootState } from '../../../store'
import { LayoutContextType } from '../../../layouts/main'
import { AppRoute } from '../../../routes'
import {
  getDetailedDebt,
  getSchedule,
  getLinkedTransactions,
  clearPaymentHistory,
  clearPayoffProjection,
} from '../store/debtSlice'
import { DebtOverviewCard } from '../components/DebtOverviewCard'
import { RepaymentScheduleTable } from '../components/RepaymentScheduleTable'
import { LinkedTransactionsPanel } from '../components/LinkedTransactionsPanel'
import { ScheduleImporter } from '../components/ScheduleImporter'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`debt-tabpanel-${index}`}
      aria-labelledby={`debt-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

const DebtDetailPage = (): React.JSX.Element => {
  const { debtId } = useParams<{ debtId: string }>()
  const { setHeader } = useOutletContext<LayoutContextType>()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const { detailedDebt, schedule, linkedTransactions, loading, error } = useSelector((state: RootState) => state.debts)

  const [activeTab, setActiveTab] = useState(0)
  const [importDialogOpen, setImportDialogOpen] = useState(false)

  useEffect(() => {
    if (debtId) {
      void dispatch(getDetailedDebt(debtId))
      void dispatch(getSchedule(debtId))
      void dispatch(getLinkedTransactions(debtId))
    }

    return () => {
      dispatch(clearPaymentHistory())
      dispatch(clearPayoffProjection())
    }
  }, [debtId, dispatch])

  useEffect(() => {
    if (detailedDebt?.debt) {
      setHeader(`${detailedDebt.debt.debtName || 'Debt'} Details`, 'Comprehensive debt overview')
    } else {
      setHeader('Debt Details', 'Loading...')
    }
  }, [detailedDebt, setHeader])

  const handleBack = (): void => {
    navigate(AppRoute.Debts)
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setActiveTab(newValue)
  }

  const handleImportSuccess = (): void => {
    setImportDialogOpen(false)
    if (debtId) {
      void dispatch(getSchedule(debtId))
    }
  }

  if (loading && !detailedDebt) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='60vh'
      >
        <CircularProgress />
      </Box>
    )
  }

  if (error && !detailedDebt) {
    return (
      <Container maxWidth='lg'>
        <Box py={4}>
          <Typography
            color='error'
            variant='h6'
          >
            {error}
          </Typography>
          <Button
            startIcon={<ArrowLeft size={20} />}
            onClick={handleBack}
            sx={{ mt: 2 }}
          >
            Back to Debts
          </Button>
        </Box>
      </Container>
    )
  }

  if (!detailedDebt?.debt) {
    return (
      <Container maxWidth='lg'>
        <Box py={4}>
          <Typography variant='h6'>Debt not found</Typography>
          <Button
            startIcon={<ArrowLeft size={20} />}
            onClick={handleBack}
            sx={{ mt: 2 }}
          >
            Back to Debts
          </Button>
        </Box>
      </Container>
    )
  }

  return (
    <Container
      maxWidth='xl'
      sx={{ py: 3 }}
    >
      {/* Header with Back Button */}
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        mb={3}
      >
        <Button
          startIcon={<ArrowLeft size={20} />}
          onClick={handleBack}
          variant='outlined'
        >
          Back to Debts
        </Button>
        <Box
          gap={2}
          display='flex'
        >
          <Button
            startIcon={<Upload size={20} />}
            variant='outlined'
            onClick={() => setImportDialogOpen(true)}
          >
            Import Schedule
          </Button>
          <Button
            startIcon={<Download size={20} />}
            variant='outlined'
            disabled
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Overview Section */}
      <DebtOverviewCard debt={detailedDebt.debt} />

      {/* Tabs Section */}
      <Paper sx={{ mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label='debt detail tabs'
          >
            <Tab label='Repayment Schedule' />
            <Tab label='Linked Transactions' />
            <Tab label='Analytics' />
          </Tabs>
        </Box>

        <TabPanel
          value={activeTab}
          index={0}
        >
          <RepaymentScheduleTable
            debtId={debtId || ''}
            schedule={schedule?.scheduleItems ?? null}
            loading={loading}
          />
        </TabPanel>

        <TabPanel
          value={activeTab}
          index={1}
        >
          <LinkedTransactionsPanel
            debtId={debtId || ''}
            transactions={linkedTransactions}
            loading={loading}
          />
        </TabPanel>

        <TabPanel
          value={activeTab}
          index={2}
        >
          <Box p={3}>
            <Typography
              variant='h6'
              color='text.secondary'
            >
              Analytics coming soon...
            </Typography>
            <Typography
              variant='body2'
              color='text.secondary'
              mt={1}
            >
              Charts showing payment history, principal vs interest breakdown, and payoff projections.
            </Typography>
          </Box>
        </TabPanel>
      </Paper>

      {/* Schedule Import Dialog */}
      {debtId && (
        <ScheduleImporter
          open={importDialogOpen}
          onClose={() => setImportDialogOpen(false)}
          debtId={debtId}
          onSuccess={handleImportSuccess}
        />
      )}
    </Container>
  )
}

export { DebtDetailPage }
