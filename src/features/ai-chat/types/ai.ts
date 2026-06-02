export type IAISuggestion = {
  transactionId: string
  suggestedCategory: string
  suggestedLabels: string[]
  confidence: number
  accepted?: boolean
}

export type IAIGroupSuggestion = {
  transactionIds: string[]
  suggestedName: string
  confidence: number
  dismissed?: boolean
}

export type IAIDebtStrategy = {
  method: 'avalanche' | 'snowball'
  orderedDebtIds: string[]
  projectedPayoffDate: string
  rationale: string
}

export type IAIChatMessage = {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}
