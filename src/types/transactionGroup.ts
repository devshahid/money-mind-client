import { ITransaction } from "./transaction";

export interface ITransactionGroup {
    _id: string;
    name: string;
    transactionIds: string[];
    groupBalance: number;
    isSettled: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ITransactionGroupDetail extends ITransactionGroup {
    transactions: ITransaction[];
}
