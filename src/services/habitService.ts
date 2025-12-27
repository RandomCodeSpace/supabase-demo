import { db, type HabitLocal, type HabitLogLocal, type HabitNoteLocal } from "../lib/db";
import { supabase } from "../lib/supabase";
import { SyncService } from "./syncService";

// Export base types from local DB schema
export type Habit = HabitLocal;
export type HabitLog = HabitLogLocal;
export type HabitNote = HabitNoteLocal;

export class HabitService {
	static async fetchHabits() {
		return await db.habits
			.filter((h) => h.sync_status !== "deleted")
			.reverse()
			.sortBy("created_at");
	}

	static async fetchTodayLogs() {
		const today = new Date().toISOString().split("T")[0];
		// Filter logs for today
		// Note: Compound index [habit_id+completed_at] could be used, but filtering all logs is fast enough for now
		return await db.habit_logs.filter(log => log.completed_at === today && log.sync_status !== 'deleted').toArray();
	}

	static async fetchNotes(habitId: string) {
		return await db.habit_notes
			.where("habit_id")
			.equals(habitId)
			.filter(note => note.sync_status !== 'deleted')
			.sortBy("created_at");
	}

	// WRITE: To Dexie + Trigger Sync

	static async createHabit(
		habit: Omit<Habit, "id" | "user_id" | "created_at" | "sync_status">,
	) {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error("User not authenticated");

		const newHabit: HabitLocal = {
			...habit,
			id: crypto.randomUUID(),
			user_id: user.id,
			created_at: new Date().toISOString(),
			sync_status: "pending",
		};

		await db.habits.add(newHabit);

		// Trigger Sync (Debounced ideally, but here we call directly to start the process)
		SyncService.pushChanges();

		return newHabit;
	}

	static async updateHabit(id: string, updates: Partial<Habit>) {
		await db.habits.update(id, { ...updates, sync_status: "pending" });
		const updated = await db.habits.get(id);
		SyncService.pushChanges();
		if (!updated) throw new Error("Habit not found");
		return updated;
	}

	static async deleteHabit(id: string) {
		const habit = await db.habits.get(id);
		if (!habit) return;

		// Smart Prune: If never synced, hard delete locally
		if (habit.sync_status === "pending") {
			await db.habits.delete(id);
			// Do NOT trigger sync - we just removed a local-only item
			return;
		}

		// Soft delete locally, sync will handle remote delete
		await db.habits.update(id, { sync_status: "deleted" });
		SyncService.pushChanges();
	}

	static async toggleCompletion(habitId: string, dateStr?: string) {
		const date = dateStr || new Date().toISOString().split("T")[0];

		// Check local log
		const existing = await db.habit_logs
			.where({ habit_id: habitId, completed_at: date })
			.first();

		if (existing && existing.sync_status !== 'deleted') {
			// Toggle OFF
			// Smart Prune: If pending (never on server), hard delete
			if (existing.sync_status === 'pending') {
				await db.habit_logs.delete(existing.id);
				// Do NOT trigger Sync
				return null;
			}

			// Otherwise Soft Delete
			await db.habit_logs.update(existing.id, { sync_status: "deleted" });
			SyncService.pushChanges();
			return null;
		} else if (existing && existing.sync_status === 'deleted') {
			// Restore (Toggle ON)
			await db.habit_logs.update(existing.id, { sync_status: "pending", status: "completed" });
			SyncService.pushChanges();
			return existing; // Return the restored log
		} else {
			// Toggle ON -> Insert
			const newLog: HabitLogLocal = {
				id: crypto.randomUUID(),
				habit_id: habitId,
				completed_at: date,
				status: "completed",
				sync_status: "pending",
			};
			await db.habit_logs.add(newLog);
			SyncService.pushChanges();
			return newLog;
		}
	}

	// Notes
	static async addNote(habitId: string, content: string) {
		const newNote: HabitNoteLocal = {
			id: crypto.randomUUID(),
			habit_id: habitId,
			content,
			created_at: new Date().toISOString(),
			sync_status: "pending",
		};
		await db.habit_notes.add(newNote);
		SyncService.pushChanges();
		return newNote;
	}

	static async deleteNote(noteId: string) {
		const note = await db.habit_notes.get(noteId);
		if (!note) return;

		if (note.sync_status === "pending") {
			await db.habit_notes.delete(noteId);
			return;
		}

		await db.habit_notes.update(noteId, { sync_status: "deleted" });
		SyncService.pushChanges();
	}

	static async deleteAllHabits() {
		// Massive soft delete? Or just hard delete local and API call?
		// For simplicity/safety, let's hard delete locally AND call API directly if online?
		// Or mark ALL as deleted.
		// Let's iterate and mark deleted.
		const habits = await db.habits.toArray();
		await db.habits.bulkUpdate(habits.map(h => ({ key: h.id, changes: { sync_status: "deleted" } })));
		SyncService.pushChanges();
	}
}
