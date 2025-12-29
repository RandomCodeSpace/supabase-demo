import { Component, type ErrorInfo, type ReactNode } from "react";
import {
	Button,
	Text,
	tokens,
	Card,
} from "@fluentui/react-components";
import { Alert24Regular, ArrowClockwise24Regular } from "@fluentui/react-icons";

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

// Cannot use hooks in class components, so we define styles outside or use inline.
// Griffel works outside components too? 'makeStyles' returns a hook.
// We can make a functional wrapper or just style via inline/style block for this critical error screen.
// Or just use FluentProvider? It's wrapped outside? No, ErrorBoundary is usually inside main.tsx?
// In main.tsx: <FluentRoot><GlobalErrorBoundary>...
// So we have Fluent context.
// But we can't use 'useStyles' inside class component.
// We'll use inline styles with tokens for simplicity in this crash handler.

const containerStyle: React.CSSProperties = {
	minHeight: "100vh",
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	justifyContent: "center",
	padding: "24px",
	backgroundColor: tokens.colorNeutralBackground2,
	textAlign: "center"
};

export class GlobalErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
		error: null,
	};

	public static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("Uncaught error:", error, errorInfo);
	}

	public render() {
		if (this.state.hasError) {
			return (
				<div style={containerStyle}>
					<Card style={{ padding: '32px', maxWidth: '480px', alignItems: 'center', gap: '16px' }}>
						<div style={{
							padding: '16px',
							borderRadius: '50%',
							backgroundColor: tokens.colorPaletteRedBackground1,
							color: tokens.colorPaletteRedForeground1
						}}>
							<Alert24Regular style={{ fontSize: 32 }} />
						</div>
						<Text size={600} weight="bold">Something went wrong</Text>
						<Text style={{ color: tokens.colorNeutralForeground3 }}>
							The application encountered an unexpected error.
						</Text>

						{this.state.error && (
							<div style={{
								padding: '12px',
								backgroundColor: tokens.colorNeutralBackground3,
								borderRadius: tokens.borderRadiusMedium,
								fontFamily: 'monospace',
								fontSize: '12px',
								textAlign: 'left',
								overflow: 'auto',
								maxHeight: '120px',
								width: '100%'
							}}>
								{this.state.error.toString()}
							</div>
						)}

						<Button
							appearance="primary"
							icon={<ArrowClockwise24Regular />}
							onClick={() => window.location.reload()}
							size="large"
						>
							Reload Application
						</Button>
					</Card>
				</div>
			);
		}

		return this.props.children;
	}
}
