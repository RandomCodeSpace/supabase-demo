import { motion, useMotionValue, useTransform } from "framer-motion";
import { Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../backbone/lib/utils";

interface SwipeableWrapperProps {
    children: ReactNode;
    onDelete: () => void;
    className?: string;
}

export function SwipeableWrapper({
    children,
    onDelete,
    className,
}: SwipeableWrapperProps) {
    const x = useMotionValue(0);
    const scale = useTransform(x, [-150, 0], [0.9, 1]); // Squeeze effect on swipe left

    // Background color only for delete (red on left swipe)
    const backgroundColor = useTransform(
        x,
        [-150, -10, 0],
        ["#ef4444", "transparent", "transparent"],
    );

    const handleDragEnd = (
        event: any,
        info: { offset: { x: number }; velocity: { x: number } },
    ) => {
        event?.stopPropagation?.();
        // Only trigger delete on left swipe
        if (info.offset.x < -100) {
            onDelete();
        }
    };

    return (
        <motion.div
            className={cn("relative w-full rounded-3xl overflow-hidden", className)}
            style={{ background: backgroundColor }}
        >
            {/* Delete Icon (Right Side, revealed on swipe left) */}
            <div className="absolute inset-y-0 right-6 flex items-center justify-end text-white font-bold pointer-events-none">
                <Trash2 size={24} />
            </div>

            <motion.div
                drag="x"
                // Only allow dragging to the left (negative x)
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={{ left: 0.1, right: 0 }} // No elasticity to the right
                onDragEnd={handleDragEnd}
                style={{ x, scale }}
                className="relative w-full h-full swipe-prevention"
            >
                {children}
            </motion.div>
        </motion.div>
    );
}
