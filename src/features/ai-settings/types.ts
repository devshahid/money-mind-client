// Explicit allow-list mirroring the backend's supported Gemini models (no dynamic discovery).
export const GEMINI_MODELS = ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'] as const

export type GeminiModel = (typeof GEMINI_MODELS)[number]

export interface AIConfigResponse {
  configured: boolean
  provider?: 'gemini'
  model?: GeminiModel
  isActive?: boolean
}

export interface AIConfigTestResponse {
  success: boolean
}
