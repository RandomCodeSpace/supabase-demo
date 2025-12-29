import {
	makeStyles,
	tokens,
	Card,
	Button,
	Text,
	Title3,
	shorthands,
} from "@fluentui/react-components";
import { useState } from "react";
import { supabase } from "../backbone/lib/supabase";
import { useToast } from "../context/ToastContext";
import { Logo } from "./ui/Logo"; // Assume Logo is SVG and safe to keep for now, or replace later

const useStyles = makeStyles({
	root: {
		height: "100%",
		width: "100%",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		background: `linear-gradient(135deg, ${tokens.colorBrandBackground2} 0%, ${tokens.colorNeutralBackground1} 100%)`,
	},
	card: {
		width: "100%",
		maxWidth: "360px",
		...shorthands.padding("40px"), // Premium spacing
		backgroundColor: tokens.colorNeutralBackground1, // Fallback
		backdropFilter: "blur(20px)",
		// Glassmorphism effect via semi-transparent background if supported tokens available
		// For now using standard Fluent generic card for consistency, but adding shadow
		boxShadow: tokens.shadow28,
		...shorthands.borderRadius(tokens.borderRadiusLarge),
		...shorthands.border("1px", "solid", tokens.colorNeutralStroke1),
	},
	headerContent: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		...shorthands.gap("16px"),
		marginBottom: "32px",
	},
	logoContainer: {
		// Optional: Add glow effect behind logo using pseudo-elements in Griffel if really needed
		position: 'relative'
	},
	buttonsContainer: {
		display: "flex",
		flexDirection: "column",
		...shorthands.gap("12px"),
		width: "100%",
	},
	button: {
		height: "48px", // Taller touch target
	},
	title: {
		background: `linear-gradient(45deg, ${tokens.colorBrandForeground1}, ${tokens.colorBrandForeground2})`,
		"-webkit-background-clip": "text",
		"-webkit-text-fill-color": "transparent",
	}
});

// Inline SVGs for Brands
const GoogleIcon = () => (
	<svg width="20" height="20" viewBox="0 0 24 24">
		<path
			d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
			fill="#4285F4"
		/>
		<path
			d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
			fill="#34A853"
		/>
		<path
			d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
			fill="#FBBC05"
		/>
		<path
			d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
			fill="#EA4335"
		/>
	</svg>
);

const GithubIcon = () => (
	<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
		<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
	</svg>
)

export function Auth() {
	const [loading, setLoading] = useState(false);
	const { error: toastError } = useToast();
	const styles = useStyles();

	const handleLogin = async (provider: "github" | "google") => {
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
				toastError(error.message);
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={styles.root}>
			<Card className={styles.card}>
				<div className={styles.headerContent}>
					<div className={styles.logoContainer}>
						<Logo size={64} />
					</div>

					<div style={{ textAlign: 'center' }}>
						<Title3 className={styles.title}>OSSFlow</Title3>
						<Text block size={200} style={{ color: tokens.colorNeutralForeground2, marginTop: '4px' }}>
							Master your daily rituals
						</Text>
					</div>
				</div>

				<div className={styles.buttonsContainer}>
					<Button
						appearance="outline"
						className={styles.button}
						disabled={loading}
						onClick={() => handleLogin("google")}
						icon={<GoogleIcon />}
						size="large"
					>
						{loading ? "Connecting..." : "Sign in with Google"}
					</Button>

					<Button
						appearance="primary"
						style={{ backgroundColor: '#24292e', border: 'none' }} // GitHub Brand Color overrides
						className={styles.button}
						disabled={loading}
						onClick={() => handleLogin("github")}
						icon={<GithubIcon />}
						size="large"
					>
						{loading ? "Connecting..." : "Sign in with GitHub"}
					</Button>
				</div>
			</Card>
		</div>
	);
}
