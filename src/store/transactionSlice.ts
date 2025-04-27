import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../services/axiosClient";

export interface ITransactionLogs {
    _id: string;
    transactionDate: string;
    narration: string;
    notes: string;
    category: string;
    label: string[];
    amount: string;
}

interface IListTransactionPayload {
    page?: string;
    limit?: string;
    type?: string;
    bankType?: string;
    bankName?: string;
    labels?: string[];
}

const initialState: { transactions: ITransactionLogs[]; totalCount: number; loading: boolean; error: string | null } = {
    transactions: [],
    totalCount: 0,
    loading: false,
    error: null as string | null,
};

// Mocking a function to fetch transactions
export const listTransactions = createAsyncThunk<ITransactionLogs[], IListTransactionPayload, { rejectValue: string }>(
    "listTransactions",
    async (payload: IListTransactionPayload, { rejectWithValue }) => {
        try {
            const searchParams = new URLSearchParams();
            Object.entries(payload).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (Array.isArray(value)) {
                        value.forEach((val) => searchParams.append(key, val));
                    } else {
                        searchParams.append(key, value);
                    }
                }
            });
            const response = await axiosClient(`/transaction-logs/list-transactions?${searchParams.toString()}`);
            return response.data.output;
        } catch (error: any) {
            return rejectWithValue(error?.response?.data?.message || "Failed to fetch transactions");
        }
    },
);

const transactionsSlice = createSlice({
    name: "transactionSlice",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(listTransactions.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(listTransactions.fulfilled, (state, action: PayloadAction<any>) => {
            state.loading = false;
            state.transactions = [...state.transactions, ...action.payload.result];
            state.totalCount = action.payload.totalCount;
        });
        builder.addCase(listTransactions.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || "failed to fetch transactions";
        });
    },
});

export default transactionsSlice.reducer;
