import { motion } from "framer-motion";

interface ProjectCardProps {
	name: string;
	description?: string;
	featureCount?: number;
	onClick?: () => void;
}

export function ProjectCard({
	name,
	description,
	featureCount = 0,
	onClick,
}: ProjectCardProps) {
	return (
		<motion.div
			whileHover={{ scale: 1.02, y: -2 }}
			whileTap={{ scale: 0.98 }}
			onClick={onClick}
			className="glass-3d rounded-2xl p-5 relative overflow-hidden group cursor-pointer"
		>
			<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500" />
			<div className="flex justify-between items-start mb-2">
				<h3 className="font-bold text-lg text-zen-text">{name}</h3>
				<span className="text-xs px-2 py-1 rounded-full bg-black/5 dark:bg-white/10 text-zen-text-muted">
					{featureCount} features
				</span>
			</div>
			{description && (
				<p className="text-sm text-zen-text-muted line-clamp-2">
					{description}
				</p>
			)}
		</motion.div>
	);
}
