import { AlertCircle, RefreshCw } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

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
				<div className="min-h-screen flex flex-col items-center justify-center p-6 bg-zen-bg text-zen-text text-center">
					<div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-3xl max-w-md w-full border border-red-100 dark:border-red-900/30">
						<div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
							<AlertCircle size={32} />
						</div>
						<h1 className="text-xl font-bold mb-2">Something went wrong</h1>
						<p className="text-sm text-zen-text-muted mb-6">
							The application encountered an unexpected error.
						</p>

						{this.state.error && (
							<div className="bg-black/5 dark:bg-black/40 p-3 rounded-xl text-xs font-mono text-left overflow-auto max-h-32 mb-6">
								{this.state.error.toString()}
							</div>
						)}

						<button
							onClick={() => window.location.reload()}
							className="w-full py-3 bg-zen-text text-zen-bg rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
						>
							<RefreshCw size={18} />
							Reload Application
						</button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
