import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { IDebt, IEMIPayment } from "../types/debt";
import { IAIDebtStrategy } from "../types/ai";
import * as debtService from "../services/debtService";

interface DebtState {
    debts: IDebt[];
    emiPayments: IEMIPayment[];
    loading: boolean;
    error: string | null;
    aiStrategy: IAIDebtStrategy | null;
}

const initialState: DebtState = {
    debts: [],
    emiPayments: [],
    loading: false,
    error: null,
    aiStrategy: null,
};

// --- Thunks ---

export const listDebts = createAsyncThunk<IDebt[], void, { rejectValue: string }>("debts/listDebts", async (_, { rejectWithValue }) => {
    try {
        return await debtService.listDebts();
    } catch {
        return rejectWithValue("Failed to fetch debts");
    }
});

export const createDebt = createAsyncThunk<IDebt, Omit<IDebt, "_id" | "createdAt" | "updatedAt">, { rejectValue: string }>(
    "debts/createDebt",
    async (debt, { rejectWithValue }) => {
        try {
            return await debtService.createDebt(debt);
        } catch {
            return rejectWithValue("Failed to create debt");
        }
    },
);

export const updateDebt = createAsyncThunk<IDebt, { debtId: string; data: Partial<IDebt> }, { rejectValue: string }>(
    "debts/updateDebt",
    async ({ debtId, data }, { rejectWithValue }) => {
        try {
            return await debtService.updateDebt(debtId, data);
        } catch {
            return rejectWithValue("Failed to update debt");
        }
    },
);

export const deleteDebt = createAsyncThunk<string, string, { rejectValue: string }>("debts/deleteDebt", async (debtId, { rejectWithValue }) => {
    try {
        await debtService.deleteDebt(debtId);
        return debtId;
    } catch {
        return rejectWithValue("Failed to delete debt");
    }
});

export const recordEMIPayment = createAsyncThunk<{ payment: IEMIPayment; updatedDebt: IDebt }, Omit<IEMIPayment, "_id">, { rejectValue: string }>(
    "debts/recordEMIPayment",
    async (payment, { rejectWithValue }) => {
        try {
            return await debtService.recordEMIPayment(payment);
        } catch {
            return rejectWithValue("Failed to record EMI payment");
        }
    },
);

// --- Slice ---

const debtSlice = createSlice({
    name: "debts",
    initialState,
    reducers: {
        setAIDebtStrategy: (state, action: PayloadAction<IAIDebtStrategy | null>) => {
            state.aiStrategy = action.payload;
        },
        clearDebtError: (state) => {
            state.error = null;
        },
        optimisticCreateDebt: (state, action: PayloadAction<IDebt>) => {
            state.debts.push(action.payload);
        },
        optimisticUpdateDebt: (state, action: PayloadAction<IDebt>) => {
            const idx = state.debts.findIndex((d) => d._id === action.payload._id);
            if (idx !== -1) {
                state.debts[idx] = action.payload;
            }
        },
        optimisticDeleteDebt: (state, action: PayloadAction<string>) => {
            state.debts = state.debts.filter((d) => d._id !== action.payload);
        },
        revertDebts: (state, action: PayloadAction<IDebt[]>) => {
            state.debts = action.payload;
        },
    },
    extraReducers: (builder) => {
        // listDebts
        builder.addCase(listDebts.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(listDebts.fulfilled, (state, action: PayloadAction<IDebt[]>) => {
            state.loading = false;
            state.debts = action.payload;
        });
        builder.addCase(listDebts.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload ?? "Failed to fetch debts";
        });

        // createDebt
        builder.addCase(createDebt.fulfilled, (state, action: PayloadAction<IDebt>) => {
            state.loading = false;
            state.debts.push(action.payload);
        });
        builder.addCase(createDebt.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload ?? "Failed to create debt";
        });

        // updateDebt
        builder.addCase(updateDebt.fulfilled, (state, action: PayloadAction<IDebt>) => {
            state.loading = false;
            const idx = state.debts.findIndex((d) => d._id === action.payload._id);
            if (idx !== -1) {
                state.debts[idx] = action.payload;
            }
        });
        builder.addCase(updateDebt.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload ?? "Failed to update debt";
        });

        // deleteDebt
        builder.addCase(deleteDebt.fulfilled, (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.debts = state.debts.filter((d) => d._id !== action.payload);
        });
        builder.addCase(deleteDebt.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload ?? "Failed to delete debt";
        });

        // recordEMIPayment
        builder.addCase(recordEMIPayment.fulfilled, (state, action) => {
            state.loading = false;
            const { payment, updatedDebt } = action.payload;

            // Update the debt in state
            const idx = state.debts.findIndex((d) => d._id === updatedDebt._id);
            if (idx !== -1) {
                state.debts[idx] = updatedDebt;
            }

            // Auto-set status to PAID_OFF when remainingBalance <= 0
            if (idx !== -1 && state.debts[idx].remainingBalance <= 0) {
                state.debts[idx].status = "PAID_OFF";
            }

            // Push the payment to emiPayments
            state.emiPayments.push(payment);
        });
        builder.addCase(recordEMIPayment.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload ?? "Failed to record EMI payment";
        });
    },
});

export const { setAIDebtStrategy, clearDebtError, optimisticCreateDebt, optimisticUpdateDebt, optimisticDeleteDebt, revertDebts } = debtSlice.actions;
export default debtSlice.reducer;
