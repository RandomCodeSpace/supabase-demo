import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
	<StrictMode>
		<ThemeProvider defaultTheme="system" storageKey="ossflow-theme">
			<ToastProvider>
				<App />
			</ToastProvider>
		</ThemeProvider>
	</StrictMode>,
);
