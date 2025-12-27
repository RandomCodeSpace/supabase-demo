import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
}

export function ConfirmationModal({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
}: ConfirmationModalProps) {
	return (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="absolute inset-0 bg-black/60 backdrop-blur-sm"
					/>
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						className="relative w-full max-w-sm"
					>
						<div className="glow-behind bg-red-500/20" />
						<div className="glass-3d rounded-3xl p-6 relative z-10 overflow-hidden">
							<div className="flex flex-col items-center text-center">
								<div className="mb-4 rounded-full bg-red-500/10 p-3 text-red-500">
									<AlertTriangle size={32} />
								</div>
								<h3 className="mb-2 text-xl font-bold text-zen-text">
									{title}
								</h3>
								<p className="mb-6 text-zen-text-muted">{message}</p>
								<div className="flex w-full gap-3">
									<button
										type="button"
										onClick={onClose}
										className="flex-1 rounded-xl bg-black/5 dark:bg-white/5 py-3 font-semibold text-zen-text transition-colors hover:bg-black/10 dark:hover:bg-white/10"
									>
										Cancel
									</button>
									<button
										type="button"
										onClick={() => {
											onConfirm();
											onClose();
										}}
										className="flex-1 rounded-xl bg-red-500 py-3 font-semibold text-white transition-transform active:scale-95 shadow-lg shadow-red-500/20"
									>
										Delete
									</button>
								</div>
							</div>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
