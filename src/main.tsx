import { registerSW } from "virtual:pwa-register";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";
import { ThemeProvider } from "./components/theme-provider";
import { ToastProvider } from "./context/ToastContext";
import "./index.css";

// Register Service Worker for offline support
const updateSW = registerSW({
	onNeedRefresh() {
		// Optional: Prompt user to refresh
		if (confirm("New content available. Reload?")) {
			updateSW(true);
		}
	},
	onOfflineReady() {
		console.log("App is ready for offline work.");
	},
});

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
	<StrictMode>
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			storageKey="ossflow-theme"
		>
			<GlobalErrorBoundary>
				<ToastProvider>
					<App />
				</ToastProvider>
			</GlobalErrorBoundary>
		</ThemeProvider>
	</StrictMode>,
);
