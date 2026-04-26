export type IGoal = {
  _id: string
  name: string
  targetAmount: number
  currentSavedAmount: number
  deadline?: string
  description?: string
  isAchieved: boolean
  linkedTransactionIds: string[]
  createdAt: string
  updatedAt: string
}

export type IGoalContribution = {
  _id: string
  goalId: string
  amount: number
  date: string
  transactionId?: string
}
