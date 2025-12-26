import { Github } from "lucide-react";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { ZenCard } from "./ui/ZenCard";

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
		<div className="flex items-center justify-center min-h-[80vh] w-full p-4">
			<ZenCard className="w-full max-w-sm text-center">
				<div className="mb-8">
					<h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-white/50 mb-2">
						ZenFlow
					</h1>
					<p className="text-zen-text-muted">Master your daily rituals.</p>
				</div>

				<button
					disabled={loading}
					onClick={() => handleLogin("github")}
					type="button"
					className="w-full bg-[#24292e] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg disabled:opacity-50"
				>
					{loading ? (
						"Connecting..."
					) : (
						<>
							<Github size={20} />
							<span>Sign in with GitHub</span>
						</>
					)}
				</button>
			</ZenCard>
		</div>
	);
}
