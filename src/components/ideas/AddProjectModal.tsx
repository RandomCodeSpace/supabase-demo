import { useState } from "react";
import { ProjectService } from "../../backbone/services/projectService";
import { VoiceInput } from "../ui/VoiceInput";
import { Drawer } from "../design/Drawer";
import { NeonButton } from "../design/NeonButton";

interface AddProjectModalProps {
	onClose: () => void;
	onAdded: (project: any) => void;
}

export function AddProjectModal({ onClose, onAdded }: AddProjectModalProps) {
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
		} finally {
			setLoading(false);
		}
	};

	return (
		<Drawer
			isOpen={true}
			onClose={onClose}
			title="New Idea"
		>
			<form onSubmit={handleSubmit} className="flex flex-col gap-6 pt-4">
				<div className="flex flex-col gap-2">
					<label htmlFor="proj-name" className="text-sm font-semibold text-[var(--text-secondary)]">
						Project Name
					</label>
					<VoiceInput
						autoFocus
						value={name}
						onValueChange={setName}
						placeholder="e.g. AI Fitness App"
						className="p-4 rounded-xl bg-white/5 border border-white/10 focus:border-[var(--color-primary)] transition-colors min-h-[3rem]"
					/>
				</div>

				<div className="flex flex-col gap-2">
					<label htmlFor="proj-desc" className="text-sm font-semibold text-[var(--text-secondary)]">
						Description / Goal
					</label>
					<VoiceInput
						value={description}
						onValueChange={setDescription}
						placeholder="What problem does it solve?"
						className="p-4 rounded-xl bg-white/5 border border-white/10 focus:border-[var(--color-primary)] transition-colors min-h-[6rem]"
					/>
				</div>

				<div className="pt-4">
					<NeonButton
						type="submit"
						disabled={!name || loading}
						className="w-full !p-4 !text-lg !rounded-xl"
						glow
					>
						{loading ? "Creating..." : "Start Brainstorming"}
					</NeonButton>
				</div>
			</form>
		</Drawer>
	);
}
