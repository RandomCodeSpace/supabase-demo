import {
	Dialog,
	DialogTrigger,
	DialogSurface,
	DialogTitle,
	DialogBody,
	DialogActions,
	DialogContent,
	Button,
	makeStyles,
	tokens,
	shorthands,
	Label
} from "@fluentui/react-components";
import { Dismiss24Regular } from "@fluentui/react-icons";
import { useState } from "react";
import { type Habit, HabitService } from "../../backbone/services/habitService";
import { VoiceInput } from "./VoiceInput";

const useStyles = makeStyles({
	dialogSurface: {
		width: "100%",
		maxWidth: "100%",
		position: "fixed",
		bottom: 0,
		left: 0,
		right: 0,
		margin: 0,
		...shorthands.borderRadius(tokens.borderRadiusXLarge, tokens.borderRadiusXLarge, 0, 0),
		maxHeight: "90dvh",
		display: "flex",
		flexDirection: "column",

		"@media (min-width: 768px)": {
			width: "480px",
			maxWidth: "480px",
			position: "relative",
			bottom: "auto",
			left: "auto",
			right: "auto",
			margin: "auto",
			...shorthands.borderRadius(tokens.borderRadiusLarge),
		}
	},
	header: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: "16px"
	},
	form: {
		display: "flex",
		flexDirection: "column",
		...shorthands.gap("16px")
	},
	field: {
		display: "flex",
		flexDirection: "column",
		...shorthands.gap("8px")
	}
});

interface AddHabitModalProps {
	onClose: () => void;
	onAdded: (habit: Habit) => void;
}

export function AddHabitModal({ onClose, onAdded }: AddHabitModalProps) {
	const styles = useStyles();
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) return;

		setLoading(true);
		try {
			const habit = await HabitService.createHabit({
				title,
				description,
				color: "#4ade80",
				icon: "circle",
			});
			onAdded(habit);
			onClose();
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={true} onOpenChange={(_, data) => !data.open && onClose()}>
			<DialogSurface className={styles.dialogSurface}>
				<DialogBody>
					<div className={styles.header}>
						<DialogTitle>New Todo</DialogTitle>
						<DialogActions>
							<DialogTrigger disableButtonEnhancement>
								<Button appearance="subtle" icon={<Dismiss24Regular />} aria-label="Close" onClick={onClose} />
							</DialogTrigger>
						</DialogActions>
					</div>

					<DialogContent className={styles.form}>
						<form onSubmit={handleSubmit} className={styles.form}>
							<div className={styles.field}>
								<Label htmlFor="todo-title" weight="semibold">Title</Label>
								<VoiceInput
									value={title}
									onValueChange={setTitle}
									placeholder="e.g. Morning Meditation"
									className="min-h-[3rem]"
								/>
							</div>
							<div className={styles.field}>
								<Label htmlFor="todo-desc" weight="semibold">Description (Optional)</Label>
								<VoiceInput
									value={description}
									onValueChange={setDescription}
									placeholder="What is this todo about?"
									className="min-h-[6rem]"
								/>
							</div>
							<Button
								appearance="primary"
								type="submit"
								disabled={!title || loading}
								size="large"
							>
								{loading ? "Creating..." : "Start Todo"}
							</Button>
						</form>
					</DialogContent>
				</DialogBody>
			</DialogSurface>
		</Dialog>
	);
}
