import { motion } from "framer-motion";
import { LogOut, Monitor, Moon, Sun, Trash2, User, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useToast } from "../../context/ToastContext";
import { supabase } from "../../backbone/lib/supabase";
import { HabitService } from "../../backbone/services/habitService";
import { del, clear } from "idb-keyval";
import { useAuthStore } from "../../stores/useAuthStore";

interface UserProfileModalProps {
	email?: string;
	onClose: () => void;
}

export function UserProfileModal({ email, onClose }: UserProfileModalProps) {
	const { theme, setTheme } = useTheme();
	const [loading, setLoading] = useState(false);
	const { success, error } = useToast(); // Removed 'confirm' from useToast
	const { setSession } = useAuthStore();

	// Local state for blocking confirmation modal
	const [confirmation, setConfirmation] = useState<{
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
		// Trigger blocking modal
		setConfirmation({
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
			}
		});
	};

	const handleEmergencyReset = () => {
		setConfirmation({
			title: "Emergency Reset?",
			message: "Fix Corruption: This will forcibly delete your local database and reload the app. Any data ALREADY SYNCED to the server is safe. Only unsynced local changes will be lost.",
			isDestructive: true,
			action: async () => {
				await clear();
				const { db } = await import("../../backbone/lib/db");
				await db.delete();
				localStorage.clear();
				window.location.reload();
			}
		});
	};

	return (
		<div
			role="dialog"
			aria-modal="true"
			className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
		>
			{/* Blocking Confirmation Overlay */}
			{confirmation && (
				<div className="fixed inset-0 z-[101] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="w-full max-w-xs bg-white dark:bg-zen-surface rounded-2xl p-6 shadow-2xl border border-red-500/20"
					>
						<h3 className="text-lg font-bold text-red-500 mb-2">{confirmation.title}</h3>
						<p className="text-sm text-zen-text-muted mb-6 loading-relaxed">
							{confirmation.message}
						</p>
						<div className="flex gap-3 justify-end">
							<button
								onClick={() => setConfirmation(null)}
								className="px-4 py-2 text-sm font-medium text-zen-text-muted hover:text-zen-text transition-colors"
							>
								Cancel
							</button>
							<button
								onClick={async () => {
									// Execute action and close confirmation (but keep parent loading if needed)
									// For now, we assume action handles its own loading or simple execution
									await confirmation.action();
									setConfirmation(null);
								}}
								className="px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-lg active:scale-95 transition-all"
							>
								Confirm
							</button>
						</div>
					</motion.div>
				</div>
			)}

			<motion.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.9 }}
				className="relative w-full max-w-sm max-h-[90vh] flex flex-col"
			>
				<div className="glow-behind bg-zen-text/10" />
				<div className="glass-3d rounded-3xl overflow-hidden relative z-10 flex flex-col max-h-full">
					{/* Header */}
					<div className="p-6 border-b border-black/5 dark:border-white/5 flex justify-between items-center shrink-0">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-black/5 dark:bg-white/5 rounded-full">
								<User size={20} className="text-zen-primary" />
							</div>
							<div>
								<h2 className="text-lg font-bold text-zen-text">Profile</h2>
								<p className="text-xs text-zen-text-muted">{email}</p>
							</div>
						</div>
						<button
							onClick={onClose}
							disabled={!!confirmation} // Disable close if confirming
							className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
						>
							<X size={20} />
						</button>
					</div>

					{/* Actions */}
					<div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
						<div>
							<label className="block text-xs font-semibold text-zen-text-muted uppercase tracking-wider mb-2">
								Appearance
							</label>
							<div className="grid grid-cols-3 gap-2 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
								{(["light", "dark", "system"] as const).map((t) => (
									<button
										key={t}
										onClick={() => setTheme(t)}
										disabled={!!confirmation}
										className={`
                                        flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all
                                        ${theme === t
												? "bg-white text-black shadow-sm"
												: "text-zen-text-muted hover:text-zen-text"
											}
                                        disabled:opacity-50
`}
									>
										{t === "light" && <Sun size={14} />}
										{t === "dark" && <Moon size={14} />}
										{t === "system" && <Monitor size={14} />}
										<span className="capitalize">{t}</span>
									</button>
								))}
							</div>
						</div>
						<button
							type="button"
							onClick={handleSignOut}
							disabled={loading || !!confirmation}
							className="w-full flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-2xl transition-all group disabled:opacity-50"
						>
							<span className="text-zen-text font-medium">Sign Out</span>
							<LogOut
								size={18}
								className="text-zen-text-muted group-hover:text-zen-text transition-colors"
							/>
						</button>

						<div className="pt-4 border-t border-black/5 dark:border-white/5 space-y-2">
							<button
								onClick={handleDeleteAccount}
								disabled={loading || !!confirmation}
								className="w-full flex items-center justify-between p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-2xl transition-all group disabled:opacity-50"
							>
								<span className="text-red-400 font-medium group-hover:text-red-300">
									Clear Data & Logout
								</span>
								<Trash2
									size={18}
									className="text-red-400 group-hover:text-red-300"
								/>
							</button>

							{/* Emergency Reset for Corruption */}
							<button
								onClick={handleEmergencyReset}
								disabled={loading || !!confirmation}
								className="w-full text-center text-[10px] text-zen-text-muted hover:text-red-400 transition-colors uppercase tracking-widest opacity-50 hover:opacity-100 disabled:opacity-30"
							>
								Emergency Database Reset
							</button>

							<p className="text-[10px] text-zen-text-muted mt-2 text-center opacity-70">
								Clears local data. Account remains active on server.
							</p>
						</div>
					</div>
				</div>
			</motion.div>
		</div>
	);
}
