import { Spinner, makeStyles, tokens } from "@fluentui/react-components";

const useStyles = makeStyles({
	root: {
		position: "absolute",
		inset: 0,
		zIndex: 50,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: tokens.colorBackgroundOverlay,
		backdropFilter: "blur(4px)",
		borderRadius: tokens.borderRadiusLarge
	}
});

interface LoadingOverlayProps {
	message?: string;
}

export function LoadingOverlay({
	message = "Loading...",
}: LoadingOverlayProps) {
	const styles = useStyles();
	return (
		<div className={styles.root}>
			<Spinner label={message} size="large" />
		</div>
	);
}
