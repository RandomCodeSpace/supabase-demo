import { Sparkles } from "lucide-react";
import { useState } from "react";
import { AIRewriteService } from "../../backbone/services/aiRewriteService";
import { useToast } from "../../context/ToastContext";
import clsx from "clsx";

interface AIRewriteButtonProps {
	text: string;
	onRewrite: (text: string) => void;
	context?: string;
	className?: string;
}

export function AIRewriteButton({
	text,
	onRewrite,
	context,
	className,
}: AIRewriteButtonProps) {
	const [isLoading, setIsLoading] = useState(false);
	const { error } = useToast();

	const handleRewrite = async () => {
		if (!text.trim() || isLoading) return;

		setIsLoading(true);
		try {
			const result = await AIRewriteService.rewriteText(text, context);
			if (result.success) {
				onRewrite(result.text);
			} else {
				error(result.error || "Failed to rewrite text");
			}
		} catch (err) {
			console.error("AI Rewrite error:", err);
			error("Failed to rewrite text");
		} finally {
			setIsLoading(false);
		}
	};

	// Don't render if AI is not enabled
	if (!AIRewriteService.isEnabled()) {
		return null;
	}

	return (
		<button
			type="button"
			onClick={handleRewrite}
			disabled={!text.trim() || isLoading}
			className={clsx(
				"p-2 rounded-full transition-all",
				isLoading ? "cursor-wait" : "hover:bg-white/10",
				"text-[var(--color-secondary)]", // Purple for AI
				className
			)}
			title={isLoading ? "Rewriting..." : "Rewrite with AI"}
		>
			<Sparkles
				size={16}
				className={clsx(isLoading && "animate-spin")}
			/>
		</button>
	);
}
