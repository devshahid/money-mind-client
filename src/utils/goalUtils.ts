import { IGoal } from "../types/goal";

/**
 * Applies a contribution amount to a goal and returns the updated fields.
 * Over-contribution is valid — the goal is marked achieved even if
 * currentSavedAmount exceeds targetAmount.
 */
export function applyContribution(goal: IGoal, amount: number): Pick<IGoal, "currentSavedAmount" | "isAchieved"> & { remainingAmount: number } {
    const currentSavedAmount = goal.currentSavedAmount + amount;
    const remainingAmount = goal.targetAmount - currentSavedAmount;
    const isAchieved = currentSavedAmount >= goal.targetAmount;

    return { currentSavedAmount, remainingAmount, isAchieved };
}
