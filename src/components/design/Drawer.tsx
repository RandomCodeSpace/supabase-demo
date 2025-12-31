import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { useEffect } from "react";
import clsx from "clsx";

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    className?: string; // Allow overrides
}

export function Drawer({ isOpen, onClose, title, children, className, noScroll }: DrawerProps & { noScroll?: boolean }) {
    const dragControls = useDragControls();

    // Close on Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 touch-none"
                    />

                    {/* Drawer Panel */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        drag="y"
                        dragControls={dragControls}
                        dragListener={false}
                        dragConstraints={{ top: 0 }}
                        dragElastic={{ top: 0, bottom: 0.5 }}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100 || info.velocity.y > 500) {
                                onClose();
                            }
                        }}
                        className={clsx(
                            "fixed bottom-0 left-0 right-0 z-[51] bg-[var(--bg-surface)] rounded-t-3xl border-t border-white/10 flex flex-col max-h-[92dvh] shadow-2xl touch-action-none",
                            className
                        )}
                        style={{ touchAction: "none" }}
                    >
                        {/* Handle Bar (for visual grasp) */}
                        <div
                            className="w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing touch-none"
                            onPointerDown={(e) => dragControls.start(e)}
                        >
                            <div className="w-12 h-1.5 bg-white/20 rounded-full" />
                        </div>

                        {/* Header */}
                        {title && (
                            <div
                                className="px-6 py-4 border-b border-white/5 flex-none cursor-grab active:cursor-grabbing touch-none"
                                onPointerDown={(e) => dragControls.start(e)}
                            >
                                <h2 className="text-xl font-bold">{title}</h2>
                            </div>
                        )}

                        {/* Content */}
                        <div className={clsx(
                            "flex-1 flex flex-col min-h-0",
                            !noScroll && "overflow-y-auto p-6 no-scrollbar",
                            noScroll && "p-0" // remove padding if custom layout
                        )}>
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
