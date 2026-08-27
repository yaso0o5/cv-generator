import type { SectionKey } from "@/types/cv";
import {
  bullets,
  contactLine,
  dateRange,
  skillList,
  visibleSections,
  type TemplateProps,
} from "./shared";

const MAIN: SectionKey[] = ["summary", "experience", "projects", "education", "custom"];

/** Professional: boxed header, main column plus a narrow right rail. */
export function ProfessionalTemplate({ data }: TemplateProps) {
  const accent = data.accent;
  const visible = visibleSections(data);
  const mainKeys = visible.filter((k) => MAIN.includes(k));
  const railKeys = visible.filter((k) => !MAIN.includes(k));

  const H = ({ children }: { children: string }) => (
    <h2
      className="mb-2 border-b border-[#d8d8d8] pb-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[#1a1a1a]"
      style={{ fontFamily: "Georgia, serif" }}
    >
      {children}
    </h2>
  );

  const render = (key: SectionKey) => {
    switch (key) {
      case "summary":
        return (
          <section key={key} className="mb-5">
            <H>Professional summary</H>
            <p className="text-[11px] leading-[1.65] text-[#2e2e2e]">{data.summary}</p>
          </section>
        );
      case "experience":
        return (
          <section key={key} className="mb-5">
            <H>Professional experience</H>
            <div className="space-y-3.5">
              {data.experience.map((e) => (
                <div key={e.id} className="cv-avoid-break">
                  <p className="text-[12px] font-bold text-[#1a1a1a]">{e.company}</p>
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="text-[11.5px] italic text-[#3a3a3a]">{e.role}</p>
                    <p className="shrink-0 text-[10px] text-[#666]">
                      {[dateRange(e.start, e.end, e.current), e.location].filter(Boolean).join(", ")}
                    </p>
                  </div>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 marker:text-[#999]">
                    {bullets(e.description).map((b, i) => (
                      <li key={i} className="text-[11px] leading-[1.6] text-[#2e2e2e]">
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        );
      case "projects":
        return (
          <section key={key} className="mb-5">
            <H>Selected projects</H>
            <div className="space-y-2.5">
              {data.projects.map((p) => (
                <div key={p.id} className="cv-avoid-break">
                  <p className="text-[11.5px] font-bold text-[#1a1a1a]">
                    {p.name}
                    {p.url ? <span className="font-normal text-[#666]"> · {p.url}</span> : null}
                  </p>
                  <p className="text-[11px] leading-[1.6] text-[#2e2e2e]">{p.description}</p>
                </div>
              ))}
            </div>
          </section>
        );
      case "education":
        return (
          <section key={key} className="mb-5">
            <H>Education</H>
            {data.education.map((e) => (
              <div key={e.id} className="cv-avoid-break mb-2">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-[11.5px] font-bold text-[#1a1a1a]">{e.school}</p>
                  <p className="text-[10px] text-[#666]">{dateRange(e.start, e.end)}</p>
                </div>
                <p className="text-[11px] italic text-[#3a3a3a]">{e.degree}</p>
                {e.details ? <p className="text-[10.5px] text-[#444]">{e.details}</p> : null}
              </div>
            ))}
          </section>
        );
      case "custom":
        return (
          <div key={key}>
            {data.customSections.map((s) => (
              <section key={s.id} className="mb-5">
                <H>{s.title || "Section"}</H>
                {s.entries.map((e) => (
                  <div key={e.id} className="cv-avoid-break mb-2">
                    <p className="text-[11.5px] font-bold text-[#1a1a1a]">{e.title}</p>
                    <p className="text-[10px] text-[#666]">{e.subtitle}</p>
                    <p className="text-[11px] leading-[1.6] text-[#2e2e2e]">{e.description}</p>
                  </div>
                ))}
              </section>
            ))}
          </div>
        );
      case "skills":
        return (
          <section key={key} className="mb-4">
            <RailH>Skills</RailH>
            {skillList(data).map((g) => (
              <div key={g.label} className="mb-1.5">
                <p className="text-[10px] font-semibold text-[#1a1a1a]">{g.label}</p>
                <p className="text-[10px] leading-[1.55] text-[#444]">{g.items.join(", ")}</p>
              </div>
            ))}
          </section>
        );
      case "certifications":
        return (
          <section key={key} className="mb-4">
            <RailH>Certifications</RailH>
            {data.certifications.map((c) => (
              <p key={c.id} className="mb-1 text-[10px] leading-[1.5] text-[#444]">
                <span className="font-semibold text-[#1a1a1a]">{c.name}</span>
                <br />
                {[c.issuer, c.date].filter(Boolean).join(", ")}
              </p>
            ))}
          </section>
        );
      case "languages":
        return (
          <section key={key} className="mb-4">
            <RailH>Languages</RailH>
            {data.languages.map((l) => (
              <p key={l.id} className="text-[10px] text-[#444]">
                {l.name}, {l.level.toLowerCase()}
              </p>
            ))}
          </section>
        );
      case "links":
        return (
          <section key={key} className="mb-4">
            <RailH>Links</RailH>
            {data.links.map((l) => (
              <p key={l.id} className="text-[10px] leading-[1.5] text-[#444]">
                {l.url}
              </p>
            ))}
          </section>
        );
    }
  };

  return (
    <div className="h-full bg-white px-[52px] py-[44px] font-sans text-[#1a1a1a]">
      <header className="cv-avoid-break mb-5 border-y-[2px] py-3" style={{ borderColor: accent }}>
        <h1
          className="text-[26px] font-bold uppercase tracking-[0.04em]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {data.personal.fullName || "Your name"}
        </h1>
        <p className="text-[12px] uppercase tracking-[0.12em] text-[#555]">
          {data.personal.headline}
        </p>
        <p className="mt-1.5 text-[10px] text-[#666]">{contactLine(data).join("  |  ")}</p>
      </header>
      <div className="grid grid-cols-[1fr_186px] gap-7">
        <div>{mainKeys.map(render)}</div>
        <aside className="border-l border-[#e0e0e0] pl-5">{railKeys.map(render)}</aside>
      </div>
    </div>
  );
}

function RailH({ children }: { children: string }) {
  return (
    <h2 className="mb-1.5 text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#1a1a1a]">
      {children}
    </h2>
  );
}
