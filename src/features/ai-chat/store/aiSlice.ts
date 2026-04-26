import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'

import type { IAISuggestion, IAIGroupSuggestion, IAIDebtStrategy, IAIChatMessage } from '../types/ai'
import { axiosClient } from '../../../shared/services/axiosClient'
import { API_ROUTES } from '../../../routes'
import * as aiServiceModule from '../services/aiService'

export const sendChatMessage = createAsyncThunk<IAIChatMessage, string, { rejectValue: string }>(
  'ai/sendChatMessage',
  async (content, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post<{ data: IAIChatMessage }>(API_ROUTES.ai.chat, { content })
      return response.data.data
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send message'
      return rejectWithValue(message)
    }
  }
)

export const fetchAnnotationSuggestions = createAsyncThunk<IAISuggestion[], string[], { rejectValue: string }>(
  'ai/fetchAnnotationSuggestions',
  async (transactionIds, { rejectWithValue }) => {
    try {
      return await aiServiceModule.fetchAnnotationSuggestions(transactionIds)
    } catch {
      return rejectWithValue('Failed to fetch annotation suggestions')
    }
  }
)

type AIState = {
  annotationSuggestions: IAISuggestion[]
  groupSuggestions: IAIGroupSuggestion[]
  debtStrategy: IAIDebtStrategy | null
  chatHistory: IAIChatMessage[]
  loading: boolean
  error: string | null
}

const initialState: AIState = {
  annotationSuggestions: [],
  groupSuggestions: [],
  debtStrategy: null,
  chatHistory: [],
  loading: false,
  error: null,
}

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    acceptSuggestion(state, action: PayloadAction<string>) {
      const suggestion = state.annotationSuggestions.find(s => s.transactionId === action.payload)
      if (suggestion) suggestion.accepted = true
    },
    rejectSuggestion(state, action: PayloadAction<string>) {
      const suggestion = state.annotationSuggestions.find(s => s.transactionId === action.payload)
      if (suggestion) suggestion.accepted = false
    },
    addUserMessage(state, action: PayloadAction<string>) {
      state.chatHistory.push({
        role: 'user',
        content: action.payload,
        timestamp: new Date().toISOString(),
      })
    },
  },
  extraReducers: builder => {
    builder
      .addCase(sendChatMessage.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.loading = false
        state.chatHistory.push(action.payload)
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Failed to send message'
      })
      .addCase(fetchAnnotationSuggestions.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAnnotationSuggestions.fulfilled, (state, action) => {
        state.loading = false
        state.annotationSuggestions = action.payload
      })
      .addCase(fetchAnnotationSuggestions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Failed to fetch annotation suggestions'
      })
  },
})

export const { acceptSuggestion, rejectSuggestion, addUserMessage } = aiSlice.actions
export const aiReducer = aiSlice.reducer
