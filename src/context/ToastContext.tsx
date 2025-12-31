import { createContext, type ReactNode, useContext, useState, useCallback } from "react";
import { ToastContainer, type ToastMessage, type ToastAction } from "../components/design/Toast";
import { v4 as uuidv4 } from 'uuid';

interface ToastContextType {
	success: (message: string, title?: string) => void;
	error: (message: string, title?: string) => void;
	info: (message: string, title?: string) => void;
	action: (message: string, actionLabel: string, onAction: () => void, variant?: ToastAction['variant']) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
	const [toasts, setToasts] = useState<ToastMessage[]>([]);

	const addToast = useCallback((toast: Omit<ToastMessage, "id">) => {
		const id = uuidv4(); // We need a UUID generator, or just simple math random
		setToasts((prev) => [...prev, { ...toast, id }]);
	}, []);

	const removeToast = useCallback((id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	const success = (message: string, title?: string) => {
		addToast({ type: "success", message, title });
	};

	const error = (message: string, title?: string) => {
		addToast({ type: "error", message, title });
	};

	const info = (message: string, title?: string) => {
		addToast({ type: "info", message, title });
	};

	const action = (message: string, actionLabel: string, onAction: () => void, variant: ToastAction['variant'] = "primary") => {
		addToast({
			type: "info",
			message,
			duration: Infinity, // Wait for interaction
			action: {
				label: actionLabel,
				onClick: onAction,
				variant
			}
		});
	};

	return (
		<ToastContext.Provider value={{ success, error, info, action }}>
			{children}
			<ToastContainer toasts={toasts} removeToast={removeToast} />
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
