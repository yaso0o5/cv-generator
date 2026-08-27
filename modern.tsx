import type { SectionKey } from "@/types/cv";
import {
  bullets,
  contactLine,
  dateRange,
  skillList,
  visibleSections,
  type TemplateProps,
} from "./shared";

export function ModernTemplate({ data }: TemplateProps) {
  const accent = data.accent;

  const Heading = ({ children }: { children: string }) => (
    <h2
      className="mb-2.5 text-[10.5px] font-semibold uppercase tracking-[0.16em]"
      style={{ color: accent }}
    >
      {children}
    </h2>
  );

  const section = (key: SectionKey) => {
    switch (key) {
      case "summary":
        return (
          <Block key={key}>
            <Heading>Profile</Heading>
            <p className="text-[11px] leading-[1.65] text-[#333]">{data.summary}</p>
          </Block>
        );
      case "experience":
        return (
          <Block key={key}>
            <Heading>Experience</Heading>
            <div className="space-y-3.5">
              {data.experience.map((e) => (
                <div key={e.id} className="cv-avoid-break">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="text-[12px] font-semibold text-[#111]">{e.role}</p>
                    <p className="shrink-0 font-mono text-[9.5px] uppercase tracking-wide text-[#777]">
                      {dateRange(e.start, e.end, e.current)}
                    </p>
                  </div>
                  <p className="text-[11px] text-[#555]">
                    {[e.company, e.location].filter(Boolean).join(" · ")}
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {bullets(e.description).map((b, i) => (
                      <li
                        key={i}
                        className="relative pl-3 text-[11px] leading-[1.6] text-[#333]"
                      >
                        <span
                          className="absolute left-0 top-[7px] h-[3px] w-[3px] rounded-full"
                          style={{ background: accent }}
                        />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Block>
        );
      case "projects":
        return (
          <Block key={key}>
            <Heading>Projects</Heading>
            <div className="space-y-2.5">
              {data.projects.map((p) => (
                <div key={p.id} className="cv-avoid-break">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="text-[12px] font-semibold text-[#111]">
                      {p.name}
                      {p.role ? <span className="font-normal text-[#555]"> · {p.role}</span> : null}
                    </p>
                    {p.url ? <p className="text-[9.5px] text-[#777]">{p.url}</p> : null}
                  </div>
                  <p className="text-[11px] leading-[1.6] text-[#333]">{p.description}</p>
                  {p.tech ? <p className="mt-0.5 text-[10px] text-[#777]">{p.tech}</p> : null}
                </div>
              ))}
            </div>
          </Block>
        );
      case "education":
        return (
          <Block key={key}>
            <Heading>Education</Heading>
            <div className="space-y-2">
              {data.education.map((e) => (
                <div key={e.id} className="cv-avoid-break">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="text-[12px] font-semibold text-[#111]">{e.degree}</p>
                    <p className="shrink-0 font-mono text-[9.5px] uppercase text-[#777]">
                      {dateRange(e.start, e.end)}
                    </p>
                  </div>
                  <p className="text-[11px] text-[#555]">
                    {[e.school, e.location].filter(Boolean).join(" · ")}
                  </p>
                  {e.details ? (
                    <p className="text-[10.5px] leading-[1.55] text-[#444]">{e.details}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </Block>
        );
      case "skills":
        return (
          <Block key={key}>
            <Heading>Skills</Heading>
            <div className="space-y-1.5">
              {skillList(data).map((g) => (
                <div key={g.label} className="flex gap-3 text-[11px]">
                  <span className="w-24 shrink-0 font-medium text-[#111]">{g.label}</span>
                  <span className="text-[#444]">{g.items.join(", ")}</span>
                </div>
              ))}
            </div>
          </Block>
        );
      case "certifications":
        return (
          <Block key={key}>
            <Heading>Certifications</Heading>
            <ul className="space-y-1">
              {data.certifications.map((c) => (
                <li key={c.id} className="flex justify-between gap-4 text-[11px] text-[#333]">
                  <span>
                    <span className="font-medium text-[#111]">{c.name}</span>
                    {c.issuer ? `, ${c.issuer}` : ""}
                  </span>
                  <span className="font-mono text-[9.5px] text-[#777]">{c.date}</span>
                </li>
              ))}
            </ul>
          </Block>
        );
      case "languages":
        return (
          <Block key={key}>
            <Heading>Languages</Heading>
            <p className="text-[11px] text-[#333]">
              {data.languages.map((l) => `${l.name} (${l.level})`).join(" · ")}
            </p>
          </Block>
        );
      case "links":
        return (
          <Block key={key}>
            <Heading>Links</Heading>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-[#333]">
              {data.links.map((l) => (
                <span key={l.id}>
                  <span className="font-medium text-[#111]">{l.label}: </span>
                  {l.url}
                </span>
              ))}
            </div>
          </Block>
        );
      case "custom":
        return (
          <div key={key}>
            {data.customSections.map((s) => (
              <Block key={s.id}>
                <Heading>{s.title || "Section"}</Heading>
                <div className="space-y-2">
                  {s.entries.map((e) => (
                    <div key={e.id} className="cv-avoid-break">
                      <div className="flex items-baseline justify-between gap-4">
                        <p className="text-[12px] font-semibold text-[#111]">{e.title}</p>
                        <p className="text-[9.5px] text-[#777]">{e.subtitle}</p>
                      </div>
                      <p className="text-[11px] leading-[1.6] text-[#333]">{e.description}</p>
                    </div>
                  ))}
                </div>
              </Block>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="h-full bg-white px-[54px] py-[48px] font-sans text-[#111]">
      <header className="cv-avoid-break mb-6 border-b border-[#e2e2e2] pb-4">
        <h1 className="text-[27px] font-semibold leading-tight tracking-tight">
          {data.personal.fullName || "Your name"}
        </h1>
        {data.personal.headline ? (
          <p className="mt-0.5 text-[13px]" style={{ color: accent }}>
            {data.personal.headline}
          </p>
        ) : null}
        <p className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[10.5px] text-[#666]">
          {contactLine(data).map((item) => (
            <span key={item}>{item}</span>
          ))}
        </p>
      </header>
      {visibleSections(data).map(section)}
    </div>
  );
}

function Block({ children }: { children: React.ReactNode }) {
  return <section className="mb-5">{children}</section>;
}
