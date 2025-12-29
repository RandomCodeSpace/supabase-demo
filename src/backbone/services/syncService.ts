import { del, set } from "idb-keyval";
import { db } from "../lib/db";
import { supabase } from "../lib/supabase";

const TABLES = [
	"habits",
	"habit_logs",
	"habit_notes",
	"projects",
	"project_features",
] as const;

export class SyncService {
	private static pushTimer: ReturnType<typeof setTimeout> | null = null;
	private static isSyncing = false;
	private static needsSync = false;

	// Debounced Push
	static async pushChanges() {
		SyncService.needsSync = true;
		if (SyncService.pushTimer) clearTimeout(SyncService.pushTimer);
		SyncService.pushTimer = setTimeout(() => SyncService.executePush(), 2000); // 2s debounce
	}

	static async pushImmediately(session?: any) {
		// Check session before attempting push (critical for PWA backgrounding)
		// If session passed explicitly, use it. Otherwise try to get it (fallback).
		let activeSession = session;
		if (!activeSession) {
			const { data } = await supabase.auth.getSession();
			activeSession = data.session;
		}

		if (!activeSession) {
			console.log("🔄 Sync: Skipping push (no session)");
			return;
		}
		SyncService.needsSync = true;
		if (SyncService.pushTimer) clearTimeout(SyncService.pushTimer);
		await SyncService.executePush();
	}

	private static async executePush() {
		if (SyncService.isSyncing) return; // Wait for current sync to finish
		if (!navigator.onLine) return; // Offline, keep needsSync=true

		SyncService.isSyncing = true;
		SyncService.needsSync = false; // We are handling it now
		console.log("🔄 Sync: Starting Push...");

		try {
			for (const table of TABLES) {
				// 1. Handle Pending (Upsert)
				const pending = await (db[table] as any)
					.where("sync_status")
					.equals("pending")
					.toArray();
				if (pending.length > 0) {
					// Clean data before sending (remove sync_status)
					const rows = pending.map(({ sync_status: _status, ...rest }: { sync_status: string; id: string }) => rest);

					const { error } = await supabase.from(table).upsert(rows);

					if (!error) {
						// Mark as synced
						await (db[table] as any).bulkUpdate(
							pending.map((r: { id: string }) => ({
								key: r.id,
								changes: { sync_status: "synced" },
							})),
						);
						console.log(`Uploaded ${pending.length} ${table}`);
					} else {
						console.error(`Failed to push ${table}`, error);
					}
				}

				// 2. Handle Deleted (Delete remote)
				const deleted = await (db[table] as any)
					.where("sync_status")
					.equals("deleted")
					.toArray();
				if (deleted.length > 0) {
					const ids = deleted.map((r: any) => r.id);
					const { error } = await supabase.from(table).delete().in("id", ids);

					if (!error) {
						// Hard delete locally
						await (db[table] as any).bulkDelete(ids);
						console.log(`Deleted ${deleted.length} ${table}`);
					}
				}
			}
			console.log("✅ Sync: Push Complete");
		} catch (err) {
			console.error("Sync Push Error", err);
		} finally {
			SyncService.isSyncing = false;
			// If changes happened while we were syncing, run again immediately (debounced essentially 0)
			if (SyncService.needsSync) {
				SyncService.pushChanges();
			}
		}
	}

	static async pullChanges() {
		if (!navigator.onLine) return;

		const {
			data: { session },
		} = await supabase.auth.getSession();
		if (!session) return;

		console.log("🔄 Sync: Starting Pull...");

		try {
			// For simplicity in this demo, we fetch ALL data from Supabase and overwrite/merge local
			// Ideally we use last_pulled_at and updated_at

			for (const table of TABLES) {
				const { data, error } = await supabase.from(table).select("*");
				if (error) continue;
				if (!data) continue;

				// We need to merge carefully.
				// Rule: Remote wins if not modified locally.
				// If local is 'pending', keep local (Last Write Wins handled by Push first).

				await db.transaction("rw", db[table], async () => {
					for (const row of data) {
						const local = await (db[table] as any).get(row.id);

						// If local doesn't exist, or is synced, update it.
						// If local is 'pending' or 'deleted', IGNORE remote (local changes pending upload take precedence).
						if (!local || local.sync_status === "synced") {
							await (db[table] as any).put({ ...row, sync_status: "synced" });
						}
					}
				});
			}

			await set("last_pulled_at", new Date().toISOString());
			console.log("✅ Sync: Pull Complete");
		} catch (err) {
			console.error("Sync Pull Error", err);
		}
	}

	static async initialSync() {
		// Force full pull
		await del("last_pulled_at");
		await SyncService.pullChanges();
	}
}
