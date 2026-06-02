import { axiosClient } from '../../../shared/services/axiosClient'
import { API_ROUTES } from '../../../routes'
import type {
  IDebt,
  IDebtPayment,
  IPaymentHistory,
  IPayoffProjection,
  IDebtSummary,
  IDebtStrategy,
  IDetailedDebt,
  IRepaymentSchedule,
  IScheduleImportData,
  IDebtTransactionLink,
  ScheduleItemStatus,
} from '../types/debt'

export const listDebts = async (): Promise<IDebt[]> => {
  const response = await axiosClient.get<{ output: IDebt[] }>(API_ROUTES.debt.list)
  return response.data.output
}

export const getDebt = async (debtId: string): Promise<IDebt> => {
  const response = await axiosClient.get<{ output: IDebt }>(API_ROUTES.debt.get(debtId))
  return response.data.output
}

export const createDebt = async (debt: { debtDetails: Record<string, unknown> }): Promise<IDebt> => {
  const response = await axiosClient.post<{ output: IDebt }>(API_ROUTES.debt.create, debt)
  return response.data.output
}

export const updateDebt = async (debtId: string, data: Partial<IDebt>): Promise<IDebt> => {
  const response = await axiosClient.put<{ output: IDebt }>(API_ROUTES.debt.update, { debtId, ...data })
  return response.data.output
}

export const deleteDebt = async (debtId: string): Promise<void> => {
  await axiosClient.delete(API_ROUTES.debt.delete(debtId))
}

export const recordPayment = async (payment: {
  debtId: string
  amount: number
  paymentDate: string
  transactionId?: string
  notes?: string
}): Promise<{ payment: IDebtPayment; updatedDebt: IDebt }> => {
  const response = await axiosClient.post<{ output: { payment: IDebtPayment; updatedDebt: IDebt } }>(
    API_ROUTES.debt.recordPayment,
    payment
  )
  return response.data.output
}

export const getPaymentHistory = async (debtId: string): Promise<IPaymentHistory> => {
  const response = await axiosClient.get<{ output: IPaymentHistory }>(API_ROUTES.debt.paymentHistory(debtId))
  return response.data.output
}

export const getPayoffProjection = async (debtId: string): Promise<IPayoffProjection> => {
  const response = await axiosClient.get<{ output: IPayoffProjection }>(API_ROUTES.debt.payoffProjection(debtId))
  return response.data.output
}

export const getDebtSummary = async (): Promise<IDebtSummary> => {
  const response = await axiosClient.get<{ output: IDebtSummary }>(API_ROUTES.debt.summary)
  return response.data.output
}

export const getDebtStrategy = async (monthlyIncome?: number, monthlyExpenses?: number): Promise<IDebtStrategy> => {
  const params = new URLSearchParams()
  if (monthlyIncome) params.append('monthlyIncome', monthlyIncome.toString())
  if (monthlyExpenses) params.append('monthlyExpenses', monthlyExpenses.toString())

  const url = `${API_ROUTES.debt.strategy}${params.toString() ? `?${params.toString()}` : ''}`
  const response = await axiosClient.get<{ output: { strategy: IDebtStrategy } }>(url)
  return response.data.output.strategy
}

export const getDetailedDebt = async (debtId: string): Promise<IDetailedDebt> => {
  const response = await axiosClient.get<{ output: IDetailedDebt }>(API_ROUTES.debt.detailed(debtId))
  return response.data.output
}

// Schedule Management
export const generateRepaymentSchedule = async (debtId: string): Promise<{ message: string; totalMonths: number }> => {
  const response = await axiosClient.post<{ output: { message: string; totalMonths: number } }>(
    API_ROUTES.debt.generateSchedule(debtId)
  )
  return response.data.output
}

export const importRepaymentSchedule = async (
  debtId: string,
  scheduleData: IScheduleImportData[]
): Promise<{ message: string; itemCount: number }> => {
  const response = await axiosClient.post<{ output: { message: string; itemCount: number } }>(
    API_ROUTES.debt.importSchedule(debtId),
    { scheduleData }
  )
  return response.data.output
}

export const getRepaymentSchedule = async (
  debtId: string
): Promise<{ hasSchedule: boolean; schedule: IRepaymentSchedule | null }> => {
  const response = await axiosClient.get<{
    output: { hasSchedule: boolean; schedule: IRepaymentSchedule | null }
  }>(API_ROUTES.debt.getSchedule(debtId))
  return response.data.output
}

export const updateScheduleItem = async (
  debtId: string,
  month: number,
  updates: {
    status?: ScheduleItemStatus
    actualPaymentId?: string
    linkedTransactionId?: string
    variance?: number
    notes?: string
  }
): Promise<{ message: string }> => {
  const response = await axiosClient.put<{ output: { message: string } }>(
    API_ROUTES.debt.updateScheduleItem(debtId, month),
    updates
  )
  return response.data.output
}

// Transaction Linking
export const linkTransactionToDebt = async (
  debtId: string,
  transactionId: string,
  linkType: 'AUTO' | 'MANUAL',
  confidence?: number,
  notes?: string
): Promise<{ message: string; link: IDebtTransactionLink }> => {
  const response = await axiosClient.post<{ output: { message: string; link: IDebtTransactionLink } }>(
    API_ROUTES.debt.linkTransaction(debtId),
    { transactionId, linkType, confidence, notes }
  )
  return response.data.output
}

export const unlinkTransactionFromDebt = async (
  debtId: string,
  transactionId: string
): Promise<{ message: string }> => {
  const response = await axiosClient.delete<{ output: { message: string } }>(
    API_ROUTES.debt.unlinkTransaction(debtId, transactionId)
  )
  return response.data.output
}

export const getLinkedTransactions = async (
  debtId: string
): Promise<{ links: IDebtTransactionLink[]; totalLinks: number }> => {
  const response = await axiosClient.get<{ output: { links: IDebtTransactionLink[]; totalLinks: number } }>(
    API_ROUTES.debt.getLinkedTransactions(debtId)
  )
  return response.data.output
}
