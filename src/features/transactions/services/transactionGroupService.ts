import { axiosClient } from '../../../shared/services/axiosClient'
import { API_ROUTES } from '../../../routes'
import type { ITransactionGroup, ITransactionGroupDetail } from '../types/transactionGroup'

export const listGroups = async (): Promise<ITransactionGroup[]> => {
  const response = await axiosClient.get<ITransactionGroup[]>(API_ROUTES.transactionGroups.list)
  return response.data
}

export const getGroupDetail = async (groupId: string): Promise<ITransactionGroupDetail> => {
  const response = await axiosClient.get<ITransactionGroupDetail>(API_ROUTES.transactionGroups.detail(groupId))
  return response.data
}

export const createGroup = async (name: string, transactionIds: string[]): Promise<ITransactionGroup> => {
  const response = await axiosClient.post<ITransactionGroup>(API_ROUTES.transactionGroups.create, {
    name,
    transactionIds,
  })
  return response.data
}

export const addToGroup = async (groupId: string, transactionId: string): Promise<ITransactionGroup> => {
  const response = await axiosClient.put<ITransactionGroup>(API_ROUTES.transactionGroups.add(groupId), {
    transactionId,
  })
  return response.data
}

export const removeFromGroup = async (groupId: string, transactionId: string): Promise<ITransactionGroup> => {
  const response = await axiosClient.put<ITransactionGroup>(API_ROUTES.transactionGroups.remove(groupId), {
    transactionId,
  })
  return response.data
}

export const dissolveGroup = async (groupId: string): Promise<void> => {
  await axiosClient.delete(API_ROUTES.transactionGroups.dissolve(groupId))
}
