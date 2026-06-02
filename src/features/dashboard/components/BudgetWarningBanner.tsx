import { Alert, AlertTitle, Stack } from '@mui/material'
import { JSX } from 'react'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import { IBudget } from '../../budget/types/budget'
import { ITransaction } from '../../transactions/types/transaction'
import { calculateSpentForBudget, getBudgetStatus } from '../../budget/utils/budgetUtils'
import { spacing } from '../../../shared/theme'

interface BudgetSliceState {
  budgets: IBudget[]
}
interface TxSliceState {
  transactions: ITransaction[]
}

const BudgetWarningBanner = (): JSX.Element | null => {
  const budgets = useSelector((state: { budgets?: BudgetSliceState }) => state.budgets?.budgets ?? [])
  const transactions = useSelector((state: { transactions?: TxSliceState }) => state.transactions?.transactions ?? [])

  const now = dayjs()
  const currentMonth = now.month() + 1
  const currentYear = now.year()

  const warnings = budgets
    .filter(b => b.month === currentMonth && b.year === currentYear)
    .map(b => {
      const spent = calculateSpentForBudget(transactions, b.category, b.month, b.year)
      const { isWarning, isOverBudget } = getBudgetStatus(spent, b.limitAmount)
      return { budget: b, spent, isWarning, isOverBudget }
    })
    .filter(item => item.isWarning || item.isOverBudget)

  if (warnings.length === 0) return null

  return (
    <Stack
      spacing={spacing[1]}
      sx={{ px: spacing[2], pt: spacing[1] }}
    >
      {warnings.map(({ budget, spent, isOverBudget }) => (
        <Alert
          key={budget._id}
          severity={isOverBudget ? 'error' : 'warning'}
          variant='outlined'
        >
          <AlertTitle>
            {isOverBudget ? 'Over Budget' : 'Budget Warning'} — {budget.category}
          </AlertTitle>
          ₹{spent.toLocaleString()} spent of ₹{budget.limitAmount.toLocaleString()} limit
        </Alert>
      ))}
    </Stack>
  )
}

export { BudgetWarningBanner }
