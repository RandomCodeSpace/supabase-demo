import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "./components/theme-provider";
import { ToastProvider } from "./context/ToastContext";
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
	<StrictMode>
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="ossflow-theme">
			<GlobalErrorBoundary>
				<ToastProvider>
					<App />
				</ToastProvider>
			</GlobalErrorBoundary>
		</ThemeProvider>
	</StrictMode>,
);
