import { SplitType } from "../types/splitTypes";
import { IMember } from "../store/groupSlice";
import { ITransactionLogs } from "../store/transactionSlice";

/**
 * Calculate the total debit amount from transactions
 */
export function calculateTotalDebits(transactions: ITransactionLogs[]): number {
    return transactions.reduce((sum, tx) => {
        if (!tx.isCredit) {
            return sum + (parseFloat(String(tx.amount)) || 0);
        }
        return sum;
    }, 0);
}

/**
 * Calculate the total credit amount from transactions
 */
export function calculateTotalCredits(transactions: ITransactionLogs[]): number {
    return transactions.reduce((sum, tx) => {
        if (tx.isCredit) {
            return sum + (parseFloat(String(tx.amount)) || 0);
        }
        return sum;
    }, 0);
}

/**
 * Calculate shares based on split type
 * Returns updated members array with calculated share values
 */
export function calculateShares(members: IMember[], splitType: SplitType, totalAmount: number): IMember[] {
    switch (splitType) {
        case SplitType.EQUAL_INCLUDE_PAYER:
            return calculateEqualSplitIncludePayer(members, totalAmount);

        case SplitType.EQUAL_EXCLUDE_PAYER:
            return calculateEqualSplitExcludePayer(members, totalAmount);

        case SplitType.CUSTOM_AMOUNTS:
            // For custom amounts, shares are manually set, so just return as is
            return members;

        case SplitType.PERCENTAGE_SPLIT:
            return calculatePercentageSplit(members, totalAmount);

        case SplitType.LOAN:
            return calculateLoanSplit(members, totalAmount);

        case SplitType.ITEMIZED:
            // For itemized, shares are manually assigned, so just return as is
            return members;

        default:
            // Default to equal split including payer
            return calculateEqualSplitIncludePayer(members, totalAmount);
    }
}

/**
 * Equal split where payer is also a beneficiary
 * Example: Movie ticket ₹3000 for 10 people including payer
 * Each person's share = ₹300 (including payer)
 */
function calculateEqualSplitIncludePayer(members: IMember[], totalAmount: number): IMember[] {
    if (members.length === 0) return members;

    const sharePerPerson = totalAmount / members.length;

    return members.map((member) => ({
        ...member,
        share: sharePerPerson,
    }));
}

/**
 * Equal split where payer is NOT a beneficiary
 * Example: ₹2000 paid for 4 others
 * Each other person's share = ₹500, payer's share = 0
 */
function calculateEqualSplitExcludePayer(members: IMember[], totalAmount: number): IMember[] {
    if (members.length === 0) return members;

    // Find who paid (assuming first member with paid > 0 is the payer)
    // Or find the member with max paid amount
    const payerIndex = members.reduce((maxIdx, member, idx, arr) => {
        return member.paid > arr[maxIdx].paid ? idx : maxIdx;
    }, 0);

    const nonPayerCount = members.length - 1;
    if (nonPayerCount <= 0) {
        // If only one member, they pay everything
        return members.map((member, idx) => ({
            ...member,
            share: idx === payerIndex ? 0 : totalAmount,
        }));
    }

    const sharePerPerson = totalAmount / nonPayerCount;

    return members.map((member, idx) => ({
        ...member,
        share: idx === payerIndex ? 0 : sharePerPerson,
    }));
}

/**
 * Percentage-based split
 * Example: 40%, 30%, 30% of total amount
 */
function calculatePercentageSplit(members: IMember[], totalAmount: number): IMember[] {
    return members.map((member) => ({
        ...member,
        share: member.percentage ? (totalAmount * member.percentage) / 100 : 0,
    }));
}

/**
 * Loan tracking - no split calculation
 * The lender's share is the total amount, borrower's is 0
 * Paid field tracks repayments
 */
function calculateLoanSplit(members: IMember[], totalAmount: number): IMember[] {
    if (members.length === 0) return members;

    // Find lender (person who paid)
    const lenderIndex = members.reduce((maxIdx, member, idx, arr) => {
        return member.paid > arr[maxIdx].paid ? idx : maxIdx;
    }, 0);

    return members.map((member, idx) => ({
        ...member,
        // Lender's share is 0 (they're getting money back)
        // Borrower's share is the amount they need to repay
        share: idx === lenderIndex ? 0 : totalAmount,
    }));
}

/**
 * Calculate net settlement for each member
 * Positive net = others owe them
 * Negative net = they owe others
 */
export function calculateMemberSettlement(member: IMember): number {
    return member.paid - member.share;
}

/**
 * Validate if all members have settled
 */
export function isGroupSettled(members: IMember[]): boolean {
    return members.every((member) => Math.abs(calculateMemberSettlement(member)) < 0.01);
}

/**
 * Calculate who owes whom and how much
 * Returns simplified settlement suggestions
 */
export interface SettlementSuggestion {
    from: string;
    to: string;
    amount: number;
}

export function calculateSettlements(members: IMember[]): SettlementSuggestion[] {
    // Create arrays of debtors (owe money) and creditors (are owed money)
    const debtors: { name: string; amount: number }[] = [];
    const creditors: { name: string; amount: number }[] = [];

    members.forEach((member) => {
        const net = calculateMemberSettlement(member);
        if (net > 0.01) {
            creditors.push({ name: member.name, amount: net });
        } else if (net < -0.01) {
            debtors.push({ name: member.name, amount: -net });
        }
    });

    // Sort by amount to optimize settlements
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const settlements: SettlementSuggestion[] = [];
    let debtorIdx = 0;
    let creditorIdx = 0;

    while (debtorIdx < debtors.length && creditorIdx < creditors.length) {
        const debtor = debtors[debtorIdx];
        const creditor = creditors[creditorIdx];

        const settleAmount = Math.min(debtor.amount, creditor.amount);

        settlements.push({
            from: debtor.name,
            to: creditor.name,
            amount: settleAmount,
        });

        debtor.amount -= settleAmount;
        creditor.amount -= settleAmount;

        if (debtor.amount < 0.01) debtorIdx++;
        if (creditor.amount < 0.01) creditorIdx++;
    }

    return settlements;
}

/**
 * Get a user-friendly explanation of the split type
 */
export function getSplitTypeExplanation(splitType: SplitType, totalAmount: number, memberCount: number): string {
    switch (splitType) {
        case SplitType.EQUAL_INCLUDE_PAYER:
            return `Total ₹${totalAmount.toFixed(2)} split equally among ${memberCount} people = ₹${(totalAmount / memberCount).toFixed(2)} per person (including payer)`;

        case SplitType.EQUAL_EXCLUDE_PAYER:
            return `Total ₹${totalAmount.toFixed(2)} split equally among ${memberCount - 1} people (excluding payer) = ₹${(totalAmount / (memberCount - 1)).toFixed(2)} per person`;

        case SplitType.CUSTOM_AMOUNTS:
            return `Custom amounts assigned to each member`;

        case SplitType.PERCENTAGE_SPLIT:
            return `Total ₹${totalAmount.toFixed(2)} split by custom percentages`;

        case SplitType.LOAN:
            return `Loan of ₹${totalAmount.toFixed(2)} being tracked`;

        case SplitType.ITEMIZED:
            return `Each member responsible for specific items`;

        default:
            return "";
    }
}
