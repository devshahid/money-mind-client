import type { IGoal } from '../types/goal'

export function applyContribution(
  goal: IGoal,
  amount: number
): Pick<IGoal, 'currentSavedAmount' | 'isAchieved'> & { remainingAmount: number } {
  const currentSavedAmount = goal.currentSavedAmount + amount
  const remainingAmount = goal.targetAmount - currentSavedAmount
  const isAchieved = currentSavedAmount >= goal.targetAmount

  return { currentSavedAmount, remainingAmount, isAchieved }
}
