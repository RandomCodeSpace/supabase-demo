import { Sparkles } from "lucide-react";
import { useState } from "react";
import { cn } from "../../backbone/lib/utils";
import { AIRewriteService } from "../../backbone/services/aiRewriteService";
import { useToast } from "../../context/ToastContext";

interface AIRewriteButtonProps {
	text: string;
	onRewrite: (newText: string) => void;
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
			className={cn(
				"p-2 rounded-xl transition-all",
				isLoading
					? "bg-purple-500 text-white shadow-lg shadow-purple-500/30"
					: "text-zen-text-muted hover:text-zen-text bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10",
				"disabled:opacity-50 disabled:cursor-not-allowed",
				className,
			)}
			title={isLoading ? "Rewriting..." : "Rewrite with AI"}
		>
			<Sparkles size={16} className={cn(isLoading && "animate-spin")} />
		</button>
	);
}
