// db.ts
import { openDB, IDBPDatabase, DBSchema } from "idb";
import { ITransactionLogs } from "../../store/transactionSlice";
import { ITransactionGroup } from "../../store/groupSlice";

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
    transaction_groups: {
        key: string;
        value: ITransactionGroup;
    };
}

let dbPromise: Promise<IDBPDatabase<ExpenseDB>> | undefined;

export function initDB(): Promise<IDBPDatabase<ExpenseDB>> {
    if (dbPromise === undefined) {
        dbPromise = openDB<ExpenseDB>("ExpenseTrackerDB", 5, {
            upgrade(db) {
                if (!db.objectStoreNames.contains("edited_transactions")) {
                    db.createObjectStore("edited_transactions", { keyPath: "_id" });
                }
                if (!db.objectStoreNames.contains("labels")) {
                    db.createObjectStore("labels", { keyPath: "key" });
                }
                if (!db.objectStoreNames.contains("transaction_groups")) {
                    db.createObjectStore("transaction_groups", { keyPath: "id" });
                }
            },
        }).catch((err) => {
            dbPromise = undefined;
            throw err;
        });
    }
    return dbPromise;
}
