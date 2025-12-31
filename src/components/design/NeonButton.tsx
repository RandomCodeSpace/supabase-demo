import clsx from 'clsx';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';

interface NeonButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    glow?: boolean;
    icon?: React.ReactNode;
    children?: React.ReactNode;
}

export const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(
    ({ className, children, variant = 'primary', glow = false, icon, ...props }, ref) => {
        const baseStyles = "relative flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-200 touch-none select-none";

        const variants = {
            primary: "bg-[var(--color-primary)] text-black",
            secondary: "bg-[var(--color-secondary)] text-white",
            ghost: "bg-white/5 text-white hover:bg-white/10 border border-white/10",
            danger: "bg-[var(--color-error)] text-white"
        };

        return (
            <motion.button
                ref={ref}
                className={clsx(
                    baseStyles,
                    variants[variant],
                    glow && variant === 'primary' && "glow-primary",
                    className
                )}
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.02 }}
                {...props}
            >
                {icon && <span className="w-5 h-5">{icon}</span>}
                {children}
            </motion.button>
        );
    }
);

NeonButton.displayName = "NeonButton";
