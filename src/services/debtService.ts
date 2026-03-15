import axiosClient from "./axiosClient";
import { IDebt, IEMIPayment } from "../types/debt";

export const listDebts = async (): Promise<IDebt[]> => {
    const response = await axiosClient.get<IDebt[]>("/debt");
    return response.data;
};

export const createDebt = async (debt: Omit<IDebt, "_id" | "createdAt" | "updatedAt">): Promise<IDebt> => {
    const response = await axiosClient.post<IDebt>("/debt", debt);
    return response.data;
};

export const updateDebt = async (debtId: string, data: Partial<IDebt>): Promise<IDebt> => {
    const response = await axiosClient.put<IDebt>(`/debt/${debtId}`, data);
    return response.data;
};

export const deleteDebt = async (debtId: string): Promise<void> => {
    await axiosClient.delete(`/debt/${debtId}`);
};

export const recordEMIPayment = async (payment: Omit<IEMIPayment, "_id">): Promise<{ payment: IEMIPayment; updatedDebt: IDebt }> => {
    const response = await axiosClient.post<{ payment: IEMIPayment; updatedDebt: IDebt }>("/debt/emi-payments", payment);
    return response.data;
};
