import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import transactionReducer from "./transactionSlice"; // ✅
import groupReducer from "./groupSlice";
import aiReducer from "./aiSlice";
import transactionGroupReducer from "./transactionGroupSlice";
import debtReducer from "./debtSlice";
import goalReducer from "./goalSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        transactions: transactionReducer, // ✅ renamed properly
        groups: groupReducer,
        ai: aiReducer,
        transactionGroups: transactionGroupReducer,
        debts: debtReducer,
        goals: goalReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
