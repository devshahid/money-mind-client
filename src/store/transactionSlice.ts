import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../services/axiosClient";
import { AxiosError } from "axios";

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

export interface ITransactionLogsApiResponse {
    result: ITransactionLogs[];
    totalCount: number;
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
    keyword?: string;
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
export const listTransactions = createAsyncThunk<ITransactionLogsApiResponse, IListTransactionPayload, { rejectValue: string }>(
    "listTransactions",
    async (payload: IListTransactionPayload, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post<{ output: ITransactionLogsApiResponse }>(`/transaction-logs/list-transactions`, payload);
            return response.data.output;
        } catch (error: unknown) {
            if (error instanceof AxiosError && error.response?.data) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                return rejectWithValue(error.response?.data || "Failed to fetch transactions");
            }
            return rejectWithValue("An unknown error occurred while fetching transactions");
        }
    },
);

// Mocking a function to update a transactions
export const updateTransaction = createAsyncThunk<ITransactionLogs, ITransactionLogs, { rejectValue: string }>(
    "updateTransaction",
    async (payload: ITransactionLogs, { rejectWithValue }) => {
        try {
            const response = await axiosClient.put<{ output: ITransactionLogs }>(`/transaction-logs/update/${payload._id}`, payload);
            const data = response.data.output;
            return data;
        } catch (error: unknown) {
            if (error instanceof AxiosError && error.response?.data) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                return rejectWithValue(error.response?.data || "Failed to fetch transactions");
            }
            return rejectWithValue("An unknown error occurred while fetching transactions");
        }
    },
);

export const listLabels = createAsyncThunk<string[], void, { rejectValue: string }>("listLabels", async (_, { rejectWithValue }) => {
    try {
        const response = await axiosClient.get<{ output: string[] }>("/transaction-logs/list-labels");
        return response.data.output;
    } catch (error: unknown) {
        if (error instanceof AxiosError && error.response?.data) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            return rejectWithValue(error.response?.data || "Failed to fetch transactions");
        }
        return rejectWithValue("An unknown error occurred while fetching transactions");
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
        builder.addCase(listTransactions.fulfilled, (state, action: PayloadAction<ITransactionLogsApiResponse>) => {
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
        builder.addCase(updateTransaction.fulfilled, (state, action: PayloadAction<ITransactionLogs>) => {
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
        builder.addCase(listLabels.fulfilled, (state, action: PayloadAction<string[]>) => {
            state.loading = false;
            state.labels = action.payload.map((label) => ({ labelName: label, labelColor: "#000000" }));
        });
        builder.addCase(listLabels.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || "failed to fetch labels";
        });
    },
});

export default transactionsSlice.reducer;
