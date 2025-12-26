import { useCallback, useEffect, useRef, useState } from "react";

export function useSpeechRecognition() {
	const [isListening, setIsListening] = useState(false);
	const [transcript, setTranscript] = useState("");
	const [error, setError] = useState<string | null>(null);

	// Use a ref to keep track of the recognition instance
	const recognitionRef = useRef<SpeechRecognition | null>(null);

	useEffect(() => {
		// Check for browser support
		const SpeechRecognition =
			window.SpeechRecognition || window.webkitSpeechRecognition;

		if (!SpeechRecognition) {
			setError("Speech recognition is not supported in this browser.");
			return;
		}

		const recognition = new SpeechRecognition();
		recognition.continuous = true;
		recognition.interimResults = true;
		recognition.lang = "en-US";

		recognition.onstart = () => {
			setIsListening(true);
			setError(null);
		};

		recognition.onresult = (event: SpeechRecognitionEvent) => {
			let _finalTranscript = "";

			for (let i = event.resultIndex; i < event.results.length; i++) {
				const result = event.results[i];
				if (result.isFinal) {
					_finalTranscript += result[0].transcript;
				} else {
					// Handle interim results if needed, for now we effectively just use the latest checks
				}
			}

			// Simple approach: just append the very last result
			// Actually, for continuous dictation, we often want to append to existing text.
			// But this hook mainly exposes the *current session's* transcript.

			// Refined approach: accumulate current session results
			const currentTranscript = Array.from(event.results)
				.map((result) => result[0].transcript)
				.join("");

			setTranscript(currentTranscript);
		};

		recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
			console.error("Speech recognition error", event.error);
			setError(`Error: ${event.error}`);
			setIsListening(false);
		};

		recognition.onend = () => {
			setIsListening(false);
		};

		recognitionRef.current = recognition;

		return () => {
			if (recognitionRef.current) {
				recognitionRef.current.stop();
			}
		};
	}, []);

	const startListening = useCallback(() => {
		if (recognitionRef.current && !isListening) {
			setTranscript(""); // Clear previous session
			try {
				recognitionRef.current.start();
			} catch (e) {
				console.error("Start error:", e);
			}
		}
	}, [isListening]);

	const stopListening = useCallback(() => {
		if (recognitionRef.current && isListening) {
			recognitionRef.current.stop();
		}
	}, [isListening]);

	const resetTranscript = useCallback(() => {
		setTranscript("");
	}, []);

	return {
		isListening,
		transcript,
		resetTranscript,
		startListening,
		stopListening,
		error,
		hasSupport: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
	};
}

// Add TypeScript definitions for Web Speech API
declare global {
	interface Window {
		// biome-ignore lint/suspicious/noExplicitAny: Web Speech API types are not standard
		SpeechRecognition: any;
		// biome-ignore lint/suspicious/noExplicitAny: Web Speech API types are not standard
		webkitSpeechRecognition: any;
	}

	interface SpeechRecognition extends EventTarget {
		continuous: boolean;
		interimResults: boolean;
		lang: string;
		start(): void;
		stop(): void;
		// biome-ignore lint/suspicious/noExplicitAny: standard event type
		onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
		// biome-ignore lint/suspicious/noExplicitAny: standard event type
		onresult:
			| ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any)
			| null;
		// biome-ignore lint/suspicious/noExplicitAny: standard event type
		onerror:
			| ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any)
			| null;
		// biome-ignore lint/suspicious/noExplicitAny: standard event type
		onend: ((this: SpeechRecognition, ev: Event) => any) | null;
	}

	interface SpeechRecognitionEvent extends Event {
		resultIndex: number;
		results: SpeechRecognitionResultList;
	}

	interface SpeechRecognitionResultList {
		readonly length: number;
		item(index: number): SpeechRecognitionResult;
		[index: number]: SpeechRecognitionResult;
	}

	interface SpeechRecognitionResult {
		readonly isFinal: boolean;
		readonly length: number;
		item(index: number): SpeechRecognitionAlternative;
		[index: number]: SpeechRecognitionAlternative;
	}

	interface SpeechRecognitionAlternative {
		readonly transcript: string;
		readonly confidence: number;
	}

	interface SpeechRecognitionErrorEvent extends Event {
		error: string;
		message: string;
	}
}
