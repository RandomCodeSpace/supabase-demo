import { motion } from "framer-motion";
import { cn } from "../../backbone/lib/utils";
import { NAV_ITEMS } from "./nav-config";
import { Logo } from "../ui/Logo";

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: any) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
    return (
        <div className="h-full w-64 hidden md:flex flex-col border-r border-white/10 bg-black/5 backdrop-blur-xl">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-8">
                    <Logo size={24} />
                    <span className="font-bold text-xl tracking-tight text-white/90">OSSFlow</span>
                </div>

                <nav className="space-y-2">
                    {NAV_ITEMS.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onTabChange(item.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                                    isActive ? "text-white" : "text-white/50 hover:text-white/80"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute inset-0 bg-white/10 rounded-xl"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}

                                <item.icon
                                    size={20}
                                    className={cn(
                                        "relative z-10 transition-transform duration-300",
                                        isActive ? "scale-110" : "group-hover:scale-105"
                                    )}
                                />
                                <span className="relative z-10 font-medium">{item.label}</span>

                                {isActive && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="absolute right-4 w-1.5 h-1.5 rounded-full bg-zen-primary shadow-[0_0_10px_rgba(var(--zen-primary),0.5)]"
                                    />
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-white/5">
                <div className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/5">
                    <p className="text-xs text-white/40 mb-1">Status</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-medium text-emerald-500">System Online</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
