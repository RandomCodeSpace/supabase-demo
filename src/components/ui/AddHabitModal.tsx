import { X } from "lucide-react";
import { useState } from "react";
import { type Habit, HabitService } from "../../services/habitService";
import { Button } from "./button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
} from "./drawer";
import { LoadingOverlay } from "./LoadingOverlay";
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
			// alert("Failed to add habit");
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
							New Todo
						</DrawerTitle>
						<DrawerClose asChild>
							<Button variant="ghost" size="icon" className="rounded-full">
								<X size={20} />
							</Button>
						</DrawerClose>
					</DrawerHeader>

					<form onSubmit={handleSubmit} className="space-y-4">
						{loading && <LoadingOverlay message="Starting todo..." />}
						<div>
							<label className="block text-sm font-medium text-muted-foreground mb-1">
								Title
							</label>
							<VoiceInput
								value={title}
								onValueChange={setTitle}
								placeholder="e.g. Morning Meditation"
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
								Description (Optional)
							</label>
							<VoiceInput
								value={description}
								onValueChange={setDescription}
								placeholder="What is this todo about?"
								rows={3}
								className="bg-secondary/50 border-transparent focus:border-primary"
							/>
						</div>

						<Button
							type="submit"
							disabled={!title || loading}
							className="w-full text-lg h-14 rounded-2xl font-bold mt-4"
							variant="default" // This will use our primary color
						>
							{loading ? "Creating..." : "Start Todo"}
						</Button>
					</form>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
