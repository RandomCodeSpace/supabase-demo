
import { useEffect, useState } from "react";
import { type Todo, TodoService } from "../services/todos";
import { useToast } from "../context/ToastContext";

export function TodoList() {
	const { error: toastError } = useToast();
	const [todos, setTodos] = useState<Todo[]>([]);
	const [newTask, setNewTask] = useState("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchTodos = async () => {
			try {
				const data = await TodoService.fetchTodos();
				setTodos(data);
			} catch (err) {
				console.error("Error fetching todos:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchTodos();
	}, []);

	const handleAddTodo = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newTask.trim()) return;

		try {
			const todo = await TodoService.addTodo(newTask);
			setTodos([todo, ...todos]);
			setNewTask("");
		} catch (err) {
			console.error("Error adding todo:", err);
			toastError("Error adding todo!");
		}
	};

	const toggleComplete = async (todo: Todo) => {
		try {
			const updated = await TodoService.updateTodo(todo.id, {
				is_complete: !todo.is_complete,
			});
			setTodos(todos.map((t) => (t.id === todo.id ? updated : t)));
		} catch (error) {
			console.error("Error updating todo:", error);
		}
	};

	const handleDelete = async (id: number) => {
		try {
			await TodoService.deleteTodo(id);
			setTodos(todos.filter((t) => t.id !== id));
		} catch (error) {
			console.error("Error deleting todo:", error);
		}
	};

	const handleLogout = async () => {
		const { supabase } = await import("../lib/supabase");
		supabase.auth.signOut();
	};

	if (loading) return <div className="card">Loading tasks...</div>;

	return (
		<div
			className="card"
			style={{ textAlign: "left", maxWidth: "500px", margin: "0 auto" }}
		>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "2rem",
				}}
			>
				<h2>My Tasks</h2>
				<button
					type="button"
					onClick={handleLogout}
					style={{
						padding: "0.5rem 1rem",
						fontSize: "0.9rem",
						backgroundColor: "transparent",
						border: "1px solid #666",
					}}
				>
					Sign Out
				</button>
			</div>

			<form
				onSubmit={handleAddTodo}
				style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}
			>
				<input
					type="text"
					placeholder="What needs to be done?"
					value={newTask}
					onChange={(e) => setNewTask(e.target.value)}
					style={{
						flex: 1,
						padding: "0.8rem",
						borderRadius: "12px",
						border: "1px solid rgba(255,255,255,0.2)",
						background: "rgba(0,0,0,0.2)",
						color: "white",
						fontSize: "1rem",
					}}
				/>
				<button type="submit" disabled={!newTask.trim()}>
					Add
				</button>
			</form>

			<ul style={{ listStyle: "none", padding: 0 }}>
				{todos.map((todo) => (
					<li
						key={todo.id}
						style={{
							display: "flex",
							alignItems: "center",
							gap: "1rem",
							padding: "1rem",
							borderBottom: "1px solid rgba(255,255,255,0.1)",
							opacity: todo.is_complete ? 0.5 : 1,
							textDecoration: todo.is_complete ? "line-through" : "none",
						}}
					>
						<input
							type="checkbox"
							checked={todo.is_complete}
							onChange={() => toggleComplete(todo)}
							style={{ transform: "scale(1.2)", cursor: "pointer" }}
						/>
						<span style={{ flex: 1 }}>{todo.task}</span>
						<button
							type="button"
							onClick={() => handleDelete(todo.id)}
							style={{
								padding: "0.4rem 0.8rem",
								fontSize: "0.8rem",
								background: "#ff4444",
								border: "none",
							}}
						>
							×
						</button>
					</li>
				))}
				{todos.length === 0 && (
					<li style={{ color: "#888", textAlign: "center", padding: "2rem" }}>
						No tasks yet. Add one above!
					</li>
				)}
			</ul>
		</div>
	);
}
