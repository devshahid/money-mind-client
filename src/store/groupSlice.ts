import { createSlice, createAsyncThunk, PayloadAction, createSelector } from "@reduxjs/toolkit";
import { groupStore } from "../helpers/indexDB/groupStore";

export interface ITransactionGroup {
    id: string;
    name: string;
    involvedParty: string;
    notes: string;
    transactionIds: string[];
    createdAt: string;
    updatedAt: string;
}

export interface IGroupState {
    groups: ITransactionGroup[];
    loading: boolean;
    error: string | null;
}

const initialState: IGroupState = {
    groups: [],
    loading: false,
    error: null,
};

// Async thunks

export const loadGroups = createAsyncThunk<ITransactionGroup[], void, { rejectValue: string }>(
    "groups/loadGroups",
    async (_, { rejectWithValue }) => {
        try {
            const groups = await groupStore.getAllGroups();
            return groups;
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : "Failed to load groups");
        }
    },
);

export const createGroup = createAsyncThunk<
    ITransactionGroup,
    { name: string; involvedParty: string; notes: string; transactionIds: string[] },
    { rejectValue: string }
>("groups/createGroup", async (payload, { rejectWithValue }) => {
    try {
        const now = new Date().toISOString();
        const group: ITransactionGroup = {
            id: crypto.randomUUID(),
            name: payload.name,
            involvedParty: payload.involvedParty,
            notes: payload.notes,
            transactionIds: payload.transactionIds,
            createdAt: now,
            updatedAt: now,
        };
        await groupStore.saveGroup(group);
        return group;
    } catch (error: unknown) {
        return rejectWithValue(error instanceof Error ? error.message : "Failed to create group");
    }
});

export const updateGroup = createAsyncThunk<ITransactionGroup, Partial<ITransactionGroup> & { id: string }, { rejectValue: string }>(
    "groups/updateGroup",
    async (payload, { rejectWithValue }) => {
        try {
            const existing = await groupStore.getGroup(payload.id);
            if (!existing) {
                return rejectWithValue("Group not found");
            }
            const updated: ITransactionGroup = {
                ...existing,
                ...payload,
                updatedAt: new Date().toISOString(),
            };
            await groupStore.saveGroup(updated);
            return updated;
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : "Failed to update group");
        }
    },
);

export const deleteGroup = createAsyncThunk<string, string, { rejectValue: string }>("groups/deleteGroup", async (id, { rejectWithValue }) => {
    try {
        await groupStore.deleteGroup(id);
        return id;
    } catch (error: unknown) {
        return rejectWithValue(error instanceof Error ? error.message : "Failed to delete group");
    }
});

export const addTransactionsToGroup = createAsyncThunk<ITransactionGroup, { groupId: string; transactionIds: string[] }, { rejectValue: string }>(
    "groups/addTransactionsToGroup",
    async ({ groupId, transactionIds }, { rejectWithValue }) => {
        try {
            const existing = await groupStore.getGroup(groupId);
            if (!existing) {
                return rejectWithValue("Group not found");
            }
            const deduped = Array.from(new Set([...existing.transactionIds, ...transactionIds]));
            const updated: ITransactionGroup = {
                ...existing,
                transactionIds: deduped,
                updatedAt: new Date().toISOString(),
            };
            await groupStore.saveGroup(updated);
            return updated;
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : "Failed to add transactions to group");
        }
    },
);

export const removeTransactionFromGroup = createAsyncThunk<ITransactionGroup, { groupId: string; transactionId: string }, { rejectValue: string }>(
    "groups/removeTransactionFromGroup",
    async ({ groupId, transactionId }, { rejectWithValue }) => {
        try {
            const existing = await groupStore.getGroup(groupId);
            if (!existing) {
                return rejectWithValue("Group not found");
            }
            const updated: ITransactionGroup = {
                ...existing,
                transactionIds: existing.transactionIds.filter((id) => id !== transactionId),
                updatedAt: new Date().toISOString(),
            };
            await groupStore.saveGroup(updated);
            return updated;
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : "Failed to remove transaction from group");
        }
    },
);

// Slice

const groupSlice = createSlice({
    name: "groupSlice",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // loadGroups
        builder.addCase(loadGroups.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(loadGroups.fulfilled, (state, action: PayloadAction<ITransactionGroup[]>) => {
            state.loading = false;
            state.groups = action.payload;
        });
        builder.addCase(loadGroups.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload ?? action.error.message ?? "Failed to load groups";
        });

        // createGroup
        builder.addCase(createGroup.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(createGroup.fulfilled, (state, action: PayloadAction<ITransactionGroup>) => {
            state.loading = false;
            state.groups.push(action.payload);
        });
        builder.addCase(createGroup.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload ?? action.error.message ?? "Failed to create group";
        });

        // updateGroup
        builder.addCase(updateGroup.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(updateGroup.fulfilled, (state, action: PayloadAction<ITransactionGroup>) => {
            state.loading = false;
            state.groups = state.groups.map((g) => (g.id === action.payload.id ? action.payload : g));
        });
        builder.addCase(updateGroup.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload ?? action.error.message ?? "Failed to update group";
        });

        // deleteGroup
        builder.addCase(deleteGroup.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(deleteGroup.fulfilled, (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.groups = state.groups.filter((g) => g.id !== action.payload);
        });
        builder.addCase(deleteGroup.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload ?? action.error.message ?? "Failed to delete group";
        });

        // addTransactionsToGroup
        builder.addCase(addTransactionsToGroup.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(addTransactionsToGroup.fulfilled, (state, action: PayloadAction<ITransactionGroup>) => {
            state.loading = false;
            state.groups = state.groups.map((g) => (g.id === action.payload.id ? action.payload : g));
        });
        builder.addCase(addTransactionsToGroup.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload ?? action.error.message ?? "Failed to add transactions to group";
        });

        // removeTransactionFromGroup
        builder.addCase(removeTransactionFromGroup.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(removeTransactionFromGroup.fulfilled, (state, action: PayloadAction<ITransactionGroup>) => {
            state.loading = false;
            state.groups = state.groups.map((g) => (g.id === action.payload.id ? action.payload : g));
        });
        builder.addCase(removeTransactionFromGroup.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload ?? action.error.message ?? "Failed to remove transaction from group";
        });
    },
});

export default groupSlice.reducer;

// Memoized selector

export const selectTransactionGroupMap = createSelector(
    [(state: { groups: IGroupState }): ITransactionGroup[] => state.groups.groups],
    (groups): Record<string, ITransactionGroup[]> => {
        const map: Record<string, ITransactionGroup[]> = {};
        for (const group of groups) {
            for (const txId of group.transactionIds) {
                if (!map[txId]) map[txId] = [];
                map[txId].push(group);
            }
        }
        return map;
    },
);
