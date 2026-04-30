import { Box, CircularProgress, Alert } from '@mui/material'
import { CreditCard, TrendingDown, Calendar, CheckCircle, AlertCircle, DollarSign } from 'lucide-react'

import { SummaryCard } from '../../../features/dashboard/components/SummaryCard'
import { colors, spacing } from '../../../shared/theme'
import type { IDebtSummary } from '../types/debt'

interface DebtSummaryCardsProps {
  summary: IDebtSummary | null
  loading: boolean
  error: string | null
}

export const DebtSummaryCards = ({ summary, loading, error }: DebtSummaryCardsProps) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: spacing[4] }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity='error'>{error}</Alert>
  }

  if (!summary) {
    return null
  }

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2], mb: spacing[3] }}>
      <SummaryCard
        title='Total Debt'
        value={formatCurrency(summary.totalDebt ?? 0)}
        icon={CreditCard}
        color={colors.semantic.error}
      />
      <SummaryCard
        title='Remaining'
        value={formatCurrency(summary.totalRemaining ?? 0)}
        icon={TrendingDown}
        color={colors.semantic.warning}
        subHeading={`${(summary.overallProgress ?? 0).toFixed(1)}% paid`}
      />
      <SummaryCard
        title='Monthly EMI'
        value={formatCurrency(summary.totalMonthlyEMI ?? 0)}
        icon={Calendar}
        color={colors.primary.blue}
      />
      <SummaryCard
        title='Active Debts'
        value={(summary.activeDebtsCount ?? 0).toString()}
        icon={AlertCircle}
        color={colors.accent.purple}
      />
      <SummaryCard
        title='Paid Off'
        value={(summary.paidDebtsCount ?? 0).toString()}
        icon={CheckCircle}
        color={colors.semantic.success}
      />
      <SummaryCard
        title='Total Paid'
        value={formatCurrency(summary.totalPaid ?? 0)}
        icon={DollarSign}
        color={colors.semantic.info}
      />
    </Box>
  )
}
