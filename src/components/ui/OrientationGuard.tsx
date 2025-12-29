import { makeStyles, tokens, Text } from "@fluentui/react-components";
import { PhoneDesktop24Regular } from "@fluentui/react-icons";
import { useEffect, useState } from "react";

const useStyles = makeStyles({
	root: {
		position: "fixed",
		inset: 0,
		zIndex: 60,
		backgroundColor: tokens.colorNeutralBackground1, // Opaque to hide app
		display: "flex", // Centered content
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		padding: "32px",
		textAlign: "center"
	},
	icon: {
		fontSize: "64px",
		marginBottom: "32px",
		color: tokens.colorBrandForeground1,
		animationName: {
			from: { transform: "rotate(0deg)" },
			to: { transform: "rotate(90deg)" }
		},
		animationDuration: "3s",
		animationIterationCount: "infinite",
		animationTimingFunction: "ease-in-out",
		animationDirection: "alternate"
	},
	title: {
		marginBottom: "16px"
	},
	description: {
		maxWidth: "320px",
		color: tokens.colorNeutralForeground3
	}
});

export function OrientationGuard() {
	const styles = useStyles();
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const checkOrientation = () => {
			const isLandscape = window.matchMedia("(orientation: landscape)").matches;
			const isMobileWidth = window.matchMedia("(max-width: 1024px)").matches;
			const isMobileHeight = window.matchMedia("(max-height: 500px)").matches;

			setIsVisible(isLandscape && (isMobileWidth || isMobileHeight));
		};

		checkOrientation();
		window.addEventListener("resize", checkOrientation);
		return () => window.removeEventListener("resize", checkOrientation);
	}, []);

	if (!isVisible) return null;

	return (
		<div className={styles.root}>
			<PhoneDesktop24Regular className={styles.icon} />
			<Text size={600} weight="bold" className={styles.title} block>
				Please Rotate Your Device
			</Text>
			<Text className={styles.description}>
				This application is designed for portrait mode to give you the best focused experience.
			</Text>
		</div>
	);
}
