import { Mic } from "lucide-react";
import { useEffect, useRef } from "react";
import { useSpeechRecognition } from "../../backbone/hooks/useSpeechRecognition";
import { cn } from "../../backbone/lib/utils";
import { AIRewriteButton } from "./AIRewriteButton";

interface VoiceInputProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	value: string;
	onValueChange: (value: string) => void;
	className?: string;
	containerClassName?: string;
	rightElement?: React.ReactNode;
	/** Context for AI rewrite (e.g., "a habit title", "a project description") */
	aiContext?: string;
	/** Enable or disable AI rewrite button (defaults to true if AI is enabled globally) */
	enableAIRewrite?: boolean;
}

export function VoiceInput({
	value,
	onValueChange,
	className,
	containerClassName,
	rightElement,
	aiContext,
	enableAIRewrite = true,
	...props
}: VoiceInputProps) {
	const {
		isListening,
		transcript,
		resetTranscript,
		startListening,
		stopListening,
		hasSupport,
	} = useSpeechRecognition();

	// Effect to update value with transcript
	// We capture the text *before* listening started to append properly
	const textBeforeListening = useRef("");

	useEffect(() => {
		if (isListening) {
			// If this is a new listening session (transcript just started), we might want to capture the current value
			// But managing "when session started" vs "transcript update" in a purely reactive way is tricky.
			// Simplest "append" logic:
			if (transcript) {
				onValueChange(
					textBeforeListening.current
						? `${textBeforeListening.current} ${transcript}`
						: transcript,
				);
			}
		} else {
			// When not listening, update our ref so next time we start, we know what base text we have
			// However, we only want to update this if we are NOT currently in the middle of receiving a transcript
			// This is handled by the toggle function logic below mostly, but good to keep in sync.
		}
	}, [transcript, isListening, onValueChange]);

	const handleToggleListening = () => {
		if (isListening) {
			stopListening();
		} else {
			textBeforeListening.current = value; // Snapshot current text
			resetTranscript(); // Clear any old transcript
			startListening();
		}
	};

	return (
		<div className={cn("relative flex items-end", containerClassName)}>
			<textarea
				value={value}
				onChange={(e) => {
					onValueChange(e.target.value);
					if (!isListening) {
						textBeforeListening.current = e.target.value;
					}
				}}
				onFocus={(e) => {
					e.target.scrollIntoView({ behavior: "smooth", block: "center" });
					props.onFocus?.(e);
				}}
				className={cn(
					"w-full bg-transparent border border-white/10 rounded-2xl pl-4 py-3 text-zen-text focus:outline-none focus:border-zen-primary transition-colors resize-none text-sm leading-relaxed placeholder:text-zen-text-muted/50",
					// Add extra padding if there is a right element (like a Send button)
					rightElement ? "pr-24" : "pr-12",
					className,
				)}
				{...props}
			/>

			<div className="absolute right-2 bottom-2 flex items-center gap-1.5 z-10">
				{hasSupport && (
					<button
						type="button"
						onClick={handleToggleListening}
						className={cn(
							"p-2 rounded-xl transition-all",
							isListening
								? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30"
								: "text-zen-text-muted hover:text-zen-text bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10",
						)}
						title={isListening ? "Stop listening" : "Start dictation"}
					>
						<Mic size={16} />
					</button>
				)}

				{enableAIRewrite && (
					<AIRewriteButton
						text={value}
						onRewrite={onValueChange}
						context={aiContext}
					/>
				)}

				{rightElement}
			</div>
		</div>
	);
}
