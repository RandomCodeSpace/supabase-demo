import { db, type TodoLocal } from "../lib/db";
import { supabase } from "../lib/supabase";
import { SyncService } from "./syncService";

// Map TodoLocal to the shape expected by UI (for now, or update UI)
// Actually, let's update TodoService to return TodoLocal format and update UI later
export type Todo = TodoLocal;

export const TodoService = {
	async fetchTodos() {
		return await db.todos
			.filter((t) => t.sync_status !== "deleted")
			.reverse()
			.sortBy("created_at");
	},

	async addTodo(text: string) {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error("User not authenticated");

		const newTodo: TodoLocal = {
			id: crypto.randomUUID(),
			user_id: user.id,
			text,
			completed: false,
			created_at: new Date().toISOString(),
			sync_status: "pending",
		};

		await db.todos.add(newTodo);
		SyncService.pushChanges();
		return newTodo;
	},

	async updateTodo(id: string, updates: Partial<TodoLocal>) {
		await db.todos.update(id, { ...updates, sync_status: "pending" });
		SyncService.pushChanges();
		return (await db.todos.get(id)) as Todo;
	},

	async deleteTodo(id: string) {
		const todo = await db.todos.get(id);
		if (!todo) return;

		if (todo.sync_status === "pending") {
			await db.todos.delete(id);
			return;
		}

		await db.todos.update(id, { sync_status: "deleted" });
		SyncService.pushChanges();
	},
};
