import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
	message?: string;
}

export function LoadingOverlay({
	message = "Loading...",
}: LoadingOverlayProps) {
	return (
		<div className="absolute inset-0 z-50 flex items-center justify-center bg-zen-bg/50 backdrop-blur-sm rounded-3xl">
			<motion.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				className="flex flex-col items-center gap-3 p-6 bg-zen-surface/90 rounded-2xl shadow-xl border border-black/5 dark:border-white/5"
			>
				<motion.div
					animate={{ rotate: 360 }}
					transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
				>
					<Loader2 className="w-8 h-8 text-zen-primary" />
				</motion.div>
				<p className="text-sm font-medium text-zen-text">{message}</p>
			</motion.div>
		</div>
	);
}
