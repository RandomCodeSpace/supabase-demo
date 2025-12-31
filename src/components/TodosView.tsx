import { AnimatePresence, motion } from "framer-motion";
import { Plus, CheckCircle2, Circle } from "lucide-react";
import { useEffect, useState } from "react";
import { useHabitStore } from "../stores/useHabitStore";
import type { Habit } from "../backbone/services/habitService";
import { useToast } from "../context/ToastContext";
import { AddHabitModal } from "./ui/AddHabitModal";
import { HabitDetailModal } from "./ui/HabitDetailModal";
import { ConfirmationModal } from "./ui/ConfirmationModal";
import { GlassCard } from "./design/GlassCard";
import { NeonButton } from "./design/NeonButton";
import { SwipeableItem } from "./design/SwipeableItem";

export function TodosView() {
	const {
		habits,
		logs,
		todayProgress,
		isLoading: loading,
		fetchData,
		toggleHabit,
		deleteHabit
	} = useHabitStore();

	const [showAddModal, setShowAddModal] = useState(false);
	const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
	const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
	const [resetKeys, setResetKeys] = useState<Record<string, number>>({});

	const { success, error: toastError } = useToast();

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleToggle = async (e: React.MouseEvent, habitId: string) => {
		e.stopPropagation();
		try {
			await toggleHabit(habitId);
			if (navigator.vibrate) navigator.vibrate(10);
		} catch (err) {
			console.error(err);
			toastError("Failed to update status");
		}
	};

	const handleSwipeDelete = (habit: Habit) => {
		setHabitToDelete(habit);
	};

	const confirmDelete = async () => {
		if (!habitToDelete) return;
		try {
			await deleteHabit(habitToDelete.id);
			success("Deleted");
			setHabitToDelete(null);
		} catch (err) {
			toastError("Failed to delete");
		}
	};

	const cancelDelete = () => {
		if (habitToDelete) {
			// Force re-render of the item to reset swipe position
			setResetKeys(prev => ({
				...prev,
				[habitToDelete.id]: (prev[habitToDelete.id] || 0) + 1
			}));
		}
		setHabitToDelete(null);
	};

	return (
		<div className="flex flex-col h-full min-h-screen relative p-4 pb-24">
			{/* Reachability Header */}
			<div className="mt-12 mb-8 px-2">
				<h1 className="text-4xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
					Today's<br />Focus
				</h1>
				<div className="flex items-center gap-4 mt-4">
					<div className="h-2 flex-1 bg-white/10 rounded-full overflow-hidden">
						<motion.div
							className="h-full bg-[var(--color-primary)] glow-primary"
							initial={{ width: 0 }}
							animate={{ width: `${todayProgress}%` }}
							transition={{ duration: 1, ease: "easeOut" }}
						/>
					</div>
					<span className="font-mono text-[var(--color-primary)]">{Math.round(todayProgress)}%</span>
				</div>
			</div>

			{/* List */}
			<div className="flex flex-col gap-4">
				<AnimatePresence mode="popLayout">
					{habits.map((habit) => {
						const isCompleted = logs.some(l => l.habit_id === habit.id && l.status === "completed");
						const currentKey = `${habit.id}-${resetKeys[habit.id] || 0}`;

						return (
							<SwipeableItem
								key={currentKey}
								onDelete={() => handleSwipeDelete(habit)}
								onComplete={() => handleToggle({ stopPropagation: () => { } } as React.MouseEvent, habit.id)}
								confirmMessage="Delete this habit?"
							>
								<GlassCard
									onClick={() => setSelectedHabit(habit)}
									className="flex items-center gap-4 !p-5 active:scale-[0.98] transition-transform !bg-transparent !border-0 !shadow-none"
								>
									<button
										onClick={(e) => handleToggle(e, habit.id)}
										className="text-[var(--color-success)] focus:outline-none"
									>
										{isCompleted ? (
											<CheckCircle2 size={28} className="drop-shadow-[0_0_8px_rgba(10,255,96,0.5)]" />
										) : (
											<Circle size={28} className="opacity-50" />
										)}
									</button>

									<div className="flex-1 min-w-0">
										<h3 className={`text-lg font-medium truncate transition-all ${isCompleted ? 'line-through opacity-40' : ''}`}>
											{habit.title}
										</h3>
										{habit.description && (
											<p className="text-sm text-[var(--text-secondary)] truncate">
												{habit.description}
											</p>
										)}
									</div>
								</GlassCard>
							</SwipeableItem>
						);
					})}
				</AnimatePresence>

				{habits.length === 0 && !loading && (
					<div className="text-center text-[var(--text-tertiary)] mt-12">
						<p>No active habits.</p>
						<p className="text-sm mt-2">Tap + to start a streak.</p>
					</div>
				)}
			</div>

			{/* FAB */}
			<div className="fixed bottom-32 right-6 z-40">
				<NeonButton
					onClick={() => setShowAddModal(true)}
					className="!rounded-full !w-16 !h-16 !p-0"
					glow
				>
					<Plus size={32} />
				</NeonButton>
			</div>

			{showAddModal && (
				<AddHabitModal
					onClose={() => setShowAddModal(false)}
					onAdded={() => {
						success("Added");
						fetchData();
					}}
				/>
			)}

			{selectedHabit && (
				<HabitDetailModal
					habit={selectedHabit}
					onClose={() => setSelectedHabit(null)}
				/>
			)}

			{habitToDelete && (
				<ConfirmationModal
					isOpen={!!habitToDelete}
					onClose={cancelDelete}
					onConfirm={confirmDelete}
					title="Delete Habit?"
					message={`Are you sure you want to delete "${habitToDelete.title}"? This cannot be undone.`}
				/>
			)}
		</div>
	);
}
