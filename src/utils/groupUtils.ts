import type { ITransactionGroup } from "../store/groupSlice";
import type { ITransactionLogs } from "../store/transactionSlice";

export interface GroupSummary {
    totalDebits: number;
    totalCredits: number;
    netSettlement: number;
    status: "Settled" | "Unsettled";
}

export function computeGroupSummary(group: ITransactionGroup, transactions: ITransactionLogs[]): GroupSummary {
    const memberTxs = transactions.filter((tx) => group.transactionIds.includes(tx._id));

    let totalDebits = 0;
    let totalCredits = 0;

    for (const tx of memberTxs) {
        const amount = parseFloat(tx.amount) || 0;
        if (tx.isCredit) {
            totalCredits += amount;
        } else {
            totalDebits += amount;
        }
    }

    const netSettlement = totalCredits - totalDebits;
    const status: GroupSummary["status"] = netSettlement === 0 ? "Settled" : "Unsettled";

    return { totalDebits, totalCredits, netSettlement, status };
}

export function mergeLabels(existing: string[], incoming: string[]): string[] {
    return Array.from(new Set([...existing, ...incoming]));
}
