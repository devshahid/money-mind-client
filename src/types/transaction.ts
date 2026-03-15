export interface ITransaction {
    _id: string;
    transactionDate: string;
    narration: string;
    notes: string;
    category: string;
    label: string[];
    amount: string;
    bankName: string;
    isCredit: boolean;
    isCash: boolean;
    groupId?: string | null;
    debtId?: string | null;
    goalId?: string | null;
    aiSuggestedCategory?: string;
    aiSuggestedLabels?: string[];
    aiSuggestionAccepted?: boolean;
}
