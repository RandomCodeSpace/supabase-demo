import { create } from "zustand";
import {
	type Habit,
	type HabitLog,
	HabitService,
} from "../backbone/services/habitService";

interface HabitState {
	habits: Habit[];
	logs: HabitLog[];
	todayProgress: number;
	isLoading: boolean;

	fetchData: () => Promise<void>;
	addHabit: (habit: Habit) => void;
	deleteHabit: (id: string) => Promise<void>;
	toggleHabit: (id: string) => Promise<void>;
}

export const useHabitStore = create<HabitState>((set, get) => ({
	habits: [],
	logs: [],
	todayProgress: 0,
	isLoading: false,

	fetchData: async () => {
		set({ isLoading: true });
		try {
			const [habits, logs] = await Promise.all([
				HabitService.fetchHabits(),
				HabitService.fetchTodayLogs(),
			]);

			// Calculate progress - Filter logs to only count VALID habits and ensure uniqueness
			const validHabitIds = new Set(habits.map((h) => h.id));
			const completedHabits = new Set(
				logs
					.filter(
						(l) => l.status === "completed" && validHabitIds.has(l.habit_id),
					)
					.map((l) => l.habit_id),
			);
			const progress =
				habits.length > 0 ? (completedHabits.size / habits.length) * 100 : 0;

			set({ habits, logs, todayProgress: progress, isLoading: false });
		} catch (error) {
			console.error("Failed to fetch habits", error);
			set({ isLoading: false });
		}
	},

	addHabit: (habit) => {
		const { habits, logs } = get();
		const newHabits = [habit, ...habits];

		// Recalc progress
		const validHabitIds = new Set(newHabits.map((h) => h.id));
		const completedHabits = new Set(
			logs
				.filter(
					(l) => l.status === "completed" && validHabitIds.has(l.habit_id),
				)
				.map((l) => l.habit_id),
		);
		const progress =
			newHabits.length > 0
				? (completedHabits.size / newHabits.length) * 100
				: 0;

		set({ habits: newHabits, todayProgress: progress });
	},

	deleteHabit: async (id) => {
		try {
			await HabitService.deleteHabit(id);
			const { habits, logs } = get();
			const newHabits = habits.filter((h) => h.id !== id);
			const newLogs = logs.filter((l) => l.habit_id !== id);

			// Recalc progress
			// Note: newLogs is already filtered by id, but we keep consistency
			const validHabitIds = new Set(newHabits.map((h) => h.id));
			const completedHabits = new Set(
				newLogs
					.filter(
						(l) => l.status === "completed" && validHabitIds.has(l.habit_id),
					)
					.map((l) => l.habit_id),
			);
			const progress =
				newHabits.length > 0
					? (completedHabits.size / newHabits.length) * 100
					: 0;

			set({ habits: newHabits, logs: newLogs, todayProgress: progress });
		} catch (error) {
			console.error("Failed to delete habit", error);
			throw error;
		}
	},

	toggleHabit: async (id) => {
		try {
			const result = await HabitService.toggleCompletion(id);
			const { logs, habits } = get();

			let newLogs = [...logs];
			if (result) {
				newLogs.push(result);
			} else {
				newLogs = newLogs.filter((l) => l.habit_id !== id);
			}

			// Recalc progress
			const validHabitIds = new Set(habits.map((h) => h.id));
			const completedHabits = new Set(
				newLogs
					.filter(
						(l) => l.status === "completed" && validHabitIds.has(l.habit_id),
					)
					.map((l) => l.habit_id),
			);
			const progress =
				habits.length > 0 ? (completedHabits.size / habits.length) * 100 : 0;

			set({ logs: newLogs, todayProgress: progress });
		} catch (error) {
			console.error("Failed to toggle habit", error);
			throw error;
		}
	},
}));
