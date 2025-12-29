/**
 * AI Rewrite Service
 * Uses Supabase Edge Function to proxy Ollama Cloud
 */

import { supabase } from "../lib/supabase";
import {
	AI_ENABLED,
} from "../lib/aiConfig";

export interface RewriteResult {
	success: boolean;
	text: string;
	error?: string;
}

class AIRewriteServiceClass {
	/**
	 * Check if AI features are enabled
	 */
	isEnabled(): boolean {
		return AI_ENABLED;
	}

	/**
	 * Rewrite text using AI via Supabase Edge Function
	 * @param text The text to rewrite
	 * @param context Optional context about where the text is being used
	 */
	async rewriteText(text: string, context?: string): Promise<RewriteResult> {
		if (!this.isEnabled()) {
			return {
				success: false,
				text,
				error: "AI features are not enabled",
			};
		}

		if (!text.trim()) {
			return {
				success: false,
				text,
				error: "No text to rewrite",
			};
		}

		try {
			const { data, error } = await supabase.functions.invoke("ai-proxy", {
				body: {
					message: text,
					context: context,
					model: "gemini-3-flash-preview"
				},
			});

			if (error) {
				throw error;
			}

			if (data?.error) {
				throw new Error(data.error);
			}

			return {
				success: true,
				text: data.text || text,
			};

		} catch (error) {
			console.error("AI Rewrite error:", error);

			let errorMessage = "Failed to rewrite text";
			if (error instanceof Error) {
				errorMessage = error.message;
			}

			return {
				success: false,
				text,
				error: errorMessage,
			};
		}
	}
}

export const AIRewriteService = new AIRewriteServiceClass();
