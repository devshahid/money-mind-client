import { axiosClient } from '../../../shared/services/axiosClient'
import { API_ROUTES } from '../../../routes'
import type { IAISuggestion } from '../types/ai'

export const fetchAnnotationSuggestions = async (transactionIds: string[]): Promise<IAISuggestion[]> => {
  const response = await axiosClient.post<IAISuggestion[]>(API_ROUTES.ai.annotate, {
    transactionIds,
  })
  return response.data
}
