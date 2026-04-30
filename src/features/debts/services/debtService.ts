import { axiosClient } from '../../../shared/services/axiosClient'
import { API_ROUTES } from '../../../routes'
import type {
  IDebt,
  IDebtPayment,
  IPaymentHistory,
  IPayoffProjection,
  IDebtSummary,
  IDebtStrategy,
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
