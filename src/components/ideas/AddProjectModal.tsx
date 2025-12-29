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
import { ProjectService } from "../../backbone/services/projectService";
import { VoiceInput } from "../ui/VoiceInput";

const useStyles = makeStyles({
	dialogSurface: {
		// Mobile Bottom Sheet Styles
		width: "100%",
		maxWidth: "100%",
		position: "fixed",
		bottom: 0,
		left: 0,
		right: 0,
		margin: 0,
		...shorthands.borderRadius(tokens.borderRadiusXLarge, tokens.borderRadiusXLarge, 0, 0),
		maxHeight: "90dvh", // PWA safety
		overflowY: "auto",

		// Desktop Center Logic
		"@media (min-width: 768px)": {
			width: "480px", // Standard modal width
			maxWidth: "480px",
			position: "relative", // Reset to default centered
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

interface AddProjectModalProps {
	onClose: () => void;
	onAdded: (project: any) => void;
}

export function AddProjectModal({ onClose, onAdded }: AddProjectModalProps) {
	const styles = useStyles();
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;

		setLoading(true);
		try {
			const project = await ProjectService.createProject({ name, description });
			onAdded(project);
			onClose();
		} catch (err) {
			console.error(err);
			// Toast ideally handled by service or context
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={true} onOpenChange={(_, data) => !data.open && onClose()}>
			<DialogSurface className={styles.dialogSurface}>
				<DialogBody>
					<div className={styles.header}>
						<DialogTitle>New Idea</DialogTitle>
						<DialogActions>
							<DialogTrigger disableButtonEnhancement>
								<Button appearance="subtle" icon={<Dismiss24Regular />} aria-label="Close" onClick={onClose} />
							</DialogTrigger>
						</DialogActions>
					</div>

					<DialogContent className={styles.form}>
						<form onSubmit={handleSubmit} className={styles.form}>
							<div className={styles.field}>
								<Label htmlFor="proj-name" weight="semibold">Project Name</Label>
								<VoiceInput
									value={name}
									onValueChange={setName}
									placeholder="e.g. AI Fitness App"
									className="min-h-[3rem]" // fallback helpers
								/>
							</div>

							<div className={styles.field}>
								<Label htmlFor="proj-desc" weight="semibold">Description / Goal</Label>
								<VoiceInput
									value={description}
									onValueChange={setDescription}
									placeholder="What problem does it solve?"
									className="min-h-[6rem]"
								/>
							</div>

							<Button
								appearance="primary"
								type="submit"
								disabled={!name || loading}
								size="large"
							>
								{loading ? "Creating..." : "Start Brainstorming"}
							</Button>
						</form>
					</DialogContent>
				</DialogBody>
			</DialogSurface>
		</Dialog>
	);
}
