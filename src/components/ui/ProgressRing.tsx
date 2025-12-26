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
			<div className="relative z-10">
				{/* Outer Glow for Pop */}
				<div
					className="absolute inset-0 rounded-full blur-xl opacity-20"
					style={{ backgroundColor: color }}
				/>
				<svg
					width={size}
					height={size}
					className="transform -rotate-90 relative z-20 drop-shadow-xl"
					aria-label="Daily Progress"
				>
					<defs>
						{/* Progress Liquid Gradient */}
						<linearGradient
							id="liquidGradient"
							x1="0%"
							y1="0%"
							x2="100%"
							y2="0%"
						>
							<stop offset="0%" stopColor={color} stopOpacity="0.5" />
							<stop offset="50%" stopColor={color} stopOpacity="1" />
							<stop offset="100%" stopColor={color} stopOpacity="0.8" />
						</linearGradient>

						{/* Background Glass Track Gradient */}
						<linearGradient
							id="trackGradient"
							x1="0%"
							y1="100%"
							x2="100%"
							y2="0%"
						>
							<stop offset="0%" stopColor="currentColor" stopOpacity="0.05" />
							<stop offset="50%" stopColor="currentColor" stopOpacity="0.1" />
							<stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
						</linearGradient>

						{/* Inner Highlight for Water/Glass Effect */}
						<filter id="glassGlow" x="-20%" y="-20%" width="140%" height="140%">
							<feGaussianBlur stdDeviation="2" result="blur" />
							<feComposite in="SourceGraphic" in2="blur" operator="over" />
						</filter>
					</defs>

					{/* Background Ring (Glassy Track) */}
					<circle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						stroke="url(#trackGradient)"
						strokeWidth={strokeWidth}
						fill="transparent"
						className="text-black dark:text-white"
						style={{
							filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.05))",
						}}
					/>

					{/* Liquid Progress Ring */}
					<motion.circle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						stroke="url(#liquidGradient)"
						strokeWidth={strokeWidth}
						fill="transparent"
						strokeLinecap="round"
						initial={{ strokeDashoffset: circumference }}
						animate={{ strokeDashoffset: offset }}
						transition={{ duration: 1.5, ease: "easeOut" }}
						style={{
							strokeDasharray: circumference,
							filter: "url(#glassGlow)",
						}}
					/>
				</svg>
			</div>
			<div className="absolute flex flex-col items-center justify-center z-30">
				<span className="text-3xl font-bold text-zen-text drop-shadow-sm">
					{Math.round(percentage)}%
				</span>
			</div>
		</div>
	);
}
