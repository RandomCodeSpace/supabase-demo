import { createRoot } from "react-dom/client";
import App from "./App.tsx";

import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";
import { ThemeProvider } from "./components/theme-provider";
import { ToastProvider } from "./context/ToastContext";
import "./index.css";



const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
	<ThemeProvider
		attribute="class"
		defaultTheme="dark"
		enableSystem={false}
		storageKey="ossflow-theme"
	>
		<GlobalErrorBoundary>
			<ToastProvider>
				<App />
			</ToastProvider>
		</GlobalErrorBoundary>
	</ThemeProvider>,
);
