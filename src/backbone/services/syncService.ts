import { db } from "../lib/db";
import { supabase } from "../lib/supabase";
import { set, del } from "idb-keyval";

const TABLES = [
    "habits",
    "habit_logs",
    "habit_notes",
    "todos",
    "projects",
    "project_features",
] as const;

export class SyncService {
    private static pushTimer: ReturnType<typeof setTimeout> | null = null;
    private static isSyncing = false;
    private static needsSync = false;

    // Debounced Push
    static async pushChanges() {
        this.needsSync = true;
        if (this.pushTimer) clearTimeout(this.pushTimer);
        this.pushTimer = setTimeout(() => this.executePush(), 2000); // 2s debounce
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
        this.needsSync = true;
        if (this.pushTimer) clearTimeout(this.pushTimer);
        await this.executePush();
    }

    private static async executePush() {
        if (this.isSyncing) return; // Wait for current sync to finish
        if (!navigator.onLine) return; // Offline, keep needsSync=true

        this.isSyncing = true;
        this.needsSync = false; // We are handling it now
        console.log("🔄 Sync: Starting Push...");


        try {
            for (const table of TABLES) {
                // 1. Handle Pending (Upsert)
                // @ts-ignore
                const pending = await db[table].where("sync_status").equals("pending").toArray();
                if (pending.length > 0) {
                    // Clean data before sending (remove sync_status)
                    const rows = pending.map(({ sync_status, ...rest }) => rest);

                    const { error } = await supabase.from(table).upsert(rows);

                    if (!error) {
                        // Mark as synced
                        // @ts-ignore
                        await db[table].bulkUpdate(pending.map((r) => ({ key: r.id, changes: { sync_status: "synced" } })));
                        console.log(`Uploaded ${pending.length} ${table}`);
                    } else {
                        console.error(`Failed to push ${table}`, error);
                    }
                }

                // 2. Handle Deleted (Delete remote)
                // @ts-ignore
                const deleted = await db[table].where("sync_status").equals("deleted").toArray();
                if (deleted.length > 0) {
                    const ids = deleted.map((r: any) => r.id);
                    const { error } = await supabase.from(table).delete().in("id", ids);

                    if (!error) {
                        // Hard delete locally
                        // @ts-ignore
                        await db[table].bulkDelete(ids);
                        console.log(`Deleted ${deleted.length} ${table}`);
                    }
                }
            }
            console.log("✅ Sync: Push Complete");
        } catch (err) {
            console.error("Sync Push Error", err);
        } finally {
            this.isSyncing = false;
            // If changes happened while we were syncing, run again immediately (debounced essentially 0)
            if (this.needsSync) {
                this.pushChanges();
            }
        }
    }

    static async pullChanges() {
        if (!navigator.onLine) return;

        const { data: { session } } = await supabase.auth.getSession();
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

                await db.transaction('rw', db[table], async () => {
                    for (const row of data) {
                        // @ts-ignore
                        const local = await db[table].get(row.id);

                        // If local doesn't exist, or is synced, update it.
                        // If local is 'pending' or 'deleted', IGNORE remote (local changes pending upload take precedence).
                        if (!local || local.sync_status === 'synced') {
                            // @ts-ignore
                            await db[table].put({ ...row, sync_status: 'synced' });
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
        await this.pullChanges();
    }
}
