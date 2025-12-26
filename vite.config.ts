import react from "@vitejs/plugin-react";
import { defineConfig, type UserConfig } from "vite";
import { configDefaults } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	base: "./",
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: "./src/test/setup.ts",
		css: true,
		exclude: [...configDefaults.exclude, "e2e/*"],
	},
} as UserConfig);
