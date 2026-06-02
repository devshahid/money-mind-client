import type { ITransactionGroup } from '../../store/groupSlice'
import { initDB } from './db'

const DELETED_IDS_KEY = '__deleted_group_ids__'

class GroupStore {
  async saveGroup(group: ITransactionGroup): Promise<void> {
    const db = await initDB()
    await db.put('transaction_groups', group)
  }

  async getAllGroups(): Promise<ITransactionGroup[]> {
    const db = await initDB()
    const all = await db.getAll('transaction_groups')
    return all.filter(g => g.id !== DELETED_IDS_KEY)
  }

  async getGroup(id: string): Promise<ITransactionGroup | undefined> {
    const db = await initDB()
    return db.get('transaction_groups', id)
  }

  async deleteGroup(id: string): Promise<void> {
    const db = await initDB()
    await db.delete('transaction_groups', id)
  }

  async getDeletedIds(): Promise<string[]> {
    const db = await initDB()
    const entry = await db.get('transaction_groups', DELETED_IDS_KEY)
    return entry ? entry.transactionIds || [] : []
  }

  async addDeletedId(id: string): Promise<void> {
    const existing = await this.getDeletedIds()
    if (!existing.includes(id)) {
      existing.push(id)
    }
    const db = await initDB()
    await db.put('transaction_groups', {
      id: DELETED_IDS_KEY,
      name: '',
      involvedParty: '',
      members: [],
      notes: '',
      transactionIds: existing,
      createdAt: '',
      updatedAt: '',
    } as ITransactionGroup)
  }

  async clearDeletedIds(): Promise<void> {
    const db = await initDB()
    await db.delete('transaction_groups', DELETED_IDS_KEY)
  }
}

const groupStore = new GroupStore()
export { groupStore }
