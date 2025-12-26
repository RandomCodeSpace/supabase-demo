import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest"; // Added vi
import App from "./App";

// Mock the Supabase client to avoid env var issues and network calls
vi.mock("./lib/supabase", () => ({
	supabase: {
		auth: {
			getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
			onAuthStateChange: vi.fn().mockReturnValue({
				data: { subscription: { unsubscribe: vi.fn() } },
			}),
		},
	},
}));

test("renders vite and react logos", () => {
	// ... rest of test
	render(<App />);
	expect(screen.getByText(/Supabase Todos/i)).toBeDefined();
});
