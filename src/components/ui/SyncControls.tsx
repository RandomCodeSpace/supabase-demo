import { makeStyles, Button, Tooltip, tokens } from "@fluentui/react-components";
import { ArrowSync24Regular, CloudArrowUp24Regular, ArrowSync24Filled } from "@fluentui/react-icons";
import { useState } from "react";
import { SyncService } from "../../backbone/services/syncService";
import { useToast } from "../../context/ToastContext";
import { useHabitStore } from "../../stores/useHabitStore";
import { useProjectStore } from "../../stores/useProjectStore";

const useStyles = makeStyles({
	root: {
		position: "fixed",
		top: "16px",
		right: "16px",
		zIndex: 50,
		display: "flex",
		gap: "8px"
	},
	button: {
		backgroundColor: tokens.colorNeutralBackgroundAlpha,
		backdropFilter: "blur(8px)",
		boxShadow: tokens.shadow4,
		":hover": {
			backgroundColor: tokens.colorNeutralBackgroundAlpha2
		}
	},
	spinning: {
		animationName: {
			from: { transform: "rotate(0deg)" },
			to: { transform: "rotate(360deg)" }
		},
		animationDuration: "1s",
		animationIterationCount: "infinite",
		animationTimingFunction: "linear"
	}
});

export function SyncControls() {
	const styles = useStyles();
	const [status, setStatus] = useState<"idle" | "pulling" | "pushing">("idle");
	const { success, error } = useToast();
	const fetchHabits = useHabitStore((state) => state.fetchData);
	const fetchProjects = useProjectStore((state) => state.fetchProjects);

	const handlePull = async () => {
		if (status !== "idle") return;
		setStatus("pulling");
		try {
			await SyncService.pullChanges();
			await Promise.all([fetchHabits(), fetchProjects()]);
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
		<div className={styles.root}>
			<Tooltip content={status === "pulling" ? "Syncing..." : "Sync from Cloud"} relationship="label">
				<Button
					appearance="subtle"
					icon={status === "pulling" ? <ArrowSync24Filled className={styles.spinning} /> : <ArrowSync24Regular />}
					onClick={handlePull}
					className={styles.button}
					disabled={status !== "idle"}
					aria-label="Pull changes"
				/>
			</Tooltip>
			{/* Push is conceptually 'save' */}
			<Tooltip content={status === "pushing" ? "Saving..." : "Save to Cloud"} relationship="label">
				<Button
					appearance="subtle"
					icon={<CloudArrowUp24Regular />}
					onClick={handlePush}
					className={styles.button}
					disabled={status !== "idle"}
					aria-label="Push changes"
				/>
			</Tooltip>
		</div>
	);
}
