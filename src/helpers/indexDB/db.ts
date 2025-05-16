// db.ts
import { openDB, IDBPDatabase, DBSchema } from "idb";
import { ITransactionLogs } from "../../store/transactionSlice";

interface ExpenseDB extends DBSchema {
    edited_transactions: {
        key: string;
        value: Partial<ITransactionLogs>;
    };
    labels: {
        key: string; // e.g., "listLabels"
        value: {
            key: string; // must match keyPath
            labels: string[];
        };
    };
}

let dbPromise: Promise<IDBPDatabase<ExpenseDB>>;

export function initDB(): Promise<IDBPDatabase<ExpenseDB>> {
    if (dbPromise === undefined) {
        dbPromise = openDB<ExpenseDB>("ExpenseTrackerDB", 2, {
            upgrade(db) {
                if (!db.objectStoreNames.contains("edited_transactions")) {
                    db.createObjectStore("edited_transactions", { keyPath: "_id" });
                }
                if (!db.objectStoreNames.contains("labels")) {
                    db.createObjectStore("labels", { keyPath: "key" }); // Store format: { key: 'listLabels', labels: string[] }
                }
            },
        });
    }
    return dbPromise;
}
