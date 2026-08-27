import type { AIRequestBody, AIResponse } from "@/lib/ai/tasks";

/** Browser-side helper. The API key never leaves the server. */
export async function callAI(body: AIRequestBody): Promise<AIResponse> {
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload: unknown = await res.json();
    if (payload && typeof payload === "object" && "ok" in payload) {
      return payload as AIResponse;
    }
    return { ok: false, code: "invalid_response", message: "Unexpected response from the server." };
  } catch (error) {
    return {
      ok: false,
      code: "request_failed",
      message: error instanceof Error ? error.message : "Network error.",
    };
  }
}

export async function fetchAIStatus(): Promise<boolean> {
  try {
    const res = await fetch("/api/ai");
    const payload = (await res.json()) as { configured?: boolean };
    return Boolean(payload.configured);
  } catch {
    return false;
  }
}
