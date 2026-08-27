import { openDB, IDBPDatabase, DBSchema } from 'idb'

import type { ITransactionLogs } from '../../store/transactionSlice'
import type { ITransactionGroup } from '../../store/groupSlice'
import type { IDebt } from '../../../debts/types/debt'
import type { IGoal } from '../../../goals/types/goal'
import type { IBudget } from '../../../budget/types/budget'
import type { ILedger, ILedgerEntry, ILedgerSyncOperation } from '../../types/ledger'

interface ExpenseDB extends DBSchema {
  edited_transactions: {
    key: string
    value: Partial<ITransactionLogs>
  }
  labels: {
    key: string
    value: {
      key: string
      labels: string[]
    }
  }
  transaction_groups: {
    key: string
    value: ITransactionGroup
  }
  pending_groups: {
    key: string
    value: Partial<ITransactionGroup>
  }
  pending_debts: {
    key: string
    value: Partial<IDebt>
  }
  pending_goals: {
    key: string
    value: Partial<IGoal>
  }
  pending_budgets: {
    key: string
    value: Partial<IBudget>
  }
  ledgers: {
    key: string
    value: ILedger
  }
  ledger_entries: {
    key: string
    value: ILedgerEntry
    indexes: {
      ledgerId_transactionId: [string, string]
    }
  }
  ledger_sync_operations: {
    key: string
    value: ILedgerSyncOperation
  }
}

let dbPromise: Promise<IDBPDatabase<ExpenseDB>> | undefined

export function initDB(): Promise<IDBPDatabase<ExpenseDB>> {
  if (dbPromise === undefined) {
    dbPromise = openDB<ExpenseDB>('ExpenseTrackerDB', 8, {
      upgrade(db: IDBPDatabase<ExpenseDB>, oldVersion: number) {
        if (oldVersion < 2) {
          if (!db.objectStoreNames.contains('edited_transactions')) {
            db.createObjectStore('edited_transactions', { keyPath: '_id' })
          }
          if (!db.objectStoreNames.contains('labels')) {
            db.createObjectStore('labels', { keyPath: 'key' })
          }
        }
        if (oldVersion < 3) {
          if (!db.objectStoreNames.contains('pending_groups')) {
            db.createObjectStore('pending_groups', { keyPath: '_id' })
          }
          if (!db.objectStoreNames.contains('pending_debts')) {
            db.createObjectStore('pending_debts', { keyPath: '_id' })
          }
          if (!db.objectStoreNames.contains('pending_goals')) {
            db.createObjectStore('pending_goals', { keyPath: '_id' })
          }
          if (!db.objectStoreNames.contains('pending_budgets')) {
            db.createObjectStore('pending_budgets', { keyPath: '_id' })
          }
        }
        if (oldVersion < 6) {
          if (!db.objectStoreNames.contains('transaction_groups')) {
            db.createObjectStore('transaction_groups', { keyPath: 'id' })
          }
        }
        if (oldVersion < 7) {
          if (!db.objectStoreNames.contains('ledgers')) {
            db.createObjectStore('ledgers', { keyPath: 'id' })
          }
          if (!db.objectStoreNames.contains('ledger_entries')) {
            db.createObjectStore('ledger_entries', { keyPath: 'id' })
          }
        }
        if (oldVersion < 8) {
          // Schema upgrades must only issue synchronous IDB schema operations.
          // Awaiting cursor work here can leave the version-change transaction
          // inactive and make *every* later IndexedDB read fail. The ledger
          // store removes legacy duplicates during normal reads instead.
          const entries = db.transaction('ledger_entries', 'readwrite').objectStore('ledger_entries')
          if (!entries.indexNames.contains('ledgerId_transactionId')) {
            ;(entries as unknown as IDBObjectStore).createIndex('ledgerId_transactionId', ['ledgerId', 'transactionId'])
          }
          if (!db.objectStoreNames.contains('ledger_sync_operations')) {
            db.createObjectStore('ledger_sync_operations', { keyPath: 'id' })
          }
        }
      },
    }).catch(err => {
      dbPromise = undefined
      throw err
    })
  }
  return dbPromise
}
