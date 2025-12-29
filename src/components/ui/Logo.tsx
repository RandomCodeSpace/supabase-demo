import { motion } from "framer-motion";
import { cn } from "../../backbone/lib/utils";

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
			<motion.img
				src="/app-icon.ico"
				alt="OSSFlow Logo"
				className="w-full h-full object-contain"
				initial={animate ? { opacity: 0, scale: 0.8 } : undefined}
				animate={animate ? { opacity: 1, scale: 1 } : undefined}
				transition={{ duration: 0.8, ease: "easeOut" }}
			/>
		</div>
	);
}
