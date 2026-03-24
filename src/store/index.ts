import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import transactionReducer from "./transactionSlice"; // ✅
import groupReducer from "./groupSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        transactions: transactionReducer, // ✅ renamed properly
        groups: groupReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
