export type DebtStatus = 'ACTIVE' | 'PAID_OFF' | 'PAUSED'

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
