// transactionStore.ts
import { ITransactionLogs } from "../../store/transactionSlice";
import { initDB } from "./db";

class IndexDBTransactions {
    // Save or update a transaction
    async saveTransaction(transaction: Partial<ITransactionLogs>): Promise<string> {
        const db = await initDB();
        await db.put("edited_transactions", transaction);
        await this.saveLabels(transaction);
        return "transaction saved";
    }

    // Get all edited transactions
    async getAllTransactions(): Promise<ITransactionLogs[]> {
        const db = await initDB();
        const transactions = await db.getAll("edited_transactions");
        return transactions.map((transaction) => ({
            ...transaction,
            _id: transaction._id || "",
        })) as ITransactionLogs[];
    }

    async saveLabels(transaction: Partial<ITransactionLogs>): Promise<void> {
        const db = await initDB();
        if (!transaction.label || !Array.isArray(transaction.label)) return;
        const tx = db.transaction("labels", "readwrite");
        const store = tx.objectStore("labels");
        const existing = (await store.get("listLabels")) as { key: string; labels: string[] } | undefined;
        const currentLabels = existing?.labels ?? [];

        const updatedLabels = Array.from(new Set([...currentLabels, ...transaction.label]));

        await store.put({ key: "listLabels", labels: updatedLabels });
        await tx.done;
    }

    async getAllLabels(): Promise<{ label: string; _id: string }[]> {
        const db = await initDB();
        const result = await db.get("labels", "listLabels");
        // return results with _id which is unique:
        const labels = result?.labels.map((label) => {
            const timestamp = Date.now().toString(36);
            const randomString = Math.random().toString(36).substring(2, 15);

            return {
                label,
                _id: `labelId-${timestamp + randomString}`,
            };
        });
        return labels ?? [];
    }

    async deleteAllTransactions(): Promise<void> {
        const db = await initDB();

        // Clear the 'edited_transactions' store
        await db.clear("edited_transactions");
    }

    async deleteLabels(): Promise<void> {
        const db = await initDB();

        // Clear the 'labels' store
        await db.clear("labels");
    }
}

const indexDBTransaction = new IndexDBTransactions();
export { indexDBTransaction };
