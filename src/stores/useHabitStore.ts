import { create } from "zustand";
import { type Habit, type HabitLog, HabitService } from "../services/habitService";

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

            // Calculate progress
            const completedCount = logs.filter(l => l.status === "completed").length;
            const progress = habits.length > 0 ? (completedCount / habits.length) * 100 : 0;

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
        const completedCount = logs.filter(l => l.status === "completed").length;
        const progress = newHabits.length > 0 ? (completedCount / newHabits.length) * 100 : 0;

        set({ habits: newHabits, todayProgress: progress });
    },

    deleteHabit: async (id) => {
        try {
            await HabitService.deleteHabit(id);
            const { habits, logs } = get();
            const newHabits = habits.filter(h => h.id !== id);
            const newLogs = logs.filter(l => l.habit_id !== id);

            // Recalc progress
            const completedCount = newLogs.filter(l => l.status === "completed").length;
            const progress = newHabits.length > 0 ? (completedCount / newHabits.length) * 100 : 0;

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
                newLogs = newLogs.filter(l => l.habit_id !== id);
            }

            // Recalc progress
            const completedCount = newLogs.filter(l => l.status === "completed").length;
            const progress = habits.length > 0 ? (completedCount / habits.length) * 100 : 0;

            set({ logs: newLogs, todayProgress: progress });
        } catch (error) {
            console.error("Failed to toggle habit", error);
            throw error;
        }
    }
}));
