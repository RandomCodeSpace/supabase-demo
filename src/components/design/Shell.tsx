import { motion } from 'framer-motion';
import { LayoutGrid, CheckSquare, UserCircle } from 'lucide-react';
import clsx from 'clsx';

interface ShellProps {
    children: React.ReactNode;
    activeTab: 'todos' | 'ideas';
    onTabChange: (tab: 'todos' | 'ideas') => void;
    onProfileClick: () => void;
}

export function Shell({ children, activeTab, onTabChange, onProfileClick }: ShellProps) {
    return (
        <div className="flex flex-col h-screen w-full bg-[var(--bg-deep)] text-[var(--text-primary)]">
            {/* Main Content Area - Scrollable */}
            <main className="flex-1 overflow-y-auto pb-[calc(var(--nav-height)+20px)] no-scrollbar">
                {children}
            </main>

            {/* Floating Bottom Nav */}
            <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
                <div className="glass px-2 py-2 rounded-full flex gap-2 pointer-events-auto shadow-2xl">
                    <NavButton
                        active={activeTab === 'todos'}
                        onClick={() => onTabChange('todos')}
                        icon={<CheckSquare size={24} />}
                        label="Todos"
                    />
                    <NavButton
                        active={activeTab === 'ideas'}
                        onClick={() => onTabChange('ideas')}
                        icon={<LayoutGrid size={24} />}
                        label="Ideas"
                    />
                    <div className="w-[1px] bg-white/10 mx-1 my-2" />
                    <NavButton
                        active={false}
                        onClick={onProfileClick}
                        icon={<UserCircle size={24} />}
                        label="Profile"
                    />
                </div>
            </div>
        </div>
    );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                "relative flex items-center justify-center w-14 h-14 rounded-full transition-colors z-0",
                active ? "text-[var(--color-primary)]" : "text-[var(--text-secondary)] hover:text-white"
            )}
        >
            {active && (
                <motion.div
                    layoutId="nav-glow"
                    className="absolute inset-0 rounded-full bg-[var(--color-primary)] -z-10"
                    style={{ opacity: 0.15 }} // Hardcoded opacity to prevent class issues
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            )}
            <span className="relative z-10">
                {icon}
            </span>
            {/* Screen Reader Only */}
            <span className="sr-only">{label}</span>
        </button>
    );
}
