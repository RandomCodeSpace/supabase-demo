import { AnimatePresence, motion, useAnimation, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { CheckCircle, AlertTriangle, AlertCircle, Undo2 } from "lucide-react";
import { useEffect } from "react";
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
    // Auto-dismiss logic
    useEffect(() => {
        if (toast.duration !== Infinity) {
            const timer = setTimeout(() => {
                onDismiss(toast.id);
            }, toast.duration || 4000);
            return () => clearTimeout(timer);
        }
    }, [toast, onDismiss]);

    // Swipe Logic
    const controls = useAnimation();
    const x = useMotionValue(0);

    // Scale down slightly when swiping away
    const scale = useTransform(x, [-100, 0, 100], [0.9, 1, 0.9]);
    const opacity = useTransform(x, [-50, 0, 50], [0.5, 1, 0.5]);

    const handleDragEnd = (_: any, info: PanInfo) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;

        if (Math.abs(offset) > 100 || Math.abs(velocity) > 500) {
            // Dismiss
            onDismiss(toast.id);
        } else {
            // Reset
            controls.start({ x: 0 });
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
            style={{ x, scale, opacity }}
            className={clsx(
                "pointer-events-auto flex items-center gap-3 w-auto max-w-[90vw] rounded-full py-3 px-5 shadow-2xl border backdrop-blur-xl touch-none select-none cursor-grab active:cursor-grabbing",
                toast.type === "success" && "bg-black/60 border-[var(--color-success)]/30 text-[var(--color-success)] shadow-[0_0_15px_rgba(10,255,96,0.1)]",
                toast.type === "error" && "bg-black/60 border-[var(--color-error)]/30 text-[var(--color-error)] shadow-[0_0_15px_rgba(255,59,48,0.1)]",
                toast.type === "warning" && "bg-black/60 border-yellow-500/30 text-yellow-500",
                toast.type === "info" && "bg-black/60 border-[var(--color-primary)]/30 text-[var(--color-primary)] shadow-[0_0_15px_rgba(10,132,255,0.1)]"
            )}
        >
            {/* Icon */}
            <div className="flex-shrink-0">
                {toast.type === "success" && <CheckCircle size={18} className="fill-current/10" />}
                {toast.type === "error" && <AlertCircle size={18} className="fill-current/10" />}
                {toast.type === "warning" && <AlertTriangle size={18} className="fill-current/10" />}
                {toast.type === "info" && (toast.action?.label === "Undo" ? <Undo2 size={18} /> : <AlertCircle size={18} className="fill-current/10" />)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 mr-1">
                <div className="flex flex-col">
                    {toast.title && <h3 className="text-xs font-bold uppercase tracking-wider opacity-80 mb-0.5">{toast.title}</h3>}
                    <p className="text-sm font-medium text-[var(--text-primary)] leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                        {toast.message}
                    </p>
                </div>
            </div>

            {/* Action Button (Optional) */}
            {toast.action && (
                <div className="flex-shrink-0 pl-2 border-l border-white/10 ml-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent drag start if possible, though drag is on parent
                            toast.action!.onClick();
                            onDismiss(toast.id);
                        }}
                        className="text-xs font-bold text-white hover:text-[var(--color-primary)] transition-colors px-2 py-1"
                    >
                        {toast.action.label}
                    </button>
                </div>
            )}
        </motion.div>
    );
}

export function ToastContainer({ toasts, removeToast }: { toasts: ToastMessage[]; removeToast: (id: string) => void }) {
    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-3 w-full pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
                ))}
            </AnimatePresence>
        </div>
    );
}
