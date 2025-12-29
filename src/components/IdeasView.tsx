import {
	makeStyles,
	tokens,
	Card,
	CardHeader,
	Button,
	Title1,
	Subtitle2,
	Text,
	shorthands,
} from "@fluentui/react-components";
import {
	Lightbulb24Regular,
	Lightbulb24Filled,
	Add24Regular,
	Add24Filled,
	Delete24Regular,
	bundleIcon
} from "@fluentui/react-icons";
import { useEffect, useState } from "react";
import { useProjectStore } from "../stores/useProjectStore";
import { type Project } from "../backbone/services/projectService";
import { useToast } from "../context/ToastContext";
import { AddProjectModal } from "./ideas/AddProjectModal";
import { ProjectDetailModal } from "./ideas/ProjectDetailModal";
import { LoadingOverlay } from "./ui/LoadingOverlay"; // Needs rewrite

const LightbulbIcon = bundleIcon(Lightbulb24Filled, Lightbulb24Regular);
const AddIcon = bundleIcon(Add24Filled, Add24Regular);

const useStyles = makeStyles({
	root: {
		position: "relative",
		height: "100%",
		width: "100%",
		display: "flex",
		flexDirection: "column",
		backgroundColor: tokens.colorNeutralBackground2,
		...shorthands.padding("16px"),
		boxSizing: "border-box", // Critical for 100% height calculations
	},
	header: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		marginBottom: "24px",
		flexShrink: 0,
	},
	headerIcon: {
		color: tokens.colorBrandForeground1,
		...shorthands.padding("12px"),
		borderRadius: tokens.borderRadiusCircular,
		backgroundColor: tokens.colorNeutralBackground1,
		boxShadow: tokens.shadow4,
		marginBottom: "12px",
	},
	grid: {
		display: "grid",
		gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
		gap: "16px",
		overflowY: "auto",
		paddingBottom: "100px", // Space for FAB
		...shorthands.padding("4px"), // Prevent shadow clip
	},
	card: {
		cursor: "pointer",
		...shorthands.transition("transform", "0.2s"),
		":hover": {
			transform: "scale(1.02)"
		}
	},
	fabContainer: {
		position: "absolute",
		bottom: "24px",
		right: "24px",
		zIndex: 10,
		// Desktop adjustment
		"@media (min-width: 768px)": {
			bottom: "32px",
			right: "32px"
		}
	},
	fab: {
		height: "56px",
		width: "56px",
		borderRadius: "28px",
		boxShadow: tokens.shadow16
	}
});

export function IdeasView() {
	const styles = useStyles();
	const {
		projects,
		isLoading: loading,
		fetchProjects,
		addProject,
		deleteProject,
	} = useProjectStore();
	const [showAddModal, setShowAddModal] = useState(false);
	const [selectedProject, setSelectedProject] = useState<Project | null>(null);
	const { success } = useToast();

	// Initial fetch
	useEffect(() => {
		fetchProjects();
	}, [fetchProjects]);

	const handleAddProject = (newProject: Project) => {
		addProject(newProject);
		success("New idea conceptualized!");
	};

	const handleDelete = async (e: React.MouseEvent, id: string) => {
		e.stopPropagation();
		await deleteProject(id);
		success("Project deleted");
	}

	return (
		<div className={styles.root}>
			{/* TODO: Replace LoadingOverlay with Fluent Spinner */}
			{loading && <LoadingOverlay message="Loading ideas..." />}

			<header className={styles.header}>
				<div className={styles.headerIcon}>
					<LightbulbIcon style={{ fontSize: 48 }} />
				</div>
				<Title1 align="center">Ideas</Title1>
				<Subtitle2 align="center" style={{ color: tokens.colorNeutralForeground2 }}>Brainstorm your next big thing</Subtitle2>
			</header>

			<div className={styles.grid}>
				{projects.map((project) => (
					<Card
						key={project.id}
						className={styles.card}
						onClick={() => setSelectedProject(project)}
					>
						<CardHeader
							header={<Text weight="semibold" size={400}>{project.name}</Text>}
							description={<Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>{project.featureCount || 0} features</Text>}
							action={
								<Button
									appearance="subtle"
									icon={<Delete24Regular />}
									onClick={(e) => handleDelete(e, project.id)}
									aria-label="Delete project"
								/>
							}
						/>
						<Text style={{ padding: '0 12px 12px 12px', color: tokens.colorNeutralForeground2 }}>
							{project.description}
						</Text>
					</Card>
				))}
				{projects.length === 0 && !loading && (
					<div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '40px' }}>
						<Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>No ideas yet. Tap + to start.</Text>
					</div>
				)}
			</div>

			<div className={styles.fabContainer}>
				<Button
					appearance="primary"
					icon={<AddIcon />}
					className={styles.fab}
					onClick={() => setShowAddModal(true)}
					size="large"
					aria-label="Add new idea"
				/>
			</div>

			{/* Modals - These still need to be rewritten or compatible */}
			{/* If they rely on 'Dialog' prop (shadcn), they might break inside FluentRoot if z-index fights occur */}
			{/* Ideally we rewrite them now. For step one, we mount them and hope. */}
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
					onUpdate={fetchProjects}
				/>
			)}
		</div>
	);
}
