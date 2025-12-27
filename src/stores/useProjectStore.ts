import { create } from "zustand";
import { type Project, ProjectService } from "../backbone/services/projectService";

interface ProjectState {
    projects: Project[];
    isLoading: boolean;
    fetchProjects: () => Promise<void>;
    addProject: (project: Project) => void;
    deleteProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set) => ({
    projects: [],
    isLoading: false,

    fetchProjects: async () => {
        set({ isLoading: true });
        try {
            const projects = await ProjectService.fetchProjects();
            set({ projects, isLoading: false });
        } catch (error) {
            console.error("Failed to fetch projects", error);
            set({ isLoading: false });
        }
    },

    addProject: (project) => {
        set((state) => ({ projects: [project, ...state.projects] }));
    },

    deleteProject: async (id) => {
        try {
            await ProjectService.deleteProject(id);
            set((state) => ({
                projects: state.projects.filter((p) => p.id !== id),
            }));
        } catch (error) {
            console.error("Failed to delete project", error);
        }
    },
}));
