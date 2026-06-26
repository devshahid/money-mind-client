import { axiosClient } from '../../../shared/services/axiosClient'
import { API_ROUTES } from '../../../routes'
import type { IDebt, IEMIPayment } from '../types/debt'

export const listDebts = async (): Promise<IDebt[]> => {
  const response = await axiosClient.get<IDebt[]>(API_ROUTES.debt.list)
  return response.data
}

export const createDebt = async (debt: Omit<IDebt, '_id' | 'createdAt' | 'updatedAt'>): Promise<IDebt> => {
  const response = await axiosClient.post<IDebt>(API_ROUTES.debt.create, debt)
  return response.data
}

export const updateDebt = async (debtId: string, data: Partial<IDebt>): Promise<IDebt> => {
  const response = await axiosClient.put<IDebt>(API_ROUTES.debt.update(debtId), data)
  return response.data
}

export const deleteDebt = async (debtId: string): Promise<void> => {
  await axiosClient.delete(API_ROUTES.debt.delete(debtId))
}

export const recordEMIPayment = async (
  payment: Omit<IEMIPayment, '_id'>
): Promise<{ payment: IEMIPayment; updatedDebt: IDebt }> => {
  const response = await axiosClient.post<{ payment: IEMIPayment; updatedDebt: IDebt }>(
    API_ROUTES.debt.emiPayments,
    payment
  )
  return response.data
}
