import dayjs from "dayjs";
import { ITransaction } from "../types/transaction";

export function calculateSpentForBudget(transactions: ITransaction[], category: string, month: number, year: number): number {
    return transactions
        .filter((tx) => {
            const d = dayjs(tx.transactionDate);
            return !tx.isCredit && tx.category === category && d.month() + 1 === month && d.year() === year;
        })
        .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);
}

export function getBudgetStatus(spentAmount: number, limitAmount: number): { isWarning: boolean; isOverBudget: boolean } {
    const isOverBudget = spentAmount > limitAmount;
    const isWarning = !isOverBudget && spentAmount / limitAmount >= 0.8;
    return { isWarning, isOverBudget };
}
