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
    page?: string;
    limit?: string;
    type?: string;
    bankType?: string;
    bankName?: string;
    labels?: string[];
}

interface IInitialState {
    transactions: ITransactionLogs[];
    totalCount: number;
    loading: boolean;
    error: string | null;
    labels: string[];
    categories: string[];
}

const initialState: IInitialState = {
    transactions: [],
    totalCount: 0,
    loading: false,
    error: null as string | null,
    labels: [],
    categories: [],
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

export const listCategories = createAsyncThunk<string[], void, { rejectValue: string }>("listCategories", async (_, { rejectWithValue }) => {
    try {
        const response = await axiosClient.get("/transaction-logs/list-categories");
        return response.data.output;
    } catch (error: any) {
        return rejectWithValue(error?.response?.data?.message || "Failed to fetch categories");
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
            state.transactions = [...state.transactions, ...action.payload.result];
            // state.transactions = [...state.transactions, ...action.payload.result];
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

        // List Categories
        builder.addCase(listCategories.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(listCategories.fulfilled, (state, action: PayloadAction<any>) => {
            state.loading = false;
            state.categories = action.payload;
        });
        builder.addCase(listCategories.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || "failed to fetch categories";
        });
    },
});

export default transactionsSlice.reducer;
