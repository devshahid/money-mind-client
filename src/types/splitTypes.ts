/**
 * Expense Split Types
 * These define how expenses should be split among members
 */

export enum SplitType {
    /**
     * Equal split including the payer
     * Use case: Movie ticket where payer also benefits
     * Example: ₹3000 paid by A for 10 people including A = ₹300 each
     */
    EQUAL_INCLUDE_PAYER = "EQUAL_INCLUDE_PAYER",

    /**
     * Equal split excluding the payer
     * Use case: Paying for others, payer doesn't benefit
     * Example: ₹2000 paid by A for 4 others = ₹500 each, A gets back ₹2000
     */
    EQUAL_EXCLUDE_PAYER = "EQUAL_EXCLUDE_PAYER",

    /**
     * Custom amounts for each member
     * Use case: Different people paid different amounts for a shared expense
     * Example: Trip where A paid ₹20k, B paid ₹10k, total ₹30k split among 3 people
     */
    CUSTOM_AMOUNTS = "CUSTOM_AMOUNTS",

    /**
     * Percentage-based split
     * Use case: Split based on income or agreed percentages
     */
    PERCENTAGE_SPLIT = "PERCENTAGE_SPLIT",

    /**
     * Loan tracking (not a split)
     * Use case: Money lent to someone, being repaid in parts
     * No share calculation needed, just track paid vs owed
     */
    LOAN = "LOAN",

    /**
     * Itemized split
     * Use case: Each person is responsible for specific items
     */
    ITEMIZED = "ITEMIZED",
}

export interface SplitConfiguration {
    type: SplitType;
    /**
     * For EQUAL_INCLUDE_PAYER: total number of people (including payer)
     * For EQUAL_EXCLUDE_PAYER: number of people excluding payer
     */
    memberCount?: number;
    /**
     * For PERCENTAGE_SPLIT: total should equal 100
     */
    percentages?: Record<string, number>;
    /**
     * For LOAN: who is the borrower
     */
    borrower?: string;
    /**
     * Total amount to be split (can be sum of all transactions or custom)
     */
    totalAmount?: number;
}

export const SPLIT_TYPE_LABELS: Record<SplitType, string> = {
    [SplitType.EQUAL_INCLUDE_PAYER]: "Equal Split (Payer Included)",
    [SplitType.EQUAL_EXCLUDE_PAYER]: "Equal Split (Payer Excluded)",
    [SplitType.CUSTOM_AMOUNTS]: "Custom Amounts",
    [SplitType.PERCENTAGE_SPLIT]: "Percentage Split",
    [SplitType.LOAN]: "Loan/Lending",
    [SplitType.ITEMIZED]: "Itemized Split",
};

export const SPLIT_TYPE_DESCRIPTIONS: Record<SplitType, string> = {
    [SplitType.EQUAL_INCLUDE_PAYER]: "Total divided equally. Payer also gets a share (e.g., movie tickets)",
    [SplitType.EQUAL_EXCLUDE_PAYER]: "Total divided equally. Payer paid for others only",
    [SplitType.CUSTOM_AMOUNTS]: "Specify exact amounts for each member (e.g., trip with multiple payers)",
    [SplitType.PERCENTAGE_SPLIT]: "Split by percentages (e.g., 40%, 30%, 30%)",
    [SplitType.LOAN]: "Track money lent and repayments. No split calculation",
    [SplitType.ITEMIZED]: "Each member responsible for specific items/transactions",
};
