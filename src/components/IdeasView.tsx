import { AnimatePresence } from "framer-motion";
import { Lightbulb, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useProjectStore } from "../stores/useProjectStore";
import type { Project } from "../backbone/services/projectService";
import { useToast } from "../context/ToastContext";
import { ProjectDetailModal } from "./ideas/ProjectDetailModal";
import { ConfirmationModal } from "./ui/ConfirmationModal";
import { GlassCard } from "./design/GlassCard";
import { SwipeableItem } from "./design/SwipeableItem";

export function IdeasView() {
	const {
		projects,
		fetchProjects,
		deleteProject
	} = useProjectStore();

	const [selectedProject, setSelectedProject] = useState<Project | null>(null);
	const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
	const [resetKeys, setResetKeys] = useState<Record<string, number>>({});

	const { success, error: toastError } = useToast();

	useEffect(() => {
		fetchProjects();
	}, [fetchProjects]);

	const handleSwipeDelete = (project: Project) => {
		setProjectToDelete(project);
	};

	const confirmDelete = async () => {
		if (!projectToDelete) return;
		try {
			await deleteProject(projectToDelete.id);
			success("Deleted");
			setProjectToDelete(null);
		} catch (err) {
			toastError("Failed to delete");
		}
	};

	const cancelDelete = () => {
		if (projectToDelete) {
			setResetKeys(prev => ({
				...prev,
				[projectToDelete.id]: (prev[projectToDelete.id] || 0) + 1
			}));
		}
		setProjectToDelete(null);
	};

	return (
		<div className="flex flex-col h-full min-h-screen relative p-4 pb-24">
			{/* Header */}
			<div className="mt-12 mb-8 px-2">
				<h1 className="text-4xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
					Ideas<br />Vault
				</h1>
			</div>

			{/* Bento Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<AnimatePresence mode="popLayout">
					{projects.map((project, index) => {
						const isNewest = index === 0;
						const currentKey = `${project.id}-${resetKeys[project.id] || 0}`;

						return (
							<SwipeableItem
								key={currentKey}
								onDelete={() => handleSwipeDelete(project)}
								confirmMessage="Delete this idea?"
							>
								<GlassCard
									onClick={() => setSelectedProject(project)}
									hoverEffect
									className={`
                                        flex flex-col justify-between min-h-[160px] cursor-pointer active:scale-[0.98] transition-all
                                        ${isNewest ? 'relative overflow-hidden group border-[var(--color-primary)]/30' : ''}
                                    `}
								>
									{/* Border Beam Effect for Newest */}
									{isNewest && (
										<div className="absolute inset-0 pointer-events-none">
											<div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary)]/10 to-transparent" />
											<div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-50 animate-pulse" />
										</div>
									)}

									<div className="flex justify-between items-start">
										<div className="p-2 bg-white/5 rounded-xl">
											<Lightbulb size={24} className={isNewest ? "text-[var(--color-primary)]" : "text-white/50"} />
										</div>
										{/* No Trash Icon */}
									</div>

									<div className="mt-4">
										<h3 className="text-xl font-bold leading-tight mb-1">{project.name}</h3>
										<p className="text-sm text-[var(--text-secondary)] line-clamp-2">
											{project.description || "No description yet."}
										</p>
									</div>

									<div className="mt-4 flex items-center gap-2 text-xs font-mono text-[var(--text-tertiary)] group-hover:text-[var(--color-primary)] transition-colors">
										<span>{project.featureCount || 0} FEATURES</span>
										<ArrowRight size={12} />
									</div>
								</GlassCard>
							</SwipeableItem>
						);
					})}
				</AnimatePresence>

				{projects.length === 0 && (
					<div className="col-span-full text-center text-[var(--text-tertiary)] mt-12">
						<p>Your vault is empty.</p>
					</div>
				)}
			</div>



			{selectedProject && (
				<ProjectDetailModal
					project={selectedProject}
					onClose={() => setSelectedProject(null)}
					onUpdate={fetchProjects}
				/>
			)}

			{projectToDelete && (
				<ConfirmationModal
					isOpen={!!projectToDelete}
					onClose={cancelDelete}
					onConfirm={confirmDelete}
					title="Delete Idea?"
					message={`Are you sure you want to delete "${projectToDelete.name}"?`}
				/>
			)}
		</div>
	);
}
