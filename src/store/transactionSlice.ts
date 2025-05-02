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
    bankName: string;
    isCredit: boolean;
}

interface IListTransactionPayload {
    dateFrom?: string;
    dateTo?: string;
    amount?: string;
    page?: string;
    limit?: string;
    type?: string; // credit/debit
    bankType?: string;
    bankName?: string;
    labels?: string[];
    category?: string[];
    transactionType?: string; // online/cash
}

interface IInitialState {
    transactions: ITransactionLogs[];
    totalCount: number;
    loading: boolean;
    error: string | null;
    labels: { labelName: string; labelColor: string }[];
}

const initialState: IInitialState = {
    transactions: [],
    totalCount: 0,
    loading: false,
    error: null as string | null,
    labels: [],
};

// Mocking a function to fetch transactions
export const listTransactions = createAsyncThunk<ITransactionLogs[], IListTransactionPayload, { rejectValue: string }>(
    "listTransactions",
    async (payload: IListTransactionPayload, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post(`/transaction-logs/list-transactions`, {
                ...payload,
            });
            return response.data.output;
        } catch (error: any) {
            return rejectWithValue(error?.response?.data?.message || "Failed to fetch transactions");
        }
    },
);

// Mocking a function to update a transactions
export const updateTransaction = createAsyncThunk<ITransactionLogs, ITransactionLogs, { rejectValue: string }>(
    "updateTransaction",
    async (payload: ITransactionLogs, { rejectWithValue }) => {
        try {
            const response = await axiosClient.put(`/transaction-logs/update/${payload._id}`, payload);
            const data = response.data.output;
            return data;
        } catch (error: any) {
            return rejectWithValue(error?.response?.data?.message || "Failed to fetch transactions");
        }
    },
);

export const listLabels = createAsyncThunk<string[], void, { rejectValue: string }>("listLabels", async (_, { rejectWithValue }) => {
    try {
        const response = await axiosClient.get("/transaction-logs/list-labels");
        return response.data.output;
    } catch (error: any) {
        return rejectWithValue(error?.response?.data?.message || "Failed to fetch labels");
    }
});

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
            state.transactions = action.payload.result;
            state.totalCount = action.payload.totalCount;
        });
        builder.addCase(listTransactions.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || "failed to fetch transactions";
        });

        // Update transaction
        builder.addCase(updateTransaction.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(updateTransaction.fulfilled, (state, action: PayloadAction<any>) => {
            state.loading = false;
            state.transactions = state.transactions.map((tx) => (tx._id === action.payload._id ? { ...tx, ...action.payload } : tx));
        });
        builder.addCase(updateTransaction.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || "failed to fetch transactions";
        });

        // List labels
        builder.addCase(listLabels.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(listLabels.fulfilled, (state, action: PayloadAction<any>) => {
            state.loading = false;
            state.labels = action.payload;
        });
        builder.addCase(listLabels.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || "failed to fetch labels";
        });
    },
});

export default transactionsSlice.reducer;
