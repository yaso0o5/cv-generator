import {
  AIConfigError,
  AIRequestError,
  AIResponseError,
  getProvider,
  isAIConfigured,
  parseJSONResponse,
} from "@/lib/ai/provider";
import { TASK_KIND, buildPrompt, type AIRequestBody, type AIResponse } from "@/lib/ai/tasks";
import type { AtsReport } from "@/types/cv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(body: AIResponse, status = 200) {
  return Response.json(body, { status });
}

function num(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function strings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string" && v.trim() !== "").slice(0, 20);
}

export async function GET() {
  return Response.json({ configured: isAIConfigured() });
}

export async function POST(request: Request) {
  let body: AIRequestBody;
  try {
    body = (await request.json()) as AIRequestBody;
  } catch {
    return json({ ok: false, code: "bad_request", message: "Invalid request body." }, 400);
  }

  if (!body || typeof body.task !== "string" || !(body.task in TASK_KIND)) {
    return json({ ok: false, code: "bad_request", message: "Unknown AI task." }, 400);
  }

  const kind = TASK_KIND[body.task];
  const hasContent =
    (body.input && body.input.trim()) ||
    (body.cvText && body.cvText.trim()) ||
    (body.jobDescription && body.jobDescription.trim());
  if (!hasContent) {
    return json(
      { ok: false, code: "bad_request", message: "There is nothing to send yet. Add some content first." },
      400,
    );
  }

  try {
    const provider = getProvider();
    const { system, prompt, json: wantsJSON } = buildPrompt(body);
    const raw = await provider.complete({ system, prompt, json: wantsJSON });

    if (kind === "text") {
      return json({ ok: true, model: provider.model, result: { kind: "text", text: raw } });
    }

    if (kind === "list") {
      const parsed = parseJSONResponse<{ skills?: unknown; items?: unknown }>(raw);
      const items = strings(parsed.skills ?? parsed.items);
      if (items.length === 0) {
        throw new AIResponseError("The AI returned no usable suggestions.");
      }
      return json({ ok: true, model: provider.model, result: { kind: "list", items } });
    }

    const parsed = parseJSONResponse<Record<string, unknown>>(raw);
    const report: AtsReport = {
      overall: num(parsed.overall),
      keywordMatch: num(parsed.keywordMatch),
      skillsMatch: num(parsed.skillsMatch),
      experienceQuality: num(parsed.experienceQuality),
      formatting: num(parsed.formatting),
      missingKeywords: strings(parsed.missingKeywords),
      matchedKeywords: strings(parsed.matchedKeywords),
      suggestions: strings(parsed.suggestions),
      source: "ai",
    };
    return json({ ok: true, model: provider.model, result: { kind: "report", report } });
  } catch (error) {
    if (error instanceof AIConfigError) {
      return json({ ok: false, code: "missing_key", message: error.message }, 200);
    }
    if (error instanceof AIResponseError) {
      return json({ ok: false, code: "invalid_response", message: error.message }, 502);
    }
    if (error instanceof AIRequestError) {
      return json({ ok: false, code: "request_failed", message: error.message }, 502);
    }
    return json(
      {
        ok: false,
        code: "request_failed",
        message: error instanceof Error ? error.message : "The AI request failed.",
      },
      500,
    );
  }
}
