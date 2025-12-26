import { motion } from "framer-motion";

interface ProgressRingProps {
	percentage: number;
	size?: number;
	strokeWidth?: number;
	color?: string;
}

export function ProgressRing({
	percentage,
	size = 120,
	strokeWidth = 8,
	color = "#4ade80",
}: ProgressRingProps) {
	const radius = (size - strokeWidth) / 2;
	const circumference = radius * 2 * Math.PI;
	const offset = circumference - (percentage / 100) * circumference;

	return (
		<div
			className="relative flex items-center justify-center"
			style={{ width: size, height: size }}
		>
			<svg
				width={size}
				height={size}
				className="transform -rotate-90"
				aria-label="Daily Progress"
			>
				{/* Background Ring */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke="currentColor"
					strokeWidth={strokeWidth}
					fill="transparent"
					className="text-white/10"
				/>
				{/* Progress Ring */}
				<motion.circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke={color}
					strokeWidth={strokeWidth}
					fill="transparent"
					strokeCheck="round"
					initial={{ strokeDashoffset: circumference }}
					animate={{ strokeDashoffset: offset }}
					transition={{ duration: 1, ease: "easeOut" }}
					style={{
						strokeDasharray: circumference,
						strokeLinecap: "round",
						filter: `drop-shadow(0 0 4px ${color})`,
					}}
				/>
			</svg>
			<div className="absolute text-2xl font-bold text-white">
				{Math.round(percentage)}%
			</div>
		</div>
	);
}
