import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import App from "./App";

test("renders vite and react logos", () => {
	render(<App />);
	expect(screen.getByText(/Supabase Todos/i)).toBeDefined();
});
