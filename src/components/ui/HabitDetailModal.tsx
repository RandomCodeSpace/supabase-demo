import { AnimatePresence, motion } from "framer-motion";
import { Send, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	type Habit,
	type HabitNote,
	HabitService,
} from "../../services/habitService";
import { VoiceInput } from "./VoiceInput";

interface HabitDetailModalProps {
	habit: Habit;
	onClose: () => void;
}

export function HabitDetailModal({ habit, onClose }: HabitDetailModalProps) {
	const [notes, setNotes] = useState<HabitNote[]>([]);
	const [newNote, setNewNote] = useState("");
	const [loading, setLoading] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = useCallback(() => {
		setTimeout(() => {
			if (scrollRef.current) {
				scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
			}
		}, 100);
	}, []);

	const loadNotes = useCallback(async () => {
		try {
			const data = await HabitService.fetchNotes(habit.id);
			setNotes(data);
			scrollToBottom();
		} catch (error) {
			console.error(error);
		}
	}, [habit.id, scrollToBottom]);

	useEffect(() => {
		loadNotes();
	}, [loadNotes]);

	// Effect to update note with transcript while listening - REMOVED (handled by VoiceInput)

	const handleSend = async () => {
		if (!newNote.trim()) return;
		setLoading(true);
		try {
			const note = await HabitService.addNote(habit.id, newNote);
			setNotes([...notes, note]);
			setNewNote("");
			scrollToBottom();
		} catch (error) {
			console.error("Failed to add note:", error);
			alert("Failed to add note");
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteNote = async (noteId: string) => {
		if (!confirm("Delete this note?")) return;
		try {
			await HabitService.deleteNote(noteId);
			setNotes(notes.filter((n) => n.id !== noteId));
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
			<motion.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.9 }}
				className="relative w-full max-w-md h-[70vh]"
			>
				<div
					className="glow-behind"
					style={{ backgroundColor: habit.color, opacity: 0.2 }}
				/>
				<div className="glass-3d rounded-3xl overflow-hidden relative z-10 flex flex-col h-full">
					{/* Header */}
					<div className="p-6 relative z-10 border-b border-black/5 dark:border-white/5 backdrop-blur-md flex justify-between items-center">
						{/* Glow */}
						<div
							className="absolute top-0 right-0 w-32 h-32 bg-zen-primary/10 blur-3xl rounded-full pointer-events-none"
							style={{ backgroundColor: habit.color }}
						/>

						<div>
							<h2 className="text-xl font-bold text-zen-text mb-0.5">
								{habit.title}
							</h2>
							<p className="text-zen-text-muted text-xs">Ritual Notes</p>
						</div>
						<button
							onClick={onClose}
							className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
						>
							<X size={20} />
						</button>
					</div>

					{/* Notes List */}
					<div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
						<AnimatePresence>
							{notes.map((note) => (
								<motion.div
									key={note.id}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, scale: 0.9 }}
									className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl p-4 relative group"
								>
									<p className="text-zen-text text-sm whitespace-pre-wrap leading-relaxed">
										{note.content}
									</p>
									<p className="text-xs text-zen-text-muted mt-2 opacity-50">
										{new Date(note.created_at).toLocaleDateString()}
									</p>
									<button
										onClick={() => handleDeleteNote(note.id)}
										className="absolute top-2 right-2 p-1.5 text-zen-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
									>
										<Trash2 size={14} />
									</button>
								</motion.div>
							))}
						</AnimatePresence>
						{notes.length === 0 && (
							<div className="text-center text-zen-text-muted/50 py-10 text-sm">
								No notes yet. Start the journal.
							</div>
						)}
					</div>

					{/* Input Area */}
					<div className="p-4 bg-zen-surface border-t border-black/5 dark:border-white/10 z-20">
						<VoiceInput
							value={newNote}
							onValueChange={setNewNote}
							placeholder="Add a thought..."
							rows={1}
							style={{ minHeight: "3rem", maxHeight: "8rem" }}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handleSend();
								}
							}}
							rightElement={
								<button
									onClick={handleSend}
									disabled={!newNote.trim() || loading}
									className="p-2 bg-zen-primary text-black rounded-xl hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
								>
									<Send size={16} />
								</button>
							}
						/>
					</div>
				</div>
			</motion.div>
		</div>
	);
}
