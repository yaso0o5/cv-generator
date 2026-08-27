import type { CVData, SectionKey } from "@/types/cv";

export interface TemplateProps {
  data: CVData;
}

export function visibleSections(data: CVData): SectionKey[] {
  return data.sectionOrder.filter((key) => !data.hiddenSections.includes(key) && hasContent(data, key));
}

export function hasContent(data: CVData, key: SectionKey): boolean {
  switch (key) {
    case "summary":
      return data.summary.trim().length > 0;
    case "experience":
      return data.experience.length > 0;
    case "education":
      return data.education.length > 0;
    case "skills":
      return data.skills.length > 0;
    case "projects":
      return data.projects.length > 0;
    case "certifications":
      return data.certifications.length > 0;
    case "languages":
      return data.languages.length > 0;
    case "links":
      return data.links.length > 0;
    case "custom":
      return data.customSections.some((s) => s.title.trim() || s.entries.length > 0);
  }
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatDate(value: string): string {
  if (!value) return "";
  const match = /^(\d{4})-(\d{2})$/.exec(value.trim());
  if (match) {
    const month = MONTHS[Number(match[2]) - 1] ?? "";
    return `${month} ${match[1]}`.trim();
  }
  return value;
}

export function dateRange(start: string, end: string, current?: boolean): string {
  const from = formatDate(start);
  const to = current ? "Present" : formatDate(end);
  if (!from && !to) return "";
  if (!from) return to;
  if (!to) return from;
  return `${from} - ${to}`;
}

export function bullets(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.replace(/^\s*[-•*]\s*/, "").trim())
    .filter(Boolean);
}

export function contactLine(data: CVData): string[] {
  const p = data.personal;
  return [p.email, p.phone, p.location, p.website].filter((v) => v && v.trim());
}

export function skillList(data: CVData): { label: string; items: string[] }[] {
  return data.skills.map((g) => ({
    label: g.label,
    items: g.items
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  }));
}
