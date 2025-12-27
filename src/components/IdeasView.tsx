import { AnimatePresence } from "framer-motion";
import { useDrag } from "@use-gesture/react";
import { Lightbulb, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "../context/ToastContext";
import { ShinyButton } from "./magicui/shiny-button";
import { BlurFade } from "./magicui/blur-fade";
import { type Project, ProjectService } from "../services/projectService";
import { AddProjectModal } from "./ideas/AddProjectModal";
// import { ProjectCard } from "./ideas/ProjectCard";
import { ProjectDetailModal } from "./ideas/ProjectDetailModal";
import { LoadingOverlay } from "./ui/LoadingOverlay";
import { Logo } from "./ui/Logo";
import { BentoCard, BentoGrid } from "./magicui/bento-grid";
import { BorderBeam } from "./magicui/border-beam";

export function IdeasView() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [showAddModal, setShowAddModal] = useState(false);
	const [selectedProject, setSelectedProject] = useState<Project | null>(null);
	const { success, error } = useToast();
	const [loading, setLoading] = useState(true);

	const loadProjects = useCallback(async () => {
		try {
			setLoading(true);
			const data = await ProjectService.fetchProjects();
			setProjects(data);
		} catch (err) {
			console.error(err);
			error("Failed to load ideas");
		} finally {
			setLoading(false);
		}
	}, [error]);

	useEffect(() => {
		loadProjects();
	}, [loadProjects]);

	const handleAddProject = (newProject: Project) => {
		setProjects([newProject, ...projects]);
		success("New idea conceptualized!");
	};

	// Swipe Up to Add
	const bind = useDrag(({ movement: [_, my], direction: [__, yDir], velocity: [___, vy], cancel }) => {
		// Disable if modals open
		if (showAddModal || selectedProject) return;

		if (vy > 0.5 && yDir < 0 && my < -50) {
			// Swipe Up
			setShowAddModal(true);
			cancel();
		}
	}, {
		axis: 'y',
		filterTaps: true,
		from: () => [0, 0],
	});

	return (
		<div {...bind()} className="pb-24 pt-8 min-h-screen relative">
			{loading && <LoadingOverlay message="Loading ideas..." />}
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
			<BentoGrid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
				<AnimatePresence>
					{projects.map((project, idx) => (
						<BlurFade key={project.id} delay={0.04 * idx} inView className="h-full">
							<BentoCard
								name={project.name}
								description={project.description}
								featureCount={project.featureCount}
								onClick={() => setSelectedProject(project)}
								className="h-full"
								background={
									<div className="absolute inset-0 z-0 opacity-50 flex items-center justify-center">
										{/* Abstract geometry/icon as background */}
										<div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 blur-3xl animate-pulse" />
									</div>
								}
							>
								{/* Border Beam for 'Active' or newest project as a highlight */}
								{idx === 0 && (
									<BorderBeam
										size={150}
										duration={10}
										colorFrom="#00E5FF" // Cyan accent
										colorTo="#A855F7" // Purple accent
									/>
								)}
							</BentoCard>
						</BlurFade>
					))}
				</AnimatePresence>
			</BentoGrid>

			{projects.length === 0 && !loading && (
				<div className="text-center text-zen-text-muted py-12">
					<p>No ideas yet.</p>
					<p className="text-sm">Tap + to start brainstorming.</p>
				</div>
			)}

			{/* FAB */}
			<div className="fixed bottom-24 right-8 z-40">
				<ShinyButton
					onClick={() => setShowAddModal(true)}
					className="!rounded-full !p-0 w-16 h-16 flex items-center justify-center !bg-cyan-600 shadow-lg shadow-cyan-600/20 glass-3d"
				>
					<Plus size={32} className="text-white" />
				</ShinyButton>
			</div>

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
