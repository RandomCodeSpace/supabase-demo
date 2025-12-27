import type { Session } from "@supabase/supabase-js";
import { LayoutGrid, Lightbulb } from "lucide-react";
import { useEffect, useState } from "react";
import { Auth } from "./components/Auth";
import { IdeasView } from "./components/IdeasView";
import { TodosView } from "./components/TodosView";
import { supabase } from "./lib/supabase";
import { cn } from "./lib/utils";

function App() {
	const [session, setSession] = useState<Session | null>(null);
	const [activeTab, setActiveTab] = useState<"ideas" | "todos">("ideas");

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

	if (!session) return <Auth />;

	return (
		<div className="min-h-screen max-w-md mx-auto relative bg-zen-bg transition-colors duration-300">
			<main className="px-4 min-h-screen">
				{activeTab === "ideas" ? (
					<IdeasView />
				) : (
					<TodosView userEmail={session.user.email} />
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
		</div>
	);
}

export default App;
