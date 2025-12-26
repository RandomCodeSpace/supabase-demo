import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import { type Habit, HabitService } from "../../services/habitService";
import { VoiceInput } from "./VoiceInput";

interface AddHabitModalProps {
	onClose: () => void;
	onAdded: (habit: Habit) => void;
}

export function AddHabitModal({ onClose, onAdded }: AddHabitModalProps) {
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
				color: "#4ade80", // Default green
				icon: "circle",
			});
			onAdded(habit);
			onClose();
		} catch (error) {
			console.error(error);
			alert("Failed to add habit");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
			<motion.div
				initial={{ opacity: 0, y: 50 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: 50 }}
				className="w-full max-w-md bg-zen-surface border border-white/10 rounded-3xl p-6 shadow-2xl"
			>
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-xl font-bold text-white">New Ritual</h2>
					<button
						onClick={onClose}
						className="p-2 bg-white/5 rounded-full hover:bg-white/10"
					>
						<X size={20} />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-zen-text-muted mb-1">
							Title
						</label>
						<VoiceInput
							value={title}
							onValueChange={setTitle}
							placeholder="e.g. Morning Meditation"
							rows={1}
							style={{ minHeight: "3rem" }}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									// Optional: focus description or submit
								}
							}}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-zen-text-muted mb-1">
							Description (Optional)
						</label>
						<VoiceInput
							value={description}
							onValueChange={setDescription}
							placeholder="What is this ritual about?"
							rows={3}
						/>
					</div>

					<button
						type="submit"
						disabled={!title || loading}
						className="w-full bg-zen-primary text-black font-bold py-4 rounded-xl mt-4 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
					>
						{loading ? "Creating..." : "Start Ritual"}
					</button>
				</form>
			</motion.div>
		</div>
	);
}
