import { axiosClient } from '../../../shared/services/axiosClient'
import { API_ROUTES } from '../../../routes'
import type { IAISuggestion } from '../types/ai'

export interface CategorySuggestion {
  transactionId: string
  narration: string
  amount: number
  currentCategory: string
  suggestedCategory: string
  confidence: number
  reasoning: string
}

export interface CategorizationResult {
  transactionId: string
  oldCategory: string
  newCategory: string
  confidence: number
  reasoning: string
}

export interface DebtStrategy {
  totalDebt: number
  monthlyIncome: number
  totalEMI: number
  availableForDebt: number
  strategy: string
  recommendations: string[]
  payoffTimeline: string
  priorityDebts: Array<{
    debtName: string
    priority: number
    reasoning: string
  }>
}

export interface BudgetRecommendation {
  category: string
  recommendedAmount: number
  currentAmount: number
  reasoning: string
  adjustmentType: 'increase' | 'decrease' | 'maintain'
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export const fetchAnnotationSuggestions = async (transactionIds: string[]): Promise<IAISuggestion[]> => {
  const response = await axiosClient.post<IAISuggestion[]>(API_ROUTES.ai.annotate, {
    transactionIds,
  })
  return response.data
}

export const getSuggestedCategories = async (
  transactionIds?: string[],
  all = false
): Promise<{
  message: string
  total: number
  suggestions: CategorySuggestion[]
}> => {
  const response = await axiosClient.post<{
    status: boolean
    output: {
      message: string
      total: number
      suggestions: CategorySuggestion[]
    }
  }>(API_ROUTES.ai.suggestCategories, transactionIds ? { transactionIds } : { all })
  return response.data.output
}

export const applyCategorySuggestions = async (
  suggestions: Array<{ transactionId: string; category: string; confidence: number }>
): Promise<{
  message: string
  applied: number
  failed: number
  details: {
    applied: Array<{ transactionId: string; category: string; confidence: number }>
    failed: Array<{ transactionId: string; reason: string }>
  }
}> => {
  const response = await axiosClient.post<{
    status: boolean
    output: {
      message: string
      applied: number
      failed: number
      details: {
        applied: Array<{ transactionId: string; category: string; confidence: number }>
        failed: Array<{ transactionId: string; reason: string }>
      }
    }
  }>(API_ROUTES.ai.applySuggestions, { suggestions })
  return response.data.output
}

export const rejectCategorySuggestions = async (
  transactionIds: string[]
): Promise<{
  message: string
  rejected: number
}> => {
  const response = await axiosClient.post<{
    status: boolean
    output: {
      message: string
      rejected: number
    }
  }>(API_ROUTES.ai.rejectSuggestions, { transactionIds })
  return response.data.output
}

export const getDebtStrategy = async (
  monthlyIncome?: number
): Promise<{
  message: string
  strategy: DebtStrategy | null
}> => {
  const response = await axiosClient.post<{
    status: boolean
    output: {
      message: string
      strategy: DebtStrategy | null
    }
  }>(API_ROUTES.ai.debtStrategy, { monthlyIncome })
  return response.data.output
}

export const getBudgetRecommendations = async (
  monthlyIncome?: number
): Promise<{
  message: string
  recommendations: BudgetRecommendation[]
}> => {
  const response = await axiosClient.post<{
    status: boolean
    output: {
      message: string
      recommendations: BudgetRecommendation[]
    }
  }>(API_ROUTES.ai.budgetRecommendations, { monthlyIncome })
  return response.data.output
}

export const chatWithAI = async (
  message: string,
  sessionId?: string
): Promise<{
  message: string
  response: string
  sessionId: string
}> => {
  const response = await axiosClient.post<{
    status: boolean
    output: {
      message: string
      response: string
      sessionId: string
    }
  }>(API_ROUTES.ai.chat, { message, sessionId })
  return response.data.output
}

export const getChatHistory = async (
  sessionId?: string
): Promise<{
  chatHistory?: {
    sessionId: string
    messages: ChatMessage[]
  }
  sessions?: Array<{
    sessionId: string
    lastMessageAt: Date
    messages: ChatMessage[]
  }>
}> => {
  const response = await axiosClient.get<{
    status: boolean
    output: {
      chatHistory?: {
        sessionId: string
        messages: ChatMessage[]
      }
      sessions?: Array<{
        sessionId: string
        lastMessageAt: Date
        messages: ChatMessage[]
      }>
    }
  }>(sessionId ? `${API_ROUTES.ai.chatHistory}?sessionId=${sessionId}` : API_ROUTES.ai.chatHistory)
  return response.data.output
}

export const clearChatHistory = async (sessionId?: string): Promise<{ message: string }> => {
  const response = await axiosClient.delete<{
    status: boolean
    output: { message: string }
  }>(API_ROUTES.ai.clearChatHistory(sessionId))
  return response.data.output
}
