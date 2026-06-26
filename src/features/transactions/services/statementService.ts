import { axiosClient } from '../../../shared/services/axiosClient'
import { API_ROUTES } from '../../../routes'
import type { ITransaction } from '../types/transaction'

export const uploadStatementFile = async (file: File, bankName: string): Promise<ITransaction[]> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('bankName', bankName)

  const response = await axiosClient.post<ITransaction[]>(API_ROUTES.transactionLogs.uploadFile, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const parsePdf = async (file: File, bankName: string): Promise<ITransaction[]> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('bankName', bankName)

  const response = await axiosClient.post<ITransaction[]>(API_ROUTES.transactionLogs.parsePdf, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export type DuplicateCheckResult = {
  duplicateIds: string[]
}

// Server's expected transaction payload format
export interface ITransactionPayload {
  date: string
  narration: string
  depositAmount: string
  withdrawlAmount: string
  refNumber: string
  valueDate: string
  closingBalance: number
  isCash: boolean
}

export const checkDuplicates = async (
  transactions: Pick<ITransaction, 'transactionDate' | 'narration' | 'amount' | 'bankName'>[]
): Promise<DuplicateCheckResult> => {
  const response = await axiosClient.post<DuplicateCheckResult>(API_ROUTES.transactionLogs.checkDuplicates, {
    transactions,
  })
  return response.data
}

/**
 * Import parsed transactions to the database
 */
export const importTransactions = async (rows: ITransactionPayload[], bankName: string): Promise<ITransaction[]> => {
  const response = await axiosClient.post<ITransaction[]>(API_ROUTES.transactionLogs.uploadFile, {
    rows,
    bankName,
  })
  return response.data
}
