import type { CVData, CVRecord, SectionKey, TemplateId } from "@/types/cv";

export function uid(prefix = "id"): string {
  const rnd = Math.random().toString(36).slice(2, 9);
  return `${prefix}_${Date.now().toString(36)}${rnd}`;
}

export const SECTION_LABELS: Record<SectionKey, string> = {
  summary: "Professional summary",
  experience: "Work experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  languages: "Languages",
  links: "Links",
  custom: "Custom sections",
};

export const DEFAULT_ORDER: SectionKey[] = [
  "summary",
  "experience",
  "projects",
  "education",
  "skills",
  "certifications",
  "languages",
  "links",
  "custom",
];

export function emptyCVData(): CVData {
  return {
    personal: {
      fullName: "",
      headline: "",
      email: "",
      phone: "",
      location: "",
      website: "",
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    links: [],
    customSections: [],
    sectionOrder: [...DEFAULT_ORDER],
    hiddenSections: [],
    accent: "#b0442a",
  };
}

export function sampleCVData(): CVData {
  return {
    personal: {
      fullName: "Marta Køhler",
      headline: "Senior Backend Engineer",
      email: "marta.kohler@fastmail.com",
      phone: "+45 31 44 08 12",
      location: "Copenhagen, Denmark",
      website: "martakohler.dev",
    },
    summary:
      "Backend engineer with 9 years building payment and ledger systems in Go and TypeScript. Led the migration of Nordbank's settlement pipeline from nightly batch to event streaming, cutting reconciliation time from 6 hours to 11 minutes. Comfortable owning a service from schema design through on-call.",
    experience: [
      {
        id: uid("exp"),
        role: "Senior Backend Engineer",
        company: "Nordbank",
        location: "Copenhagen",
        start: "2021-03",
        end: "",
        current: true,
        description:
          "Owned the settlement platform processing 4.2M transactions a day.\nRebuilt reconciliation on Kafka and Postgres, reducing the nightly close from 6h to 11min.\nMentored 4 engineers and ran the hiring loop for the payments team.",
      },
      {
        id: uid("exp"),
        role: "Backend Engineer",
        company: "Pleo",
        location: "Copenhagen",
        start: "2018-01",
        end: "2021-02",
        current: false,
        description:
          "Built the card authorisation service in Go, 99.98% availability over 3 years.\nIntroduced contract testing across 12 services, cutting integration bugs by roughly half.",
      },
    ],
    education: [
      {
        id: uid("edu"),
        degree: "MSc Computer Science",
        school: "DTU Technical University of Denmark",
        location: "Lyngby",
        start: "2014",
        end: "2016",
        details: "Thesis on distributed consensus in low-latency trading systems.",
      },
    ],
    skills: [
      { id: uid("sk"), label: "Languages", items: "Go, TypeScript, Python, SQL" },
      {
        id: uid("sk"),
        label: "Infrastructure",
        items: "Kafka, Postgres, Kubernetes, Terraform, AWS",
      },
      { id: uid("sk"), label: "Practices", items: "Event sourcing, TDD, observability, on-call" },
    ],
    projects: [
      {
        id: uid("prj"),
        name: "ledgerkit",
        role: "Author",
        url: "github.com/mkohler/ledgerkit",
        description:
          "Open source double-entry ledger library for Go. 1,340 stars, used in production by three fintechs.",
        tech: "Go, Postgres",
      },
    ],
    certifications: [
      {
        id: uid("cert"),
        name: "AWS Solutions Architect, Professional",
        issuer: "Amazon Web Services",
        date: "2023",
      },
    ],
    languages: [
      { id: uid("lng"), name: "Danish", level: "Native" },
      { id: uid("lng"), name: "English", level: "Fluent" },
      { id: uid("lng"), name: "German", level: "Conversational" },
    ],
    links: [
      { id: uid("lnk"), label: "GitHub", url: "github.com/mkohler" },
      { id: uid("lnk"), label: "LinkedIn", url: "linkedin.com/in/martakohler" },
    ],
    customSections: [],
    sectionOrder: [...DEFAULT_ORDER],
    hiddenSections: [],
    accent: "#b0442a",
  };
}

export function createCV(
  name = "Untitled CV",
  template: TemplateId = "modern",
  data: CVData = emptyCVData(),
): CVRecord {
  const now = new Date().toISOString();
  return { id: uid("cv"), name, template, data, createdAt: now, updatedAt: now };
}

/** Fills in anything missing so older/partial records never crash the editor. */
export function normalizeCV(input: unknown): CVRecord | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Partial<CVRecord>;
  if (!raw.id || typeof raw.id !== "string") return null;
  const base = emptyCVData();
  const data = { ...base, ...(raw.data ?? {}) } as CVData;
  data.personal = { ...base.personal, ...(raw.data?.personal ?? {}) };
  const arrays = [
    "experience",
    "education",
    "skills",
    "projects",
    "certifications",
    "languages",
    "links",
    "customSections",
  ] as const;
  for (const key of arrays) {
    if (!Array.isArray(data[key])) {
      (data[key] as unknown) = [];
    }
  }
  if (!Array.isArray(data.sectionOrder) || data.sectionOrder.length === 0) {
    data.sectionOrder = [...DEFAULT_ORDER];
  } else {
    for (const key of DEFAULT_ORDER) {
      if (!data.sectionOrder.includes(key)) data.sectionOrder.push(key);
    }
  }
  if (!Array.isArray(data.hiddenSections)) data.hiddenSections = [];
  if (typeof data.accent !== "string") data.accent = base.accent;
  return {
    id: raw.id,
    name: typeof raw.name === "string" && raw.name ? raw.name : "Untitled CV",
    template: (raw.template ?? "modern") as TemplateId,
    data,
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  };
}

export function cvToPlainText(record: CVRecord): string {
  const d = record.data;
  const lines: string[] = [];
  lines.push(`${d.personal.fullName} ${d.personal.headline}`);
  lines.push(
    [d.personal.email, d.personal.phone, d.personal.location, d.personal.website]
      .filter(Boolean)
      .join(" | "),
  );
  if (d.summary) lines.push(`SUMMARY\n${d.summary}`);
  if (d.experience.length) {
    lines.push("EXPERIENCE");
    for (const e of d.experience) {
      lines.push(
        `${e.role} at ${e.company} (${e.start} - ${e.current ? "Present" : e.end})\n${e.description}`,
      );
    }
  }
  if (d.projects.length) {
    lines.push("PROJECTS");
    for (const p of d.projects) lines.push(`${p.name} (${p.tech})\n${p.description}`);
  }
  if (d.education.length) {
    lines.push("EDUCATION");
    for (const e of d.education) lines.push(`${e.degree}, ${e.school} (${e.start} - ${e.end})`);
  }
  if (d.skills.length) {
    lines.push("SKILLS");
    for (const s of d.skills) lines.push(`${s.label}: ${s.items}`);
  }
  if (d.certifications.length) {
    lines.push("CERTIFICATIONS");
    for (const c of d.certifications) lines.push(`${c.name}, ${c.issuer} (${c.date})`);
  }
  if (d.languages.length) {
    lines.push(`LANGUAGES\n${d.languages.map((l) => `${l.name} (${l.level})`).join(", ")}`);
  }
  for (const s of d.customSections) {
    lines.push(s.title.toUpperCase());
    for (const e of s.entries) lines.push(`${e.title} ${e.subtitle}\n${e.description}`);
  }
  return lines.join("\n\n");
}

export function isCVEmpty(record: CVRecord): boolean {
  const d = record.data;
  return (
    !d.personal.fullName.trim() &&
    !d.summary.trim() &&
    d.experience.length === 0 &&
    d.education.length === 0 &&
    d.projects.length === 0 &&
    d.skills.length === 0
  );
}
