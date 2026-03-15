import axiosClient from "./axiosClient";
import { IAISuggestion } from "../types/ai";

export const fetchAnnotationSuggestions = async (transactionIds: string[]): Promise<IAISuggestion[]> => {
    const response = await axiosClient.post<IAISuggestion[]>("/ai/annotate", {
        transactionIds,
    });
    return response.data;
};
