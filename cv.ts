export type TemplateId =
  | "modern"
  | "minimal"
  | "professional"
  | "creative"
  | "ats";

export type SectionKey =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "languages"
  | "links"
  | "custom";

export interface PersonalInfo {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  website: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  start: string;
  end: string;
  current: boolean;
  description: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  school: string;
  location: string;
  start: string;
  end: string;
  details: string;
}

export interface SkillGroup {
  id: string;
  label: string;
  items: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  role: string;
  url: string;
  description: string;
  tech: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface LanguageItem {
  id: string;
  name: string;
  level: string;
}

export interface LinkItem {
  id: string;
  label: string;
  url: string;
}

export interface CustomEntry {
  id: string;
  title: string;
  subtitle: string;
  description: string;
}

export interface CustomSection {
  id: string;
  title: string;
  entries: CustomEntry[];
}

export interface CVData {
  personal: PersonalInfo;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillGroup[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  languages: LanguageItem[];
  links: LinkItem[];
  customSections: CustomSection[];
  /** Ordered list of visible section keys, drives both editor and preview. */
  sectionOrder: SectionKey[];
  hiddenSections: SectionKey[];
  accent: string;
}

export interface CVRecord {
  id: string;
  name: string;
  template: TemplateId;
  data: CVData;
  createdAt: string;
  updatedAt: string;
}

export interface AtsReport {
  overall: number;
  keywordMatch: number;
  skillsMatch: number;
  experienceQuality: number;
  formatting: number;
  missingKeywords: string[];
  matchedKeywords: string[];
  suggestions: string[];
  source: "local" | "ai";
}
