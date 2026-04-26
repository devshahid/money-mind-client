import axiosClient from "./axiosClient";
import { ITransactionGroup, ITransactionGroupDetail } from "../types/transactionGroup";

export const listGroups = async (): Promise<ITransactionGroup[]> => {
    const response = await axiosClient.get<ITransactionGroup[]>("/transaction-groups");
    return response.data;
};

export const getGroupDetail = async (groupId: string): Promise<ITransactionGroupDetail> => {
    const response = await axiosClient.get<ITransactionGroupDetail>(`/transaction-groups/${groupId}`);
    return response.data;
};

export const createGroup = async (name: string, transactionIds: string[]): Promise<ITransactionGroup> => {
    const response = await axiosClient.post<ITransactionGroup>("/transaction-groups", { name, transactionIds });
    return response.data;
};

export const addToGroup = async (groupId: string, transactionId: string): Promise<ITransactionGroup> => {
    const response = await axiosClient.put<ITransactionGroup>(`/transaction-groups/${groupId}/add`, { transactionId });
    return response.data;
};

export const removeFromGroup = async (groupId: string, transactionId: string): Promise<ITransactionGroup> => {
    const response = await axiosClient.put<ITransactionGroup>(`/transaction-groups/${groupId}/remove`, { transactionId });
    return response.data;
};

export const dissolveGroup = async (groupId: string): Promise<void> => {
    await axiosClient.delete(`/transaction-groups/${groupId}`);
};
