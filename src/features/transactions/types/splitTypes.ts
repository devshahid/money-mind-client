export enum SplitType {
  EQUAL_INCLUDE_PAYER = 'EQUAL_INCLUDE_PAYER',
  EQUAL_EXCLUDE_PAYER = 'EQUAL_EXCLUDE_PAYER',
  CUSTOM_AMOUNTS = 'CUSTOM_AMOUNTS',
  PERCENTAGE_SPLIT = 'PERCENTAGE_SPLIT',
  LOAN = 'LOAN',
  ITEMIZED = 'ITEMIZED',
}

export type SplitConfiguration = {
  type: SplitType
  memberCount?: number
  percentages?: Record<string, number>
  borrower?: string
  totalAmount?: number
}

export const SPLIT_TYPE_LABELS: Record<SplitType, string> = {
  [SplitType.EQUAL_INCLUDE_PAYER]: 'Equal Split (Payer Included)',
  [SplitType.EQUAL_EXCLUDE_PAYER]: 'Equal Split (Payer Excluded)',
  [SplitType.CUSTOM_AMOUNTS]: 'Custom Amounts',
  [SplitType.PERCENTAGE_SPLIT]: 'Percentage Split',
  [SplitType.LOAN]: 'Loan/Lending',
  [SplitType.ITEMIZED]: 'Itemized Split',
}

export const SPLIT_TYPE_DESCRIPTIONS: Record<SplitType, string> = {
  [SplitType.EQUAL_INCLUDE_PAYER]: 'Total divided equally. Payer also gets a share (e.g., movie tickets)',
  [SplitType.EQUAL_EXCLUDE_PAYER]: 'Total divided equally. Payer paid for others only',
  [SplitType.CUSTOM_AMOUNTS]: 'Specify exact amounts for each member (e.g., trip with multiple payers)',
  [SplitType.PERCENTAGE_SPLIT]: 'Split by percentages (e.g., 40%, 30%, 30%)',
  [SplitType.LOAN]: 'Track money lent and repayments. No split calculation',
  [SplitType.ITEMIZED]: 'Each member responsible for specific items/transactions',
}
