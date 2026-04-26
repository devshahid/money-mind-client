import type { ITransaction } from './transaction'

export type ITransactionGroup = {
  _id: string
  name: string
  transactionIds: string[]
  groupBalance: number
  isSettled: boolean
  createdAt: string
  updatedAt: string
}

export type ITransactionGroupDetail = ITransactionGroup & {
  transactions: ITransaction[]
}
