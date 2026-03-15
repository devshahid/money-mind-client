import dayjs from "dayjs";
import { ITransaction } from "../types/transaction";

/**
 * Groups transactions by "YYYY-MM" month and aggregates income (credits) and
 * expense (debits) for each month. Returns results sorted by month ascending.
 */
export function aggregateMonthlyIncomeExpense(transactions: ITransaction[]): { month: string; income: number; expense: number }[] {
    const map = new Map<string, { income: number; expense: number }>();

    for (const tx of transactions) {
        const month = dayjs(tx.transactionDate).format("YYYY-MM");
        const amount = parseFloat(tx.amount) || 0;
        const entry = map.get(month) ?? { income: 0, expense: 0 };

        if (tx.isCredit) {
            entry.income += amount;
        } else {
            entry.expense += amount;
        }

        map.set(month, entry);
    }

    return Array.from(map.entries())
        .map(([month, { income, expense }]) => ({ month, income, expense }))
        .sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Aggregates debit transactions by category, with optional date range and bank
 * name filters. Returns results sorted by amount descending.
 */
export function aggregateCategoryBreakdown(
    transactions: ITransaction[],
    filters?: { dateFrom?: string; dateTo?: string; bankName?: string },
): { category: string; amount: number }[] {
    let filtered = transactions.filter((tx) => !tx.isCredit);

    if (filters?.dateFrom) {
        const from = dayjs(filters.dateFrom).startOf("day");
        filtered = filtered.filter((tx) => !dayjs(tx.transactionDate).isBefore(from));
    }

    if (filters?.dateTo) {
        const to = dayjs(filters.dateTo).endOf("day");
        filtered = filtered.filter((tx) => !dayjs(tx.transactionDate).isAfter(to));
    }

    if (filters?.bankName) {
        filtered = filtered.filter((tx) => tx.bankName === filters.bankName);
    }

    const map = new Map<string, number>();

    for (const tx of filtered) {
        const amount = parseFloat(tx.amount) || 0;
        map.set(tx.category, (map.get(tx.category) ?? 0) + amount);
    }

    return Array.from(map.entries())
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount);
}

/**
 * Groups transactions by "YYYY-MM" month and computes net savings (income minus
 * expense) for each month. Returns results sorted by month ascending.
 */
export function aggregateNetSavingsTrend(transactions: ITransaction[]): { month: string; netSavings: number }[] {
    const monthly = aggregateMonthlyIncomeExpense(transactions);
    return monthly.map(({ month, income, expense }) => ({
        month,
        netSavings: income - expense,
    }));
}
