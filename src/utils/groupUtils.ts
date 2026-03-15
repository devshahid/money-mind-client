import { ITransaction } from "../types/transaction";

/**
 * Calculates the net balance for a group of transactions.
 * Credits add to the balance, debits subtract from it.
 */
export function calculateGroupBalance(transactions: ITransaction[]): number {
    return transactions.reduce((acc, tx) => {
        const amount = parseFloat(tx.amount) || 0;
        return tx.isCredit ? acc + amount : acc - amount;
    }, 0);
}
