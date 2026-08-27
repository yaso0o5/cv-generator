import type { AtsReport } from "@/types/cv";

export type AITask =
  | "improve_summary"
  | "improve_experience"
  | "generate_project"
  | "suggest_skills"
  | "rewrite"
  | "analyze_cv"
  | "ats_score"
  | "jd_match"
  | "generate_summary"
  | "tailor_summary"
  | "cover_letter"
  | "interview_prep";

export interface AIRequestBody {
  task: AITask;
  /** Free text the task operates on (summary, bullet block, prompt). */
  input?: string;
  /** Plain-text rendering of the whole CV, used by the analysis tasks. */
  cvText?: string;
  /** Pasted job description for match / ATS tasks. */
  jobDescription?: string;
  context?: Record<string, string>;
}

export type AIErrorCode =
  | "missing_key"
  | "request_failed"
  | "invalid_response"
  | "bad_request";

export interface AITextResult {
  kind: "text";
  text: string;
}

export interface AIListResult {
  kind: "list";
  items: string[];
}

export interface AIReportResult {
  kind: "report";
  report: AtsReport;
}

export type AIResult = AITextResult | AIListResult | AIReportResult;

export interface AISuccess {
  ok: true;
  result: AIResult;
  model: string;
}

export interface AIFailure {
  ok: false;
  code: AIErrorCode;
  message: string;
}

export type AIResponse = AISuccess | AIFailure;

export const TASK_KIND: Record<AITask, AIResult["kind"]> = {
  improve_summary: "text",
  improve_experience: "text",
  generate_project: "text",
  suggest_skills: "list",
  rewrite: "text",
  analyze_cv: "report",
  ats_score: "report",
  jd_match: "report",
  generate_summary: "text",
  tailor_summary: "text",
  cover_letter: "text",
  interview_prep: "text",
};

const WRITER_SYSTEM =
  "You are a senior technical recruiter and CV editor. You write in plain, concrete British-English prose. " +
  "You never invent employers, dates, or metrics that are not present in the input. " +
  "You avoid marketing adjectives and never use em dashes. Return only the requested content, no preamble.";

const ANALYST_SYSTEM =
  "You are an applicant tracking system (ATS) analyst. You return strict JSON only, matching the requested schema exactly. " +
  "Scores are integers from 0 to 100. Suggestions are short, specific and actionable.";

const REPORT_SCHEMA = `{
  "overall": number,
  "keywordMatch": number,
  "skillsMatch": number,
  "experienceQuality": number,
  "formatting": number,
  "missingKeywords": string[],
  "matchedKeywords": string[],
  "suggestions": string[]
}`;

export function buildPrompt(body: AIRequestBody): {
  system: string;
  prompt: string;
  json: boolean;
} {
  const input = (body.input ?? "").slice(0, 6000);
  const cvText = (body.cvText ?? "").slice(0, 12000);
  const jd = (body.jobDescription ?? "").slice(0, 8000);
  const role = body.context?.role ?? "";
  const company = body.context?.company ?? "";

  switch (body.task) {
    case "generate_summary":
      return {
        system: WRITER_SYSTEM,
        json: false,
        prompt: `Write a strong CV professional summary in 3 sentences or fewer using only facts supported by this CV. Prioritise the target role if one is provided. Do not invent years, employers, metrics, technologies, or achievements.\n\nTarget role: ${role || "not specified"}\n\nCV:\n${cvText}`,
      };
    case "tailor_summary":
      return {
        system: WRITER_SYSTEM,
        json: false,
        prompt: `Tailor this professional summary to the target job. Keep every factual claim supported by the CV, naturally use relevant terms from the job description, and keep it to 3 sentences or fewer. Do not claim experience with a skill unless the CV supports it.\n\nCurrent summary:\n${input}\n\nJob description:\n${jd}\n\nFull CV:\n${cvText}`,
      };
    case "cover_letter":
      return {
        system: WRITER_SYSTEM,
        json: false,
        prompt: `Write a concise, specific cover letter for this job using only facts from the CV. Use 3 short paragraphs plus a brief closing. Connect the candidate's real experience to the job requirements. Do not invent employers, dates, metrics, projects, or skills. Avoid generic phrases and em dashes.\n\nJob description:\n${jd}\n\nCV:\n${cvText}`,
      };
    case "interview_prep":
      return {
        system: WRITER_SYSTEM,
        json: false,
        prompt: `Create an interview preparation sheet for this candidate and job. Give 8 likely interview questions, followed by a short bullet-point answer strategy for each based only on the CV. Flag any question where the CV does not provide enough evidence instead of inventing an answer. Finish with 5 smart questions the candidate can ask the employer.\n\nJob description:\n${jd}\n\nCV:\n${cvText}`,
      };
    case "improve_summary":
      return {
        system: WRITER_SYSTEM,
        json: false,
        prompt: `Rewrite this CV professional summary in 3 sentences or fewer. Keep every fact. Lead with years of experience and domain, then the strongest measurable result.\n\nSummary:\n${input}\n\nRest of the CV for context:\n${cvText}`,
      };
    case "improve_experience":
      return {
        system: WRITER_SYSTEM,
        json: false,
        prompt: `Rewrite these work experience bullet points for the role of ${role || "the listed role"}${company ? ` at ${company}` : ""}. One bullet per line, no leading dashes, each starting with a past-tense verb, each ending with the outcome. Keep existing numbers, do not invent new ones.\n\nBullets:\n${input}`,
      };
    case "generate_project":
      return {
        system: WRITER_SYSTEM,
        json: false,
        prompt: `Write a 2 sentence CV description for this project. State what it does, the stack, and the result.\n\nProject name: ${body.context?.name ?? ""}\nStack: ${body.context?.tech ?? ""}\nNotes: ${input}`,
      };
    case "suggest_skills":
      return {
        system: ANALYST_SYSTEM,
        json: true,
        prompt: `Suggest 12 skills that belong on this CV and are not already listed. Return JSON: {"skills": string[]}.\n\nCV:\n${cvText}\n\n${jd ? `Target job description:\n${jd}` : ""}`,
      };
    case "rewrite":
      return {
        system: WRITER_SYSTEM,
        json: false,
        prompt: `Rewrite the following text so it reads professionally on a CV. Same length or shorter. Keep all facts.\n\n${input}`,
      };
    case "analyze_cv":
      return {
        system: ANALYST_SYSTEM,
        json: true,
        prompt: `Analyse this CV for general quality and ATS readability. Return JSON matching ${REPORT_SCHEMA}. missingKeywords should list terms a recruiter in this field would expect but cannot find.\n\nCV:\n${cvText}`,
      };
    case "ats_score":
      return {
        system: ANALYST_SYSTEM,
        json: true,
        prompt: `Score this CV as an ATS would parse it. Return JSON matching ${REPORT_SCHEMA}.\n\nCV:\n${cvText}`,
      };
    case "jd_match":
      return {
        system: ANALYST_SYSTEM,
        json: true,
        prompt: `Compare this CV against the job description. Return JSON matching ${REPORT_SCHEMA}, where keywordMatch reflects overlap with the job description and missingKeywords lists job description terms absent from the CV.\n\nJob description:\n${jd}\n\nCV:\n${cvText}`,
      };
  }
}
