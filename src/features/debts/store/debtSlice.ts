import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import type {
  IDebt,
  IDebtPayment,
  IPaymentHistory,
  IPayoffProjection,
  IDebtSummary,
  IDebtStrategy,
  IDetailedDebt,
  IRepaymentSchedule,
  IDebtTransactionLink,
  IScheduleImportData,
  ScheduleItemStatus,
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
  getDetailedDebt as getDetailedDebtService,
  generateRepaymentSchedule as generateScheduleService,
  importRepaymentSchedule as importScheduleService,
  getRepaymentSchedule as getScheduleService,
  updateScheduleItem as updateScheduleItemService,
  linkTransactionToDebt as linkTransactionService,
  unlinkTransactionFromDebt as unlinkTransactionService,
  getLinkedTransactions as getLinkedTransactionsService,
} from '../services/debtService'

type DebtState = {
  debts: IDebt[]
  currentDebt: IDebt | null
  detailedDebt: IDetailedDebt | null
  summary: IDebtSummary | null
  paymentHistory: IPaymentHistory | null
  payoffProjection: IPayoffProjection | null
  strategy: IDebtStrategy | null
  schedule: IRepaymentSchedule | null
  linkedTransactions: IDebtTransactionLink[]
  loading: boolean
  error: string | null
}

const initialState: DebtState = {
  debts: [],
  currentDebt: null,
  detailedDebt: null,
  summary: null,
  paymentHistory: null,
  payoffProjection: null,
  strategy: null,
  schedule: null,
  linkedTransactions: [],
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

export const getDetailedDebt = createAsyncThunk<IDetailedDebt, string, { rejectValue: string }>(
  'debts/getDetailedDebt',
  async (debtId, { rejectWithValue }) => {
    try {
      return await getDetailedDebtService(debtId)
    } catch {
      return rejectWithValue('Failed to fetch detailed debt information')
    }
  }
)

// Schedule Management Actions
export const generateSchedule = createAsyncThunk<
  { message: string; totalMonths: number },
  string,
  { rejectValue: string }
>('debts/generateSchedule', async (debtId, { rejectWithValue }) => {
  try {
    return await generateScheduleService(debtId)
  } catch {
    return rejectWithValue('Failed to generate repayment schedule')
  }
})

export const importSchedule = createAsyncThunk<
  { message: string; itemCount: number },
  { debtId: string; scheduleData: IScheduleImportData[] },
  { rejectValue: string }
>('debts/importSchedule', async ({ debtId, scheduleData }, { rejectWithValue }) => {
  try {
    return await importScheduleService(debtId, scheduleData)
  } catch {
    return rejectWithValue('Failed to import repayment schedule')
  }
})

export const getSchedule = createAsyncThunk<
  { hasSchedule: boolean; schedule: IRepaymentSchedule | null },
  string,
  { rejectValue: string }
>('debts/getSchedule', async (debtId, { rejectWithValue }) => {
  try {
    return await getScheduleService(debtId)
  } catch {
    return rejectWithValue('Failed to fetch repayment schedule')
  }
})

export const updateScheduleItem = createAsyncThunk<
  { message: string },
  {
    debtId: string
    month: number
    updates: {
      status?: ScheduleItemStatus
      actualPaymentId?: string
      linkedTransactionId?: string
      variance?: number
      notes?: string
    }
  },
  { rejectValue: string }
>('debts/updateScheduleItem', async ({ debtId, month, updates }, { rejectWithValue }) => {
  try {
    return await updateScheduleItemService(debtId, month, updates)
  } catch {
    return rejectWithValue('Failed to update schedule item')
  }
})

// Transaction Linking Actions
export const linkTransaction = createAsyncThunk<
  { message: string; link: IDebtTransactionLink },
  { debtId: string; transactionId: string; linkType: 'AUTO' | 'MANUAL'; confidence?: number; notes?: string },
  { rejectValue: string }
>('debts/linkTransaction', async ({ debtId, transactionId, linkType, confidence, notes }, { rejectWithValue }) => {
  try {
    return await linkTransactionService(debtId, transactionId, linkType, confidence, notes)
  } catch {
    return rejectWithValue('Failed to link transaction')
  }
})

export const unlinkTransaction = createAsyncThunk<
  { message: string },
  { debtId: string; transactionId: string },
  { rejectValue: string }
>('debts/unlinkTransaction', async ({ debtId, transactionId }, { rejectWithValue }) => {
  try {
    return await unlinkTransactionService(debtId, transactionId)
  } catch {
    return rejectWithValue('Failed to unlink transaction')
  }
})

export const getLinkedTransactions = createAsyncThunk<
  { links: IDebtTransactionLink[]; totalLinks: number },
  string,
  { rejectValue: string }
>('debts/getLinkedTransactions', async (debtId, { rejectWithValue }) => {
  try {
    return await getLinkedTransactionsService(debtId)
  } catch {
    return rejectWithValue('Failed to fetch linked transactions')
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
    clearDetailedDebt: state => {
      state.detailedDebt = null
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
    clearSchedule: state => {
      state.schedule = null
    },
    clearLinkedTransactions: state => {
      state.linkedTransactions = []
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

    // Get Detailed Debt
    builder
      .addCase(getDetailedDebt.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(getDetailedDebt.fulfilled, (state, action) => {
        state.loading = false
        state.detailedDebt = action.payload
      })
      .addCase(getDetailedDebt.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Failed to fetch detailed debt information'
      })

    // Generate Schedule
    builder
      .addCase(generateSchedule.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(generateSchedule.fulfilled, state => {
        state.loading = false
      })
      .addCase(generateSchedule.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Failed to generate schedule'
      })

    // Import Schedule
    builder
      .addCase(importSchedule.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(importSchedule.fulfilled, state => {
        state.loading = false
      })
      .addCase(importSchedule.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Failed to import schedule'
      })

    // Get Schedule
    builder
      .addCase(getSchedule.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(getSchedule.fulfilled, (state, action) => {
        state.loading = false
        state.schedule = action.payload.schedule
      })
      .addCase(getSchedule.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Failed to fetch schedule'
      })

    // Update Schedule Item
    builder
      .addCase(updateScheduleItem.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(updateScheduleItem.fulfilled, state => {
        state.loading = false
      })
      .addCase(updateScheduleItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Failed to update schedule item'
      })

    // Link Transaction
    builder
      .addCase(linkTransaction.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(linkTransaction.fulfilled, (state, action) => {
        state.loading = false
        state.linkedTransactions.push(action.payload.link)
      })
      .addCase(linkTransaction.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Failed to link transaction'
      })

    // Unlink Transaction
    builder
      .addCase(unlinkTransaction.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(unlinkTransaction.fulfilled, state => {
        state.loading = false
        // Transaction will be removed when we refresh with getLinkedTransactions
      })
      .addCase(unlinkTransaction.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Failed to unlink transaction'
      })

    // Get Linked Transactions
    builder
      .addCase(getLinkedTransactions.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(getLinkedTransactions.fulfilled, (state, action) => {
        state.loading = false
        state.linkedTransactions = action.payload.links
      })
      .addCase(getLinkedTransactions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Failed to fetch linked transactions'
      })
  },
})

export const {
  clearDebtError,
  clearCurrentDebt,
  clearDetailedDebt,
  clearPaymentHistory,
  clearPayoffProjection,
  clearStrategy,
  clearSchedule,
  clearLinkedTransactions,
} = debtSlice.actions
export const debtReducer = debtSlice.reducer
