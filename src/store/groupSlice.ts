import { createSlice, createAsyncThunk, PayloadAction, createSelector } from "@reduxjs/toolkit";
import { groupStore } from "../helpers/indexDB/groupStore";
import axiosClient from "../services/axiosClient";
import { AxiosError } from "axios";
import { SplitType, SplitConfiguration } from "../types/splitTypes";

export interface IMember {
    name: string;
    share: number;
    paid: number;
    percentage?: number; // For percentage-based splits
}

export interface ITransactionGroup {
    id: string;
    name: string;
    involvedParty: string;
    members: IMember[];
    notes: string;
    transactionIds: string[];
    createdAt: string;
    updatedAt: string;
    splitType?: SplitType; // Optional for backward compatibility
    splitConfig?: SplitConfiguration; // Additional configuration for split
}

export interface IGroupState {
    groups: ITransactionGroup[];
    loading: boolean;
    error: string | null;
    isLocalGroups: boolean;
    groupSyncStatus: "idle" | "success" | "error";
}

const initialState: IGroupState = {
    groups: [],
    loading: false,
    error: null,
    isLocalGroups: false,
    groupSyncStatus: "idle",
};

// Map frontend group (id) to backend format (clientId) for API calls
const toApiGroup = ({ id, ...rest }: ITransactionGroup): Record<string, unknown> => ({
    ...rest,
    clientId: id,
});

// Map backend group (clientId, _id) to frontend format (id)
const fromApiGroup = (apiGroup: Record<string, unknown>): ITransactionGroup => ({
    ...(apiGroup as unknown as ITransactionGroup),
    id: (apiGroup.clientId as string) || (apiGroup._id as string) || (apiGroup.id as string),
});

// Async thunks

export const loadGroups = createAsyncThunk<{ groups: ITransactionGroup[]; hasLocal: boolean }, void, { rejectValue: string }>(
    "groups/loadGroups",
    async (_, { rejectWithValue }) => {
        try {
            const localGroups = await groupStore.getAllGroups();

            // Try fetching from API first
            try {
                const response = await axiosClient.get<{ output: Record<string, unknown>[] }>("/transaction-groups/list");
                const serverGroups = response.data.output.map(fromApiGroup);

                const deletedIds: string[] = await groupStore.getDeletedIds();

                // Filter out locally-deleted groups from server response
                const filteredServerGroups = serverGroups.filter((g) => !deletedIds.includes(g.id));

                // Merge: local groups override server groups by id, plus any new local-only groups
                const serverMap = new Map(filteredServerGroups.map((g) => [g.id, g]));
                const merged = [...filteredServerGroups];

                for (const local of localGroups) {
                    if (serverMap.has(local.id)) {
                        // Local edit overrides server version
                        const idx = merged.findIndex((g) => g.id === local.id);
                        if (idx !== -1) merged[idx] = local;
                    } else {
                        // New local group not yet on server
                        merged.push(local);
                    }
                }

                const hasLocal = localGroups.length > 0 || deletedIds.length > 0;
                return { groups: merged, hasLocal };
            } catch {
                // API failed (offline or no backend yet), fall back to IndexedDB only
                return { groups: localGroups, hasLocal: localGroups.length > 0 };
            }
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : "Failed to load groups");
        }
    },
);

export const createGroup = createAsyncThunk<
    ITransactionGroup,
    { name: string; involvedParty: string; members: IMember[]; notes: string; transactionIds: string[] },
    { rejectValue: string }
>("groups/createGroup", async (payload, { rejectWithValue }) => {
    try {
        const now = new Date().toISOString();
        const group: ITransactionGroup = {
            id: crypto.randomUUID(),
            name: payload.name,
            involvedParty: payload.involvedParty,
            members: payload.members,
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
    async (payload, { rejectWithValue, getState }) => {
        try {
            // Try IndexedDB first, fall back to Redux state (group may be API-sourced after sync)
            let existing = await groupStore.getGroup(payload.id);
            if (!existing) {
                const state = getState() as { groups: IGroupState };
                existing = state.groups.groups.find((g) => g.id === payload.id);
            }
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
        // Delete from IndexedDB if it exists (no-op if not there)
        await groupStore.deleteGroup(id);
        // Track the deletion so sync can tell the server

        await groupStore.addDeletedId(id);
        return id;
    } catch (error: unknown) {
        return rejectWithValue(error instanceof Error ? error.message : "Failed to delete group");
    }
});

export const addTransactionsToGroup = createAsyncThunk<ITransactionGroup, { groupId: string; transactionIds: string[] }, { rejectValue: string }>(
    "groups/addTransactionsToGroup",
    async ({ groupId, transactionIds }, { rejectWithValue, getState }) => {
        try {
            let existing = await groupStore.getGroup(groupId);
            if (!existing) {
                const state = getState() as { groups: IGroupState };
                existing = state.groups.groups.find((g) => g.id === groupId);
            }
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
    async ({ groupId, transactionId }, { rejectWithValue, getState }) => {
        try {
            let existing = await groupStore.getGroup(groupId);
            if (!existing) {
                const state = getState() as { groups: IGroupState };
                existing = state.groups.groups.find((g) => g.id === groupId);
            }
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

// Sync groups to backend
export const syncGroups = createAsyncThunk<ITransactionGroup[], void, { rejectValue: string }>(
    "groups/syncGroups",
    async (_, { rejectWithValue }) => {
        try {
            const localGroups = await groupStore.getAllGroups();

            const deletedIds: string[] = await groupStore.getDeletedIds();
            const apiPayload = localGroups.map(toApiGroup);
            const response = await axiosClient.put<{ output: { groups: Record<string, unknown>[] } }>("/transaction-groups/sync", {
                groups: apiPayload,
                deletedClientIds: deletedIds,
            });
            const serverGroups = response.data.output.groups.map(fromApiGroup);

            // Clear local IndexedDB — server is now the source of truth
            for (const group of localGroups) {
                await groupStore.deleteGroup(group.id);
            }

            await groupStore.clearDeletedIds();

            // Groups stay visible in Redux from the server response
            return serverGroups;
        } catch (error: unknown) {
            if (error instanceof AxiosError && error.response?.data) {
                return rejectWithValue((error.response?.data as string) || "Failed to sync groups");
            }
            return rejectWithValue("An unknown error occurred while syncing groups");
        }
    },
);

// Slice

const groupSlice = createSlice({
    name: "groupSlice",
    initialState,
    reducers: {
        setIsLocalGroups: (state, action: PayloadAction<boolean>) => {
            state.isLocalGroups = action.payload;
        },
        resetGroupSyncStatus: (state) => {
            state.groupSyncStatus = "idle";
        },
    },
    extraReducers: (builder) => {
        // loadGroups
        builder.addCase(loadGroups.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(loadGroups.fulfilled, (state, action: PayloadAction<{ groups: ITransactionGroup[]; hasLocal: boolean }>) => {
            state.loading = false;
            state.groups = action.payload.groups;
            state.isLocalGroups = action.payload.hasLocal;
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
            state.isLocalGroups = true;
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
            state.isLocalGroups = true;
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
            state.isLocalGroups = true;
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
            state.isLocalGroups = true;
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
            state.isLocalGroups = true;
        });
        builder.addCase(removeTransactionFromGroup.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload ?? action.error.message ?? "Failed to remove transaction from group";
        });

        // syncGroups
        builder.addCase(syncGroups.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(syncGroups.fulfilled, (state, action: PayloadAction<ITransactionGroup[]>) => {
            state.loading = false;
            state.groups = action.payload;
            state.isLocalGroups = false;
            state.groupSyncStatus = "success";
        });
        builder.addCase(syncGroups.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload ?? action.error.message ?? "Failed to sync groups";
            state.groupSyncStatus = "error";
        });
    },
});

export const { setIsLocalGroups, resetGroupSyncStatus } = groupSlice.actions;
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
