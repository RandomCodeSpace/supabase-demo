import { useState } from "react";
import { supabase } from "../lib/supabase";

export function Auth() {
	const [loading, setLoading] = useState(false);

	const handleLogin = async (provider: "github") => {
		try {
			setLoading(true);
			const { error } = await supabase.auth.signInWithOAuth({
				provider,
				options: {
					redirectTo: window.location.origin,
				},
			});
			if (error) throw error;
		} catch (error) {
			if (error instanceof Error) {
				alert(error.message);
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="card">
			<h2>Welcome Back</h2>
			<p style={{ marginBottom: "2rem", color: "#888" }}>
				Sign in to manage your tasks securely.
			</p>
			<div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
				<button
					disabled={loading}
					onClick={() => handleLogin("github")}
					type="button"
					style={{ backgroundColor: "#24292e" }}
				>
					{loading ? "Processing..." : "Sign in with GitHub"}
				</button>
			</div>
		</div>
	);
}
