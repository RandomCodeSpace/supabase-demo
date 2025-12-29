import { createContext, type ReactNode, useContext } from "react";
import {
	useToastController,
	Toast,
	ToastTitle,
	ToastBody,
	Toaster,
	ToastTrigger,
	Link
} from "@fluentui/react-components";

interface ToastContextType {
	success: (message: string) => void;
	error: (message: string) => void;
	confirm: (message: string, onConfirm: () => void) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
	const toasterId = "default-toaster";
	const { dispatchToast } = useToastController(toasterId);

	const success = (message: string) => {
		dispatchToast(
			<Toast>
				<ToastTitle>Success</ToastTitle>
				<ToastBody>{message}</ToastBody>
			</Toast>,
			{ intent: "success" }
		);
	};

	const error = (message: string) => {
		dispatchToast(
			<Toast>
				<ToastTitle>Error</ToastTitle>
				<ToastBody>{message}</ToastBody>
			</Toast>,
			{ intent: "error" }
		);
	};

	const confirm = (message: string, onConfirm: () => void) => {
		dispatchToast(
			<Toast>
				<ToastTitle>Confirmation Required</ToastTitle>
				<ToastBody>
					{message}
					<div style={{ marginTop: '8px' }}>
						<ToastTrigger>
							<Link onClick={onConfirm}>Confirm</Link>
						</ToastTrigger>
					</div>
				</ToastBody>
			</Toast>,
			{ intent: "info", timeout: -1 }
		);
	};

	return (
		<ToastContext.Provider value={{ success, error, confirm }}>
			<Toaster toasterId={toasterId} />
			{children}
		</ToastContext.Provider>
	);
}

export function useToast() {
	const context = useContext(ToastContext);
	if (context === undefined) {
		throw new Error("useToast must be used within a ToastProvider");
	}
	return context;
}
