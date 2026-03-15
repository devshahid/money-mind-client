// db.ts
import { openDB, IDBPDatabase, DBSchema } from "idb";
import { ITransactionLogs } from "../../store/transactionSlice";
import { ITransactionGroup } from "../../types/transactionGroup";
import { IDebt } from "../../types/debt";
import { IGoal } from "../../types/goal";
import { IBudget } from "../../types/budget";

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
    pending_groups: {
        key: string;
        value: Partial<ITransactionGroup>;
    };
    pending_debts: {
        key: string;
        value: Partial<IDebt>;
    };
    pending_goals: {
        key: string;
        value: Partial<IGoal>;
    };
    pending_budgets: {
        key: string;
        value: Partial<IBudget>;
    };
}

let dbPromise: Promise<IDBPDatabase<ExpenseDB>>;

export function initDB(): Promise<IDBPDatabase<ExpenseDB>> {
    if (dbPromise === undefined) {
        dbPromise = openDB<ExpenseDB>("ExpenseTrackerDB", 3, {
            upgrade(db: IDBPDatabase<ExpenseDB>, oldVersion: number) {
                if (oldVersion < 2) {
                    if (!db.objectStoreNames.contains("edited_transactions")) {
                        db.createObjectStore("edited_transactions", { keyPath: "_id" });
                    }
                    if (!db.objectStoreNames.contains("labels")) {
                        db.createObjectStore("labels", { keyPath: "key" });
                    }
                }
                if (oldVersion < 3) {
                    if (!db.objectStoreNames.contains("pending_groups")) {
                        db.createObjectStore("pending_groups", { keyPath: "_id" });
                    }
                    if (!db.objectStoreNames.contains("pending_debts")) {
                        db.createObjectStore("pending_debts", { keyPath: "_id" });
                    }
                    if (!db.objectStoreNames.contains("pending_goals")) {
                        db.createObjectStore("pending_goals", { keyPath: "_id" });
                    }
                    if (!db.objectStoreNames.contains("pending_budgets")) {
                        db.createObjectStore("pending_budgets", { keyPath: "_id" });
                    }
                }
            },
        });
    }
    return dbPromise;
}
