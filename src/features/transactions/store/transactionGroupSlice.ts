import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'

import type { ITransactionGroup } from '../types/transactionGroup'
import type { IAIGroupSuggestion } from '../../ai-chat/types/ai'
import * as groupService from '../services/transactionGroupService'

type TransactionGroupState = {
  groups: ITransactionGroup[]
  loading: boolean
  error: string | null
  aiGroupSuggestions: IAIGroupSuggestion[]
}

const initialState: TransactionGroupState = {
  groups: [],
  loading: false,
  error: null,
  aiGroupSuggestions: [],
}

export function isTransactionGrouped(groups: ITransactionGroup[], transactionId: string): boolean {
  return groups.some(g => g.transactionIds.includes(transactionId))
}

export const listGroups = createAsyncThunk<ITransactionGroup[], void, { rejectValue: string }>(
  'transactionGroups/listGroups',
  async (_, { rejectWithValue }) => {
    try {
      return await groupService.listGroups()
    } catch {
      return rejectWithValue('Failed to fetch transaction groups')
    }
  }
)

export const createGroup = createAsyncThunk<
  ITransactionGroup,
  { name: string; transactionIds: string[] },
  { rejectValue: string }
>('transactionGroups/createGroup', async ({ name, transactionIds }, { rejectWithValue }) => {
  try {
    return await groupService.createGroup(name, transactionIds)
  } catch {
    return rejectWithValue('Failed to create transaction group')
  }
})

export const addToGroup = createAsyncThunk<
  ITransactionGroup,
  { groupId: string; transactionId: string },
  { rejectValue: string }
>('transactionGroups/addToGroup', async ({ groupId, transactionId }, { rejectWithValue }) => {
  try {
    return await groupService.addToGroup(groupId, transactionId)
  } catch {
    return rejectWithValue('Failed to add transaction to group')
  }
})

export const removeFromGroup = createAsyncThunk<
  { group: ITransactionGroup; removedTransactionId: string },
  { groupId: string; transactionId: string },
  { rejectValue: string }
>('transactionGroups/removeFromGroup', async ({ groupId, transactionId }, { rejectWithValue }) => {
  try {
    const updated = await groupService.removeFromGroup(groupId, transactionId)
    return { group: updated, removedTransactionId: transactionId }
  } catch {
    return rejectWithValue('Failed to remove transaction from group')
  }
})

export const dissolveGroup = createAsyncThunk<string, string, { rejectValue: string }>(
  'transactionGroups/dissolveGroup',
  async (groupId, { rejectWithValue }) => {
    try {
      await groupService.dissolveGroup(groupId)
      return groupId
    } catch {
      return rejectWithValue('Failed to dissolve transaction group')
    }
  }
)

const transactionGroupSlice = createSlice({
  name: 'transactionGroups',
  initialState,
  reducers: {
    optimisticCreateGroup: (state, action: PayloadAction<ITransactionGroup>) => {
      const incoming = action.payload.transactionIds
      const alreadyGrouped = incoming.find(txId => state.groups.some(g => g.transactionIds.includes(txId)))
      if (alreadyGrouped) {
        state.error = `Transaction ${alreadyGrouped} is already a member of another group`
        return
      }
      state.groups.push(action.payload)
    },
    revertGroup: (state, action: PayloadAction<string>) => {
      state.groups = state.groups.filter(g => g._id !== action.payload)
    },
    setAIGroupSuggestions: (state, action: PayloadAction<IAIGroupSuggestion[]>) => {
      state.aiGroupSuggestions = action.payload
    },
    dismissGroupSuggestion: (state, action: PayloadAction<string[]>) => {
      state.aiGroupSuggestions = state.aiGroupSuggestions.map(s =>
        s.transactionIds.every(id => action.payload.includes(id)) ? { ...s, dismissed: true } : s
      )
    },
    clearGroupError: state => {
      state.error = null
    },
  },
  extraReducers: builder => {
    builder.addCase(listGroups.pending, state => {
      state.loading = true
      state.error = null
    })
    builder.addCase(listGroups.fulfilled, (state, action: PayloadAction<ITransactionGroup[]>) => {
      state.loading = false
      state.groups = action.payload
    })
    builder.addCase(listGroups.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload ?? 'Failed to fetch groups'
    })

    builder.addCase(createGroup.fulfilled, (state, action: PayloadAction<ITransactionGroup>) => {
      state.loading = false
      const idx = state.groups.findIndex(g => g._id === action.payload._id)
      if (idx !== -1) {
        state.groups[idx] = action.payload
      } else {
        state.groups.push(action.payload)
      }
    })
    builder.addCase(createGroup.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload ?? 'Failed to create group'
    })

    builder.addCase(addToGroup.fulfilled, (state, action: PayloadAction<ITransactionGroup>) => {
      state.loading = false
      const idx = state.groups.findIndex(g => g._id === action.payload._id)
      if (idx !== -1) state.groups[idx] = action.payload
    })
    builder.addCase(addToGroup.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload ?? 'Failed to add to group'
    })

    builder.addCase(removeFromGroup.fulfilled, (state, action) => {
      state.loading = false
      const idx = state.groups.findIndex(g => g._id === action.payload.group._id)
      if (idx !== -1) state.groups[idx] = action.payload.group
    })
    builder.addCase(removeFromGroup.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload ?? 'Failed to remove from group'
    })

    builder.addCase(dissolveGroup.fulfilled, (state, action: PayloadAction<string>) => {
      state.loading = false
      state.groups = state.groups.filter(g => g._id !== action.payload)
    })
    builder.addCase(dissolveGroup.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload ?? 'Failed to dissolve group'
    })
  },
})

export const { optimisticCreateGroup, revertGroup, setAIGroupSuggestions, dismissGroupSuggestion, clearGroupError } =
  transactionGroupSlice.actions
export const transactionGroupReducer = transactionGroupSlice.reducer
