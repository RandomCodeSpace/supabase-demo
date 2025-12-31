import { useState } from "react";
import { type Habit, HabitService } from "../../backbone/services/habitService";
import { VoiceInput } from "./VoiceInput";
import { Drawer } from "../design/Drawer";
import { NeonButton } from "../design/NeonButton";

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
		<Drawer
			isOpen={true}
			onClose={onClose}
			title="New Todo"
		>
			<form onSubmit={handleSubmit} className="flex flex-col gap-6 pt-4">
				<div className="flex flex-col gap-2">
					<label className="text-sm font-semibold text-[var(--text-secondary)]">Title</label>
					<VoiceInput
						autoFocus
						value={title}
						onValueChange={setTitle}
						placeholder="e.g. Morning Meditation"
						className="p-4 rounded-xl bg-white/5 border border-white/10 focus:border-[var(--color-primary)] transition-colors min-h-[3rem]"
					/>
				</div>
				<div className="flex flex-col gap-2">
					<label className="text-sm font-semibold text-[var(--text-secondary)]">Description (Optional)</label>
					<VoiceInput
						value={description}
						onValueChange={setDescription}
						placeholder="What is this todo about?"
						className="p-4 rounded-xl bg-white/5 border border-white/10 focus:border-[var(--color-primary)] transition-colors min-h-[6rem]"
					/>
				</div>
				<div className="pt-4">
					<NeonButton
						type="submit"
						disabled={!title || loading}
						className="w-full !p-4 !text-lg !rounded-xl"
						glow
					>
						{loading ? "Creating..." : "Start Todo"}
					</NeonButton>
				</div>
			</form>
		</Drawer>
	);
}
