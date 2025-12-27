import { motion, useMotionValue, useTransform } from "framer-motion";
import { Check, X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../backbone/lib/utils";

interface SwipeableHabitProps {
	children: ReactNode;
	onComplete: () => void;
	onDelete: () => void;
	isCompleted: boolean;
	color?: string;
}

export function SwipeableHabit({
	children,
	onComplete,
	onDelete,
	isCompleted,
	color = "#4ade80",
}: SwipeableHabitProps) {
	const x = useMotionValue(0);
	const scale = useTransform(x, [-150, 0, 150], [0.9, 1, 0.9]); // Squeeze effect

	// Determine background color based on direction
	const backgroundColor = useTransform(
		x,
		[-150, -10, 10, 150],
		["#ef4444", "transparent", "transparent", color],
	);

	const handleDragEnd = (
		event: any,
		info: { offset: { x: number }; velocity: { x: number } },
	) => {
		event?.stopPropagation?.();
		if (info.offset.x > 100) {
			onComplete();
		} else if (info.offset.x < -100) {
			onDelete();
		}
	};

	return (
		<motion.div
			className="relative w-full mb-4 rounded-2xl overflow-hidden"
			style={{ background: backgroundColor }}
		>
			{/* Icons revealed on swipe */}
			<div className="absolute inset-y-0 left-4 flex items-center justify-start text-white font-bold">
				<Check size={24} />
			</div>
			<div className="absolute inset-y-0 right-4 flex items-center justify-end text-white font-bold">
				<X size={24} />
			</div>

			<motion.div
				// Removing stopPropagation as it blocks standard click events on some mobile browsers/contexts
				// onPointerDown={(e) => e.stopPropagation()}
				// onTouchStart={(e) => e.stopPropagation()}
				drag="x"
				dragConstraints={{ left: 0, right: 0 }}
				dragElastic={0.1} // Resistance
				onDragEnd={handleDragEnd}
				style={{ x, scale }}
				className={cn(
					"relative bg-zen-surface border border-white/10 p-4 rounded-2xl z-10 swipe-prevention",
				)}
			>
				{children}
				{isCompleted && (
					<motion.div
						initial={{ opacity: 0, scale: 0.5 }}
						animate={{ opacity: 1, scale: 1 }}
						className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] rounded-2xl pointer-events-none"
					>
						<Check className="text-white drop-shadow-lg" size={32} />
					</motion.div>
				)}
			</motion.div>
		</motion.div>
	);
}
