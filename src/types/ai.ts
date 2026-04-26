export interface IAISuggestion {
    transactionId: string;
    suggestedCategory: string;
    suggestedLabels: string[];
    confidence: number;
    accepted?: boolean;
}

export interface IAIGroupSuggestion {
    transactionIds: string[];
    suggestedName: string;
    confidence: number;
    dismissed?: boolean;
}

export interface IAIDebtStrategy {
    method: "avalanche" | "snowball";
    orderedDebtIds: string[];
    projectedPayoffDate: string;
    rationale: string;
}

export interface IAIChatMessage {
    role: "user" | "assistant";
    content: string;
    timestamp: string;
}
