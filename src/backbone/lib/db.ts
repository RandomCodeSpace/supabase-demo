import Dexie, { type Table } from "dexie";

// Define Types (Mirroring Supabase + Sync Fields)
export type SyncStatus = "synced" | "pending" | "deleted";

export interface HabitLocal {
	id: string; // UUID
	user_id: string;
	title: string;
	description?: string;
	color: string;
	icon?: string;
	created_at: string;
	sync_status: SyncStatus;
}

export interface HabitLogLocal {
	id: string;
	habit_id: string;
	completed_at: string; // YYYY-MM-DD
	status: "completed" | "skipped";
	sync_status: SyncStatus;
}

export interface HabitNoteLocal {
	id: string;
	habit_id: string;
	content: string;
	created_at: string;
	sync_status: SyncStatus;
}

export interface TodoLocal {
	id: string;
	user_id: string;
	text: string;
	completed: boolean;
	created_at: string;
	sync_status: SyncStatus;
}

export interface ProjectLocal {
	id: string;
	user_id: string;
	name: string;
	description?: string;
	status: "active" | "completed" | "archived";
	created_at: string;
	sync_status: SyncStatus;
}

export interface ProjectFeatureLocal {
	id: string;
	project_id: string;
	title: string;
	description?: string;
	completed: boolean;
	created_at: string;
	sync_status: SyncStatus;
}

export class AppDatabase extends Dexie {
	habits!: Table<HabitLocal>;
	habit_logs!: Table<HabitLogLocal>;
	habit_notes!: Table<HabitNoteLocal>;
	todos!: Table<TodoLocal>;
	projects!: Table<ProjectLocal>;
	project_features!: Table<ProjectFeatureLocal>;

	constructor() {
		super("OSSFlowDB");
		this.version(1).stores({
			habits: "id, user_id, sync_status",
			habit_logs: "id, habit_id, [habit_id+completed_at], sync_status",
			habit_notes: "id, habit_id, sync_status",
			todos: "id, user_id, sync_status",
			projects: "id, user_id, sync_status",
			project_features: "id, project_id, sync_status",
		});
	}
}

export const db = new AppDatabase();
