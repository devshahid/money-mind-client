import { configureStore } from '@reduxjs/toolkit'

import { authReducer } from '../features/auth/store/authSlice'
import { transactionReducer } from '../features/transactions/store/transactionSlice'
import { groupReducer } from '../features/transactions/store/groupSlice'
import { ledgerReducer } from '../features/transactions/store/ledgerSlice'
import { aiReducer } from '../features/ai-chat/store/aiSlice'
import { transactionGroupReducer } from '../features/transactions/store/transactionGroupSlice'
import { debtReducer } from '../features/debts/store/debtSlice'
import { goalReducer } from '../features/goals/store/goalSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionReducer,
    groups: groupReducer,
    ledgers: ledgerReducer,
    ai: aiReducer,
    transactionGroups: transactionGroupReducer,
    debts: debtReducer,
    goals: goalReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
