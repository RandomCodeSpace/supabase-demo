import {
	makeStyles,
	tokens,
	Text,
	Button,
	shorthands,
	Checkbox
} from "@fluentui/react-components";
import {
	Add24Regular,
	Add24Filled,
	Delete24Regular,
	bundleIcon
} from "@fluentui/react-icons";
import { useEffect, useState } from "react";
import { useHabitStore } from "../stores/useHabitStore";
import type { Habit } from "../backbone/services/habitService";
import { useToast } from "../context/ToastContext";
import { AddHabitModal } from "./ui/AddHabitModal";
import { HabitDetailModal } from "./ui/HabitDetailModal";
import { ConfirmationModal } from "./ui/ConfirmationModal";
import { LoadingOverlay } from "./ui/LoadingOverlay";
import { Logo } from "./ui/Logo";
import { ProgressRing } from "./ui/ProgressRing";

const AddIcon = bundleIcon(Add24Filled, Add24Regular);

const useStyles = makeStyles({
	root: {
		position: "relative",
		height: "100%",
		width: "100%",
		display: "flex",
		flexDirection: "column",
		backgroundColor: tokens.colorNeutralBackground2,
		...shorthands.padding("16px"),
		boxSizing: "border-box"
	},
	header: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		marginBottom: "24px",
		flexShrink: 0,
		...shorthands.gap("8px")
	},
	list: {
		display: "flex",
		flexDirection: "column",
		...shorthands.gap("12px"),
		overflowY: "auto",
		paddingBottom: "100px",
		flexGrow: 1
	},
	habitCard: {
		display: "flex",
		alignItems: "center",
		...shorthands.padding("12px"),
		backgroundColor: tokens.colorNeutralBackground1,
		...shorthands.borderRadius(tokens.borderRadiusMedium),
		boxShadow: tokens.shadow2,
		cursor: "pointer",
		...shorthands.gap("12px")
	},
	colorStrip: {
		width: "6px",
		height: "40px",
		borderRadius: "3px"
	},
	content: {
		flexGrow: 1,
		display: "flex",
		flexDirection: "column"
	},
	fabContainer: {
		position: "absolute",
		bottom: "24px",
		right: "24px",
		zIndex: 10,
		"@media (min-width: 768px)": {
			bottom: "32px",
			right: "32px"
		}
	},
	fab: {
		height: "56px",
		width: "56px",
		borderRadius: "28px",
		boxShadow: tokens.shadow16
	}
});

export function TodosView() {
	const styles = useStyles();
	const {
		habits,
		logs,
		todayProgress,
		isLoading: loading,
		fetchData,
		addHabit: addHabitToStore,
		toggleHabit,
		deleteHabit: deleteHabitFromStore,
	} = useHabitStore();

	const [showAddModal, setShowAddModal] = useState(false);
	const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
	const [habitToDelete, setHabitToDelete] = useState<string | null>(null);
	const { success, error: toastError } = useToast();

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleComplete = async (e: React.MouseEvent | React.ChangeEvent, habitId: string) => {
		e.stopPropagation();
		try {
			await toggleHabit(habitId);
			success("Status updated");
		} catch (err) {
			console.error(err);
			toastError("Failed to update status");
		}
	};

	const handleAddHabit = (newHabit: Habit) => {
		addHabitToStore(newHabit);
		success("New todo started");
	};

	const handleDelete = (id: string) => {
		setHabitToDelete(id);
	}

	const confirmDelete = async () => {
		if (!habitToDelete) return;
		try {
			await deleteHabitFromStore(habitToDelete);
			success("Todo deleted");
		} catch (e) {
			toastError("Failed to delete");
		} finally {
			setHabitToDelete(null);
		}
	}

	return (
		<div className={styles.root}>
			{loading && <LoadingOverlay message="Loading todos..." />}

			<header className={styles.header}>
				<ProgressRing percentage={todayProgress} size={160} color={tokens.colorPaletteGreenBackground3} />
				<div style={{ textAlign: 'center' }}>
					<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
						<Logo size={24} animate={false} />
						<Text size={500} weight="bold">Todos</Text>
					</div>
					<Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>
						{Math.round(todayProgress)}% completed
					</Text>
				</div>
			</header>

			<div className={styles.list}>
				{habits.map(habit => {
					const isCompleted = logs.some(l => l.habit_id === habit.id && l.status === "completed");
					return (
						<div key={habit.id} className={styles.habitCard} onClick={() => setSelectedHabit(habit)}>
							<div className={styles.colorStrip} style={{ backgroundColor: habit.color }} />
							<div className={styles.content}>
								<Text weight="semibold" style={{ textDecoration: isCompleted ? 'line-through' : 'none', opacity: isCompleted ? 0.6 : 1 }}>
									{habit.title}
								</Text>
								{habit.description && <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>{habit.description}</Text>}
							</div>
							<Checkbox
								checked={isCompleted}
								onChange={(e) => handleComplete(e, habit.id)}
								onClick={(e) => e.stopPropagation()}
							/>
							<Button
								appearance="transparent"
								icon={<Delete24Regular />}
								onClick={(e) => { e.stopPropagation(); handleDelete(habit.id); }}
								aria-label="Delete"
							/>
						</div>
					)
				})}
				{habits.length === 0 && !loading && (
					<div style={{ textAlign: 'center', padding: '40px' }}>
						<Text style={{ color: tokens.colorNeutralForeground3 }}>No todos yet. Tap + to start.</Text>
					</div>
				)}
			</div>

			<div className={styles.fabContainer}>
				<Button
					appearance="primary"
					icon={<AddIcon />}
					className={styles.fab}
					onClick={() => setShowAddModal(true)}
					size="large"
					aria-label="Add new todo"
				/>
			</div>

			{showAddModal && (
				<AddHabitModal
					onClose={() => setShowAddModal(false)}
					onAdded={handleAddHabit}
				/>
			)}

			{selectedHabit && (
				<HabitDetailModal
					habit={selectedHabit}
					onClose={() => setSelectedHabit(null)}
				/>
			)}

			<ConfirmationModal
				isOpen={!!habitToDelete}
				onClose={() => setHabitToDelete(null)}
				onConfirm={confirmDelete}
				title="Delete Todo?"
				message="This action cannot be undone."
			/>

		</div>
	);
}
