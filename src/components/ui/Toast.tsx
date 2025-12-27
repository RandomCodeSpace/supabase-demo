import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Trash2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "confirmation";

export interface ToastProps {
	id: string;
	message: string;
	type: ToastType;
	onClose: (id: string, confirmed?: boolean) => void;
	onConfirm?: () => void;
}

export function Toast({ id, message, type, onClose, onConfirm }: ToastProps) {
	const [isChecked, setIsChecked] = useState(false);

	useEffect(() => {
		if (type === "confirmation") return; // Do not auto-close confirmation toasts

		const timer = setTimeout(() => {
			onClose(id);
		}, 3000);

		return () => clearTimeout(timer);
	}, [id, onClose, type]);

	const handleConfirm = () => {
		if (onConfirm) onConfirm();
		onClose(id, true);
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 50, scale: 0.9 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
			layout
			className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-3 px-4 py-4 rounded-2xl shadow-2xl backdrop-blur-md bg-white/95 dark:bg-zen-surface/95 border border-black/5 dark:border-white/10 min-w-[320px] max-w-[90vw] ${type === "confirmation" ? "items-start" : "flex-row items-center"
				}`}
		>
			<div className="flex items-start gap-3 w-full">
				<div
					className={`p-2 rounded-full shrink-0 ${type === "success"
						? "bg-green-500/10"
						: type === "error"
							? "bg-red-500/10"
							: "bg-amber-500/10"
						}`}
				>
					{type === "success" && <CheckCircle className="w-5 h-5 text-green-500" />}
					{type === "error" && <XCircle className="w-5 h-5 text-red-500" />}
					{type === "confirmation" && (
						<AlertTriangle className="w-5 h-5 text-amber-500" />
					)}
				</div>
				<div className="flex-1">
					<p className="text-sm font-medium text-zen-text leading-tight mt-1">
						{message}
					</p>
				</div>
			</div>

			{type === "confirmation" && (
				<div className="w-full pl-11 pr-2 space-y-3">
					<label className="flex items-start gap-3 cursor-pointer group">
						<div className="relative flex items-center pt-0.5">
							<input
								type="checkbox"
								className="peer sr-only"
								checked={isChecked}
								onChange={(e) => setIsChecked(e.target.checked)}
							/>
							<div className="w-4 h-4 border-2 border-zen-text-muted rounded-md peer-checked:bg-red-500 peer-checked:border-red-500 transition-all" />
							<CheckCircle
								size={10}
								className="absolute top-1 left-[3px] text-white opacity-0 peer-checked:opacity-100 transition-opacity"
							/>
						</div>
						<span className="text-xs text-zen-text-muted group-hover:text-zen-text transition-colors select-none">
							I understand this action is permanent and cannot be undone.
						</span>
					</label>

					<div className="flex gap-2 justify-end pt-1">
						<button
							onClick={() => onClose(id)}
							className="px-3 py-1.5 text-xs font-medium text-zen-text-muted hover:text-zen-text hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors"
						>
							Cancel
						</button>
						<button
							onClick={handleConfirm}
							disabled={!isChecked}
							className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all"
						>
							<Trash2 size={12} />
							Delete Everything
						</button>
					</div>
				</div>
			)}
		</motion.div>
	);
}

export function ToastContainer({
	toasts,
	removeToast,
}: {
	toasts: ToastProps[];
	removeToast: (id: string) => void;
}) {
	return (
		<div className="fixed bottom-0 left-0 right-0 z-[60] flex flex-col items-center pointer-events-none p-4 space-y-2">
			<AnimatePresence>
				{toasts.map((toast) => (
					<div key={toast.id} className="pointer-events-auto">
						<Toast {...toast} onClose={removeToast} />
					</div>
				))}
			</AnimatePresence>
		</div>
	);
}
