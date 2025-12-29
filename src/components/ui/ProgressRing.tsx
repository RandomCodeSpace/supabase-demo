import { motion } from "framer-motion";
import {
	makeStyles,
	tokens,
	Text
} from "@fluentui/react-components";

const useStyles = makeStyles({
	root: {
		position: "relative",
		display: "flex",
		alignItems: "center",
		justifyContent: "center"
	},
	label: {
		position: "absolute",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		zIndex: 30
	},
	track: {
		color: tokens.colorNeutralStroke1 // or transparent
	}
});

interface ProgressRingProps {
	percentage: number; // 0-100
	size?: number;
	strokeWidth?: number;
	color?: string; // Hex color for SVG gradient support or Token?
	// Fluent Tokens are variables, so we might need to extract value or use currentColor
}

export function ProgressRing({
	percentage,
	size = 120,
	strokeWidth = 8,
	color = "#4ade80", // Keep default hex for SVG gradient
}: ProgressRingProps) {
	const styles = useStyles();
	const radius = (size - strokeWidth) / 2;
	const circumference = radius * 2 * Math.PI;
	const offset = circumference - (percentage / 100) * circumference;

	return (
		<div
			className={styles.root}
			style={{ width: size, height: size }}
		>
			<div style={{ position: 'relative', zIndex: 10 }}>
				{/* Outer Glow */}
				<div
					style={{
						position: 'absolute',
						inset: 0,
						borderRadius: '9999px',
						filter: 'blur(24px)',
						opacity: 0.2,
						backgroundColor: color
					}}
				/>
				<svg
					width={size}
					height={size}
					style={{ transform: 'rotate(-90deg)', filter: 'drop-shadow(0 20px 13px rgba(0, 0, 0, 0.1))' }}
					aria-label="Daily Progress"
				>
					<defs>
						<linearGradient id="liquidGradient" x1="0%" y1="0%" x2="100%" y2="0%">
							<stop offset="0%" stopColor={color} stopOpacity="0.5" />
							<stop offset="50%" stopColor={color} stopOpacity="1" />
							<stop offset="100%" stopColor={color} stopOpacity="0.8" />
						</linearGradient>

						<linearGradient id="trackGradient" x1="0%" y1="100%" x2="100%" y2="0%">
							<stop offset="0%" stopColor="currentColor" stopOpacity="0.05" />
							<stop offset="50%" stopColor="currentColor" stopOpacity="0.1" />
							<stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
						</linearGradient>

						<filter id="glassGlow" x="-20%" y="-20%" width="140%" height="140%">
							<feGaussianBlur stdDeviation="2" result="blur" />
							<feComposite in="SourceGraphic" in2="blur" operator="over" />
						</filter>
					</defs>

					{/* Track */}
					<circle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						stroke="url(#trackGradient)"
						strokeWidth={strokeWidth}
						fill="transparent"
						className={styles.track}
					/>

					{/* Progress */}
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
			<div className={styles.label}>
				<Text size={700} weight="bold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
					{Math.round(percentage)}%
				</Text>
			</div>
		</div>
	);
}
