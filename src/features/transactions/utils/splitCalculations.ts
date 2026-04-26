import { SplitType } from '../types/splitTypes'
import type { IMember } from '../store/groupSlice'
import type { ITransactionLogs } from '../store/transactionSlice'

export function calculateTotalDebits(transactions: ITransactionLogs[]): number {
  return transactions.reduce((sum, tx) => {
    if (!tx.isCredit) return sum + (parseFloat(String(tx.amount)) || 0)
    return sum
  }, 0)
}

export function calculateTotalCredits(transactions: ITransactionLogs[]): number {
  return transactions.reduce((sum, tx) => {
    if (tx.isCredit) return sum + (parseFloat(String(tx.amount)) || 0)
    return sum
  }, 0)
}

export function calculateShares(members: IMember[], splitType: SplitType, totalAmount: number): IMember[] {
  switch (splitType) {
    case SplitType.EQUAL_INCLUDE_PAYER:
      return calculateEqualSplitIncludePayer(members, totalAmount)
    case SplitType.EQUAL_EXCLUDE_PAYER:
      return calculateEqualSplitExcludePayer(members, totalAmount)
    case SplitType.CUSTOM_AMOUNTS:
      return members
    case SplitType.PERCENTAGE_SPLIT:
      return calculatePercentageSplit(members, totalAmount)
    case SplitType.LOAN:
      return calculateLoanSplit(members, totalAmount)
    case SplitType.ITEMIZED:
      return members
    default:
      return calculateEqualSplitIncludePayer(members, totalAmount)
  }
}

function calculateEqualSplitIncludePayer(members: IMember[], totalAmount: number): IMember[] {
  if (members.length === 0) return members
  const sharePerPerson = totalAmount / members.length
  return members.map(member => ({ ...member, share: sharePerPerson }))
}

function calculateEqualSplitExcludePayer(members: IMember[], totalAmount: number): IMember[] {
  if (members.length === 0) return members

  const payerIndex = members.reduce((maxIdx, member, idx, arr) => (member.paid > arr[maxIdx].paid ? idx : maxIdx), 0)

  const nonPayerCount = members.length - 1
  if (nonPayerCount <= 0) {
    return members.map((member, idx) => ({
      ...member,
      share: idx === payerIndex ? 0 : totalAmount,
    }))
  }

  const sharePerPerson = totalAmount / nonPayerCount
  return members.map((member, idx) => ({
    ...member,
    share: idx === payerIndex ? 0 : sharePerPerson,
  }))
}

function calculatePercentageSplit(members: IMember[], totalAmount: number): IMember[] {
  return members.map(member => ({
    ...member,
    share: member.percentage ? (totalAmount * member.percentage) / 100 : 0,
  }))
}

function calculateLoanSplit(members: IMember[], totalAmount: number): IMember[] {
  if (members.length === 0) return members

  const lenderIndex = members.reduce((maxIdx, member, idx, arr) => (member.paid > arr[maxIdx].paid ? idx : maxIdx), 0)

  return members.map((member, idx) => ({
    ...member,
    share: idx === lenderIndex ? 0 : totalAmount,
  }))
}

export function calculateMemberSettlement(member: IMember): number {
  return member.paid - member.share
}

export function isGroupSettled(members: IMember[]): boolean {
  return members.every(member => Math.abs(calculateMemberSettlement(member)) < 0.01)
}

export type SettlementSuggestion = {
  from: string
  to: string
  amount: number
}

export function calculateSettlements(members: IMember[]): SettlementSuggestion[] {
  const debtors: { name: string; amount: number }[] = []
  const creditors: { name: string; amount: number }[] = []

  members.forEach(member => {
    const net = calculateMemberSettlement(member)
    if (net > 0.01) {
      creditors.push({ name: member.name, amount: net })
    } else if (net < -0.01) {
      debtors.push({ name: member.name, amount: -net })
    }
  })

  debtors.sort((a, b) => b.amount - a.amount)
  creditors.sort((a, b) => b.amount - a.amount)

  const settlements: SettlementSuggestion[] = []
  let debtorIdx = 0
  let creditorIdx = 0

  while (debtorIdx < debtors.length && creditorIdx < creditors.length) {
    const debtor = debtors[debtorIdx]
    const creditor = creditors[creditorIdx]
    const settleAmount = Math.min(debtor.amount, creditor.amount)

    settlements.push({ from: debtor.name, to: creditor.name, amount: settleAmount })

    debtor.amount -= settleAmount
    creditor.amount -= settleAmount

    if (debtor.amount < 0.01) debtorIdx++
    if (creditor.amount < 0.01) creditorIdx++
  }

  return settlements
}

export function getSplitTypeExplanation(splitType: SplitType, totalAmount: number, memberCount: number): string {
  switch (splitType) {
    case SplitType.EQUAL_INCLUDE_PAYER:
      return `Total ₹${totalAmount.toFixed(2)} split equally among ${memberCount} people = ₹${(totalAmount / memberCount).toFixed(2)} per person (including payer)`
    case SplitType.EQUAL_EXCLUDE_PAYER:
      return `Total ₹${totalAmount.toFixed(2)} split equally among ${memberCount - 1} people (excluding payer) = ₹${(totalAmount / (memberCount - 1)).toFixed(2)} per person`
    case SplitType.CUSTOM_AMOUNTS:
      return 'Custom amounts assigned to each member'
    case SplitType.PERCENTAGE_SPLIT:
      return `Total ₹${totalAmount.toFixed(2)} split by custom percentages`
    case SplitType.LOAN:
      return `Loan of ₹${totalAmount.toFixed(2)} being tracked`
    case SplitType.ITEMIZED:
      return 'Each member responsible for specific items'
    default:
      return ''
  }
}
