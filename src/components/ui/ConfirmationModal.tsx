import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { NeonButton } from "../design/NeonButton";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";

interface ConfirmationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	requiresCheckbox?: boolean;
	checkboxLabel?: string;
}

export function ConfirmationModal({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	requiresCheckbox,
	checkboxLabel
}: ConfirmationModalProps) {
	const [isChecked, setIsChecked] = useState(false);

	// Reset check state when opening
	useEffect(() => {
		if (isOpen) setIsChecked(false);
	}, [isOpen]);

	return createPortal(
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="absolute inset-0 bg-black/80 backdrop-blur-sm"
					/>
					<motion.div
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.9, opacity: 0 }}
						className="relative bg-[var(--bg-surface)] border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl"
					>
						<div className="flex flex-col items-center text-center gap-4">
							<div className="p-4 bg-[var(--color-error)]/10 rounded-full text-[var(--color-error)]">
								<AlertTriangle size={32} />
							</div>

							<div>
								<h3 className="text-xl font-bold mb-2">{title}</h3>
								<p className="text-[var(--text-secondary)]">{message}</p>
							</div>

							{requiresCheckbox && (
								<label className="flex items-center gap-3 bg-white/5 p-3 rounded-xl w-full cursor-pointer border border-white/5 hover:border-white/20 transition-colors text-left">
									<input
										type="checkbox"
										checked={isChecked}
										onChange={(e) => setIsChecked(e.target.checked)}
										className="w-5 h-5 rounded border-gray-500 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
									/>
									<span className="text-sm text-[var(--text-primary)] font-medium select-none">
										{checkboxLabel || "I understand the consequences"}
									</span>
								</label>
							)}

							<div className="flex gap-3 w-full mt-2">
								<NeonButton
									variant="ghost"
									onClick={onClose}
									className="flex-1"
								>
									Cancel
								</NeonButton>
								<NeonButton
									variant="danger"
									onClick={() => { onConfirm(); onClose(); }}
									disabled={requiresCheckbox && !isChecked}
									className="flex-1"
								>
									Confirm
								</NeonButton>
							</div>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>,
		document.body
	);
}
