import type { SectionKey } from "@/types/cv";
import {
  bullets,
  contactLine,
  dateRange,
  skillList,
  visibleSections,
  type TemplateProps,
} from "./shared";

/** Minimal: serif type, wide margins, no rules, section labels in the margin. */
export function MinimalTemplate({ data }: TemplateProps) {
  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <section className="mb-6 grid grid-cols-[86px_1fr] gap-5">
      <p className="pt-[3px] text-[9.5px] uppercase tracking-[0.14em] text-[#999]">{label}</p>
      <div>{children}</div>
    </section>
  );

  const section = (key: SectionKey) => {
    switch (key) {
      case "summary":
        return (
          <Row key={key} label="Profile">
            <p className="text-[11.5px] leading-[1.8] text-[#333]">{data.summary}</p>
          </Row>
        );
      case "experience":
        return (
          <Row key={key} label="Experience">
            <div className="space-y-5">
              {data.experience.map((e) => (
                <div key={e.id} className="cv-avoid-break">
                  <p className="text-[12.5px] text-[#111]">
                    {e.role}
                    {e.company ? <span className="text-[#777]">, {e.company}</span> : null}
                  </p>
                  <p className="text-[10px] italic text-[#999]">
                    {[dateRange(e.start, e.end, e.current), e.location].filter(Boolean).join(" · ")}
                  </p>
                  <div className="mt-1.5 space-y-1">
                    {bullets(e.description).map((b, i) => (
                      <p key={i} className="text-[11px] leading-[1.75] text-[#3a3a3a]">
                        {b}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Row>
        );
      case "projects":
        return (
          <Row key={key} label="Projects">
            <div className="space-y-3">
              {data.projects.map((p) => (
                <div key={p.id} className="cv-avoid-break">
                  <p className="text-[12.5px] text-[#111]">{p.name}</p>
                  <p className="text-[11px] leading-[1.75] text-[#3a3a3a]">{p.description}</p>
                  <p className="text-[10px] italic text-[#999]">
                    {[p.tech, p.url].filter(Boolean).join(" · ")}
                  </p>
                </div>
              ))}
            </div>
          </Row>
        );
      case "education":
        return (
          <Row key={key} label="Education">
            <div className="space-y-2.5">
              {data.education.map((e) => (
                <div key={e.id} className="cv-avoid-break">
                  <p className="text-[12.5px] text-[#111]">{e.degree}</p>
                  <p className="text-[10.5px] text-[#666]">{e.school}</p>
                  <p className="text-[10px] italic text-[#999]">{dateRange(e.start, e.end)}</p>
                  {e.details ? (
                    <p className="mt-0.5 text-[10.5px] leading-[1.7] text-[#444]">{e.details}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </Row>
        );
      case "skills":
        return (
          <Row key={key} label="Skills">
            <div className="space-y-1">
              {skillList(data).map((g) => (
                <p key={g.label} className="text-[11px] leading-[1.7] text-[#3a3a3a]">
                  <span className="text-[#999]">{g.label}. </span>
                  {g.items.join(", ")}
                </p>
              ))}
            </div>
          </Row>
        );
      case "certifications":
        return (
          <Row key={key} label="Certificates">
            {data.certifications.map((c) => (
              <p key={c.id} className="text-[11px] leading-[1.7] text-[#3a3a3a]">
                {[c.name, c.issuer, c.date].filter(Boolean).join(", ")}
              </p>
            ))}
          </Row>
        );
      case "languages":
        return (
          <Row key={key} label="Languages">
            <p className="text-[11px] leading-[1.7] text-[#3a3a3a]">
              {data.languages.map((l) => `${l.name}, ${l.level.toLowerCase()}`).join(". ")}
            </p>
          </Row>
        );
      case "links":
        return (
          <Row key={key} label="Elsewhere">
            {data.links.map((l) => (
              <p key={l.id} className="text-[11px] leading-[1.7] text-[#3a3a3a]">
                {l.label}: {l.url}
              </p>
            ))}
          </Row>
        );
      case "custom":
        return (
          <div key={key}>
            {data.customSections.map((s) => (
              <Row key={s.id} label={s.title || "Section"}>
                <div className="space-y-2">
                  {s.entries.map((e) => (
                    <div key={e.id} className="cv-avoid-break">
                      <p className="text-[12.5px] text-[#111]">{e.title}</p>
                      <p className="text-[10px] italic text-[#999]">{e.subtitle}</p>
                      <p className="text-[11px] leading-[1.75] text-[#3a3a3a]">{e.description}</p>
                    </div>
                  ))}
                </div>
              </Row>
            ))}
          </div>
        );
    }
  };

  return (
    <div
      className="h-full bg-white px-[68px] py-[64px] text-[#111]"
      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
    >
      <header className="mb-9 grid grid-cols-[86px_1fr] gap-5">
        <div />
        <div>
          <h1 className="text-[24px] font-normal tracking-tight text-[#111]">
            {data.personal.fullName || "Your name"}
          </h1>
          <p className="text-[12px] italic text-[#777]">{data.personal.headline}</p>
          <p className="mt-2 text-[10px] text-[#999]">{contactLine(data).join("   ·   ")}</p>
        </div>
      </header>
      {visibleSections(data).map(section)}
    </div>
  );
}
