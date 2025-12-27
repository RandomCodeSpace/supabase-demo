import { db, type ProjectLocal, type ProjectFeatureLocal } from "../lib/db";
import { supabase } from "../lib/supabase";
import { SyncService } from "./syncService";

export type Project = ProjectLocal & { featureCount?: number };
export type ProjectFeature = ProjectFeatureLocal;

export const ProjectService = {
	async fetchProjects() {
		const projects = await db.projects
			.filter((p) => p.sync_status !== "deleted")
			.reverse()
			.sortBy("created_at");

		// Calculate feature counts manually
		const result: Project[] = [];
		for (const p of projects) {
			const count = await db.project_features
				.where("project_id")
				.equals(p.id)
				.filter(f => f.sync_status !== 'deleted')
				.count();
			result.push({ ...p, featureCount: count });
		}
		return result;
	},

	async createProject(project: { name: string; description?: string }) {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error("User not found");

		const newProject: ProjectLocal = {
			id: crypto.randomUUID(),
			user_id: user.id,
			name: project.name,
			description: project.description,
			status: "active",
			created_at: new Date().toISOString(),
			sync_status: "pending",
		};

		await db.projects.add(newProject);
		SyncService.pushChanges();
		return newProject;
	},

	async deleteProject(id: string) {
		const project = await db.projects.get(id);
		if (!project) return;

		if (project.sync_status === "pending") {
			await db.projects.delete(id);
			// Also hard delete features (optional, but cleaner)
			const features = await db.project_features.where("project_id").equals(id).toArray();
			await db.project_features.bulkDelete(features.map(f => f.id));
			return;
		}

		await db.projects.update(id, { sync_status: "deleted" });
		SyncService.pushChanges();
	},

	async fetchFeatures(projectId: string) {
		return await db.project_features
			.where("project_id")
			.equals(projectId)
			.filter((f) => f.sync_status !== "deleted")
			.sortBy("created_at");
	},

	async addFeature(feature: {
		project_id: string;
		title: string;
		description?: string;
	}) {
		const newFeature: ProjectFeatureLocal = {
			id: crypto.randomUUID(),
			project_id: feature.project_id,
			title: feature.title,
			description: feature.description,
			completed: false,
			created_at: new Date().toISOString(),
			sync_status: "pending",
		};

		await db.project_features.add(newFeature);
		SyncService.pushChanges();
		return newFeature;
	},

	async deleteFeature(id: string) {
		const feature = await db.project_features.get(id);
		if (!feature) return;

		if (feature.sync_status === "pending") {
			await db.project_features.delete(id);
			return;
		}

		await db.project_features.update(id, { sync_status: "deleted" });
		SyncService.pushChanges();
	},

	// Missing toggle/update? Existing file didn't seem to export updateFeature but ProjectDetailModal might typically use it.
	// Implementing updateFeature just in case users need it later or if I missed it.
	async updateFeature(id: string, updates: Partial<ProjectFeatureLocal>) {
		await db.project_features.update(id, { ...updates, sync_status: "pending" });
		SyncService.pushChanges();
	}
};
