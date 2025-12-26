import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import "./App.css";
import { Auth } from "./components/Auth";
import { TodoList } from "./components/TodoList";
import { supabase } from "./lib/supabase";

function App() {
	const [session, setSession] = useState<Session | null>(null);

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

	return (
		<>
			<h1>Supabase Todos</h1>
			{!session ? <Auth /> : <TodoList />}
			<p className="read-the-docs">Secure • Fast • Realtime</p>
		</>
	);
}

export default App;
