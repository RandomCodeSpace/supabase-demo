import { AnimatePresence, motion } from "framer-motion";
import { Plus, Settings } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "../context/ToastContext";
import {
	type Habit,
	type HabitLog,
	HabitService,
} from "../services/habitService";
import { AddHabitModal } from "./ui/AddHabitModal";
import { ConfirmationModal } from "./ui/ConfirmationModal";
import { HabitDetailModal } from "./ui/HabitDetailModal";
import { LoadingOverlay } from "./ui/LoadingOverlay";
import { Logo } from "./ui/Logo";
import { ProgressRing } from "./ui/ProgressRing";
import { SwipeableHabit } from "./ui/SwipeableHabit";
import { UserProfileModal } from "./ui/UserProfileModal";

interface TodosViewProps {
	userEmail: string | undefined;
}

export function TodosView({ userEmail }: TodosViewProps) {
	const [habits, setHabits] = useState<Habit[]>([]);
	const [logs, setLogs] = useState<HabitLog[]>([]);
	const [showAddModal, setShowAddModal] = useState(false);
	const [showProfileModal, setShowProfileModal] = useState(false);
	const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
	const [habitToDelete, setHabitToDelete] = useState<string | null>(null);
	const [todayProgress, setTodayProgress] = useState(0);
	const [loading, setLoading] = useState(true);

	const { success, error: toastError } = useToast();

	const fetchData = useCallback(async () => {
		try {
			setLoading(true);
			const [fetchedHabits, fetchedLogs] = await Promise.all([
				HabitService.fetchHabits(),
				HabitService.fetchTodayLogs(),
			]);
			setHabits(fetchedHabits);
			setLogs(fetchedLogs);
		} catch (error) {
			console.error("Error fetching data:", error);
			toastError("Failed to load data");
		} finally {
			setLoading(false);
		}
	}, [toastError]);

	// Initial Load
	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// Calculate Progress when logs/habits change
	useEffect(() => {
		if (habits.length === 0) {
			setTodayProgress(0);
			return;
		}
		const completedCount = logs.filter(
			(log) => log.status === "completed",
		).length;
		setTodayProgress((completedCount / habits.length) * 100);
	}, [habits, logs]);

	const handleComplete = async (habitId: string) => {
		try {
			const result = await HabitService.toggleCompletion(habitId);

			if (result) {
				setLogs([...logs, result]);
				success("Todo completed!");
			} else {
				setLogs(logs.filter((l) => l.habit_id !== habitId));
			}
		} catch (err) {
			console.error("Error toggling completion:", err);
			toastError("Failed to update status");
		}
	};

	const handleDelete = (habitId: string) => {
		setHabitToDelete(habitId);
	};

	const confirmDelete = async () => {
		if (!habitToDelete) return;
		try {
			await HabitService.deleteHabit(habitToDelete);
			setHabits(habits.filter((h) => h.id !== habitToDelete));
			setLogs(logs.filter((l) => l.habit_id !== habitToDelete));
			success("Todo deleted");
		} catch (err) {
			console.error("Error deleting habit:", err);
			toastError("Failed to delete todo");
		} finally {
			setHabitToDelete(null);
		}
	};

	const handleAddHabit = (newHabit: Habit) => {
		setHabits([newHabit, ...habits]);
		success("New todo started");
	};

	return (
		<div className="pb-24 pt-8 min-h-screen relative">
			{loading && <LoadingOverlay message="Loading todos..." />}

			{/* Header with Progress Ring */}
			<header className="flex flex-col items-center mb-8 space-y-4 relative">
				<button
					onClick={() => setShowProfileModal(true)}
					className="absolute top-0 right-0 p-2 text-zen-text-muted hover:text-zen-text transition-colors"
				>
					<Settings size={24} />
				</button>

				<ProgressRing percentage={todayProgress} size={160} color="#4ade80" />
				<div className="text-center">
					<div className="flex items-center justify-center gap-2 mb-1">
						<Logo size={24} animate={false} />
						<h1 className="text-2xl font-bold text-zen-text">Todos</h1>
					</div>
					<p className="text-zen-text-muted">
						{Math.round(todayProgress)}% completed
					</p>
				</div>
			</header>

			{/* Habits List */}
			<div className="space-y-4">
				<AnimatePresence>
					{habits.map((habit) => {
						const isCompleted = logs.some(
							(l) => l.habit_id === habit.id && l.status === "completed",
						);
						return (
							<SwipeableHabit
								key={habit.id}
								isCompleted={isCompleted}
								color={habit.color}
								onComplete={() => handleComplete(habit.id)}
								onDelete={() => handleDelete(habit.id)}
							>
								<div
									className="flex items-center gap-4 cursor-pointer"
									onClick={() => setSelectedHabit(habit)}
								>
									<div
										className="w-3 h-12 rounded-full"
										style={{ backgroundColor: habit.color }}
									/>
									<div>
										<h3 className="font-bold text-lg text-zen-text">
											{habit.title}
										</h3>
										{habit.description && (
											<p className="text-sm text-zen-text-muted">
												{habit.description}
											</p>
										)}
									</div>
								</div>
							</SwipeableHabit>
						);
					})}
				</AnimatePresence>

				{habits.length === 0 && (
					<div className="text-center text-zen-text-muted py-12">
						<p>No todos yet.</p>
						<p className="text-sm">Tap + to start your journey.</p>
					</div>
				)}
			</div>

			{/* Floating Action Button */}
			<motion.button
				whileHover={{ scale: 1.1 }}
				whileTap={{ scale: 0.9 }}
				onClick={() => setShowAddModal(true)}
				className="fixed bottom-32 right-8 w-16 h-16 !bg-zen-btn-primary rounded-full flex items-center justify-center shadow-lg shadow-green-500/20 z-40 text-white glass-3d"
			>
				<Plus size={32} />
			</motion.button>

			{/* Add Modal */}
			<AnimatePresence>
				{showAddModal && (
					<AddHabitModal
						onClose={() => setShowAddModal(false)}
						onAdded={handleAddHabit}
					/>
				)}
			</AnimatePresence>

			{/* Detail Modal */}
			<AnimatePresence>
				{selectedHabit && (
					<HabitDetailModal
						habit={selectedHabit}
						onClose={() => setSelectedHabit(null)}
					/>
				)}
			</AnimatePresence>

			{/* Profile Modal */}
			<AnimatePresence>
				{showProfileModal && (
					<UserProfileModal
						email={userEmail}
						onClose={() => setShowProfileModal(false)}
					/>
				)}
			</AnimatePresence>

			{/* Confirmation Modal */}
			<ConfirmationModal
				isOpen={!!habitToDelete}
				onClose={() => setHabitToDelete(null)}
				onConfirm={confirmDelete}
				title="Delete Todo?"
				message="This action cannot be undone. All notes and history for this todo will be lost."
			/>
		</div>
	);
}
