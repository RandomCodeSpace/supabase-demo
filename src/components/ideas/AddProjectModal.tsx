import { X } from "lucide-react";
import { useState } from "react";
import { ProjectService } from "../../services/projectService";
import { Button } from "../ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
} from "../ui/drawer";
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
			// alert("Failed to create project");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Drawer open={true} onOpenChange={(open) => !open && onClose()}>
			<DrawerContent className="max-w-md mx-auto">
				<div className="p-6">
					<DrawerHeader className="p-0 mb-6 flex justify-between items-center">
						<DrawerTitle className="text-xl font-bold text-foreground">
							New Idea
						</DrawerTitle>
						<DrawerClose asChild>
							<Button variant="ghost" size="icon" className="rounded-full">
								<X size={20} />
							</Button>
						</DrawerClose>
					</DrawerHeader>

					<form onSubmit={handleSubmit} className="space-y-4">
						{loading && <LoadingOverlay message="Conceptualizing..." />}
						<div>
							<label className="block text-sm font-medium text-muted-foreground mb-1">
								Project Name
							</label>
							<VoiceInput
								value={name}
								onValueChange={setName}
								placeholder="e.g. AI Fitness App"
								rows={1}
								className="bg-secondary/50 border-transparent focus:border-primary"
								style={{ minHeight: "3rem" }}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
									}
								}}
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-muted-foreground mb-1">
								Description / Goal
							</label>
							<VoiceInput
								value={description}
								onValueChange={setDescription}
								placeholder="What problem does it solve?"
								rows={3}
								className="bg-secondary/50 border-transparent focus:border-primary"
							/>
						</div>

						<Button
							type="submit"
							disabled={!name || loading}
							className="w-full text-lg h-14 rounded-2xl font-bold mt-4"
							variant="default"
						>
							{loading ? "Creating..." : "Start Brainstorming"}
						</Button>
					</form>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
