import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../services/axiosClient";
import { AxiosError } from "axios";
import dayjs from "dayjs";

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
    isCash: boolean;
}

export interface ITransactionLogsApiResponse {
    result: ITransactionLogs[];
    totalCount: number;
}

export interface ILabelsApiResponse {
    _id: string | null;
    labelName: string;
    labelColor: string | null;
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
    labels: { _id: string | null; labelName: string; labelColor: string | null }[];
    page: string;
    limit: string;
}

const initialState: IInitialState = {
    transactions: [],
    totalCount: 0,
    loading: false,
    error: null as string | null,
    labels: [{ _id: null, labelName: "", labelColor: null }],
    page: "0",
    limit: "50",
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
export const updateTransaction = createAsyncThunk<ITransactionLogs, Partial<ITransactionLogs>, { rejectValue: string }>(
    "updateTransaction",
    async (payload: Partial<ITransactionLogs>, { rejectWithValue }) => {
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

export const listLabels = createAsyncThunk<ILabelsApiResponse[], void, { rejectValue: string }>("listLabels", async (_, { rejectWithValue }) => {
    try {
        const response = await axiosClient.get<{ output: ILabelsApiResponse[] }>("/transaction-logs/list-labels");
        return response.data.output;
    } catch (error: unknown) {
        if (error instanceof AxiosError && error.response?.data) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            return rejectWithValue(error.response?.data || "Failed to fetch labels");
        }
        return rejectWithValue("An unknown error occurred while fetching labels");
    }
});

// Mocking a function to update a transactions
export const addCashTransaction = createAsyncThunk<ITransactionLogs, Partial<ITransactionLogs>, { rejectValue: string }>(
    "addCashTransaction",
    async (payload: Partial<ITransactionLogs>, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post<{ output: ITransactionLogs }>("/transaction-logs/add-cashmemo", payload);
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

const transactionsSlice = createSlice({
    name: "transactionSlice",
    initialState,
    reducers: {
        updatePage: (state, action: PayloadAction<string>) => {
            state.page = action.payload;
        },
        updateLimit: (state, action: PayloadAction<string>) => {
            state.limit = action.payload;
        },
    },
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
        builder.addCase(listLabels.fulfilled, (state, action: PayloadAction<ILabelsApiResponse[]>) => {
            state.loading = false;
            state.labels = action.payload.map((label) => ({
                _id: label._id,
                labelName: label.labelName,
                labelColor: label.labelColor || "#000000",
            }));
        });
        builder.addCase(listLabels.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || "failed to fetch labels";
        });

        // Add Cash Transaction
        builder.addCase(addCashTransaction.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(addCashTransaction.fulfilled, (state, action: PayloadAction<ITransactionLogs>) => {
            state.loading = false;
            if (!action.payload._id) return;
            const insertIndex = state.transactions.findIndex((tx) =>
                dayjs(action.payload.transactionDate, "DD/MM/YYYY").isAfter(dayjs(tx.transactionDate, "DD/MM/YYYY")),
            );
            // Insert the transaction at the correct position
            if (insertIndex === -1) {
                // Add to the end if no later date found
                state.transactions.push(action.payload);
            } else {
                state.transactions.splice(insertIndex, 0, action.payload);
            }
        });
        builder.addCase(addCashTransaction.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || "failed to add transaction";
        });
    },
});

export const { updatePage, updateLimit } = transactionsSlice.actions;
export default transactionsSlice.reducer;
