import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import { ProjectService } from "../../services/projectService";
import { LoadingOverlay } from "../ui/LoadingOverlay";
import { VoiceInput } from "../ui/VoiceInput";

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
			alert("Failed to create project");
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
				className="relative w-full max-w-md"
			>
				{loading && <LoadingOverlay message="Creating project..." />}
				<div className="glow-behind bg-cyan-500/30" />
				<div className="glass-3d rounded-3xl p-6 relative z-10">
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-xl font-bold text-zen-text">New Idea</h2>
						<button
							onClick={onClose}
							className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
						>
							<X size={20} />
						</button>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-zen-text-muted mb-1">
								Project Name
							</label>
							<VoiceInput
								value={name}
								onValueChange={setName}
								placeholder="e.g. AI Fitness App"
								rows={1}
								style={{ minHeight: "3rem" }}
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-zen-text-muted mb-1">
								Description / Goal
							</label>
							<VoiceInput
								value={description}
								onValueChange={setDescription}
								placeholder="What problem does it solve?"
								rows={3}
							/>
						</div>

						<button
							type="submit"
							disabled={!name || loading}
							className="w-full bg-cyan-600 text-white font-bold py-4 rounded-xl mt-4 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-cyan-500/20"
						>
							{loading ? "Creating..." : "Start Brainstorming"}
						</button>
					</form>
				</div>
			</motion.div>
		</div>
	);
}
