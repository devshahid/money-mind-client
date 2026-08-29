import { configureStore } from '@reduxjs/toolkit'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  post: vi.fn(),
  getAllTransactions: vi.fn(),
}))

vi.mock('../../../shared/services/axiosClient', () => ({
  axiosClient: {
    post: mocks.post,
  },
}))

vi.mock('../helpers/indexDB/transactionStore', () => ({
  indexDBTransaction: {
    getAllTransactions: mocks.getAllTransactions,
  },
}))

import { listTransactions, transactionReducer, type ITransactionLogs } from '../store/transactionSlice'

describe('transactionSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('keeps API transactions when the local IndexedDB cache is unavailable', async () => {
    const transaction: ITransactionLogs = {
      _id: 'transaction-1',
      transactionDate: '2026-08-28',
      narration: 'Existing account transaction',
      notes: '',
      category: 'Bills',
      label: [],
      amount: '100',
      bankName: 'Bank',
      isCredit: false,
      isCash: false,
    }
    mocks.post.mockResolvedValue({
      data: { output: { result: [transaction], totalCount: 8929 } },
    })
    mocks.getAllTransactions.mockRejectedValue(
      new Error('Version change transaction was aborted in upgradeneeded event handler')
    )
    const store = configureStore({ reducer: { transactions: transactionReducer } })

    const action = await store.dispatch(listTransactions({ page: '1', limit: '50' }))

    expect(listTransactions.fulfilled.match(action)).toBe(true)
    expect(store.getState().transactions.transactions).toEqual([transaction])
    expect(store.getState().transactions.totalCount).toBe(8929)
  })
})
