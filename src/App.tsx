import { AnimatePresence } from "framer-motion";
import { useDrag } from "@use-gesture/react";
import { LayoutGrid, Lightbulb, RefreshCw, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { Auth } from "./components/Auth";
import { IdeasView } from "./components/IdeasView";
import { TodosView } from "./components/TodosView";
import { UserProfileModal } from "./components/ui/UserProfileModal";
import { OrientationGuard } from "./components/ui/OrientationGuard";
import { supabase } from "./lib/supabase";
import { cn } from "./lib/utils";
import { useAuthStore } from "./stores/useAuthStore";

function App() {
	const { session, setSession } = useAuthStore();
	// Active Tab with Persistence
	const [activeTab, setActiveTabPrivate] = useState<"todos" | "ideas">("todos"); // Default to todos initially

	// Load saved tab on mount
	useEffect(() => {
		import("idb-keyval").then(({ get }) => {
			get("activeTab").then((val) => {
				if (val === "todos" || val === "ideas") {
					setActiveTabPrivate(val);
				}
			});
		});
	}, []);

	const setActiveTab = (tab: "todos" | "ideas") => {
		setActiveTabPrivate(tab);
		import("idb-keyval").then(({ set }) => {
			set("activeTab", tab);
		});
	};
	const [showProfileModal, setShowProfileModal] = useState(false);

	// Auth & Initial Load
	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});

		return () => subscription.unsubscribe();
	}, []);

	// Gesture Navigation
	const bind = useDrag(({ movement: [mx], direction: [xDir], velocity: [vx], cancel }) => {
		if (vx < 0.2) return; // Ignore slow swipes
		if (Math.abs(mx) < 100) return; // Ignore short swipes

		if (xDir < 0 && activeTab === "ideas") {
			setActiveTab("todos");
			cancel();
		} else if (xDir > 0 && activeTab === "todos") {
			setActiveTab("ideas");
			cancel();
		}
	}, {
		axis: 'x',
		filterTaps: true,
	});

	if (!session) return <Auth />;

	return (
		<div {...bind()} className="min-h-screen max-w-md mx-auto relative bg-zen-bg transition-colors duration-300 touch-pan-y">
			<OrientationGuard />

			{/* Global Refresh Button (Top-Left) */}
			<button
				onClick={() => window.location.reload()}
				className="absolute top-6 left-6 z-40 p-2 text-zen-text-muted hover:text-zen-text bg-white shadow-sm border border-black/5 dark:bg-white/5 dark:border-white/5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-all backdrop-blur-sm"
			>
				<RefreshCw size={20} />
			</button>

			{/* Global Settings Button (Top-Right) */}
			<button
				onClick={() => setShowProfileModal(true)}
				className="absolute top-6 right-6 z-40 p-2 text-zen-text-muted hover:text-zen-text bg-white shadow-sm border border-black/5 dark:bg-white/5 dark:border-white/5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-all backdrop-blur-sm"
			>
				<Settings size={20} />
			</button>

			<main className="px-4 min-h-screen">
				{activeTab === "ideas" ? (
					<IdeasView />
				) : (
					<TodosView />
				)}
			</main>

			{/* Tab Navigation Bar */}
			<div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-6 pointer-events-none">
				<div className="glass-3d bg-zen-surface/90 rounded-2xl p-1.5 flex gap-1 pointer-events-auto backdrop-blur-2xl shadow-2xl">
					<button
						onClick={() => setActiveTab("ideas")}
						className={cn(
							"flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300",
							activeTab === "ideas"
								? "bg-white shadow-sm ring-1 ring-black/5 dark:bg-white/10 dark:ring-0 dark:shadow-inner text-zen-text"
								: "text-zen-text-muted hover:text-zen-text hover:bg-black/5 dark:hover:bg-white/5",
						)}
					>
						<Lightbulb size={20} />
						<span>Ideas</span>
					</button>
					<div className="w-px bg-black/5 dark:bg-white/10 my-2" />
					<button
						onClick={() => setActiveTab("todos")}
						className={cn(
							"flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300",
							activeTab === "todos"
								? "bg-white shadow-sm ring-1 ring-black/5 dark:bg-white/10 dark:ring-0 dark:shadow-inner text-zen-text"
								: "text-zen-text-muted hover:text-zen-text hover:bg-black/5 dark:hover:bg-white/5",
						)}
					>
						<LayoutGrid size={20} />
						<span>Todos</span>
					</button>
				</div>
			</div>

			{/* Global Profile Modal */}
			<AnimatePresence>
				{showProfileModal && (
					<UserProfileModal
						email={session.user.email}
						onClose={() => setShowProfileModal(false)}
					/>
				)}
			</AnimatePresence>
		</div>
	);
}

export default App;
