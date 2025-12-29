import {
	Dialog,
	DialogSurface,
	DialogBody,
	Button,
	makeStyles,
	tokens,
	shorthands,
	Text,
	Spinner
} from "@fluentui/react-components";
import {
	Dismiss24Regular,
	Delete24Regular,
	Send24Regular
} from "@fluentui/react-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { type Habit, type HabitNote, HabitService } from "../../backbone/services/habitService";
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
		height: "85dvh",
		maxHeight: "90dvh",
		...shorthands.borderRadius(tokens.borderRadiusXLarge, tokens.borderRadiusXLarge, 0, 0),
		display: "flex",
		flexDirection: "column",

		"@media (min-width: 768px)": {
			width: "600px",
			maxWidth: "600px",
			position: "relative",
			bottom: "auto",
			left: "auto",
			right: "auto",
			margin: "auto",
			height: "auto",
			maxHeight: "80vh",
			...shorthands.borderRadius(tokens.borderRadiusLarge),
		}
	},
	header: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		paddingBottom: "16px",
		borderBottom: `1px solid ${tokens.colorNeutralStroke2}`
	},
	contentNode: {
		display: "flex",
		flexDirection: "column",
		flexGrow: 1,
		overflowY: "auto",
		paddingTop: "16px",
		paddingBottom: "16px",
		...shorthands.gap("12px")
	},
	noteItem: {
		display: "flex",
		alignItems: "flex-start",
		...shorthands.gap("12px"),
		...shorthands.padding("12px"),
		backgroundColor: tokens.colorNeutralBackground2,
		...shorthands.borderRadius(tokens.borderRadiusMedium),
		boxShadow: tokens.shadow2
	},
	noteContent: {
		flexGrow: 1,
		display: "flex",
		flexDirection: "column",
	},
	inputArea: {
		marginTop: "auto",
		paddingTop: "16px",
		borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
		display: "flex",
		alignItems: "flex-end",
		...shorthands.gap("8px")
	}
});

interface HabitDetailModalProps {
	habit: Habit;
	onClose: () => void;
}

export function HabitDetailModal({ habit, onClose }: HabitDetailModalProps) {
	const styles = useStyles();
	const [notes, setNotes] = useState<HabitNote[]>([]);
	const [newNote, setNewNote] = useState("");
	const [loading, setLoading] = useState(false);
	const [loadingData, setLoadingData] = useState(true);
	const listEndRef = useRef<HTMLDivElement>(null);

	const loadNotes = useCallback(async () => {
		try {
			setLoadingData(true);
			const data = await HabitService.fetchNotes(habit.id);
			setNotes(data);
		} catch (err) {
			console.error(err);
		} finally {
			setLoadingData(false);
		}
	}, [habit.id]);

	useEffect(() => {
		loadNotes();
	}, [loadNotes]);

	useEffect(() => {
		if (notes.length > 0) {
			listEndRef.current?.scrollIntoView({ behavior: "smooth" });
		}
	}, [notes.length]);

	const handleSend = async () => {
		if (!newNote.trim()) return;
		setLoading(true);
		try {
			const note = await HabitService.addNote(habit.id, newNote);
			setNotes([...notes, note]);
			setNewNote("");
		} catch (error) {
			console.error("Failed to add note:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteNote = async (noteId: string) => {
		// Standard confirm for now, or Toast with undo usually better but simplest is native confirm
		if (!window.confirm("Delete this note?")) return;
		try {
			await HabitService.deleteNote(noteId);
			setNotes(notes.filter((n) => n.id !== noteId));
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<Dialog open={true} onOpenChange={(_, data) => !data.open && onClose()}>
			<DialogSurface className={styles.dialogSurface}>
				<DialogBody style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
					<div className={styles.header}>
						<div style={{ overflow: 'hidden' }}>
							<Text truncate weight="bold" size={500} block>{habit.title}</Text>
							<Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>Todo Notes</Text>
						</div>
						<div style={{ display: 'flex', gap: '8px' }}>
							<Button appearance="subtle" icon={<Dismiss24Regular />} onClick={onClose} title="Close" />
						</div>
					</div>

					<div className={styles.contentNode}>
						{loadingData && <Spinner label="Loading details..." />}
						{!loadingData && notes.map((note) => (
							<div key={note.id} className={styles.noteItem}>
								<div className={styles.noteContent}>
									<Text style={{ whiteSpace: 'pre-wrap' }}>{note.content}</Text>
									<Text size={200} style={{ color: tokens.colorNeutralForeground3, marginTop: '4px' }}>
										{new Date(note.created_at).toLocaleDateString()}
									</Text>
								</div>
								<Button
									appearance="transparent"
									icon={<Delete24Regular />}
									onClick={() => handleDeleteNote(note.id)}
									style={{ color: tokens.colorPaletteRedForeground1 }}
								/>
							</div>
						))}
						{!loadingData && notes.length === 0 && (
							<Text align="center" style={{ padding: '40px', color: tokens.colorNeutralForeground3 }}>No notes yet.</Text>
						)}
						<div ref={listEndRef} />
					</div>

					<div className={styles.inputArea}>
						<VoiceInput
							value={newNote}
							onValueChange={setNewNote}
							placeholder="Add a thought..."
							className="flex-grow"
							containerClassName="flex-grow"
						/>
						<Button
							appearance="primary"
							icon={<Send24Regular />}
							disabled={!newNote.trim() || loading}
							onClick={handleSend}
						/>
					</div>
				</DialogBody>
			</DialogSurface>
		</Dialog>
	);
}
