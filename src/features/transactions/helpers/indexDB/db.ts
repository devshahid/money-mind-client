import { openDB, IDBPDatabase, DBSchema } from 'idb'

import type { ITransactionLogs } from '../../store/transactionSlice'
import type { ITransactionGroup } from '../../store/groupSlice'
import type { IDebt } from '../../../debts/types/debt'
import type { IGoal } from '../../../goals/types/goal'
import type { IBudget } from '../../../budget/types/budget'
import type { ILedger, ILedgerEntry } from '../../types/ledger'

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
  }
}

let dbPromise: Promise<IDBPDatabase<ExpenseDB>> | undefined

export function initDB(): Promise<IDBPDatabase<ExpenseDB>> {
  if (dbPromise === undefined) {
    dbPromise = openDB<ExpenseDB>('ExpenseTrackerDB', 7, {
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
      },
    }).catch(err => {
      dbPromise = undefined
      throw err
    })
  }
  return dbPromise
}
