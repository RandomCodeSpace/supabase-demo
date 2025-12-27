import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export const BentoGrid = ({
    className,
    children,
}: {
    className?: string;
    children?: ReactNode;
}) => {
    return (
        <div
            className={cn(
                "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto",
                className
            )}
        >
            {children}
        </div>
    );
};

export const BentoCard = ({
    className,
    name,
    description,
    featureCount = 0,
    onClick,
    children,
    background,
}: {
    className?: string;
    name: string;
    description?: string;
    featureCount?: number;
    onClick: () => void;
    children?: ReactNode;
    background?: ReactNode;
}) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl",
                "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
                "dark:bg-black dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
                "hover:shadow-xl transition-all duration-300 cursor-pointer",
                className
            )}
        >
            <div>{background}</div>
            <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 p-6 transition-all duration-300 group-hover:-translate-y-2">
                <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300">
                    {name}
                </h3>
                <p className="max-w-lg text-neutral-400 text-sm">{description}</p>
                <div className="mt-2 inline-flex items-center rounded-full border border-transparent bg-neutral-100 dark:bg-neutral-800 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    {featureCount} features
                </div>
            </div>

            {/* Render Children (BorderBeam, etc) */}
            {children}

            {/* Decorative gradient */}
            <div
                className={cn(
                    "pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                )}
            >
                <span className="text-xs font-medium text-neutral-500">
                    Click to view details &rarr;
                </span>
            </div>
            <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/[.03] group-hover:dark:bg-neutral-800/10" />
        </div>
    );
};
