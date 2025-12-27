import { supabase } from "../lib/supabase";

export interface Project {
	id: string;
	user_id: string;
	name: string;
	description?: string;
	created_at: string;
	featureCount?: number;
}

export interface ProjectFeature {
	id: string;
	project_id: string;
	title: string;
	description?: string;
	priority: "low" | "medium" | "high";
	status: "pending" | "completed";
	created_at: string;
}

export const ProjectService = {
	async fetchProjects() {
		const { data, error } = await supabase
			.from("projects")
			.select("*, project_features(count)")
			.order("created_at", { ascending: false });

		if (error) throw error;

		// Map the response to include featureCount
		return data.map((p: any) => ({
			...p,
			featureCount: p.project_features[0]?.count || 0,
		})) as Project[];
	},

	async createProject(project: { name: string; description?: string }) {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error("User not found");

		const { data, error } = await supabase
			.from("projects")
			.insert({
				user_id: user.id,
				name: project.name,
				description: project.description,
			})
			.select()
			.single();

		if (error) throw error;
		return data as Project;
	},

	async deleteProject(id: string) {
		const { error } = await supabase.from("projects").delete().eq("id", id);
		if (error) throw error;
	},

	async fetchFeatures(projectId: string) {
		const { data, error } = await supabase
			.from("project_features")
			.select("*")
			.eq("project_id", projectId)
			.order("created_at", { ascending: true });

		if (error) throw error;
		return data as ProjectFeature[];
	},

	async addFeature(feature: {
		project_id: string;
		title: string;
		description?: string;
	}) {
		const { data, error } = await supabase
			.from("project_features")
			.insert(feature)
			.select()
			.single();

		if (error) throw error;
		return data as ProjectFeature;
	},

	async deleteFeature(id: string) {
		const { error } = await supabase
			.from("project_features")
			.delete()
			.eq("id", id);
		if (error) throw error;
	},
};
