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
						className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-zen-card backdrop-blur-xl border border-white/10 p-6 shadow-2xl"
					>
						<div className="flex flex-col items-center text-center">
							<div className="mb-4 rounded-full bg-red-500/10 p-3 text-red-400">
								<AlertTriangle size={32} />
							</div>
							<h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
							<p className="mb-6 text-zen-text-muted">{message}</p>
							<div className="flex w-full gap-3">
								<button
									type="button"
									onClick={onClose}
									className="flex-1 rounded-xl bg-white/5 py-3 font-semibold text-white transition-colors hover:bg-white/10"
								>
									Cancel
								</button>
								<button
									type="button"
									onClick={() => {
										onConfirm();
										onClose();
									}}
									className="flex-1 rounded-xl bg-red-500 py-3 font-semibold text-white transition-transform active:scale-95"
								>
									Delete
								</button>
							</div>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
