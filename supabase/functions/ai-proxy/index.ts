// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

console.log("Hello from AI Proxy!");

Deno.serve(async (req) => {
    // Handle CORS
    if (req.method === "OPTIONS") {
        return new Response("ok", {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
            },
        });
    }

    try {
        const { message, context, model = "gemini-3-flash-preview", temperature = 0.7 } = await req.json();

        if (!message) {
            return new Response(JSON.stringify({ success: false, error: "Message is required" }), {
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            });
        }

        // Get API key from Supabase Secrets
        const apiKey = Deno.env.get("OLLAMA_CLOUD_KEY");
        if (!apiKey) {
            // Return 200 with error to be visible in client
            return new Response(JSON.stringify({ success: false, error: "OLLAMA_CLOUD_KEY is not set in Edge Function secrets" }), {
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            });
        }

        console.log(`Rewriting text with model ${model}...`);

        let systemPrompt = `You are a helpful writing assistant. Your task is to improve and rewrite the given text to make it:
- More clear and concise
- Grammatically correct
- Well-structured and professional

Important rules:
1. Keep the original meaning and intent
2. Return ONLY the rewritten text, no explanations
3. Maintain the same language as the input
4. If the input is very short (1-3 words), expand it slightly into a proper phrase/sentence`;

        if (context) {
            systemPrompt += `\n\nContext: This text is being used for ${context}.`;
        }

        // Call Ollama Cloud API
        const response = await fetch("https://ollama.com/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                stream: false,
                options: {
                    temperature: temperature
                }
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Ollama API Error:", errorText);
            // Return 200 but with success: false to surface error to client
            return new Response(JSON.stringify({
                success: false,
                error: `Ollama Cloud Error (${response.status}): ${errorText || response.statusText}`
            }), {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
            });
        }

        const data = await response.json();
        const rewrittenText = data.message?.content || "";

        return new Response(JSON.stringify({ success: true, text: rewrittenText }), {
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
        });

    } catch (error) {
        console.error("Proxy Error:", error);
        // Return 200 with error details
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
        });
    }
});
