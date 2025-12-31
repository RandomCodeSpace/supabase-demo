import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { Plus } from "lucide-react";
import { supabase } from "./backbone/lib/supabase";
import { Auth } from "./components/Auth";
import { IdeasView } from "./components/IdeasView";
import { Shell } from "./components/design/Shell";
import { TodosView } from "./components/TodosView";
import { OrientationGuard } from "./components/ui/OrientationGuard";
import { UserProfileModal } from "./components/ui/UserProfileModal";
import { AddHabitModal } from "./components/ui/AddHabitModal";
import { AddProjectModal } from "./components/ideas/AddProjectModal";
import { NeonButton } from "./components/design/NeonButton";
import { useAuthStore } from "./stores/useAuthStore";
import { useHabitStore } from "./stores/useHabitStore";
import { useProjectStore } from "./stores/useProjectStore";
import { useToast } from "./context/ToastContext";

function App() {
	const { session, setSession } = useAuthStore();
	// Active Tab with Persistence
	const [activeTab, setActiveTabPrivate] = useState<"todos" | "ideas">("ideas");
	const [showProfile, setShowProfile] = useState(false);

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

		const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
			if (session) {
				// User signed in or session refreshed
				import("./backbone/services/syncService").then(({ SyncService }) => {
					SyncService.pullChanges();
				});
			}
		});
		return () => subscription.unsubscribe();
	}, [setSession]);

	const { fetchData } = useHabitStore();
	const { fetchProjects } = useProjectStore();
	const { success, action } = useToast();

	// PWA Update Logic
	const {
		needRefresh: [needRefresh],
		updateServiceWorker,
	} = useRegisterSW({
		onRegisterError(error) {
			console.log('SW registration error', error);
		},
	});

	useEffect(() => {
		if (needRefresh) {
			action(
				"New version available",
				"Reload",
				() => updateServiceWorker(true),
				"primary"
			);
		}
	}, [needRefresh, action, updateServiceWorker]);

	const [showAddHabitModal, setShowAddHabitModal] = useState(false);
	const [showAddProjectModal, setShowAddProjectModal] = useState(false);

	const handleFabClick = () => {
		if (activeTab === "todos") setShowAddHabitModal(true);
		else setShowAddProjectModal(true);
	};

	if (!session) {
		return <Auth />;
	}

	return (
		<>
			<OrientationGuard />
			<Shell
				activeTab={activeTab}
				onTabChange={setActiveTab}
				onProfileClick={() => setShowProfile(true)}
			>
				<AnimatePresence mode="wait">
					{activeTab === "todos" ? (
						<motion.div
							key="todos"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 20 }}
							transition={{ duration: 0.2 }}
							className="h-full"
						>
							<TodosView />
						</motion.div>
					) : (
						<motion.div
							key="ideas"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							transition={{ duration: 0.2 }}
							className="h-full"
						>
							<IdeasView />
						</motion.div>
					)}
				</AnimatePresence>
			</Shell>

			{/* Global FAB */}
			<div className="fixed bottom-32 right-6 z-40">
				<NeonButton
					onClick={handleFabClick}
					className="!rounded-full !w-16 !h-16 !p-0"
					variant={activeTab === "ideas" ? "secondary" : "primary"}
					glow
				>
					<Plus size={32} />
				</NeonButton>
			</div>

			{/* Modals */}
			{showAddHabitModal && (
				<AddHabitModal
					onClose={() => setShowAddHabitModal(false)}
					onAdded={() => {
						success("Added");
						fetchData();
					}}
				/>
			)}

			{showAddProjectModal && (
				<AddProjectModal
					onClose={() => setShowAddProjectModal(false)}
					onAdded={() => {
						success("Idea created");
						fetchProjects();
					}}
				/>
			)}

			{/* Temporary Profile Modal using old UI until refactor */}
			{showProfile && (
				<UserProfileModal
					email={session.user.email}
					onClose={() => setShowProfile(false)}
				/>
			)}
		</>
	);
}

export default App;
