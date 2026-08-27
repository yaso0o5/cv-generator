import type { SectionKey } from "@/types/cv";
import {
  bullets,
  dateRange,
  skillList,
  visibleSections,
  type TemplateProps,
} from "./shared";

const SIDEBAR: SectionKey[] = ["skills", "languages", "links", "certifications"];

/** Creative: dark sidebar, oversized name, timeline rail in the main column. */
export function CreativeTemplate({ data }: TemplateProps) {
  const accent = data.accent;
  const visible = visibleSections(data);
  const sideKeys = visible.filter((k) => SIDEBAR.includes(k));
  const mainKeys = visible.filter((k) => !SIDEBAR.includes(k));

  const MainH = ({ children }: { children: string }) => (
    <h2 className="mb-3 text-[13px] font-bold tracking-tight text-[#141414]">
      {children}
      <span className="mt-1 block h-[2px] w-8" style={{ background: accent }} />
    </h2>
  );

  const SideH = ({ children }: { children: string }) => (
    <h2 className="mb-2 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[#b9b3ab]">
      {children}
    </h2>
  );

  const main = (key: SectionKey) => {
    switch (key) {
      case "summary":
        return (
          <section key={key} className="mb-6">
            <MainH>About</MainH>
            <p className="text-[11px] leading-[1.7] text-[#3a3a3a]">{data.summary}</p>
          </section>
        );
      case "experience":
        return (
          <section key={key} className="mb-6">
            <MainH>Experience</MainH>
            <div className="space-y-4 border-l border-[#e6e2db] pl-4">
              {data.experience.map((e) => (
                <div key={e.id} className="relative cv-avoid-break">
                  <span
                    className="absolute -left-[21px] top-[5px] h-[7px] w-[7px] rounded-full"
                    style={{ background: accent }}
                  />
                  <p className="text-[12px] font-bold text-[#141414]">{e.role}</p>
                  <p className="text-[10.5px] uppercase tracking-wide text-[#8a8279]">
                    {[e.company, dateRange(e.start, e.end, e.current)].filter(Boolean).join(" · ")}
                  </p>
                  <div className="mt-1 space-y-0.5">
                    {bullets(e.description).map((b, i) => (
                      <p key={i} className="text-[11px] leading-[1.65] text-[#3a3a3a]">
                        {b}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      case "projects":
        return (
          <section key={key} className="mb-6">
            <MainH>Work</MainH>
            <div className="grid grid-cols-2 gap-3">
              {data.projects.map((p) => (
                <div key={p.id} className="cv-avoid-break border border-[#e6e2db] p-2.5">
                  <p className="text-[11.5px] font-bold text-[#141414]">{p.name}</p>
                  <p className="mt-0.5 text-[10.5px] leading-[1.6] text-[#3a3a3a]">{p.description}</p>
                  <p className="mt-1 text-[9.5px] uppercase tracking-wide" style={{ color: accent }}>
                    {p.tech}
                  </p>
                </div>
              ))}
            </div>
          </section>
        );
      case "education":
        return (
          <section key={key} className="mb-6">
            <MainH>Education</MainH>
            {data.education.map((e) => (
              <div key={e.id} className="cv-avoid-break mb-2">
                <p className="text-[11.5px] font-bold text-[#141414]">{e.degree}</p>
                <p className="text-[10.5px] text-[#8a8279]">
                  {[e.school, dateRange(e.start, e.end)].filter(Boolean).join(" · ")}
                </p>
                {e.details ? (
                  <p className="text-[10.5px] leading-[1.6] text-[#3a3a3a]">{e.details}</p>
                ) : null}
              </div>
            ))}
          </section>
        );
      case "custom":
        return (
          <div key={key}>
            {data.customSections.map((s) => (
              <section key={s.id} className="mb-6">
                <MainH>{s.title || "Section"}</MainH>
                {s.entries.map((e) => (
                  <div key={e.id} className="cv-avoid-break mb-2">
                    <p className="text-[11.5px] font-bold text-[#141414]">{e.title}</p>
                    <p className="text-[10.5px] text-[#8a8279]">{e.subtitle}</p>
                    <p className="text-[11px] leading-[1.65] text-[#3a3a3a]">{e.description}</p>
                  </div>
                ))}
              </section>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const side = (key: SectionKey) => {
    switch (key) {
      case "skills":
        return (
          <section key={key} className="mb-5">
            <SideH>Skills</SideH>
            {skillList(data).map((g) => (
              <div key={g.label} className="mb-2">
                <p className="text-[10px] font-semibold text-[#f0ece5]">{g.label}</p>
                <p className="text-[10px] leading-[1.6] text-[#b9b3ab]">{g.items.join(" · ")}</p>
              </div>
            ))}
          </section>
        );
      case "languages":
        return (
          <section key={key} className="mb-5">
            <SideH>Languages</SideH>
            {data.languages.map((l) => (
              <p key={l.id} className="text-[10px] leading-[1.6] text-[#b9b3ab]">
                <span className="text-[#f0ece5]">{l.name}</span> · {l.level}
              </p>
            ))}
          </section>
        );
      case "links":
        return (
          <section key={key} className="mb-5">
            <SideH>Links</SideH>
            {data.links.map((l) => (
              <p key={l.id} className="text-[10px] leading-[1.6] text-[#b9b3ab]">
                {l.url}
              </p>
            ))}
          </section>
        );
      case "certifications":
        return (
          <section key={key} className="mb-5">
            <SideH>Certifications</SideH>
            {data.certifications.map((c) => (
              <p key={c.id} className="mb-1 text-[10px] leading-[1.5] text-[#b9b3ab]">
                <span className="text-[#f0ece5]">{c.name}</span>
                <br />
                {[c.issuer, c.date].filter(Boolean).join(", ")}
              </p>
            ))}
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full min-h-full bg-white font-sans">
      <aside className="w-[34%] bg-[#1c1a17] px-6 py-9 text-[#f0ece5]">
        <h1 className="text-[24px] font-bold leading-[1.1] tracking-tight">
          {data.personal.fullName || "Your name"}
        </h1>
        <p className="mt-1 text-[11px]" style={{ color: accent }}>
          {data.personal.headline}
        </p>
        <div className="mb-6 mt-4 space-y-0.5 text-[10px] text-[#b9b3ab]">
          {[data.personal.email, data.personal.phone, data.personal.location, data.personal.website]
            .filter(Boolean)
            .map((v) => (
              <p key={v}>{v}</p>
            ))}
        </div>
        {sideKeys.map(side)}
      </aside>
      <div className="flex-1 px-8 py-9">{mainKeys.map(main)}</div>
    </div>
  );
}
