import type { AtsReport, CVRecord } from "@/types/cv";
import { cvToPlainText } from "@/lib/cv/defaults";

const STOP_WORDS = new Set(
  ("a an the and or of to in for with on at by from as is are be we you your our their this that " +
    "will they it its have has who what which such other more most using use used able role job " +
    "team work working experience years year including etc across into about over under also can").split(
    " ",
  ),
);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#./ -]/g, " ")
    .split(/[\s/,]+/)
    .map((t) => t.replace(/^[-.]+|[-.]+$/g, ""))
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * Deterministic, offline ATS heuristic. It always works, with or without an
 * AI key, and gives the AI report something to fall back to.
 */
export function analyzeLocally(record: CVRecord, jobDescription = ""): AtsReport {
  const d = record.data;
  const cvText = cvToPlainText(record);
  const cvTokens = new Set(tokenize(cvText));

  const suggestions: string[] = [];

  // Formatting: contact completeness, section presence, bullet hygiene.
  let formatting = 100;
  const contact = [d.personal.fullName, d.personal.email, d.personal.phone, d.personal.location];
  const missingContact = contact.filter((v) => !v.trim()).length;
  formatting -= missingContact * 10;
  if (!d.summary.trim()) {
    formatting -= 8;
    suggestions.push("Add a professional summary. Most recruiters read it first.");
  }
  if (d.experience.length === 0) {
    formatting -= 20;
    suggestions.push("Add at least one work experience entry with dates.");
  }
  if (d.skills.length === 0) {
    formatting -= 10;
    suggestions.push("Add a skills section. Parsers look for it by name.");
  }
  if (missingContact > 0) {
    suggestions.push("Complete your contact details: name, email, phone and location.");
  }
  if (record.template === "creative") {
    formatting -= 6;
    suggestions.push(
      "Two-column layouts can confuse older parsers. Use the ATS template when applying through a portal.",
    );
  }

  // Experience quality: measurable results, verbs, bullet length.
  const bullets = d.experience.flatMap((e) =>
    e.description.split("\n").map((b) => b.trim()).filter(Boolean),
  );
  const withNumbers = bullets.filter((b) => /\d/.test(b)).length;
  const tooLong = bullets.filter((b) => b.split(" ").length > 34).length;
  let experienceQuality = 40;
  if (bullets.length) {
    experienceQuality =
      40 + Math.min(30, bullets.length * 5) + (withNumbers / bullets.length) * 30 - tooLong * 4;
  }
  if (bullets.length && withNumbers / bullets.length < 0.4) {
    suggestions.push(
      "Only " +
        withNumbers +
        " of " +
        bullets.length +
        " bullets contain a number. Quantify scope, volume or time saved.",
    );
  }
  if (tooLong) {
    suggestions.push(`${tooLong} bullet(s) run past 34 words. Split them into single results.`);
  }
  const undated = d.experience.filter((e) => !e.start || (!e.end && !e.current)).length;
  if (undated) {
    suggestions.push(`${undated} experience entry(ies) are missing start or end dates.`);
    formatting -= undated * 5;
  }

  // Skills coverage.
  const skillCount = d.skills.reduce(
    (acc, g) => acc + g.items.split(",").filter((s) => s.trim()).length,
    0,
  );
  let skillsMatch = clamp(skillCount * 5);
  if (skillCount < 8) {
    suggestions.push("List at least 8 concrete skills, grouped by type.");
  }

  // Keyword match against the job description.
  let keywordMatch = 60;
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];
  if (jobDescription.trim()) {
    const freq = new Map<string, number>();
    for (const token of tokenize(jobDescription)) {
      freq.set(token, (freq.get(token) ?? 0) + 1);
    }
    const ranked = [...freq.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 40)
      .map(([t]) => t);
    for (const term of ranked) {
      if (cvTokens.has(term)) matchedKeywords.push(term);
      else missingKeywords.push(term);
    }
    keywordMatch = ranked.length ? (matchedKeywords.length / ranked.length) * 100 : 60;
    const jdSkillHits = missingKeywords.slice(0, 6);
    if (jdSkillHits.length) {
      suggestions.push(
        `Work these job description terms into your CV where they are true: ${jdSkillHits.join(", ")}.`,
      );
    }
    skillsMatch = clamp((skillsMatch + keywordMatch) / 2);
  } else {
    suggestions.push("Paste a job description to score keyword coverage against a real vacancy.");
  }

  formatting = clamp(formatting);
  experienceQuality = clamp(experienceQuality);
  keywordMatch = clamp(keywordMatch);

  const overall = clamp(
    keywordMatch * 0.3 + skillsMatch * 0.2 + experienceQuality * 0.3 + formatting * 0.2,
  );

  return {
    overall,
    keywordMatch,
    skillsMatch,
    experienceQuality,
    formatting,
    missingKeywords: missingKeywords.slice(0, 18),
    matchedKeywords: matchedKeywords.slice(0, 18),
    suggestions: suggestions.slice(0, 8),
    source: "local",
  };
}
