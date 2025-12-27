import path from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig, type UserConfig } from "vite";
import { configDefaults } from "vitest/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	base: "./",
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: "./src/test/setup.ts",
		css: true,
		exclude: [...configDefaults.exclude, "e2e/*"],
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					"vendor-react": ["react", "react-dom"],
					"vendor-ui": ["framer-motion", "lucide-react", "clsx", "tailwind-merge"],
					"vendor-supabase": ["@supabase/supabase-js"],
					"vendor-utils": ["@use-gesture/react", "zustand", "vaul", "next-themes"]
				},
			},
		},
	},
} as UserConfig);
