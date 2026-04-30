import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import type {
  IDebt,
  IDebtPayment,
  IPaymentHistory,
  IPayoffProjection,
  IDebtSummary,
  IDebtStrategy,
} from '../types/debt'
import {
  listDebts as listDebtsService,
  getDebt as getDebtService,
  createDebt as createDebtService,
  updateDebt as updateDebtService,
  deleteDebt as deleteDebtService,
  recordPayment as recordPaymentService,
  getPaymentHistory as getPaymentHistoryService,
  getPayoffProjection as getPayoffProjectionService,
  getDebtSummary as getDebtSummaryService,
  getDebtStrategy as getDebtStrategyService,
} from '../services/debtService'

type DebtState = {
  debts: IDebt[]
  currentDebt: IDebt | null
  summary: IDebtSummary | null
  paymentHistory: IPaymentHistory | null
  payoffProjection: IPayoffProjection | null
  strategy: IDebtStrategy | null
  loading: boolean
  error: string | null
}

const initialState: DebtState = {
  debts: [],
  currentDebt: null,
  summary: null,
  paymentHistory: null,
  payoffProjection: null,
  strategy: null,
  loading: false,
  error: null,
}

export const listDebts = createAsyncThunk<IDebt[], void, { rejectValue: string }>(
  'debts/listDebts',
  async (_, { rejectWithValue }) => {
    try {
      return await listDebtsService()
    } catch {
      return rejectWithValue('Failed to fetch debts')
    }
  }
)

export const getDebt = createAsyncThunk<IDebt, string, { rejectValue: string }>(
  'debts/getDebt',
  async (debtId, { rejectWithValue }) => {
    try {
      return await getDebtService(debtId)
    } catch {
      return rejectWithValue('Failed to fetch debt details')
    }
  }
)

export const createDebt = createAsyncThunk<IDebt, { debtDetails: Record<string, unknown> }, { rejectValue: string }>(
  'debts/createDebt',
  async (debt, { rejectWithValue }) => {
    try {
      return await createDebtService(debt)
    } catch {
      return rejectWithValue('Failed to create debt')
    }
  }
)

export const updateDebt = createAsyncThunk<IDebt, { debtId: string; data: Partial<IDebt> }, { rejectValue: string }>(
  'debts/updateDebt',
  async ({ debtId, data }, { rejectWithValue }) => {
    try {
      return await updateDebtService(debtId, data)
    } catch {
      return rejectWithValue('Failed to update debt')
    }
  }
)

export const deleteDebt = createAsyncThunk<string, string, { rejectValue: string }>(
  'debts/deleteDebt',
  async (debtId, { rejectWithValue }) => {
    try {
      await deleteDebtService(debtId)
      return debtId
    } catch {
      return rejectWithValue('Failed to delete debt')
    }
  }
)

export const recordPayment = createAsyncThunk<
  { payment: IDebtPayment; updatedDebt: IDebt },
  { debtId: string; amount: number; paymentDate: string; transactionId?: string; notes?: string },
  { rejectValue: string }
>('debts/recordPayment', async (payment, { rejectWithValue }) => {
  try {
    return await recordPaymentService(payment)
  } catch {
    return rejectWithValue('Failed to record payment')
  }
})

export const getPaymentHistory = createAsyncThunk<IPaymentHistory, string, { rejectValue: string }>(
  'debts/getPaymentHistory',
  async (debtId, { rejectWithValue }) => {
    try {
      return await getPaymentHistoryService(debtId)
    } catch {
      return rejectWithValue('Failed to fetch payment history')
    }
  }
)

export const getPayoffProjection = createAsyncThunk<IPayoffProjection, string, { rejectValue: string }>(
  'debts/getPayoffProjection',
  async (debtId, { rejectWithValue }) => {
    try {
      return await getPayoffProjectionService(debtId)
    } catch {
      return rejectWithValue('Failed to fetch payoff projection')
    }
  }
)

export const getDebtSummary = createAsyncThunk<IDebtSummary, void, { rejectValue: string }>(
  'debts/getDebtSummary',
  async (_, { rejectWithValue }) => {
    try {
      return await getDebtSummaryService()
    } catch {
      return rejectWithValue('Failed to fetch debt summary')
    }
  }
)

export const getDebtStrategy = createAsyncThunk<
  IDebtStrategy,
  { monthlyIncome?: number; monthlyExpenses?: number },
  { rejectValue: string }
>('debts/getDebtStrategy', async ({ monthlyIncome, monthlyExpenses }, { rejectWithValue }) => {
  try {
    return await getDebtStrategyService(monthlyIncome, monthlyExpenses)
  } catch {
    return rejectWithValue('Failed to fetch debt strategy')
  }
})

const debtSlice = createSlice({
  name: 'debts',
  initialState,
  reducers: {
    clearDebtError: state => {
      state.error = null
    },
    clearCurrentDebt: state => {
      state.currentDebt = null
    },
    clearPaymentHistory: state => {
      state.paymentHistory = null
    },
    clearPayoffProjection: state => {
      state.payoffProjection = null
    },
    clearStrategy: state => {
      state.strategy = null
    },
  },
  extraReducers: builder => {
    // List Debts
    builder
      .addCase(listDebts.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(listDebts.fulfilled, (state, action) => {
        state.loading = false
        state.debts = action.payload
      })
      .addCase(listDebts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Failed to fetch debts'
      })

    // Get Debt
    builder
      .addCase(getDebt.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(getDebt.fulfilled, (state, action) => {
        state.loading = false
        state.currentDebt = action.payload
      })
      .addCase(getDebt.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Failed to fetch debt details'
      })

    // Create Debt
    builder
      .addCase(createDebt.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(createDebt.fulfilled, (state, action) => {
        state.loading = false
        state.debts.push(action.payload)
      })
      .addCase(createDebt.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Failed to create debt'
      })

    // Update Debt
    builder
      .addCase(updateDebt.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(updateDebt.fulfilled, (state, action) => {
        state.loading = false
        const idx = state.debts.findIndex(d => d._id === action.payload._id)
        if (idx !== -1) state.debts[idx] = action.payload
        if (state.currentDebt?._id === action.payload._id) {
          state.currentDebt = action.payload
        }
      })
      .addCase(updateDebt.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Failed to update debt'
      })

    // Delete Debt
    builder
      .addCase(deleteDebt.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteDebt.fulfilled, (state, action) => {
        state.loading = false
        state.debts = state.debts.filter(d => d._id !== action.payload)
        if (state.currentDebt?._id === action.payload) {
          state.currentDebt = null
        }
      })
      .addCase(deleteDebt.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Failed to delete debt'
      })

    // Record Payment
    builder
      .addCase(recordPayment.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(recordPayment.fulfilled, (state, action) => {
        state.loading = false
        const { updatedDebt } = action.payload
        const idx = state.debts.findIndex(d => d._id === updatedDebt._id)
        if (idx !== -1) {
          state.debts[idx] = updatedDebt
        }
        if (state.currentDebt?._id === updatedDebt._id) {
          state.currentDebt = updatedDebt
        }
      })
      .addCase(recordPayment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Failed to record payment'
      })

    // Get Payment History
    builder
      .addCase(getPaymentHistory.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(getPaymentHistory.fulfilled, (state, action) => {
        state.loading = false
        state.paymentHistory = action.payload
      })
      .addCase(getPaymentHistory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Failed to fetch payment history'
      })

    // Get Payoff Projection
    builder
      .addCase(getPayoffProjection.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(getPayoffProjection.fulfilled, (state, action) => {
        state.loading = false
        state.payoffProjection = action.payload
      })
      .addCase(getPayoffProjection.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Failed to fetch payoff projection'
      })

    // Get Debt Summary
    builder
      .addCase(getDebtSummary.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(getDebtSummary.fulfilled, (state, action) => {
        state.loading = false
        state.summary = action.payload
      })
      .addCase(getDebtSummary.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Failed to fetch debt summary'
      })

    // Get Debt Strategy
    builder
      .addCase(getDebtStrategy.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(getDebtStrategy.fulfilled, (state, action) => {
        state.loading = false
        state.strategy = action.payload
      })
      .addCase(getDebtStrategy.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Failed to fetch debt strategy'
      })
  },
})

export const { clearDebtError, clearCurrentDebt, clearPaymentHistory, clearPayoffProjection, clearStrategy } =
  debtSlice.actions
export const debtReducer = debtSlice.reducer
