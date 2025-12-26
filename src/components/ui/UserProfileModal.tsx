import { motion } from "framer-motion";
import { LogOut, Trash2, User, X } from "lucide-react";
import { useState } from "react";
import { useToast } from "../../context/ToastContext";
import { supabase } from "../../lib/supabase";
import { HabitService } from "../../services/habitService";

interface UserProfileModalProps {
	email?: string;
	onClose: () => void;
}

export function UserProfileModal({ email, onClose }: UserProfileModalProps) {
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
				className="w-full max-w-sm bg-zen-surface border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative"
			>
				{/* Header */}
				<div className="p-6 border-b border-white/5 bg-zen-surface flex justify-between items-center">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-white/5 rounded-full">
							<User size={20} className="text-zen-primary" />
						</div>
						<div>
							<h2 className="text-lg font-bold text-white">Profile</h2>
							<p className="text-xs text-zen-text-muted">{email}</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
					>
						<X size={20} />
					</button>
				</div>

				{/* Actions */}
				<div className="p-6 space-y-4">
					<button
						onClick={handleSignOut}
						disabled={loading}
						className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group"
					>
						<span className="text-white font-medium">Sign Out</span>
						<LogOut
							size={18}
							className="text-zen-text-muted group-hover:text-white transition-colors"
						/>
					</button>

					<div className="pt-4 border-t border-white/5">
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
