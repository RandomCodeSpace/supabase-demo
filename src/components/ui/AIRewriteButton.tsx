import {
	Button,
	makeStyles
} from "@fluentui/react-components";
import { SparkleRegular, SparkleFilled, bundleIcon } from "@fluentui/react-icons";
import { useState } from "react";
import { AIRewriteService } from "../../backbone/services/aiRewriteService";
import { useToast } from "../../context/ToastContext";

const SparkleIcon = bundleIcon(SparkleFilled, SparkleRegular);

const useStyles = makeStyles({
	loading: {
		animationDuration: "2s",
		animationIterationCount: "infinite",
		animationName: {
			from: { transform: "rotate(0deg)" },
			to: { transform: "rotate(360deg)" },
		},
		animationTimingFunction: "linear",
	}
});

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
	const styles = useStyles();

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
		<Button
			appearance="subtle"
			icon={<SparkleIcon className={isLoading ? styles.loading : undefined} />}
			onClick={handleRewrite}
			disabled={!text.trim() || isLoading}
			className={className}
			title={isLoading ? "Rewriting..." : "Rewrite with AI"}
			aria-label="Rewrite text with AI"
		/>
	);
}
