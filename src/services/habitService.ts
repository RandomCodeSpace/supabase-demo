import { supabase } from "../lib/supabase";

export type Habit = {
	id: string;
	user_id: string;
	title: string;
	description?: string;
	color: string;
	icon?: string;
	created_at: string;
	notes?: string; // Deprecated
};

export type HabitLog = {
	id: string;
	habit_id: string;
	completed_at: string; // YYYY-MM-DD
	status: "completed" | "skipped";
};

export type HabitNote = {
	id: string;
	habit_id: string;
	content: string;
	created_at: string;
};

export class HabitService {
	static async fetchHabits() {
		const { data, error } = await supabase
			.from("habits")
			.select("*")
			.order("created_at", { ascending: false });

		if (error) throw error;
		return data as Habit[];
	}

	static async fetchTodayLogs() {
		const today = new Date().toISOString().split("T")[0];
		const { data, error } = await supabase
			.from("habit_logs")
			.select("*")
			.eq("completed_at", today);

		if (error) throw error;
		return data as HabitLog[];
	}

	// New: Fetch Notes for a Habit
	static async fetchNotes(habitId: string) {
		const { data, error } = await supabase
			.from("habit_notes")
			.select("*")
			.eq("habit_id", habitId)
			.order("created_at", { ascending: true }); // Oldest first (timeline)

		if (error) throw error;
		return data as HabitNote[];
	}

	// New: Add Note
	static async addNote(habitId: string, content: string) {
		const { data, error } = await supabase
			.from("habit_notes")
			.insert([{ habit_id: habitId, content }])
			.select()
			.single();

		if (error) throw error;
		return data as HabitNote;
	}

	// New: Delete Note
	static async deleteNote(noteId: string) {
		const { error } = await supabase
			.from("habit_notes")
			.delete()
			.eq("id", noteId);
		if (error) throw error;
	}

	static async createHabit(
		habit: Omit<Habit, "id" | "user_id" | "created_at">,
	) {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error("User not authenticated");

		const { data, error } = await supabase
			.from("habits")
			.insert([{ ...habit, user_id: user.id }])
			.select()
			.single();

		if (error) throw error;
		return data as Habit;
	}

	static async deleteHabit(id: string) {
		const { error } = await supabase.from("habits").delete().eq("id", id);
		if (error) throw error;
	}

	static async updateHabit(id: string, updates: Partial<Habit>) {
		const { data, error } = await supabase
			.from("habits")
			.update(updates)
			.eq("id", id)
			.select()
			.single();

		if (error) throw error;
		return data as Habit;
	}

	static async toggleCompletion(habitId: string, dateStr?: string) {
		const date = dateStr || new Date().toISOString().split("T")[0];

		// Check if already completed
		const { data: existing } = await supabase
			.from("habit_logs")
			.select("id")
			.eq("habit_id", habitId)
			.eq("completed_at", date)
			.single();

		if (existing) {
			// Toggle OFF (delete log)
			const { error } = await supabase
				.from("habit_logs")
				.delete()
				.eq("id", existing.id);
			if (error) throw error;
			return null; // Indicates removed
		} else {
			// Toggle ON (insert log)
			const { data, error } = await supabase
				.from("habit_logs")
				.insert([
					{ habit_id: habitId, completed_at: date, status: "completed" },
				])
				.select()
				.single();
			if (error) throw error;
			return data as HabitLog; // Indicates added
		}
	}

	static async deleteAllHabits() {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error("Not authenticated");

		const { error } = await supabase
			.from("habits")
			.delete()
			.eq("user_id", user.id);
		if (error) throw error;
	}
}
