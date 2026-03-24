import { ITransactionGroup } from "../../store/groupSlice";
import { initDB } from "./db";

class GroupStore {
    async saveGroup(group: ITransactionGroup): Promise<void> {
        const db = await initDB();
        await db.put("transaction_groups", group);
    }

    async getAllGroups(): Promise<ITransactionGroup[]> {
        const db = await initDB();
        return db.getAll("transaction_groups");
    }

    async getGroup(id: string): Promise<ITransactionGroup | undefined> {
        const db = await initDB();
        return db.get("transaction_groups", id);
    }

    async deleteGroup(id: string): Promise<void> {
        const db = await initDB();
        await db.delete("transaction_groups", id);
    }
}

const groupStore = new GroupStore();
export { groupStore };
