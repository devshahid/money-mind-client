import type { ITransactionGroup, IMember } from '../store/groupSlice'
import type { ITransactionLogs } from '../store/transactionSlice'
import type { ITransaction } from '../types/transaction'

export type MemberSettlement = {
  name: string
  share: number
  paid: number
  net: number
}

export type GroupSummary = {
  totalDebits: number
  totalCredits: number
  netSettlement: number
  status: 'Settled' | 'Unsettled'
  memberSettlements: MemberSettlement[]
}

export function computeGroupSummary(group: ITransactionGroup, transactions: ITransactionLogs[]): GroupSummary {
  const memberTxs = transactions.filter(tx => group.transactionIds.includes(tx._id))

  let totalDebits = 0
  let totalCredits = 0

  for (const tx of memberTxs) {
    const amount = parseFloat(tx.amount) || 0
    if (tx.isCredit) {
      totalCredits += amount
    } else {
      totalDebits += amount
    }
  }

  const netSettlement = totalCredits - totalDebits

  const memberSettlements: MemberSettlement[] = (group.members || []).map((m: IMember) => ({
    name: m.name,
    share: m.share,
    paid: m.paid,
    net: m.paid - m.share,
  }))

  const allSettled = memberSettlements.length > 0 ? memberSettlements.every(m => m.net === 0) : netSettlement === 0

  const status: GroupSummary['status'] = allSettled ? 'Settled' : 'Unsettled'

  return { totalDebits, totalCredits, netSettlement, status, memberSettlements }
}

export function mergeLabels(existing: string[], incoming: string[]): string[] {
  return Array.from(new Set([...existing, ...incoming]))
}

export function calculateGroupBalance(transactions: ITransaction[]): number {
  return transactions.reduce((acc, tx) => {
    const amount = parseFloat(tx.amount) || 0
    return tx.isCredit ? acc + amount : acc - amount
  }, 0)
}
