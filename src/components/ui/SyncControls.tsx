import { Loader2, RefreshCw, UploadCloud } from "lucide-react";
import { useState } from "react";
import { cn } from "../../backbone/lib/utils";
import { SyncService } from "../../backbone/services/syncService";
import { useToast } from "../../context/ToastContext";
import { useHabitStore } from "../../stores/useHabitStore";
import { useProjectStore } from "../../stores/useProjectStore";

export function SyncControls() {
	const [status, setStatus] = useState<"idle" | "pulling" | "pushing">("idle");
	const { success, error } = useToast();
	const fetchHabits = useHabitStore((state) => state.fetchData);
	const fetchProjects = useProjectStore((state) => state.fetchProjects);

	const handlePull = async () => {
		if (status !== "idle") return;
		setStatus("pulling");
		try {
			await SyncService.pullChanges();
			await Promise.all([fetchHabits(), fetchProjects()]); // Refresh ALL data
			success("Data updated from cloud");
		} catch (err) {
			console.error(err);
			error("Failed to refresh data");
		} finally {
			setStatus("idle");
		}
	};

	const handlePush = async () => {
		if (status !== "idle") return;
		setStatus("pushing");
		try {
			await SyncService.pushImmediately();
			success("Changes uploaded successfully");
		} catch (err) {
			console.error(err);
			error("Failed to upload changes");
		} finally {
			setStatus("idle");
		}
	};

	return (
		<div className="fixed top-4 right-4 z-50 flex items-center gap-2">
			<button
				onClick={handlePull}
				disabled={status !== "idle"}
				className={cn(
					"flex items-center gap-2 px-3 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-zen-text-muted hover:text-white hover:bg-white/10 transition-all shadow-lg",
					status === "pulling" &&
						"bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
				)}
			>
				{status === "pulling" ? (
					<>
						<Loader2 size={16} className="animate-spin" />
						<span className="text-xs font-medium">Syncing...</span>
					</>
				) : (
					<RefreshCw size={20} />
				)}
			</button>
			<button
				onClick={handlePush}
				disabled={status !== "idle"}
				className={cn(
					"flex items-center gap-2 px-3 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-zen-text-muted hover:text-white hover:bg-white/10 transition-all shadow-lg",
					status === "pushing" &&
						"bg-green-500/20 text-green-400 border-green-500/30",
				)}
			>
				{status === "pushing" ? (
					<>
						<Loader2 size={16} className="animate-spin" />
						<span className="text-xs font-medium">Saving...</span>
					</>
				) : (
					<UploadCloud size={20} />
				)}
			</button>
		</div>
	);
}
