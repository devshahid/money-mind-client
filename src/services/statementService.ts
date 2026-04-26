import axiosClient from "./axiosClient";
import { ITransaction } from "../types/transaction";

export const uploadStatementFile = async (file: File, bankName: string): Promise<ITransaction[]> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bankName", bankName);

    const response = await axiosClient.post<ITransaction[]>("/transaction-logs/upload-data-from-file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export const parsePdf = async (file: File, bankName: string): Promise<ITransaction[]> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bankName", bankName);

    const response = await axiosClient.post<ITransaction[]>("/transaction-logs/parse-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export interface DuplicateCheckResult {
    duplicateIds: string[];
}

export const checkDuplicates = async (
    transactions: Pick<ITransaction, "transactionDate" | "narration" | "amount" | "bankName">[],
): Promise<DuplicateCheckResult> => {
    const response = await axiosClient.post<DuplicateCheckResult>("/transaction-logs/check-duplicates", { transactions });
    return response.data;
};
