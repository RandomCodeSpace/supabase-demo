import { motion } from "framer-motion";

interface LoadingOverlayProps {
	message?: string;
}

export function LoadingOverlay({ message = "Loading..." }: LoadingOverlayProps) {
	return (
		<div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
			<motion.div
				animate={{ rotate: 360 }}
				transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
				className="w-12 h-12 border-2 border-[var(--color-primary)] border-t-transparent rounded-full"
			/>
			<p className="mt-4 font-mono text-[var(--color-primary)] animate-pulse">
				{message}
			</p>
		</div>
	);
}
