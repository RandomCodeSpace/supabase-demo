import {
	Dialog,
	DialogSurface,
	DialogTitle,
	DialogBody,
	DialogContent,
	DialogActions,
	Button,
	Avatar,
	makeStyles,
	tokens,
	shorthands,
	Text,
	Label,
	Divider
} from "@fluentui/react-components";
import {
	Dismiss24Regular,
	SignOut24Regular,
	Delete24Regular,
	WeatherMoon24Regular,
	WeatherSunny24Regular,
	Desktop24Regular,
	ArrowCounterclockwise24Regular
} from "@fluentui/react-icons";
import { useTheme } from "next-themes";
import { useState } from "react";
import { clear, del } from "idb-keyval";
import { supabase } from "../../backbone/lib/supabase";
import { HabitService } from "../../backbone/services/habitService";
import { useToast } from "../../context/ToastContext";
import { useAuthStore } from "../../stores/useAuthStore";

// Confirmation Dialog Local Component
function ConfirmDialog({
	open,
	title,
	message,
	onConfirm,
	onCancel,
	isDestructive
}: {
	open: boolean;
	title: string;
	message: string;
	onConfirm: () => void;
	onCancel: () => void;
	isDestructive?: boolean;
}) {
	return (
		<Dialog open={open} onOpenChange={(_, data) => !data.open && onCancel()}>
			<DialogSurface>
				<DialogBody>
					<DialogTitle>{title}</DialogTitle>
					<DialogContent>
						<Text>{message}</Text>
					</DialogContent>
					<DialogActions>
						<Button appearance="secondary" onClick={onCancel}>Cancel</Button>
						<Button
							appearance="primary"
							onClick={onConfirm}
							style={isDestructive ? { backgroundColor: tokens.colorPaletteRedBackground3 } : undefined}
						>
							Confirm
						</Button>
					</DialogActions>
				</DialogBody>
			</DialogSurface>
		</Dialog>
	);
}

const useStyles = makeStyles({
	dialogSurface: {
		width: "100%",
		maxWidth: "100%",
		position: "fixed",
		bottom: 0,
		left: 0,
		right: 0,
		margin: 0,
		...shorthands.borderRadius(tokens.borderRadiusXLarge, tokens.borderRadiusXLarge, 0, 0),
		maxHeight: "90dvh",
		display: "flex",
		flexDirection: "column",

		"@media (min-width: 768px)": {
			width: "480px",
			maxWidth: "480px",
			position: "relative",
			bottom: "auto",
			left: "auto",
			right: "auto",
			margin: "auto",
			...shorthands.borderRadius(tokens.borderRadiusLarge),
		}
	},
	header: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: "16px"
	},
	section: {
		display: "flex",
		flexDirection: "column",
		...shorthands.gap("12px"),
		marginBottom: "24px"
	},
	themeSelector: {
		display: "grid",
		gridTemplateColumns: "1fr 1fr 1fr",
		gap: "8px",
		backgroundColor: tokens.colorNeutralBackground2,
		...shorthands.padding("4px"),
		...shorthands.borderRadius(tokens.borderRadiusMedium)
	},
	actionButton: {
		justifyContent: "flex-start",
		...shorthands.padding("12px"),
	}
});

interface UserProfileModalProps {
	email?: string;
	onClose: () => void;
}

export function UserProfileModal({ email, onClose }: UserProfileModalProps) {
	const styles = useStyles();
	const { theme, setTheme } = useTheme();
	const [loading, setLoading] = useState(false);
	const { success, error } = useToast();
	const { setSession } = useAuthStore();

	const [confirmState, setConfirmState] = useState<{
		title: string;
		message: string;
		action: () => Promise<void>;
		isDestructive?: boolean;
	} | null>(null);

	const handleSignOut = async () => {
		try {
			setLoading(true);
			setSession(null);
			await supabase.auth.signOut();
			await del("sb-access-token");
			await del("sb-refresh-token");
			success("Signed out successfully");
			onClose();
		} catch (_err) {
			error("Signed out (offline mode)");
			setSession(null);
			onClose();
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteAccount = () => {
		setConfirmState({
			title: "Clear Data & Logout?",
			message: "DANGER: This will permanently delete ALL your habits, logs, and notes locally. If synced, they remain on the server.",
			isDestructive: true,
			action: async () => {
				try {
					setLoading(true);
					await HabitService.deleteAllHabits();
					await supabase.auth.signOut();
					success("Account reset complete.");
					onClose();
				} catch (err) {
					console.error(err);
					error("Failed to delete account data");
				} finally {
					setLoading(false);
				}
			},
		});
	};

	const handleEmergencyReset = () => {
		setConfirmState({
			title: "Emergency Reset?",
			message: "Fix Corruption: This will forcibly delete your local database and reload the app. Unsynced changes will be lost.",
			isDestructive: true,
			action: async () => {
				await clear();
				const { db } = await import("../../backbone/lib/db");
				await db.delete();
				localStorage.clear();
				window.location.reload();
			},
		});
	};

	return (
		<>
			<Dialog open={true} onOpenChange={(_, data) => !data.open && onClose()}>
				<DialogSurface className={styles.dialogSurface}>
					<DialogBody>
						<div className={styles.header}>
							<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
								<Avatar name={email} color="brand" size={40} />
								<div>
									<Text weight="bold" block>Profile</Text>
									<Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>{email}</Text>
								</div>
							</div>
							<Button appearance="subtle" icon={<Dismiss24Regular />} aria-label="Close" onClick={onClose} />
						</div>

						<DialogContent>
							<div className={styles.section}>
								<Label weight="semibold">Appearance</Label>
								<div className={styles.themeSelector}>
									{(["light", "dark", "system"] as const).map((t) => (
										<Button
											key={t}
											appearance={theme === t ? "primary" : "subtle"}
											onClick={() => setTheme(t)}
											icon={t === "light" ? <WeatherSunny24Regular /> : t === "dark" ? <WeatherMoon24Regular /> : <Desktop24Regular />}
										>
											{t.charAt(0).toUpperCase() + t.slice(1)}
										</Button>
									))}
								</div>
							</div>

							<Divider style={{ marginBottom: '24px' }} />

							<div className={styles.section}>
								<Button
									className={styles.actionButton}
									appearance="subtle"
									icon={<SignOut24Regular />}
									onClick={handleSignOut}
									disabled={loading}
								>
									Sign Out
								</Button>
								<Button
									className={styles.actionButton}
									appearance="subtle"
									icon={<Delete24Regular />}
									onClick={handleDeleteAccount}
									disabled={loading}
									style={{ color: tokens.colorPaletteRedForeground1 }}
								>
									Clear Data & Logout
								</Button>
								<Button
									className={styles.actionButton}
									appearance="subtle"
									icon={<ArrowCounterclockwise24Regular />}
									onClick={handleEmergencyReset}
									disabled={loading}
									style={{ color: tokens.colorNeutralForeground3, fontSize: '12px' }}
								>
									Emergency Database Reset
								</Button>
							</div>
						</DialogContent>
					</DialogBody>
				</DialogSurface>
			</Dialog>

			{confirmState && (
				<ConfirmDialog
					open={!!confirmState}
					title={confirmState.title}
					message={confirmState.message}
					onConfirm={async () => {
						await confirmState.action();
						setConfirmState(null); // Close after action
					}}
					onCancel={() => setConfirmState(null)}
					isDestructive={confirmState.isDestructive}
				/>
			)}
		</>
	);
}
