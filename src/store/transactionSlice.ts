import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../services/axiosClient";
import { AxiosError } from "axios";
import dayjs from "dayjs";
import { indexDBTransaction } from "../helpers/indexDB/transactionStore";

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
    isLocalTransactions: boolean;
    syncStatus: "idle" | "success" | "error";
}

const initialState: IInitialState = {
    transactions: [],
    totalCount: 0,
    loading: false,
    error: null as string | null,
    labels: [{ _id: null, labelName: "", labelColor: null }],
    page: "0",
    limit: "50",
    isLocalTransactions: false,
    syncStatus: "idle",
};

// Mocking a function to fetch transactions
export const listTransactions = createAsyncThunk<ITransactionLogsApiResponse, IListTransactionPayload, { rejectValue: string }>(
    "listTransactions",
    async (payload: IListTransactionPayload, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post<{ output: ITransactionLogsApiResponse }>(`/transaction-logs/list-transactions`, payload);
            const localEdits = await indexDBTransaction.getAllTransactions();
            const apiTransactions = response.data.output.result;
            // Merge: override matching API records with local edits
            const mergedTransactions = apiTransactions.map((tx) => {
                const local = localEdits.find((edit) => edit._id === tx._id);
                return local ? { ...tx, ...local } : tx;
            });
            return { result: mergedTransactions, totalCount: response.data.output.totalCount };
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
                return rejectWithValue(error.response?.data || "Failed to update transactions");
            }
            return rejectWithValue("An unknown error occurred while updating transaction");
        }
    },
);

// Mocking a function to update a transactions
export const syncTransactions = createAsyncThunk<
    ITransactionLogsApiResponse,
    { transactions: Partial<ITransactionLogs[]>; statePage: string; limit: string },
    { rejectValue: string }
>("syncTransactions", async ({ transactions, statePage, limit }, { rejectWithValue }) => {
    try {
        const response = await axiosClient.put<{ output: { result: ITransactionLogs[]; totalCount: number } }>(
            `/transaction-logs/sync-transactions`,
            {
                transactions,
                page: statePage,
                limit: limit,
            },
        );
        const data = response.data.output;

        // delete all indexDB transactions and labels:
        await indexDBTransaction.deleteAllTransactions();
        await indexDBTransaction.deleteLabels();

        return { result: data.result, totalCount: data.totalCount };
    } catch (error: unknown) {
        if (error instanceof AxiosError && error.response?.data) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            return rejectWithValue(error.response?.data || "Failed to sync transactions");
        }
        return rejectWithValue("An unknown error occurred while syncing transactions");
    }
});

export const listLabels = createAsyncThunk<ILabelsApiResponse[], void, { rejectValue: string }>("listLabels", async (_, { rejectWithValue }) => {
    try {
        const response = await axiosClient.get<{ output: ILabelsApiResponse[] }>("/transaction-logs/list-labels");
        const apiLabels = response.data.output;
        const localLabels = await indexDBTransaction.getAllLabels();
        const mergedLabels = [...apiLabels]; // start with a copy of API labels

        localLabels.forEach((local) => {
            const index = mergedLabels.findIndex((label) => label.labelName === local.label);
            if (index !== -1) {
                // merge with existing label
                mergedLabels[index] = { ...mergedLabels[index], ...local };
            } else {
                // push new local label
                mergedLabels.push({
                    _id: local._id,
                    labelName: local.label,
                    labelColor: "#000000", // Ensure labelColor is included
                });
            }
        });

        return mergedLabels;
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
        setTransaction: (state, action: PayloadAction<Partial<ITransactionLogs>>) => {
            state.transactions = state.transactions.map((tx) => (tx._id === action.payload._id ? { ...tx, ...action.payload } : tx));
        },
        setIsLocalTransactions: (state, action: PayloadAction<boolean>) => {
            state.isLocalTransactions = action.payload;
        },
        setLabels: (state, action: PayloadAction<{ label: string; _id: string }[]>) => {
            action.payload.forEach(({ label, _id }) => {
                const index = state.labels.findIndex((existingLabel) => existingLabel._id === _id || existingLabel.labelName === label);

                if (index !== -1) {
                    // Update existing label
                    state.labels[index] = {
                        ...state.labels[index],
                        labelName: label,
                        _id,
                    };
                } else {
                    // Add new label with default color
                    state.labels.push({
                        _id,
                        labelName: label,
                        labelColor: "", // default color, you can modify this
                    });
                }
            });
        },
        resetSyncStatus: (state) => {
            state.syncStatus = "idle";
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

        // sync transactions:
        builder.addCase(syncTransactions.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(syncTransactions.fulfilled, (state, action: PayloadAction<ITransactionLogsApiResponse>) => {
            state.loading = false;
            state.transactions = action.payload.result;
            state.totalCount = action.payload.totalCount;
            state.isLocalTransactions = false;
            state.syncStatus = "success";
        });
        builder.addCase(syncTransactions.rejected, (state, action) => {
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
            const insertIndex = state.transactions.findIndex((tx) => dayjs(action.payload.transactionDate).isAfter(dayjs(tx.transactionDate)));
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

export const { updatePage, updateLimit, setTransaction, setLabels, setIsLocalTransactions, resetSyncStatus } = transactionsSlice.actions;
export default transactionsSlice.reducer;
