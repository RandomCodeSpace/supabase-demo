import { createContext, type ReactNode, useContext, useState } from "react";
import {
	ToastContainer,
	type ToastProps,
	type ToastType,
} from "../components/ui/Toast";

interface ToastContextType {
	success: (message: string) => void;
	error: (message: string) => void;
	confirm: (message: string, onConfirm: () => void) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
	const [toasts, setToasts] = useState<Omit<ToastProps, "onClose">[]>([]);

	const addToast = (message: string, type: ToastType) => {
		const id = Math.random().toString(36).substring(7);
		setToasts((prev) => [...prev, { id, message, type }]);
	};

	const removeToast = (id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	};

	const success = (message: string) => addToast(message, "success");
	const error = (message: string) => addToast(message, "error");
	const confirm = (message: string, onConfirm: () => void) => {
		const id = Math.random().toString(36).substring(7);
		setToasts((prev) => [...prev, { id, message, type: "confirmation", onConfirm }]);
	};

	return (
		<ToastContext.Provider value={{ success, error, confirm }}>
			{children}
			<ToastContainer
				toasts={toasts.map((t) => ({ ...t, onClose: removeToast }))}
				removeToast={removeToast}
			/>
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
