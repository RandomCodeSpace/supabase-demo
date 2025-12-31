import { Mic, MicOff } from "lucide-react";
import { useEffect, useRef } from "react";
import { useSpeechRecognition } from "../../backbone/hooks/useSpeechRecognition";
import { AIRewriteButton } from "./AIRewriteButton"; // Verify this later
import clsx from "clsx";

interface VoiceInputProps {
	value: string;
	onValueChange: (value: string) => void;
	className?: string; // Legacy support or extra styling
	containerClassName?: string;
	rightElement?: React.ReactNode;
	aiContext?: string;
	enableAIRewrite?: boolean;
	onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
	placeholder?: string;
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

	const textBeforeListening = useRef("");

	useEffect(() => {
		if (isListening && transcript) {
			onValueChange(
				textBeforeListening.current
					? `${textBeforeListening.current} ${transcript}`
					: transcript
			);
		}
	}, [transcript, isListening, onValueChange]);

	const handleToggleListening = () => {
		if (isListening) {
			stopListening();
		} else {
			textBeforeListening.current = value;
			resetTranscript();
			startListening();
		}
	};

	const handleOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		onValueChange(e.target.value);
		if (!isListening) {
			textBeforeListening.current = e.target.value;
		}
	};

	return (
		<div className={clsx("relative w-full flex flex-col", containerClassName)}>
			<textarea
				value={value}
				onChange={handleOnChange}
				className={clsx(
					"w-full resize-none font-sans min-h-[50px] bg-transparent text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none",
					className
				)}
				placeholder={props.placeholder}
				onFocus={props.onFocus}
			/>

			{/* Actions - overlaid or adjacent usually? 
               In the legacy design, they were absolute bottom-right.
               We can keep that or make them inline. 
               Given the usage in ProjectDetailModal, it's wrapped in a flex container row.
               So maybe we just return the textarea here and let the parent handle layout?
               
               Legacy VoiceInput was self-contained with buttons inside.
               Let's render them absolutely positioned inside the container if it's meant to be a wrapper.
            */}
			<div className="absolute right-2 bottom-2 flex gap-1 z-10">
				{hasSupport && (
					<button
						type="button"
						onClick={handleToggleListening}
						className={clsx(
							"p-2 rounded-full transition-all",
							isListening
								? "bg-[var(--color-error)] text-white animate-pulse"
								: "bg-white/5 text-[var(--text-secondary)] hover:bg-white/10"
						)}
						title={isListening ? "Stop listening" : "Start dictation"}
					>
						{isListening ? <MicOff size={16} /> : <Mic size={16} />}
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
