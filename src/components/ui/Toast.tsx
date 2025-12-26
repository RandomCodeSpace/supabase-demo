import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import { useEffect } from "react";

export type ToastType = "success" | "error";

export interface ToastProps {
	id: string;
	message: string;
	type: ToastType;
	onClose: (id: string) => void;
}

export function Toast({ id, message, type, onClose }: ToastProps) {
	useEffect(() => {
		const timer = setTimeout(() => {
			onClose(id);
		}, 3000);

		return () => clearTimeout(timer);
	}, [id, onClose]);

	return (
		<motion.div
			initial={{ opacity: 0, y: 50, scale: 0.9 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
			layout
			className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md bg-zen-surface/90 border border-white/10 min-w-[300px]"
		>
			<div
				className={`p-2 rounded-full ${
					type === "success" ? "bg-green-500/10" : "bg-red-500/10"
				}`}
			>
				{type === "success" ? (
					<CheckCircle className="w-5 h-5 text-green-500" />
				) : (
					<XCircle className="w-5 h-5 text-red-500" />
				)}
			</div>
			<p className="text-sm font-medium text-white">{message}</p>
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
		<div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center pointer-events-none p-4 space-y-2">
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
