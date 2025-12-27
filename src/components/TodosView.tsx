import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "../context/ToastContext";
import {
	type Habit,
} from "../services/habitService";
import { useHabitStore } from "../stores/useHabitStore";
import { AddHabitModal } from "./ui/AddHabitModal";
import { ConfirmationModal } from "./ui/ConfirmationModal";
import { HabitDetailModal } from "./ui/HabitDetailModal";
import { LoadingOverlay } from "./ui/LoadingOverlay";
import { Logo } from "./ui/Logo";
import { ProgressRing } from "./ui/ProgressRing";
import { SwipeableHabit } from "./ui/SwipeableHabit";
import { ShinyButton } from "./magicui/shiny-button";
import { BlurFade } from "./magicui/blur-fade";



export function TodosView() {
	const {
		habits,
		logs,
		todayProgress,
		isLoading: loading,
		fetchData,
		addHabit: addHabitToStore,
		toggleHabit,
		deleteHabit: deleteHabitFromStore
	} = useHabitStore();

	const [showAddModal, setShowAddModal] = useState(false);
	const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
	const [habitToDelete, setHabitToDelete] = useState<string | null>(null);

	const { success, error: toastError } = useToast();

	// Initial Load
	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleComplete = async (habitId: string) => {
		try {
			await toggleHabit(habitId);
			success("Status updated");
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
			await deleteHabitFromStore(habitToDelete);
			success("Todo deleted");
		} catch (err) {
			console.error("Error deleting habit:", err);
			toastError("Failed to delete todo");
		} finally {
			setHabitToDelete(null);
		}
	};

	const handleAddHabit = (newHabit: Habit) => {
		addHabitToStore(newHabit);
		success("New todo started");
	};

	return (
		<div className="pb-24 pt-8 min-h-screen relative">
			{loading && <LoadingOverlay message="Loading todos..." />}

			{/* Header with Progress Ring */}
			<header className="flex flex-col items-center mb-8 space-y-4 relative">
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
					{habits.map((habit, idx) => {
						const isCompleted = logs.some(
							(l) => l.habit_id === habit.id && l.status === "completed",
						);
						return (
							<BlurFade key={habit.id} delay={0.04 * idx} inView className="w-full">
								<SwipeableHabit
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
							</BlurFade>
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

			{/* Floating Action Button - Shiny Magic */}
			<div className="fixed bottom-32 right-8 z-40">
				<ShinyButton
					onClick={() => setShowAddModal(true)}
					className="!rounded-full !p-0 w-16 h-16 flex items-center justify-center bg-zen-btn-primary shadow-lg shadow-green-500/20 glass-3d"
				>
					<Plus size={32} className="text-white" />
				</ShinyButton>
			</div>

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
