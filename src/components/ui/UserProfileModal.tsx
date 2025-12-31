import { LogOut, Trash2, Sun, Moon, Laptop, RotateCcw } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { clear, del } from "idb-keyval";
import { supabase } from "../../backbone/lib/supabase";
import { HabitService } from "../../backbone/services/habitService";
import { useToast } from "../../context/ToastContext";
import { useAuthStore } from "../../stores/useAuthStore";
import { Drawer } from "../design/Drawer";
import { NeonButton } from "../design/NeonButton";
import { ConfirmationModal } from "./ConfirmationModal";
import clsx from "clsx";

interface UserProfileModalProps {
	email?: string;
	onClose: () => void;
}

export function UserProfileModal({ email, onClose }: UserProfileModalProps) {
	const { theme, setTheme } = useTheme();
	const [loading, setLoading] = useState(false);
	const { success, error } = useToast();
	const { setSession } = useAuthStore();

	// Critical Action State
	const [confirmAction, setConfirmAction] = useState<{
		type: 'delete_account' | 'emergency_reset';
		isOpen: boolean;
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

	const executeDeleteAccount = async () => {
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
	};

	const executeEmergencyReset = async () => {
		await clear();
		const { db } = await import("../../backbone/lib/db");
		await db.delete();
		localStorage.clear();
		window.location.reload();
	};

	return (
		<Drawer
			isOpen={true}
			onClose={onClose}
			title="Profile"
		>
			<div className="flex flex-col gap-8 pb-8">
				{/* User Info */}
				<div className="bg-white/5 p-4 rounded-2xl flex items-center gap-4">
					<div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-black font-bold text-xl">
						{email?.[0].toUpperCase()}
					</div>
					<div>
						<p className="font-semibold text-lg">{email}</p>
						<p className="text-sm text-[var(--text-secondary)]">Signed In</p>
					</div>
				</div>

				{/* Appearance */}
				<div>
					<h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3 uppercase tracking-wider">Appearance</h3>
					<div className="grid grid-cols-3 gap-3 bg-white/5 p-2 rounded-2xl">
						{(["light", "dark", "system"] as const).map((t) => (
							<button
								key={t}
								onClick={() => setTheme(t)}
								className={clsx(
									"flex flex-col items-center gap-2 py-3 rounded-xl transition-all",
									theme === t ? "bg-white/10 text-white shadow-lg" : "text-[var(--text-secondary)] hover:bg-white/5"
								)}
							>
								{t === "light" && <Sun size={20} />}
								{t === "dark" && <Moon size={20} />}
								{t === "system" && <Laptop size={20} />}
								<span className="text-xs font-medium capitalize">{t}</span>
							</button>
						))}
					</div>
				</div>

				{/* Danger Zone */}
				<div>
					<h3 className="text-sm font-semibold text-[var(--color-error)] mb-3 uppercase tracking-wider">Danger Zone</h3>
					<div className="flex flex-col gap-3">
						<NeonButton
							variant="secondary"
							onClick={handleSignOut}
							disabled={loading}
							className="!justify-start !bg-white/5 !text-white hover:!bg-white/10"
							icon={<LogOut size={18} />}
						>
							Sign Out
						</NeonButton>

						<NeonButton
							variant="danger"
							onClick={() => setConfirmAction({ type: 'delete_account', isOpen: true })}
							disabled={loading}
							className="!justify-start"
							icon={<Trash2 size={18} />}
						>
							Clear Data & Logout
						</NeonButton>

						<button
							onClick={() => setConfirmAction({ type: 'emergency_reset', isOpen: true })}
							className="mt-4 flex items-center gap-2 text-xs text-[var(--text-tertiary)] hover:text-white transition-colors px-4 py-2"
						>
							<RotateCcw size={14} />
							Emergency Database Reset
						</button>
					</div>
				</div>
			</div>

			{/* Confirmation Modals */}
			{confirmAction?.type === 'delete_account' && (
				<ConfirmationModal
					isOpen={confirmAction.isOpen}
					onClose={() => setConfirmAction(null)}
					onConfirm={executeDeleteAccount}
					title="Delete Account?"
					message="This will permanently delete ALL your local habits and history. This action cannot be undone."
					requiresCheckbox
					checkboxLabel="I understand that all data will be lost."
				/>
			)}

			{confirmAction?.type === 'emergency_reset' && (
				<ConfirmationModal
					isOpen={confirmAction.isOpen}
					onClose={() => setConfirmAction(null)}
					onConfirm={executeEmergencyReset}
					title="Emergency Reset?"
					message="This is a nuclear option. It will wipe the entire local database and reload the app. Use only if the app is broken."
					requiresCheckbox
					checkboxLabel="Yes, wipe everything and reload."
				/>
			)}
		</Drawer>
	);
}
