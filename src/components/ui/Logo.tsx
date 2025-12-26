import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface LogoProps {
	size?: number;
	className?: string;
	animate?: boolean;
}

export function Logo({ size = 40, className, animate = true }: LogoProps) {
	return (
		<div
			className={cn("relative flex items-center justify-center", className)}
			style={{ width: size, height: size }}
		>
			<svg
				viewBox="0 0 100 100"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				className="w-full h-full"
				aria-label="OSSFlow Logo"
			>
				{/* Unique Brush Stroke Enso */}
				<motion.path
					d="M50 15C30 15 15 30 15 50C15 70 30 85 50 85C70 85 85 70 85 50C85 35 75 25 65 20"
					stroke="currentColor"
					strokeWidth="8"
					strokeLinecap="round"
					className="text-zen-primary"
					style={{ filter: "drop-shadow(0 0 4px rgba(74, 222, 128, 0.5))" }}
					initial={animate ? { pathLength: 0, opacity: 0 } : undefined}
					animate={animate ? { pathLength: 1, opacity: 1 } : undefined}
					transition={{ duration: 1.8, ease: "easeInOut" }}
				/>

				{/* Inner Organic Flow Dot */}
				<motion.circle
					cx="50"
					cy="50"
					r="10"
					className="fill-zen-accent"
					initial={animate ? { scale: 0 } : undefined}
					animate={animate ? { scale: 1 } : undefined}
					transition={{ delay: 1, type: "spring", stiffness: 200 }}
				/>
			</svg>
		</div>
	);
}
