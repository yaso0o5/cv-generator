/**
 * Server-only AI abstraction.
 *
 * The rest of the app never imports a vendor SDK: it calls `runCompletion`.
 * Swapping provider means writing another object with the same shape and
 * returning it from `getProvider()`.
 *
 * Configuration comes from environment variables only:
 *   AI_API_KEY   (required, server-side, never NEXT_PUBLIC_*)
 *   AI_BASE_URL  (optional, defaults to the OpenAI-compatible endpoint)
 *   AI_MODEL     (optional)
 */
import "server-only";

export class AIConfigError extends Error {
  code = "missing_key" as const;
  constructor(message = "AI is not configured on this server.") {
    super(message);
  }
}

export class AIRequestError extends Error {
  code = "request_failed" as const;
}

export class AIResponseError extends Error {
  code = "invalid_response" as const;
}

export interface CompletionInput {
  system: string;
  prompt: string;
  json?: boolean;
  temperature?: number;
  maxTokens?: number;
}

export interface AIProvider {
  id: string;
  model: string;
  complete(input: CompletionInput): Promise<string>;
}

export function isAIConfigured(): boolean {
  return Boolean(process.env.AI_API_KEY);
}

function openAICompatibleProvider(apiKey: string): AIProvider {
  const baseUrl = (process.env.AI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.AI_MODEL ?? "gpt-4o-mini";
  return {
    id: "openai-compatible",
    model,
    async complete({ system, prompt, json, temperature = 0.4, maxTokens = 900 }) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 45_000);
      try {
        const res = await fetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            temperature,
            max_tokens: maxTokens,
            ...(json ? { response_format: { type: "json_object" } } : {}),
            messages: [
              { role: "system", content: system },
              { role: "user", content: prompt },
            ],
          }),
          signal: controller.signal,
        });
        if (!res.ok) {
          const body = await res.text().catch(() => "");
          throw new AIRequestError(
            `The AI provider returned ${res.status}. ${body.slice(0, 180)}`.trim(),
          );
        }
        const payload: unknown = await res.json();
        const content = (payload as { choices?: { message?: { content?: string } }[] })
          ?.choices?.[0]?.message?.content;
        if (typeof content !== "string" || content.trim() === "") {
          throw new AIResponseError("The AI provider returned an empty response.");
        }
        return content.trim();
      } catch (error) {
        if (error instanceof AIRequestError || error instanceof AIResponseError) throw error;
        if (error instanceof DOMException && error.name === "AbortError") {
          throw new AIRequestError("The AI request timed out after 45 seconds.");
        }
        throw new AIRequestError(
          error instanceof Error ? error.message : "The AI request failed.",
        );
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}

export function getProvider(): AIProvider {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    throw new AIConfigError(
      "Set AI_API_KEY in your environment to enable the AI writing tools.",
    );
  }
  return openAICompatibleProvider(apiKey);
}

export async function runCompletion(input: CompletionInput): Promise<string> {
  return getProvider().complete(input);
}

export function parseJSONResponse<T>(raw: string): T {
  const cleaned = raw
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1)) as T;
      } catch {
        /* fall through */
      }
    }
    throw new AIResponseError("The AI response was not valid JSON.");
  }
}
