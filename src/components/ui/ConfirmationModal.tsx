import {
	Dialog,
	DialogSurface,
	DialogBody,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	makeStyles,
	tokens,
	Text
} from "@fluentui/react-components";
import { Alert24Regular } from "@fluentui/react-icons";

const useStyles = makeStyles({
	iconContainer: {
		display: "flex",
		justifyContent: "center",
		marginBottom: "16px",
		color: tokens.colorPaletteRedForeground1
	}
});

interface ConfirmationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
}

export function ConfirmationModal({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
}: ConfirmationModalProps) {
	const styles = useStyles();
	return (
		<Dialog open={isOpen} onOpenChange={(_, data) => !data.open && onClose()}>
			<DialogSurface>
				<DialogBody>
					<DialogTitle>{title}</DialogTitle>
					<DialogContent>
						<div className={styles.iconContainer}>
							<Alert24Regular style={{ fontSize: 40 }} />
						</div>
						<Text align="center">{message}</Text>
					</DialogContent>
					<DialogActions>
						<Button appearance="secondary" onClick={onClose}>Cancel</Button>
						<Button
							appearance="primary"
							onClick={() => { onConfirm(); onClose(); }}
							style={{ backgroundColor: tokens.colorPaletteRedBackground3 }}
						>
							Delete
						</Button>
					</DialogActions>
				</DialogBody>
			</DialogSurface>
		</Dialog>
	);
}
