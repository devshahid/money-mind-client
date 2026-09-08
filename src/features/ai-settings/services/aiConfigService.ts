import { axiosClient } from '../../../shared/services/axiosClient'
import { API_ROUTES } from '../../../routes'
import type { AIConfigResponse, AIConfigTestResponse, GeminiModel } from '../types'

export const getAIConfig = async (): Promise<AIConfigResponse> => {
  const response = await axiosClient.get<{ output: AIConfigResponse }>(API_ROUTES.ai.config.get)
  return response.data.output
}

export const saveAIConfig = async (model: GeminiModel, apiKey: string): Promise<AIConfigResponse> => {
  const response = await axiosClient.put<{ output: AIConfigResponse }>(API_ROUTES.ai.config.update, {
    model,
    apiKey,
  })
  return response.data.output
}

export const deleteAIConfig = async (): Promise<void> => {
  await axiosClient.delete(API_ROUTES.ai.config.delete)
}

export const testAIConfig = async (model: GeminiModel, apiKey: string): Promise<AIConfigTestResponse> => {
  const response = await axiosClient.post<{ output: AIConfigTestResponse }>(API_ROUTES.ai.config.test, {
    model,
    apiKey,
  })
  return response.data.output
}
