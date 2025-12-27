import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import App from "./App";
import { HabitService } from "./backbone/services/habitService";

// Mock Supabase
vi.mock("./lib/supabase", () => ({
	supabase: {
		auth: {
			getSession: vi.fn().mockResolvedValue({
				data: {
					session: {
						user: { id: "test-user" },
					},
				},
			}),
			onAuthStateChange: vi.fn().mockReturnValue({
				data: { subscription: { unsubscribe: vi.fn() } },
			}),
		},
	},
}));

// Mock HabitService
vi.mock("./services/habitService", () => ({
	HabitService: {
		fetchHabits: vi.fn(),
		fetchTodayLogs: vi.fn(),
	},
}));

test("renders ZenFlow dashboard when authenticated", async () => {
	// Mock return values
	(HabitService.fetchHabits as any).mockResolvedValue([
		{
			id: "1",
			title: "Morning Meditation",
			description: "10 mins breathing",
			color: "#4ade80",
			created_at: new Date().toISOString(),
		},
	]);
	(HabitService.fetchTodayLogs as any).mockResolvedValue([]);

	render(<App />);

	// Check for title
	expect(await screen.findByText(/Today's Flow/i)).toBeDefined();

	// Check for habit
	expect(await screen.findByText("Morning Meditation")).toBeDefined();
});
