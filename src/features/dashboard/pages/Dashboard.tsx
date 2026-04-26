import { Box, Stack, Card, CardContent, Typography, LinearProgress } from '@mui/material'
import { CreditCard, DollarSign, Package, Target } from 'lucide-react'
import dayjs from 'dayjs'

import './Dashboard.css'
import { useOutletContext } from 'react-router-dom'
import { LayoutContextType } from '../../../layouts/main'
import { JSX, useEffect, useMemo } from 'react'
import { CustomTable } from '../../transactions/components/Table'
import { useAppDispatch, useAppSelector } from '../../../shared/hooks/slice-hooks'
import { listTransactions } from '../../transactions/store/transactionSlice'
import { RootState } from '../../../store'
import { SummaryCard } from '../components/SummaryCard'
import { EMIReminderBanner } from '../components/EMIReminderBanner'
import { BudgetWarningBanner } from '../components/BudgetWarningBanner'
import { IGoal } from '../../goals/types/goal'
import { useSelector } from 'react-redux'

interface GoalSliceState {
  goals: IGoal[]
}

const DashboardPage = (): JSX.Element => {
  const dispatch = useAppDispatch()
  const { transactions } = useAppSelector((state: RootState) => state.transactions)
  const { userData } = useAppSelector((state: RootState) => state.auth)
  const goals = useSelector((state: { goals?: GoalSliceState }) => state.goals?.goals ?? [])

  const { setHeader } = useOutletContext<LayoutContextType>()

  useEffect(() => {
    let name = userData.fullName?.split(' ') || 'User'
    if (Array.isArray(name)) name = name[0]
    setHeader(`Welcome Back, ${name}`, 'It is the best time to manage your finances')
  }, [setHeader, userData])

  useEffect(() => {
    void dispatch(listTransactions({ page: '1', limit: '50' }))
  }, [dispatch])

  const now = dayjs()
  const currentMonth = now.month()
  const currentYear = now.year()

  const { totalBalance, monthlyIncome, monthlyExpenses } = useMemo(() => {
    let income = 0
    let expense = 0
    let balance = 0

    for (const tx of transactions) {
      const amt = parseFloat(tx.amount) || 0
      const d = dayjs(tx.transactionDate)
      if (tx.isCredit) {
        balance += amt
      } else {
        balance -= amt
      }
      if (d.month() === currentMonth && d.year() === currentYear) {
        if (tx.isCredit) income += amt
        else expense += amt
      }
    }
    return { totalBalance: balance, monthlyIncome: income, monthlyExpenses: expense }
  }, [transactions, currentMonth, currentYear])

  const activeGoalSavings = useMemo(() => {
    return goals.filter((g: IGoal) => !g.isAchieved).reduce((sum: number, g: IGoal) => sum + g.currentSavedAmount, 0)
  }, [goals])

  const activeGoals = useMemo(() => goals.filter((g: IGoal) => !g.isAchieved), [goals])

  const fmt = (n: number): string => `₹${Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

  return (
    <Box>
      {/* Banners */}
      <EMIReminderBanner />
      <BudgetWarningBanner />

      {/* Summary Cards */}
      <Stack
        direction='row'
        gap={2}
        padding={2}
        flexWrap='wrap'
      >
        <SummaryCard
          icon={Package}
          title='Total Balance'
          value={fmt(totalBalance)}
          color='#1976d2'
        />
        <SummaryCard
          icon={DollarSign}
          title='Income'
          value={fmt(monthlyIncome)}
          color='#2e7d32'
          subHeading='This month'
        />
        <SummaryCard
          icon={CreditCard}
          title='Expenses'
          value={fmt(monthlyExpenses)}
          color='#d32f2f'
          subHeading='This month'
        />
        <SummaryCard
          icon={Target}
          title='Goal Savings'
          value={fmt(activeGoalSavings)}
          color='#ed6c02'
          subHeading={`${activeGoals.length} active goal${activeGoals.length !== 1 ? 's' : ''}`}
        />
      </Stack>

      {/* Charts + Content placeholder */}
      <Stack
        flexWrap='wrap'
        gap={2}
        padding={2}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: { xs: '100%', md: '50%' }, minWidth: 0 }}>
            <Card>
              <CardContent>
                <Typography variant='h6'>Chart Area</Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: { xs: '100%', md: '30%' }, minWidth: 0 }}>
            <Card>
              <CardContent>
                <Typography variant='h6'>Content Area</Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Stack>

      {/* Recent Transactions + Goals */}
      <Stack
        flexWrap='wrap'
        gap={2}
        padding={2}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: { xs: '100%', md: '50%', borderRadius: 6, border: '1px solid #ccc' }, minWidth: 0 }}>
            <Typography variant='h4'>Recent Transactions</Typography>
            {transactions.length > 0 ? (
              <CustomTable
                type='mini'
                sx={{
                  overflow: 'auto',
                  height: '80vh',
                  '&::-webkit-scrollbar': { display: 'none' },
                }}
              />
            ) : (
              <Typography
                variant='h6'
                textAlign='center'
              >
                No Transactions Found
              </Typography>
            )}
          </Box>

          {/* Active Goals Progress */}
          <Box sx={{ flex: { xs: '100%', md: '30%' }, minWidth: 0 }}>
            <Card>
              <CardContent>
                <Typography
                  variant='h6'
                  sx={{ mb: 2 }}
                >
                  Saving Goals
                </Typography>
                {activeGoals.length === 0 ? (
                  <Typography
                    variant='body2'
                    color='text.secondary'
                  >
                    No active goals
                  </Typography>
                ) : (
                  <Stack spacing={2}>
                    {activeGoals.slice(0, 5).map((goal: IGoal) => {
                      const pct =
                        goal.targetAmount > 0 ? Math.min((goal.currentSavedAmount / goal.targetAmount) * 100, 100) : 0
                      return (
                        <Box key={goal._id}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant='body2'>{goal.name}</Typography>
                            <Typography
                              variant='body2'
                              color='text.secondary'
                            >
                              {pct.toFixed(0)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant='determinate'
                            value={pct}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                          <Typography
                            variant='caption'
                            color='text.secondary'
                          >
                            {fmt(goal.currentSavedAmount)} / {fmt(goal.targetAmount)}
                          </Typography>
                        </Box>
                      )
                    })}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Stack>
    </Box>
  )
}

export { DashboardPage }
