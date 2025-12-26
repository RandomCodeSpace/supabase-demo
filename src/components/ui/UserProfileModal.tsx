import { motion } from "framer-motion";
import { LogOut, Monitor, Moon, Sun, Trash2, User, X } from "lucide-react";
import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { supabase } from "../../lib/supabase";
import { HabitService } from "../../services/habitService";

interface UserProfileModalProps {
	email?: string;
	onClose: () => void;
}

export function UserProfileModal({ email, onClose }: UserProfileModalProps) {
	const { theme, setTheme } = useTheme();
	const [loading, setLoading] = useState(false);
	const { success, error } = useToast();

	const handleSignOut = async () => {
		try {
			setLoading(true);
			await supabase.auth.signOut();
			success("Signed out successfully");
			onClose();
		} catch (_err) {
			error("Failed to sign out");
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteAccount = async () => {
		const confirmed = window.confirm(
			"DANGER: This will permanently delete ALL your habits, logs, and notes. This cannot be undone. Are you sure?",
		);
		if (!confirmed) return;

		try {
			setLoading(true);
			// 1. Delete all user data (Cascading delete from habits)
			await HabitService.deleteAllHabits();
			// 2. Sign out
			await supabase.auth.signOut();
			success("Account reset complete. All data deleted.");
			onClose();
		} catch (err) {
			console.error(err);
			error("Failed to delete account data");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
			<motion.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.9 }}
				className="w-full max-w-sm bg-zen-surface border border-black/20 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl relative"
			>
				{/* Header */}
				<div className="p-6 border-b border-black/10 dark:border-white/5 bg-zen-surface flex justify-between items-center">
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
						className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
					>
						<X size={20} />
					</button>
				</div>

				{/* Actions */}
				<div className="p-6 space-y-4">
					<div>
						<label className="block text-xs font-semibold text-zen-text-muted uppercase tracking-wider mb-2">
							Appearance
						</label>
						<div className="grid grid-cols-3 gap-2 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
							{(["light", "dark", "system"] as const).map((t) => (
								<button
									key={t}
									onClick={() => setTheme(t)}
									className={`
                                        flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all
                                        ${theme === t
											? "bg-white text-black shadow-sm"
											: "text-zen-text-muted hover:text-zen-text"
										}
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
						onClick={handleSignOut}
						disabled={loading}
						className="w-full flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-2xl transition-all group"
					>
						<span className="text-zen-text font-medium">Sign Out</span>
						<LogOut
							size={18}
							className="text-zen-text-muted group-hover:text-zen-text transition-colors"
						/>
					</button>

					<div className="pt-4 border-t border-black/5 dark:border-white/5">
						<button
							onClick={handleDeleteAccount}
							disabled={loading}
							className="w-full flex items-center justify-between p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-2xl transition-all group"
						>
							<span className="text-red-400 font-medium group-hover:text-red-300">
								Delete Data & Reset
							</span>
							<Trash2
								size={18}
								className="text-red-400 group-hover:text-red-300"
							/>
						</button>
						<p className="text-[10px] text-zen-text-muted mt-2 text-center opacity-70">
							This action strictly deletes your habit data. It does not delete
							your authentication account.
						</p>
					</div>
				</div>
			</motion.div>
		</div>
	);
}
