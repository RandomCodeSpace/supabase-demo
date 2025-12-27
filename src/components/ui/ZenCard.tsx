import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface ZenCardProps {
	children: ReactNode;
	className?: string;
	onClick?: () => void;
}

export function ZenCard({ children, className, onClick }: ZenCardProps) {
	return (
		<motion.div
			whileHover={{ scale: 1.05, y: -5 }}
			whileTap={{ scale: 0.98 }}
			className={cn(
				"glass-3d rounded-2xl p-6 relative overflow-hidden group",
				"bg-gradient-to-br from-white/10 to-transparent dark:from-white/5 dark:to-transparent",
				className,
			)}
			onClick={onClick}
		>
			{/* Inner Glow */}
			<div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
			{children}
		</motion.div>
	);
}
