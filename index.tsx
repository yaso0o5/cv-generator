import type { ComponentType } from "react";
import type { TemplateId } from "@/types/cv";
import type { TemplateProps } from "./shared";
import { ModernTemplate } from "./modern";
import { MinimalTemplate } from "./minimal";
import { ProfessionalTemplate } from "./professional";
import { CreativeTemplate } from "./creative";
import { AtsTemplate } from "./ats";

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  description: string;
  component: ComponentType<TemplateProps>;
}

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "modern",
    name: "Modern",
    description: "Single column, accent section labels, dates aligned right.",
    component: ModernTemplate,
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Serif type, margin labels, generous leading. No rules.",
    component: MinimalTemplate,
  },
  {
    id: "professional",
    name: "Professional",
    description: "Boxed header, main column plus a skills rail. Corporate.",
    component: ProfessionalTemplate,
  },
  {
    id: "creative",
    name: "Creative",
    description: "Dark sidebar, timeline experience, project grid.",
    component: CreativeTemplate,
  },
  {
    id: "ats",
    name: "ATS friendly",
    description: "One column, Arial, standard headings. Parses cleanly.",
    component: AtsTemplate,
  },
];

export function getTemplate(id: TemplateId): TemplateMeta {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

export type { TemplateProps };
