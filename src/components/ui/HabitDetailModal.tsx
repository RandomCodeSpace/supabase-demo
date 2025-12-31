import { Send, Lightbulb } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { type Habit, type HabitNote, HabitService } from "../../backbone/services/habitService";
import { VoiceInput } from "./VoiceInput";
import { Drawer } from "../design/Drawer";
import { NeonButton } from "../design/NeonButton";
import { ConfirmationModal } from "./ConfirmationModal";
import { SwipeableItem } from "../design/SwipeableItem";
import { useToast } from "../../context/ToastContext";

interface HabitDetailModalProps {
	habit: Habit;
	onClose: () => void;
}

export function HabitDetailModal({ habit, onClose }: HabitDetailModalProps) {
	const [notes, setNotes] = useState<HabitNote[]>([]);
	const [newNote, setNewNote] = useState("");
	const [loading, setLoading] = useState(false);
	const [loadingData, setLoadingData] = useState(true);
	const listEndRef = useRef<HTMLDivElement>(null);
	const { success, error } = useToast();

	// Swipe & Confirm State
	const [noteToDelete, setNoteToDelete] = useState<HabitNote | null>(null);
	const [resetKeys, setResetKeys] = useState<Record<string, number>>({});

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

	const handleSwipeDelete = (note: HabitNote) => {
		setNoteToDelete(note);
	};

	const confirmDelete = async () => {
		if (!noteToDelete) return;
		try {
			await HabitService.deleteNote(noteToDelete.id);
			setNotes(notes.filter((n) => n.id !== noteToDelete.id));
			success("Note deleted");
		} catch (err) {
			console.error(err);
			error("Failed to delete note");
		} finally {
			setNoteToDelete(null);
		}
	};

	const cancelDelete = () => {
		if (noteToDelete) {
			setResetKeys(prev => ({
				...prev,
				[noteToDelete.id]: (prev[noteToDelete.id] || 0) + 1
			}));
		}
		setNoteToDelete(null);
	};


	return (
		<Drawer
			isOpen={true}
			onClose={onClose}
			title={habit.title}
		>
			{/* Sub-header info */}
			<div className="mb-6 -mt-2 text-[var(--text-secondary)]">
				Todo Notes & Log
			</div>

			<div className="flex flex-col gap-3 min-h-[200px] mb-20">
				{loadingData ? (
					<div className="flex justify-center py-10">
						<div className="animate-spin w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full" />
					</div>
				) : (
					<>
						{notes.map((note) => {
							const currentKey = `${note.id}-${resetKeys[note.id] || 0}`;
							return (
								<SwipeableItem
									key={currentKey}
									onDelete={() => handleSwipeDelete(note)}
									confirmMessage="Delete note?"
								>
									<div className="group relative bg-[var(--bg-deep)] border border-white/5 rounded-xl p-4 flex gap-3">
										<div className="flex-1">
											<p className="text-[var(--text-primary)] whitespace-pre-wrap">{note.content}</p>
											<p className="text-xs text-[var(--text-tertiary)] mt-2">
												{new Date(note.created_at).toLocaleDateString()}
											</p>
										</div>
										{/* No Trash Icon */}
									</div>
								</SwipeableItem>
							);
						})}

						{notes.length === 0 && (
							<div className="text-center py-10 text-[var(--text-tertiary)] bg-white/5 rounded-xl border border-dashed border-white/10">
								<Lightbulb className="mx-auto mb-2 opacity-50" />
								<p>No notes yet.</p>
							</div>
						)}
					</>
				)}
				<div ref={listEndRef} />
			</div>

			<div className="sticky bottom-0 bg-[var(--bg-surface)] pt-4 pb-2 border-t border-white/10 flex items-end gap-2">
				<VoiceInput
					value={newNote}
					onValueChange={setNewNote}
					placeholder="Add a thought..."
					className="flex-1 bg-[var(--bg-deep)] border-white/10 rounded-xl px-4 py-3 focus:border-[var(--color-primary)] outline-none transition-colors"
				/>
				<NeonButton
					onClick={handleSend}
					disabled={!newNote.trim() || loading}
					className="!w-12 !h-12 !p-0 !rounded-xl flex-shrink-0"
					glow
				>
					{loading ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Send size={20} />}
				</NeonButton>
			</div>

			{noteToDelete && (
				<ConfirmationModal
					isOpen={!!noteToDelete}
					onClose={cancelDelete}
					onConfirm={confirmDelete}
					title="Delete Note?"
					message={`Are you sure you want to delete this note?`}
				/>
			)}
		</Drawer>
	);
}
