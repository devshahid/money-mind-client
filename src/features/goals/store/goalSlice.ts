import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'

import type { IGoal, IGoalContribution } from '../types/goal'
import * as goalService from '../services/goalService'

type GoalState = {
  goals: IGoal[]
  contributions: IGoalContribution[]
  loading: boolean
  error: string | null
}

const initialState: GoalState = {
  goals: [],
  contributions: [],
  loading: false,
  error: null,
}

export const listGoals = createAsyncThunk<IGoal[], void, { rejectValue: string }>(
  'goals/listGoals',
  async (_, { rejectWithValue }) => {
    try {
      return await goalService.listGoals()
    } catch {
      return rejectWithValue('Failed to fetch goals')
    }
  }
)

export const createGoal = createAsyncThunk<
  IGoal,
  Omit<IGoal, '_id' | 'createdAt' | 'updatedAt' | 'isAchieved' | 'currentSavedAmount' | 'linkedTransactionIds'>,
  { rejectValue: string }
>('goals/createGoal', async (goal, { rejectWithValue }) => {
  try {
    return await goalService.createGoal(goal)
  } catch {
    return rejectWithValue('Failed to create goal')
  }
})

export const updateGoal = createAsyncThunk<IGoal, { goalId: string; data: Partial<IGoal> }, { rejectValue: string }>(
  'goals/updateGoal',
  async ({ goalId, data }, { rejectWithValue }) => {
    try {
      return await goalService.updateGoal(goalId, data)
    } catch {
      return rejectWithValue('Failed to update goal')
    }
  }
)

export const deleteGoal = createAsyncThunk<string, string, { rejectValue: string }>(
  'goals/deleteGoal',
  async (goalId, { rejectWithValue }) => {
    try {
      await goalService.deleteGoal(goalId)
      return goalId
    } catch {
      return rejectWithValue('Failed to delete goal')
    }
  }
)

export const recordContribution = createAsyncThunk<
  { contribution: IGoalContribution; updatedGoal: IGoal },
  Omit<IGoalContribution, '_id'>,
  { rejectValue: string }
>('goals/recordContribution', async (contribution, { rejectWithValue }) => {
  try {
    return await goalService.recordContribution(contribution)
  } catch {
    return rejectWithValue('Failed to record contribution')
  }
})

const goalSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    clearGoalError: state => {
      state.error = null
    },
    optimisticCreateGoal: (state, action: PayloadAction<IGoal>) => {
      state.goals.push(action.payload)
    },
    optimisticUpdateGoal: (state, action: PayloadAction<IGoal>) => {
      const idx = state.goals.findIndex(g => g._id === action.payload._id)
      if (idx !== -1) state.goals[idx] = action.payload
    },
    optimisticDeleteGoal: (state, action: PayloadAction<string>) => {
      state.goals = state.goals.filter(g => g._id !== action.payload)
    },
    revertGoals: (state, action: PayloadAction<IGoal[]>) => {
      state.goals = action.payload
    },
  },
  extraReducers: builder => {
    builder.addCase(listGoals.pending, state => {
      state.loading = true
      state.error = null
    })
    builder.addCase(listGoals.fulfilled, (state, action: PayloadAction<IGoal[]>) => {
      state.loading = false
      state.goals = action.payload
    })
    builder.addCase(listGoals.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload ?? 'Failed to fetch goals'
    })

    builder.addCase(createGoal.fulfilled, (state, action: PayloadAction<IGoal>) => {
      state.loading = false
      state.goals.push(action.payload)
    })
    builder.addCase(createGoal.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload ?? 'Failed to create goal'
    })

    builder.addCase(updateGoal.fulfilled, (state, action: PayloadAction<IGoal>) => {
      state.loading = false
      const idx = state.goals.findIndex(g => g._id === action.payload._id)
      if (idx !== -1) state.goals[idx] = action.payload
    })
    builder.addCase(updateGoal.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload ?? 'Failed to update goal'
    })

    builder.addCase(deleteGoal.fulfilled, (state, action: PayloadAction<string>) => {
      state.loading = false
      state.goals = state.goals.filter(g => g._id !== action.payload)
    })
    builder.addCase(deleteGoal.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload ?? 'Failed to delete goal'
    })

    builder.addCase(recordContribution.fulfilled, (state, action) => {
      state.loading = false
      const { contribution, updatedGoal } = action.payload
      const idx = state.goals.findIndex(g => g._id === updatedGoal._id)
      if (idx !== -1) state.goals[idx] = updatedGoal
      state.contributions.push(contribution)
    })
    builder.addCase(recordContribution.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload ?? 'Failed to record contribution'
    })
  },
})

export const { clearGoalError, optimisticCreateGoal, optimisticUpdateGoal, optimisticDeleteGoal, revertGoals } =
  goalSlice.actions
export const goalReducer = goalSlice.reducer
