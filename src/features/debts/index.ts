export { DebtsPage } from './pages/Debts'
export { DebtTable } from './components/Debt'
export { EMIPaymentModal } from './components/EMIPaymentModal'
export type {
  IDebt,
  IDebtPayment,
  IPaymentHistory,
  IPayoffProjection,
  IDebtSummary,
  IDebtStrategy,
  DebtStatus,
} from './types/debt'
export { calculateEMI, calculateTotalInterest, projectedPayoffDate } from './utils/debtUtils'
