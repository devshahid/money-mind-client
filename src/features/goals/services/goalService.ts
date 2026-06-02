import { axiosClient } from '../../../shared/services/axiosClient'
import { API_ROUTES } from '../../../routes'
import type { IGoal, IGoalContribution } from '../types/goal'

export const listGoals = async (): Promise<IGoal[]> => {
  const response = await axiosClient.get<IGoal[]>(API_ROUTES.goals.list)
  return response.data
}

export const createGoal = async (
  goal: Omit<IGoal, '_id' | 'createdAt' | 'updatedAt' | 'isAchieved' | 'currentSavedAmount' | 'linkedTransactionIds'>
): Promise<IGoal> => {
  const response = await axiosClient.post<IGoal>(API_ROUTES.goals.create, goal)
  return response.data
}

export const updateGoal = async (goalId: string, data: Partial<IGoal>): Promise<IGoal> => {
  const response = await axiosClient.put<IGoal>(API_ROUTES.goals.update(goalId), data)
  return response.data
}

export const deleteGoal = async (goalId: string): Promise<void> => {
  await axiosClient.delete(API_ROUTES.goals.delete(goalId))
}

export const recordContribution = async (
  contribution: Omit<IGoalContribution, '_id'>
): Promise<{ contribution: IGoalContribution; updatedGoal: IGoal }> => {
  const response = await axiosClient.post<{ contribution: IGoalContribution; updatedGoal: IGoal }>(
    API_ROUTES.goals.contributions,
    contribution
  )
  return response.data
}
