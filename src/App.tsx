import { AnimatePresence } from "framer-motion";
import { useDrag } from "@use-gesture/react";

import { useEffect, useState } from "react";
import { Auth } from "./components/Auth";
import { IdeasView } from "./components/IdeasView";
import { TodosView } from "./components/TodosView";

import { AppLayout } from "./components/layout/AppLayout";
import { UserProfileModal } from "./components/ui/UserProfileModal";
import { OrientationGuard } from "./components/ui/OrientationGuard";
import { supabase } from "./backbone/lib/supabase";
import { useAuthStore } from "./stores/useAuthStore";
import { SyncService } from "./backbone/services/syncService";

function App() {
	const { session, setSession } = useAuthStore();
	// Active Tab with Persistence
	const [activeTab, setActiveTabPrivate] = useState<string>("ideas");

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

	const setActiveTab = (tab: string) => {
		setActiveTabPrivate(tab);
		import("idb-keyval").then(({ set }) => {
			set("activeTab", tab);
		});
	};
	const [showProfileModal, setShowProfileModal] = useState(false);

	// Auth & Initial Load & Sync
	useEffect(() => {
		const init = async () => {
			const { data: { session } } = await supabase.auth.getSession();
			setSession(session);
			if (session) {
				import("./backbone/services/syncService").then(({ SyncService }) => {
					SyncService.pullChanges();
				});
			}
		};
		init();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
			if (session) {
				// User signed in or session refreshed
				import("./backbone/services/syncService").then(({ SyncService }) => {
					SyncService.pullChanges();
				});
			}
		});

		// Smart Sync Listeners
		const onFocus = () => {
			if (useAuthStore.getState().session) {
				import("./backbone/services/syncService").then(({ SyncService }) => {
					SyncService.pullChanges();
				});
			}
		};
		const onOnline = () => {
			import("./backbone/services/syncService").then(({ SyncService }) => {
				SyncService.pushChanges();
				SyncService.pullChanges();
			});
		};


		window.addEventListener("focus", onFocus);
		window.addEventListener("online", onOnline);

		// Flush sync when app is backgrounded (critical for mobile PWA)
		const onVisibilityChange = () => {
			if (document.visibilityState === "hidden") {
				SyncService.pushImmediately();
			} else {
				// Re-entering app - good time to pull
				SyncService.pullChanges();
			}
		};
		document.addEventListener("visibilitychange", onVisibilityChange);

		return () => {
			subscription.unsubscribe();
			window.removeEventListener("focus", onFocus);
			window.removeEventListener("online", onOnline);
			document.removeEventListener("visibilitychange", onVisibilityChange);
		};
	}, []);

	// Gesture Navigation
	const bind = useDrag(({ event, movement: [mx], direction: [xDir], velocity: [vx], cancel }) => {
		// Ignore if interacting with swipeable items (prevent conflicts)
		if ((event?.target as HTMLElement)?.closest('.swipe-prevention')) return;

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

	const handleTabChange = (tab: string) => {
		if (tab === "profile") {
			setShowProfileModal(true);
		} else {
			setActiveTab(tab);
		}
	};

	return (
		<div {...bind()} className="min-h-screen bg-zen-bg transition-colors duration-300 touch-pan-y">
			<OrientationGuard />

			<AppLayout activeTab={activeTab} onTabChange={handleTabChange}>
				{activeTab === "todos" && <TodosView />}
				{activeTab === "ideas" && <IdeasView />}
			</AppLayout>

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
