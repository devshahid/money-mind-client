import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import dayjs from 'dayjs'

import { axiosClient } from '../../../shared/services/axiosClient'
import { API_ROUTES } from '../../../routes'
import { indexDBTransaction } from '../helpers/indexDB/transactionStore'

export type ITransactionLogs = {
  _id: string
  transactionDate: string
  narration: string
  notes: string
  category: string
  label: string[]
  amount: string
  bankName: string
  isCredit: boolean
  isCash: boolean
}

export type ITransactionLogsApiResponse = {
  result: ITransactionLogs[]
  totalCount: number
}

export type ILabelsApiResponse = {
  _id: string | null
  labelName: string
  labelColor: string | null
}

type IListTransactionPayload = {
  dateFrom?: string
  dateTo?: string
  amount?: string
  page?: string
  limit?: string
  type?: string
  bankType?: string
  bankName?: string
  labels?: string[]
  category?: string[]
  transactionType?: string
  keyword?: string
}

type IInitialState = {
  transactions: ITransactionLogs[]
  totalCount: number
  loading: boolean
  error: string | null
  labels: { _id: string | null; labelName: string; labelColor: string | null }[]
  page: string
  limit: string
  isLocalTransactions: boolean
  syncStatus: 'idle' | 'success' | 'error'
}

const initialState: IInitialState = {
  transactions: [],
  totalCount: 0,
  loading: false,
  error: null as string | null,
  labels: [{ _id: null, labelName: '', labelColor: null }],
  page: '0',
  limit: '50',
  isLocalTransactions: false,
  syncStatus: 'idle',
}

export const listTransactions = createAsyncThunk<
  ITransactionLogsApiResponse,
  IListTransactionPayload,
  { rejectValue: string }
>('listTransactions', async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosClient.post<{ output: ITransactionLogsApiResponse }>(
      API_ROUTES.transactionLogs.list,
      payload
    )
    const localEdits = await indexDBTransaction.getAllTransactions()
    const apiTransactions = response.data.output.result
    const mergedTransactions = apiTransactions.map(tx => {
      const local = localEdits.find(edit => edit._id === tx._id)
      return local ? { ...tx, ...local } : tx
    })
    return { result: mergedTransactions, totalCount: response.data.output.totalCount }
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response?.data) {
      return rejectWithValue((error.response?.data as string) || 'Failed to fetch transactions')
    }
    return rejectWithValue('An unknown error occurred while fetching transactions')
  }
})

export const updateTransaction = createAsyncThunk<ITransactionLogs, Partial<ITransactionLogs>, { rejectValue: string }>(
  'updateTransaction',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosClient.put<{ output: ITransactionLogs }>(
        API_ROUTES.transactionLogs.update(payload._id!),
        payload
      )
      return response.data.output
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data) {
        return rejectWithValue((error.response?.data as string) || 'Failed to update transactions')
      }
      return rejectWithValue('An unknown error occurred while updating transaction')
    }
  }
)

export const syncTransactions = createAsyncThunk<
  ITransactionLogsApiResponse,
  { transactions: Partial<ITransactionLogs[]>; statePage: string; limit: string },
  { rejectValue: string }
>('syncTransactions', async ({ transactions, statePage, limit }, { rejectWithValue }) => {
  try {
    const response = await axiosClient.put<{ output: { result: ITransactionLogs[]; totalCount: number } }>(
      API_ROUTES.transactionLogs.sync,
      { transactions, page: statePage, limit }
    )
    const data = response.data.output
    await indexDBTransaction.deleteAllTransactions()
    await indexDBTransaction.deleteLabels()
    return { result: data.result, totalCount: data.totalCount }
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response?.data) {
      return rejectWithValue((error.response?.data as string) || 'Failed to sync transactions')
    }
    return rejectWithValue('An unknown error occurred while syncing transactions')
  }
})

export const listLabels = createAsyncThunk<ILabelsApiResponse[], void, { rejectValue: string }>(
  'listLabels',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get<{ output: ILabelsApiResponse[] }>(API_ROUTES.transactionLogs.labels)
      const apiLabels = response.data.output
      const localLabels = await indexDBTransaction.getAllLabels()
      const mergedLabels = [...apiLabels]

      localLabels.forEach(local => {
        const index = mergedLabels.findIndex(label => label.labelName === local.label)
        if (index !== -1) {
          mergedLabels[index] = { ...mergedLabels[index], ...local }
        } else {
          mergedLabels.push({ _id: local._id, labelName: local.label, labelColor: '#000000' })
        }
      })

      return mergedLabels
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data) {
        return rejectWithValue((error.response?.data as string) || 'Failed to fetch labels')
      }
      return rejectWithValue('An unknown error occurred while fetching labels')
    }
  }
)

export const addCashTransaction = createAsyncThunk<
  ITransactionLogs,
  Partial<ITransactionLogs>,
  { rejectValue: string }
>('addCashTransaction', async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosClient.post<{ output: ITransactionLogs }>(
      API_ROUTES.transactionLogs.addCashMemo,
      payload
    )
    return response.data.output
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response?.data) {
      return rejectWithValue((error.response?.data as string) || 'Failed to fetch transactions')
    }
    return rejectWithValue('An unknown error occurred while fetching transactions')
  }
})

const transactionsSlice = createSlice({
  name: 'transactionSlice',
  initialState,
  reducers: {
    updatePage: (state, action: PayloadAction<string>) => {
      state.page = action.payload
    },
    updateLimit: (state, action: PayloadAction<string>) => {
      state.limit = action.payload
    },
    setTransaction: (state, action: PayloadAction<Partial<ITransactionLogs>>) => {
      state.transactions = state.transactions.map(tx =>
        tx._id === action.payload._id ? { ...tx, ...action.payload } : tx
      )
    },
    setIsLocalTransactions: (state, action: PayloadAction<boolean>) => {
      state.isLocalTransactions = action.payload
    },
    setLabels: (state, action: PayloadAction<{ label: string; _id: string }[]>) => {
      action.payload.forEach(({ label, _id }) => {
        const index = state.labels.findIndex(
          existingLabel => existingLabel._id === _id || existingLabel.labelName === label
        )
        if (index !== -1) {
          state.labels[index] = { ...state.labels[index], labelName: label, _id }
        } else {
          state.labels.push({ _id, labelName: label, labelColor: '' })
        }
      })
    },
    resetSyncStatus: state => {
      state.syncStatus = 'idle'
    },
  },
  extraReducers: builder => {
    builder.addCase(listTransactions.pending, state => {
      state.loading = true
    })
    builder.addCase(listTransactions.fulfilled, (state, action: PayloadAction<ITransactionLogsApiResponse>) => {
      state.loading = false
      state.transactions = action.payload.result
      state.totalCount = action.payload.totalCount
    })
    builder.addCase(listTransactions.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message || 'failed to fetch transactions'
    })

    builder.addCase(syncTransactions.pending, state => {
      state.loading = true
    })
    builder.addCase(syncTransactions.fulfilled, (state, action: PayloadAction<ITransactionLogsApiResponse>) => {
      state.loading = false
      state.transactions = action.payload.result
      state.totalCount = action.payload.totalCount
      state.isLocalTransactions = false
      state.syncStatus = 'success'
    })
    builder.addCase(syncTransactions.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message || 'failed to fetch transactions'
    })

    builder.addCase(updateTransaction.pending, state => {
      state.loading = true
    })
    builder.addCase(updateTransaction.fulfilled, (state, action: PayloadAction<ITransactionLogs>) => {
      state.loading = false
      state.transactions = state.transactions.map(tx =>
        tx._id === action.payload._id ? { ...tx, ...action.payload } : tx
      )
    })
    builder.addCase(updateTransaction.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message || 'failed to fetch transactions'
    })

    builder.addCase(listLabels.pending, state => {
      state.loading = true
    })
    builder.addCase(listLabels.fulfilled, (state, action: PayloadAction<ILabelsApiResponse[]>) => {
      state.loading = false
      state.labels = action.payload.map(label => ({
        _id: label._id,
        labelName: label.labelName,
        labelColor: label.labelColor || '#000000',
      }))
    })
    builder.addCase(listLabels.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message || 'failed to fetch labels'
    })

    builder.addCase(addCashTransaction.pending, state => {
      state.loading = true
    })
    builder.addCase(addCashTransaction.fulfilled, (state, action: PayloadAction<ITransactionLogs>) => {
      state.loading = false
      if (!action.payload._id) return
      const insertIndex = state.transactions.findIndex(tx =>
        dayjs(action.payload.transactionDate).isAfter(dayjs(tx.transactionDate))
      )
      if (insertIndex === -1) {
        state.transactions.push(action.payload)
      } else {
        state.transactions.splice(insertIndex, 0, action.payload)
      }
    })
    builder.addCase(addCashTransaction.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message || 'failed to add transaction'
    })
  },
})

export const { updatePage, updateLimit, setTransaction, setLabels, setIsLocalTransactions, resetSyncStatus } =
  transactionsSlice.actions
export const transactionReducer = transactionsSlice.reducer
