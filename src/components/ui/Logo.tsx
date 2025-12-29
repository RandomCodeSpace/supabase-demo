import { motion } from "framer-motion";
import { makeStyles, mergeClasses } from "@fluentui/react-components";

const useStyles = makeStyles({
	root: {
		position: "relative",
		display: "flex",
		alignItems: "center",
		justifyContent: "center"
	},
	img: {
		width: "100%",
		height: "100%",
		objectFit: "contain"
	}
});

interface LogoProps {
	size?: number;
	className?: string; // Standard React className prop
	animate?: boolean;
}

export function Logo({ size = 40, className, animate = true }: LogoProps) {
	const styles = useStyles();
	return (
		<div
			className={mergeClasses(styles.root, className)}
			style={{ width: size, height: size }}
		>
			<motion.img
				src="/app-icon.ico"
				alt="OSSFlow Logo"
				className={styles.img}
				initial={animate ? { opacity: 0, scale: 0.8 } : undefined}
				animate={animate ? { opacity: 1, scale: 1 } : undefined}
				transition={{ duration: 0.8, ease: "easeOut" }}
			/>
		</div>
	);
}
