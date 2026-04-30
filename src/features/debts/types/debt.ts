export type DebtStatus = 'ACTIVE' | 'PAID' | 'PAUSED'

export type EMIType = 'INTEREST_ONLY' | 'PRINCIPAL_AND_INTEREST'

export type IDebt = {
  _id: string
  debtName: string
  lender: string
  principal: number
  interestRate: number
  startDate: string
  expectedEndDate: string
  monthlyExpectedEMI: number
  remainingBalance: number
  totalInterestPayable: number
  nextPaymentDate: string
  status: DebtStatus
  linkedTransactionIds: string[]
  emiType?: EMIType
  principalComponent?: number
  interestComponent?: number
  createdAt: string
  updatedAt: string
}

export type IEMIPayment = {
  _id: string
  debtId: string
  amount: number
  paymentDate: string
  isPartPayment: boolean
  transactionId?: string
}

export type IDebtPayment = {
  _id: string
  userId: string
  debtId: string
  amount: number
  paymentDate: string
  transactionId?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export type IPaymentHistory = {
  payments: IDebtPayment[]
  totalPaid: number
  paymentCount: number
}

export type IPayoffProjection = {
  debtId: string
  debtName: string
  monthlyBreakdown: Array<{
    month: number
    date: string
    payment: number
    principal: number
    interest: number
    remainingBalance: number
  }>
  totalInterest: number
  totalPayments: number
  payoffDate: string
}

export type IDebtSummary = {
  totalDebt: number
  totalRemaining: number
  totalMonthlyEMI: number
  activeDebtsCount: number
  paidDebtsCount: number
  totalPaid: number
  overallProgress: number
  highestInterestDebt: {
    debtName: string
    interestRate: number
    remaining: number
  } | null
}

export type IDebtStrategy = {
  recommendedMethod: 'AVALANCHE' | 'SNOWBALL'
  priorityOrder: Array<{
    debtId: string
    debtName: string
    reason: string
    order: number
  }>
  estimatedPayoffTimeline: string
  potentialSavings: number
  monthlyRecommendation: {
    minimumPayments: number
    extraPaymentSuggestion: number
    totalMonthly: number
  }
  strategyExplanation: string
  tips: string[]
}
