import { motion, useAnimation, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { Trash2, CheckCircle2 } from "lucide-react";

interface SwipeableItemProps {
    children: React.ReactNode;
    onDelete: () => void;
    onComplete?: () => void;
    confirmMessage?: string;
}

export function SwipeableItem({ children, onDelete, onComplete }: SwipeableItemProps) {
    const controls = useAnimation();
    const x = useMotionValue(0);

    // Background Opacity/Color Logic
    // Left Drag (x < 0): Red/Delete
    // Right Drag (x > 0): Green/Complete

    // We can map x to reveal one or the other.
    // If x < 0, show Delete icon (right aligned in background).
    // If x > 0, show Complete icon (left aligned in background).

    const deleteOpacity = useTransform(x, [-100, 0], [1, 0]);
    const completeOpacity = useTransform(x, [0, 100], [0, 1]);

    const handleDragEnd = async (_: any, info: PanInfo) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;

        if (offset < -100 || velocity < -500) {
            // Swiped Left -> Delete
            await controls.start({ x: -100, transition: { type: "spring", stiffness: 400, damping: 25 } });
            onDelete();
        } else if (onComplete && (offset > 100 || velocity > 500)) {
            // Swiped Right -> Complete
            // Animate further right then snap back
            await controls.start({ x: 100, transition: { type: "spring", stiffness: 400, damping: 25 } });
            onComplete();
            // Auto snap back after short delay for feedback
            setTimeout(() => {
                controls.start({ x: 0 });
            }, 300);
        } else {
            controls.start({ x: 0, opacity: 1 });
        }
    };

    return (
        <div className="relative w-full overflow-hidden mb-3 rounded-xl touch-pan-y">
            {/* Delete Background (Red, Right Side) */}
            <motion.div
                style={{ opacity: deleteOpacity }}
                className="absolute inset-0 bg-[var(--color-error)]/20 rounded-xl flex items-center justify-end pr-6 pointer-events-none"
            >
                <Trash2 className="text-[var(--color-error)]" />
            </motion.div>

            {/* Complete Background (Green, Left Side) */}
            {onComplete && (
                <motion.div
                    style={{ opacity: completeOpacity }}
                    className="absolute inset-0 bg-[var(--color-success)]/20 rounded-xl flex items-center justify-start pl-6 pointer-events-none"
                >
                    <CheckCircle2 className="text-[var(--color-success)]" />
                </motion.div>
            )}

            {/* Foreground Content */}
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.5} // Allow elastic drag both ways
                onDragEnd={handleDragEnd}
                animate={controls}
                style={{ x }}
                className="relative bg-[var(--bg-deep)] rounded-xl z-10"
            >
                {children}
            </motion.div>
        </div>
    );
}
