import { cn } from "../../backbone/lib/utils";
import { SyncControls } from "../ui/SyncControls";
import { NAV_ITEMS } from "./nav-config";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
	children: React.ReactNode;
	activeTab: string;
	onTabChange: (tab: any) => void;
}

export function AppLayout({
	children,
	activeTab,
	onTabChange,
}: AppLayoutProps) {
	return (
		<div className="flex h-screen w-full bg-zen-bg text-zen-text overflow-hidden">
			{/* Desktop Sidebar (Hidden on Mobile) */}
			<Sidebar activeTab={activeTab} onTabChange={onTabChange} />

			{/* Main Content */}
			<main className="flex-1 relative h-full overflow-hidden flex flex-col">
				<div className="flex-1 overflow-hidden p-4 md:p-8 pb-32 md:pb-8 flex flex-col">
					<div className="max-w-7xl mx-auto w-full h-full flex flex-col">
						{children}
					</div>
				</div>

				{/* Sync Controls (Top Right) */}
				<SyncControls />

				{/* Mobile Bottom Nav (Floating Pill) */}
				<div className="md:hidden fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
					<div className="glass-3d bg-zen-surface/90 rounded-2xl p-1.5 flex gap-1 pointer-events-auto backdrop-blur-2xl shadow-2xl">
						{NAV_ITEMS.filter((item) => item.id !== "profile").map((item) => {
							const isActive = activeTab === item.id;
							return (
								<button
									key={item.id}
									onClick={() => onTabChange(item.id)}
									className={cn(
										"flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300",
										isActive
											? "bg-white shadow-sm ring-1 ring-black/5 dark:bg-white/10 dark:ring-0 dark:shadow-inner text-zen-text"
											: "text-zen-text-muted hover:text-zen-text hover:bg-black/5 dark:hover:bg-white/5",
									)}
								>
									<item.icon size={20} />
									<span>{item.label}</span>
								</button>
							);
						})}
						{/* Profile Button - Separate logic often, but here just a button invoking onTabChange('profile') */}
						<div className="w-px bg-black/5 dark:bg-white/10 my-2 mx-1" />
						<button
							onClick={() => onTabChange("profile")}
							className={cn(
								"flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 text-zen-text-muted hover:text-zen-text hover:bg-black/5 dark:hover:bg-white/5",
							)}
						>
							<span className="sr-only">Profile</span>
							{NAV_ITEMS.find((i) => i.id === "profile")?.icon &&
								(() => {
									const Icon = NAV_ITEMS.find((i) => i.id === "profile")!.icon;
									return <Icon size={20} />;
								})()}
						</button>
					</div>
				</div>
			</main>
		</div>
	);
}
