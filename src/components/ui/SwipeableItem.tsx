import { motion, useMotionValue, useTransform } from "framer-motion";
import { Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SwipeableItemProps {
    children: ReactNode;
    onDelete: () => void;
    className?: string;
}

export function SwipeableItem({
    children,
    onDelete,
    className,
}: SwipeableItemProps) {
    const x = useMotionValue(0);
    // Only swipe left for delete
    const scale = useTransform(x, [-150, 0], [0.9, 1]); // Squeeze effect
    const opacity = useTransform(x, [-150, 0], [0.5, 1]);

    // Background color only shows red on left swipe
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
        if (info.offset.x < -100) {
            // Swiped Left enough
            onDelete();
        }
    };

    return (
        <motion.div
            className={cn("relative w-full overflow-hidden", className)}
            style={{ background: backgroundColor, borderRadius: "0.75rem" }}
        >
            {/* Icon revealed on swipe left */}
            <div className="absolute inset-y-0 right-4 flex items-center justify-end text-white font-bold">
                <Trash2 size={20} />
            </div>

            <motion.div
                onPointerDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                style={{ x, scale, opacity }}
                className="relative bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl transition-colors z-10"
            >
                {children}
            </motion.div>
        </motion.div>
    );
}
