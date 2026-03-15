import axiosClient from "./axiosClient";
import { IGoal, IGoalContribution } from "../types/goal";

export const listGoals = async (): Promise<IGoal[]> => {
    const response = await axiosClient.get<IGoal[]>("/goals");
    return response.data;
};

export const createGoal = async (
    goal: Omit<IGoal, "_id" | "createdAt" | "updatedAt" | "isAchieved" | "currentSavedAmount" | "linkedTransactionIds">,
): Promise<IGoal> => {
    const response = await axiosClient.post<IGoal>("/goals", goal);
    return response.data;
};

export const updateGoal = async (goalId: string, data: Partial<IGoal>): Promise<IGoal> => {
    const response = await axiosClient.put<IGoal>(`/goals/${goalId}`, data);
    return response.data;
};

export const deleteGoal = async (goalId: string): Promise<void> => {
    await axiosClient.delete(`/goals/${goalId}`);
};

export const recordContribution = async (
    contribution: Omit<IGoalContribution, "_id">,
): Promise<{ contribution: IGoalContribution; updatedGoal: IGoal }> => {
    const response = await axiosClient.post<{ contribution: IGoalContribution; updatedGoal: IGoal }>("/goals/contributions", contribution);
    return response.data;
};
