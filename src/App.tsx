import { useDrag } from "@use-gesture/react";
import { AnimatePresence } from "framer-motion";

import { useEffect, useState } from "react";
import { supabase } from "./backbone/lib/supabase";
import { SyncService } from "./backbone/services/syncService";
import { Auth } from "./components/Auth";
import { IdeasView } from "./components/IdeasView";
import { Shell } from "./components/layout/Shell";
import { TodosView } from "./components/TodosView";
import { OrientationGuard } from "./components/ui/OrientationGuard";
import { UserProfileModal } from "./components/ui/UserProfileModal";
import { useAuthStore } from "./stores/useAuthStore";

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
			const {
				data: { session },
			} = await supabase.auth.getSession();
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
				// Pass session synchronously to avoid async gap
				const session = useAuthStore.getState().session;
				SyncService.pushImmediately(session);
			} else {
				// Re-entering app - good time to pull AND refresh UI
				SyncService.pullChanges().then(() => {
					// Force Stores to reload from IDB
					import("./stores/useHabitStore").then(({ useHabitStore }) =>
						useHabitStore.getState().fetchData(),
					);
					import("./stores/useProjectStore").then(({ useProjectStore }) =>
						useProjectStore.getState().fetchProjects(),
					);
				});
			}
		};
		document.addEventListener("visibilitychange", onVisibilityChange);

		return () => {
			subscription.unsubscribe();
			window.removeEventListener("focus", onFocus);
			window.removeEventListener("online", onOnline);
			document.removeEventListener("visibilitychange", onVisibilityChange);
		};
	}, [setSession]);

	// Gesture Navigation
	const bind = useDrag(
		({
			event,
			movement: [mx, my],
			direction: [xDir],
			velocity: [vx],
			cancel,
		}) => {
			// 1. Block if ANY modal is open (Profile, HabitDetail, ProjectDetail)
			// We check for the generic modal overlay/dialog presence
			if (
				document.querySelector('[role="dialog"]') ||
				document.querySelector(".fixed.inset-0.z-\\[100\\]")
			)
				return;

			// 2. Block if interacting with swipeable items (prevent conflicts)
			// Check if the target or any of its parents has the prevention class
			if ((event?.target as HTMLElement)?.closest(".swipe-prevention")) return;

			if (vx < 0.2) return; // Ignore slow swipes
			if (Math.abs(mx) < 100) return; // Ignore short swipes
			if (Math.abs(my) > 50) return; // Ignore diagonal/vertical swipes (scrolling)

			if (xDir < 0 && activeTab === "ideas") {
				setActiveTab("todos");
				cancel();
			} else if (xDir > 0 && activeTab === "todos") {
				setActiveTab("ideas");
				cancel();
			}
		},
		{
			axis: "x",
			filterTaps: true,
			// preventDefault: true, // Be careful with this, might block scroll
		},
	);

	// Gesture Navigation

	if (!session) return <Auth />;

	const handleTabChange = (tab: string) => {
		if (tab === "profile") {
			setShowProfileModal(true);
		} else {
			setActiveTab(tab);
		}
	};

	return (
		// Wrapper for gestures. FluentRoot provides the 100dvh context.
		// We use inline style or class for 100% size to fill FluentRoot.
		<div
			{...bind()}
			style={{ width: '100%', height: '100%' }}
		>
			<OrientationGuard />

			<Shell activeTab={activeTab} onTabChange={handleTabChange}>
				{activeTab === "todos" && <TodosView />}
				{activeTab === "ideas" && <IdeasView />}
			</Shell>

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
