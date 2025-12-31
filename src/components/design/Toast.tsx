import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, AlertTriangle, AlertCircle, Undo2 } from "lucide-react";
import { useEffect } from "react";
import { NeonButton } from "./NeonButton";
import clsx from "clsx";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastAction {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

export interface ToastMessage {
    id: string;
    type: ToastType;
    title?: string;
    message: string;
    duration?: number;
    action?: ToastAction;
}

export function ToastItem({
    toast,
    onDismiss
}: {
    toast: ToastMessage;
    onDismiss: (id: string) => void;
}) {
    useEffect(() => {
        if (toast.duration !== Infinity) {
            const timer = setTimeout(() => {
                onDismiss(toast.id);
            }, toast.duration || 4000);
            return () => clearTimeout(timer);
        }
    }, [toast, onDismiss]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={clsx(
                "pointer-events-auto flex items-start w-full max-w-sm rounded-xl p-4 shadow-2xl border backdrop-blur-md",
                toast.type === "success" && "bg-[var(--bg-surface)] border-[var(--color-success)]/30 text-[var(--color-success)]",
                toast.type === "error" && "bg-[var(--bg-surface)] border-[var(--color-error)]/30 text-[var(--color-error)]",
                toast.type === "warning" && "bg-[var(--bg-surface)] border-yellow-500/30 text-yellow-500",
                toast.type === "info" && "bg-[var(--bg-surface)] border-[var(--color-primary)]/30 text-[var(--color-primary)]"
            )}
        >
            <div className="flex-shrink-0 pt-0.5">
                {toast.type === "success" && <CheckCircle size={20} />}
                {toast.type === "error" && <AlertCircle size={20} />}
                {toast.type === "warning" && <AlertTriangle size={20} />}
                {toast.type === "info" && (toast.action?.label === "Undo" ? <Undo2 size={20} /> : <AlertCircle size={20} />)}
            </div>

            <div className="ml-3 flex-1">
                {toast.title && <h3 className="text-sm font-semibold">{toast.title}</h3>}
                <p className="text-sm text-[var(--text-primary)] leading-tight mt-0.5">{toast.message}</p>

                {toast.action && (
                    <div className="mt-3">
                        <NeonButton
                            variant={toast.action.variant || "ghost"}

                            onClick={() => {
                                toast.action!.onClick();
                                onDismiss(toast.id);
                            }}
                            className="!py-1 !px-3 !h-auto !text-xs"
                        >
                            {toast.action.label}
                        </NeonButton>
                    </div>
                )}
            </div>

            <button
                onClick={() => onDismiss(toast.id)}
                className="ml-4 flex-shrink-0 text-[var(--text-tertiary)] hover:text-white transition-colors"
            >
                <X size={16} />
            </button>
        </motion.div>
    );
}

export function ToastContainer({ toasts, removeToast }: { toasts: ToastMessage[]; removeToast: (id: string) => void }) {
    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 w-full px-4 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
                ))}
            </AnimatePresence>
        </div>
    );
}
