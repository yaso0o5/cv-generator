import type { SectionKey } from "@/types/cv";
import {
  bullets,
  contactLine,
  dateRange,
  skillList,
  visibleSections,
  type TemplateProps,
} from "./shared";

/** ATS friendly: one column, standard headings, no colour, no tables, no icons. */
export function AtsTemplate({ data }: TemplateProps) {
  const H = ({ children }: { children: string }) => (
    <h2 className="mb-1.5 mt-4 border-b border-black pb-0.5 text-[11px] font-bold uppercase tracking-[0.06em] text-black">
      {children}
    </h2>
  );

  const render = (key: SectionKey) => {
    switch (key) {
      case "summary":
        return (
          <section key={key}>
            <H>Professional summary</H>
            <p className="text-[11px] leading-[1.55] text-black">{data.summary}</p>
          </section>
        );
      case "experience":
        return (
          <section key={key}>
            <H>Work experience</H>
            {data.experience.map((e) => (
              <div key={e.id} className="cv-avoid-break mb-2.5">
                <p className="text-[11.5px] font-bold text-black">{e.role}</p>
                <p className="text-[11px] text-black">
                  {[e.company, e.location, dateRange(e.start, e.end, e.current)]
                    .filter(Boolean)
                    .join(" | ")}
                </p>
                <ul className="mt-0.5 list-disc pl-4">
                  {bullets(e.description).map((b, i) => (
                    <li key={i} className="text-[11px] leading-[1.5] text-black">
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        );
      case "projects":
        return (
          <section key={key}>
            <H>Projects</H>
            {data.projects.map((p) => (
              <div key={p.id} className="cv-avoid-break mb-1.5">
                <p className="text-[11px] font-bold text-black">
                  {[p.name, p.role].filter(Boolean).join(" | ")}
                </p>
                <p className="text-[11px] leading-[1.5] text-black">{p.description}</p>
                {p.tech ? <p className="text-[11px] text-black">Technologies: {p.tech}</p> : null}
              </div>
            ))}
          </section>
        );
      case "education":
        return (
          <section key={key}>
            <H>Education</H>
            {data.education.map((e) => (
              <div key={e.id} className="cv-avoid-break mb-1.5">
                <p className="text-[11px] font-bold text-black">{e.degree}</p>
                <p className="text-[11px] text-black">
                  {[e.school, e.location, dateRange(e.start, e.end)].filter(Boolean).join(" | ")}
                </p>
                {e.details ? <p className="text-[11px] leading-[1.5] text-black">{e.details}</p> : null}
              </div>
            ))}
          </section>
        );
      case "skills":
        return (
          <section key={key}>
            <H>Skills</H>
            {skillList(data).map((g) => (
              <p key={g.label} className="text-[11px] leading-[1.55] text-black">
                {g.label}: {g.items.join(", ")}
              </p>
            ))}
          </section>
        );
      case "certifications":
        return (
          <section key={key}>
            <H>Certifications</H>
            {data.certifications.map((c) => (
              <p key={c.id} className="text-[11px] leading-[1.55] text-black">
                {[c.name, c.issuer, c.date].filter(Boolean).join(" | ")}
              </p>
            ))}
          </section>
        );
      case "languages":
        return (
          <section key={key}>
            <H>Languages</H>
            <p className="text-[11px] text-black">
              {data.languages.map((l) => `${l.name} (${l.level})`).join(", ")}
            </p>
          </section>
        );
      case "links":
        return (
          <section key={key}>
            <H>Links</H>
            {data.links.map((l) => (
              <p key={l.id} className="text-[11px] text-black">
                {l.label}: {l.url}
              </p>
            ))}
          </section>
        );
      case "custom":
        return (
          <div key={key}>
            {data.customSections.map((s) => (
              <section key={s.id}>
                <H>{s.title || "Additional information"}</H>
                {s.entries.map((e) => (
                  <div key={e.id} className="cv-avoid-break mb-1.5">
                    <p className="text-[11px] font-bold text-black">
                      {[e.title, e.subtitle].filter(Boolean).join(" | ")}
                    </p>
                    <p className="text-[11px] leading-[1.5] text-black">{e.description}</p>
                  </div>
                ))}
              </section>
            ))}
          </div>
        );
    }
  };

  return (
    <div
      className="h-full bg-white px-[48px] py-[44px] text-black"
      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      <header>
        <h1 className="text-[20px] font-bold uppercase tracking-[0.02em] text-black">
          {data.personal.fullName || "Your name"}
        </h1>
        <p className="text-[11.5px] text-black">{data.personal.headline}</p>
        <p className="text-[11px] text-black">{contactLine(data).join(" | ")}</p>
      </header>
      {visibleSections(data).map(render)}
    </div>
  );
}
