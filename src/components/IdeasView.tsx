import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "../context/ToastContext";
import { type Project, ProjectService } from "../services/projectService";
import { AddProjectModal } from "./ideas/AddProjectModal";
import { ProjectCard } from "./ideas/ProjectCard";
import { ProjectDetailModal } from "./ideas/ProjectDetailModal";
import { Logo } from "./ui/Logo";

export function IdeasView() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const { success, error } = useToast();

    const loadProjects = useCallback(async () => {
        try {
            const data = await ProjectService.fetchProjects();
            setProjects(data);
        } catch (err) {
            console.error(err);
            error("Failed to load ideas");
        }
    }, [error]);

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    const handleAddProject = (newProject: Project) => {
        setProjects([newProject, ...projects]);
        success("New idea conceptualized!");
    };

    return (
        <div className="pb-24 pt-8">
            {/* Header */}
            <header className="flex flex-col items-center mb-8 space-y-4 relative">
                <div className="glass-3d p-4 rounded-full bg-zen-surface text-cyan-500">
                    <Lightbulb size={48} />
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <Logo size={24} animate={false} />
                        <h1 className="text-2xl font-bold text-zen-text">Ideas</h1>
                    </div>
                    <p className="text-zen-text-muted">Brainstorm your next big thing</p>
                </div>
            </header>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence>
                    {projects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            name={project.name}
                            description={project.description}
                            featureCount={0} // TODO: Fetch count
                            onClick={() => setSelectedProject(project)}
                        />
                    ))}
                </AnimatePresence>

                {projects.length === 0 && (
                    <div className="text-center text-zen-text-muted py-12">
                        <p>No ideas yet.</p>
                        <p className="text-sm">Tap + to start brainstorming.</p>
                    </div>
                )}
            </div>

            {/* FAB */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowAddModal(true)}
                className="fixed bottom-24 right-8 w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center shadow-lg shadow-cyan-600/20 z-40 text-white glass-3d"
            >
                <Plus size={32} />
            </motion.button>

            {/* Modals */}
            <AnimatePresence>
                {showAddModal && (
                    <AddProjectModal
                        onClose={() => setShowAddModal(false)}
                        onAdded={handleAddProject}
                    />
                )}
                {selectedProject && (
                    <ProjectDetailModal
                        project={selectedProject}
                        onClose={() => setSelectedProject(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
