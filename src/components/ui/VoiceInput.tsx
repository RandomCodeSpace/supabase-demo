import {
	makeStyles,
	tokens,
	Textarea,
	Button,
	shorthands,
	mergeClasses
} from "@fluentui/react-components";
import { MicRegular, MicFilled, bundleIcon } from "@fluentui/react-icons";
import { useEffect, useRef } from "react";
import { useSpeechRecognition } from "../../backbone/hooks/useSpeechRecognition";
import { AIRewriteButton } from "./AIRewriteButton";

const MicIcon = bundleIcon(MicFilled, MicRegular);

const useStyles = makeStyles({
	container: {
		position: "relative",
		display: "flex",
		flexDirection: "column",
		width: "100%",
	},
	textarea: {
		width: "100%",
		"& textarea": {
			minHeight: "80px", // equivalent to likely size
			maxHeight: "300px",
			resize: "none",
			fontFamily: tokens.fontFamilyBase,
			...shorthands.padding("12px", "12px", "48px", "12px"), // Bottom padding for actions
		}
	},
	actionsContainer: {
		position: "absolute",
		right: "8px",
		bottom: "8px",
		display: "flex",
		...shorthands.gap("4px"),
		zIndex: 10,
	},
	micActive: {
		backgroundColor: tokens.colorPaletteRedBackground3,
		color: tokens.colorNeutralForegroundOnBrand,
		"&:hover": {
			backgroundColor: tokens.colorPaletteRedBackground2,
		}
	}
});

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
	const styles = useStyles();
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
	}

	return (
		<div className={mergeClasses(styles.container, containerClassName)}>
			<Textarea
				value={value}
				onChange={handleOnChange}
				className={mergeClasses(styles.textarea, className)}
				placeholder={props.placeholder}
				onFocus={props.onFocus}
				// Fluent Textarea doesn't pass all props directly to textarea comfortably without slot props, trying direct
				textarea={{
					className: "min-h-[100px]" // fallback if styles fail or needed
				}}
			/>

			<div className={styles.actionsContainer}>
				{hasSupport && (
					<Button
						appearance={isListening ? "primary" : "subtle"}
						icon={<MicIcon />}
						onClick={handleToggleListening}
						className={isListening ? styles.micActive : undefined}
						title={isListening ? "Stop listening" : "Start dictation"}
						aria-label={isListening ? "Stop listening" : "Start dictation"}
					/>
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
