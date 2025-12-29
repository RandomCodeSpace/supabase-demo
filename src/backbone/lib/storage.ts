import { del, get, set } from "idb-keyval";

export const idbStorage = {
	async getItem(key: string): Promise<string | null> {
		const val = await get(key);
		return val || null;
	},
	async setItem(key: string, value: string): Promise<void> {
		await set(key, value);
	},
	async removeItem(key: string): Promise<void> {
		await del(key);
	},
};
