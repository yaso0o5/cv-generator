"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type {
  CVData,
  CVRecord,
  CustomSection,
  SectionKey,
} from "@/types/cv";
import { SECTION_LABELS, cvToPlainText, uid } from "@/lib/cv/defaults";
import { Button } from "@/components/ui/button";
import { Checkbox, TextArea, TextInput } from "@/components/ui/inputs";
import { AIAction } from "@/components/editor/ai-action";
import { ItemCard, SectionShell } from "@/components/editor/section-shell";

type ListKey = "experience" | "education" | "skills" | "projects" | "certifications" | "languages" | "links";

function move<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EditorPanel({
  record,
  updateData,
  onMissingKey,
}: {
  record: CVRecord;
  updateData: (updater: (data: CVData) => CVData) => void;
  onMissingKey: () => void;
}) {
  const data = record.data;
  const [open, setOpen] = useState<Record<string, boolean>>({
    personal: true,
    summary: true,
    experience: true,
  });
  const cvText = cvToPlainText(record);

  const toggle = (key: string) => setOpen((o) => ({ ...o, [key]: !o[key] }));

  const setList = <K extends ListKey>(key: K, items: CVData[K]) =>
    updateData((d) => ({ ...d, [key]: items }));

  const moveItem = (key: ListKey, index: number, delta: number) =>
    updateData((d) => ({ ...d, [key]: move(d[key] as unknown[], index, index + delta) }) as CVData);

  const removeItem = (key: ListKey, id: string) =>
    updateData(
      (d) => ({ ...d, [key]: (d[key] as { id: string }[]).filter((i) => i.id !== id) }) as CVData,
    );

  const moveSection = (key: SectionKey, delta: number) =>
    updateData((d) => ({
      ...d,
      sectionOrder: move(d.sectionOrder, d.sectionOrder.indexOf(key), d.sectionOrder.indexOf(key) + delta),
    }));

  const toggleHidden = (key: SectionKey) =>
    updateData((d) => ({
      ...d,
      hiddenSections: d.hiddenSections.includes(key)
        ? d.hiddenSections.filter((k) => k !== key)
        : [...d.hiddenSections, key],
    }));

  const sectionProps = (key: SectionKey, meta?: string) => ({
    title: SECTION_LABELS[key],
    meta,
    open: Boolean(open[key]),
    onToggle: () => toggle(key),
    hidden: data.hiddenSections.includes(key),
    onToggleHidden: () => toggleHidden(key),
    onMoveUp: () => moveSection(key, -1),
    onMoveDown: () => moveSection(key, 1),
  });

  const emailError =
    data.personal.email && !EMAIL_RE.test(data.personal.email.trim())
      ? "That does not look like an email address."
      : undefined;

  const renderSection = (key: SectionKey) => {
    switch (key) {
      case "summary":
        return (
          <SectionShell key={key} {...sectionProps(key)}>
            <TextArea
              label="Summary"
              value={data.summary}
              rows={5}
              placeholder="Three sentences: what you do, how long, and your strongest result."
              onChange={(e) => updateData((d) => ({ ...d, summary: e.target.value }))}
              hint={`${data.summary.trim().split(/\s+/).filter(Boolean).length} words. Aim for 45 to 80.`}
              action={
                <AIAction
                  label="Improve with AI"
                  onMissingKey={onMissingKey}
                  build={() =>
                    data.summary.trim()
                      ? { task: "improve_summary", input: data.summary, cvText }
                      : null
                  }
                  onResult={(r) => {
                    if (r.kind === "text") updateData((d) => ({ ...d, summary: r.text }));
                  }}
                />
              }
            />
          </SectionShell>
        );

      case "experience":
        return (
          <SectionShell key={key} {...sectionProps(key, `${data.experience.length}`)}>
            {data.experience.map((item, index) => (
              <ItemCard
                key={item.id}
                title={item.role || item.company || "New role"}
                onRemove={() => removeItem("experience", item.id)}
                onMoveUp={index > 0 ? () => moveItem("experience", index, -1) : undefined}
                onMoveDown={
                  index < data.experience.length - 1 ? () => moveItem("experience", index, 1) : undefined
                }
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextInput
                    label="Role"
                    value={item.role}
                    onChange={(e) =>
                      setList(
                        "experience",
                        data.experience.map((x) =>
                          x.id === item.id ? { ...x, role: e.target.value } : x,
                        ),
                      )
                    }
                  />
                  <TextInput
                    label="Company"
                    value={item.company}
                    onChange={(e) =>
                      setList(
                        "experience",
                        data.experience.map((x) =>
                          x.id === item.id ? { ...x, company: e.target.value } : x,
                        ),
                      )
                    }
                  />
                  <TextInput
                    label="Location"
                    value={item.location}
                    onChange={(e) =>
                      setList(
                        "experience",
                        data.experience.map((x) =>
                          x.id === item.id ? { ...x, location: e.target.value } : x,
                        ),
                      )
                    }
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <TextInput
                      label="Start"
                      type="month"
                      value={item.start}
                      onChange={(e) =>
                        setList(
                          "experience",
                          data.experience.map((x) =>
                            x.id === item.id ? { ...x, start: e.target.value } : x,
                          ),
                        )
                      }
                    />
                    <TextInput
                      label="End"
                      type="month"
                      disabled={item.current}
                      value={item.end}
                      onChange={(e) =>
                        setList(
                          "experience",
                          data.experience.map((x) =>
                            x.id === item.id ? { ...x, end: e.target.value } : x,
                          ),
                        )
                      }
                    />
                  </div>
                </div>
                <Checkbox
                  label="I currently work here"
                  checked={item.current}
                  onChange={(v) =>
                    setList(
                      "experience",
                      data.experience.map((x) => (x.id === item.id ? { ...x, current: v } : x)),
                    )
                  }
                />
                <TextArea
                  label="Bullets"
                  rows={4}
                  value={item.description}
                  hint="One result per line. Start with a verb, end with the outcome."
                  onChange={(e) =>
                    setList(
                      "experience",
                      data.experience.map((x) =>
                        x.id === item.id ? { ...x, description: e.target.value } : x,
                      ),
                    )
                  }
                  action={
                    <AIAction
                      label="Improve with AI"
                      onMissingKey={onMissingKey}
                      build={() =>
                        item.description.trim()
                          ? {
                              task: "improve_experience",
                              input: item.description,
                              context: { role: item.role, company: item.company },
                            }
                          : null
                      }
                      onResult={(r) => {
                        if (r.kind === "text")
                          setList(
                            "experience",
                            data.experience.map((x) =>
                              x.id === item.id ? { ...x, description: r.text } : x,
                            ),
                          );
                      }}
                    />
                  }
                />
              </ItemCard>
            ))}
            <AddButton
              label="Add role"
              onClick={() =>
                setList("experience", [
                  ...data.experience,
                  {
                    id: uid("exp"),
                    role: "",
                    company: "",
                    location: "",
                    start: "",
                    end: "",
                    current: false,
                    description: "",
                  },
                ])
              }
            />
          </SectionShell>
        );

      case "education":
        return (
          <SectionShell key={key} {...sectionProps(key, `${data.education.length}`)}>
            {data.education.map((item, index) => (
              <ItemCard
                key={item.id}
                title={item.degree || item.school || "New entry"}
                onRemove={() => removeItem("education", item.id)}
                onMoveUp={index > 0 ? () => moveItem("education", index, -1) : undefined}
                onMoveDown={
                  index < data.education.length - 1 ? () => moveItem("education", index, 1) : undefined
                }
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextInput
                    label="Degree"
                    value={item.degree}
                    onChange={(e) =>
                      setList(
                        "education",
                        data.education.map((x) =>
                          x.id === item.id ? { ...x, degree: e.target.value } : x,
                        ),
                      )
                    }
                  />
                  <TextInput
                    label="School"
                    value={item.school}
                    onChange={(e) =>
                      setList(
                        "education",
                        data.education.map((x) =>
                          x.id === item.id ? { ...x, school: e.target.value } : x,
                        ),
                      )
                    }
                  />
                  <TextInput
                    label="Start"
                    value={item.start}
                    placeholder="2014"
                    onChange={(e) =>
                      setList(
                        "education",
                        data.education.map((x) =>
                          x.id === item.id ? { ...x, start: e.target.value } : x,
                        ),
                      )
                    }
                  />
                  <TextInput
                    label="End"
                    value={item.end}
                    placeholder="2016"
                    onChange={(e) =>
                      setList(
                        "education",
                        data.education.map((x) => (x.id === item.id ? { ...x, end: e.target.value } : x)),
                      )
                    }
                  />
                </div>
                <TextArea
                  label="Details"
                  rows={2}
                  value={item.details}
                  onChange={(e) =>
                    setList(
                      "education",
                      data.education.map((x) =>
                        x.id === item.id ? { ...x, details: e.target.value } : x,
                      ),
                    )
                  }
                />
              </ItemCard>
            ))}
            <AddButton
              label="Add education"
              onClick={() =>
                setList("education", [
                  ...data.education,
                  {
                    id: uid("edu"),
                    degree: "",
                    school: "",
                    location: "",
                    start: "",
                    end: "",
                    details: "",
                  },
                ])
              }
            />
          </SectionShell>
        );

      case "skills":
        return (
          <SectionShell key={key} {...sectionProps(key, `${data.skills.length} groups`)}>
            <div className="flex justify-end">
              <AIAction
                label="Suggest skills with AI"
                onMissingKey={onMissingKey}
                build={() => ({ task: "suggest_skills", cvText })}
                onResult={(r) => {
                  if (r.kind !== "list") return;
                  setList("skills", [
                    ...data.skills,
                    { id: uid("sk"), label: "Suggested", items: r.items.join(", ") },
                  ]);
                }}
              />
            </div>
            {data.skills.map((group, index) => (
              <ItemCard
                key={group.id}
                title={group.label || "New group"}
                onRemove={() => removeItem("skills", group.id)}
                onMoveUp={index > 0 ? () => moveItem("skills", index, -1) : undefined}
                onMoveDown={index < data.skills.length - 1 ? () => moveItem("skills", index, 1) : undefined}
              >
                <TextInput
                  label="Group name"
                  value={group.label}
                  placeholder="Languages"
                  onChange={(e) =>
                    setList(
                      "skills",
                      data.skills.map((x) => (x.id === group.id ? { ...x, label: e.target.value } : x)),
                    )
                  }
                />
                <TextInput
                  label="Skills"
                  value={group.items}
                  hint="Comma separated."
                  onChange={(e) =>
                    setList(
                      "skills",
                      data.skills.map((x) => (x.id === group.id ? { ...x, items: e.target.value } : x)),
                    )
                  }
                />
              </ItemCard>
            ))}
            <AddButton
              label="Add skill group"
              onClick={() => setList("skills", [...data.skills, { id: uid("sk"), label: "", items: "" }])}
            />
          </SectionShell>
        );

      case "projects":
        return (
          <SectionShell key={key} {...sectionProps(key, `${data.projects.length}`)}>
            {data.projects.map((item, index) => (
              <ItemCard
                key={item.id}
                title={item.name || "New project"}
                onRemove={() => removeItem("projects", item.id)}
                onMoveUp={index > 0 ? () => moveItem("projects", index, -1) : undefined}
                onMoveDown={
                  index < data.projects.length - 1 ? () => moveItem("projects", index, 1) : undefined
                }
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextInput
                    label="Name"
                    value={item.name}
                    onChange={(e) =>
                      setList(
                        "projects",
                        data.projects.map((x) => (x.id === item.id ? { ...x, name: e.target.value } : x)),
                      )
                    }
                  />
                  <TextInput
                    label="Role"
                    value={item.role}
                    onChange={(e) =>
                      setList(
                        "projects",
                        data.projects.map((x) => (x.id === item.id ? { ...x, role: e.target.value } : x)),
                      )
                    }
                  />
                  <TextInput
                    label="Link"
                    value={item.url}
                    onChange={(e) =>
                      setList(
                        "projects",
                        data.projects.map((x) => (x.id === item.id ? { ...x, url: e.target.value } : x)),
                      )
                    }
                  />
                  <TextInput
                    label="Stack"
                    value={item.tech}
                    onChange={(e) =>
                      setList(
                        "projects",
                        data.projects.map((x) => (x.id === item.id ? { ...x, tech: e.target.value } : x)),
                      )
                    }
                  />
                </div>
                <TextArea
                  label="Description"
                  rows={3}
                  value={item.description}
                  onChange={(e) =>
                    setList(
                      "projects",
                      data.projects.map((x) =>
                        x.id === item.id ? { ...x, description: e.target.value } : x,
                      ),
                    )
                  }
                  action={
                    <AIAction
                      label="Generate with AI"
                      onMissingKey={onMissingKey}
                      build={() =>
                        item.name.trim() || item.description.trim()
                          ? {
                              task: "generate_project",
                              input: item.description,
                              context: { name: item.name, tech: item.tech },
                            }
                          : null
                      }
                      onResult={(r) => {
                        if (r.kind === "text")
                          setList(
                            "projects",
                            data.projects.map((x) =>
                              x.id === item.id ? { ...x, description: r.text } : x,
                            ),
                          );
                      }}
                    />
                  }
                />
              </ItemCard>
            ))}
            <AddButton
              label="Add project"
              onClick={() =>
                setList("projects", [
                  ...data.projects,
                  { id: uid("prj"), name: "", role: "", url: "", description: "", tech: "" },
                ])
              }
            />
          </SectionShell>
        );

      case "certifications":
        return (
          <SectionShell key={key} {...sectionProps(key, `${data.certifications.length}`)}>
            {data.certifications.map((item, index) => (
              <ItemCard
                key={item.id}
                title={item.name || "New certification"}
                onRemove={() => removeItem("certifications", item.id)}
                onMoveUp={index > 0 ? () => moveItem("certifications", index, -1) : undefined}
                onMoveDown={
                  index < data.certifications.length - 1
                    ? () => moveItem("certifications", index, 1)
                    : undefined
                }
              >
                <div className="grid gap-3 sm:grid-cols-3">
                  <TextInput
                    label="Name"
                    value={item.name}
                    onChange={(e) =>
                      setList(
                        "certifications",
                        data.certifications.map((x) =>
                          x.id === item.id ? { ...x, name: e.target.value } : x,
                        ),
                      )
                    }
                  />
                  <TextInput
                    label="Issuer"
                    value={item.issuer}
                    onChange={(e) =>
                      setList(
                        "certifications",
                        data.certifications.map((x) =>
                          x.id === item.id ? { ...x, issuer: e.target.value } : x,
                        ),
                      )
                    }
                  />
                  <TextInput
                    label="Year"
                    value={item.date}
                    onChange={(e) =>
                      setList(
                        "certifications",
                        data.certifications.map((x) =>
                          x.id === item.id ? { ...x, date: e.target.value } : x,
                        ),
                      )
                    }
                  />
                </div>
              </ItemCard>
            ))}
            <AddButton
              label="Add certification"
              onClick={() =>
                setList("certifications", [
                  ...data.certifications,
                  { id: uid("cert"), name: "", issuer: "", date: "" },
                ])
              }
            />
          </SectionShell>
        );

      case "languages":
        return (
          <SectionShell key={key} {...sectionProps(key, `${data.languages.length}`)}>
            {data.languages.map((item, index) => (
              <ItemCard
                key={item.id}
                title={item.name || "New language"}
                onRemove={() => removeItem("languages", item.id)}
                onMoveUp={index > 0 ? () => moveItem("languages", index, -1) : undefined}
                onMoveDown={
                  index < data.languages.length - 1 ? () => moveItem("languages", index, 1) : undefined
                }
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextInput
                    label="Language"
                    value={item.name}
                    onChange={(e) =>
                      setList(
                        "languages",
                        data.languages.map((x) => (x.id === item.id ? { ...x, name: e.target.value } : x)),
                      )
                    }
                  />
                  <TextInput
                    label="Level"
                    value={item.level}
                    placeholder="Fluent"
                    onChange={(e) =>
                      setList(
                        "languages",
                        data.languages.map((x) =>
                          x.id === item.id ? { ...x, level: e.target.value } : x,
                        ),
                      )
                    }
                  />
                </div>
              </ItemCard>
            ))}
            <AddButton
              label="Add language"
              onClick={() =>
                setList("languages", [...data.languages, { id: uid("lng"), name: "", level: "" }])
              }
            />
          </SectionShell>
        );

      case "links":
        return (
          <SectionShell key={key} {...sectionProps(key, `${data.links.length}`)}>
            {data.links.map((item, index) => (
              <ItemCard
                key={item.id}
                title={item.label || "New link"}
                onRemove={() => removeItem("links", item.id)}
                onMoveUp={index > 0 ? () => moveItem("links", index, -1) : undefined}
                onMoveDown={index < data.links.length - 1 ? () => moveItem("links", index, 1) : undefined}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextInput
                    label="Label"
                    value={item.label}
                    onChange={(e) =>
                      setList(
                        "links",
                        data.links.map((x) => (x.id === item.id ? { ...x, label: e.target.value } : x)),
                      )
                    }
                  />
                  <TextInput
                    label="URL"
                    value={item.url}
                    onChange={(e) =>
                      setList(
                        "links",
                        data.links.map((x) => (x.id === item.id ? { ...x, url: e.target.value } : x)),
                      )
                    }
                  />
                </div>
              </ItemCard>
            ))}
            <AddButton
              label="Add link"
              onClick={() => setList("links", [...data.links, { id: uid("lnk"), label: "", url: "" }])}
            />
          </SectionShell>
        );

      case "custom":
        return (
          <SectionShell key={key} {...sectionProps(key, `${data.customSections.length}`)}>
            {data.customSections.map((section) => (
              <ItemCard
                key={section.id}
                title={section.title || "Custom section"}
                onRemove={() =>
                  updateData((d) => ({
                    ...d,
                    customSections: d.customSections.filter((s) => s.id !== section.id),
                  }))
                }
              >
                <TextInput
                  label="Section title"
                  value={section.title}
                  placeholder="Volunteering"
                  onChange={(e) => updateCustom(section.id, { title: e.target.value })}
                />
                {section.entries.map((entry) => (
                  <div key={entry.id} className="space-y-2 border-l border-line pl-3">
                    <TextInput
                      label="Title"
                      value={entry.title}
                      onChange={(e) =>
                        updateCustomEntry(section.id, entry.id, { title: e.target.value })
                      }
                    />
                    <TextInput
                      label="Subtitle"
                      value={entry.subtitle}
                      onChange={(e) =>
                        updateCustomEntry(section.id, entry.id, { subtitle: e.target.value })
                      }
                    />
                    <TextArea
                      label="Description"
                      rows={2}
                      value={entry.description}
                      onChange={(e) =>
                        updateCustomEntry(section.id, entry.id, { description: e.target.value })
                      }
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        updateCustom(section.id, {
                          entries: section.entries.filter((x) => x.id !== entry.id),
                        })
                      }
                    >
                      Remove entry
                    </Button>
                  </div>
                ))}
                <AddButton
                  label="Add entry"
                  onClick={() =>
                    updateCustom(section.id, {
                      entries: [
                        ...section.entries,
                        { id: uid("ce"), title: "", subtitle: "", description: "" },
                      ],
                    })
                  }
                />
              </ItemCard>
            ))}
            <AddButton
              label="Add custom section"
              onClick={() =>
                updateData((d) => ({
                  ...d,
                  customSections: [...d.customSections, { id: uid("cs"), title: "", entries: [] }],
                }))
              }
            />
          </SectionShell>
        );
    }
  };

  function updateCustom(id: string, patch: Partial<CustomSection>) {
    updateData((d) => ({
      ...d,
      customSections: d.customSections.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }

  function updateCustomEntry(
    sectionId: string,
    entryId: string,
    patch: Partial<{ title: string; subtitle: string; description: string }>,
  ) {
    updateData((d) => ({
      ...d,
      customSections: d.customSections.map((s) =>
        s.id === sectionId
          ? { ...s, entries: s.entries.map((e) => (e.id === entryId ? { ...e, ...patch } : e)) }
          : s,
      ),
    }));
  }

  return (
    <div>
      <SectionShell
        title="Personal information"
        open={Boolean(open.personal)}
        onToggle={() => toggle("personal")}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput
            label="Full name"
            value={data.personal.fullName}
            error={!data.personal.fullName.trim() ? "Recruiters need a name at the top." : undefined}
            onChange={(e) =>
              updateData((d) => ({ ...d, personal: { ...d.personal, fullName: e.target.value } }))
            }
          />
          <TextInput
            label="Headline"
            value={data.personal.headline}
            placeholder="Senior Backend Engineer"
            onChange={(e) =>
              updateData((d) => ({ ...d, personal: { ...d.personal, headline: e.target.value } }))
            }
          />
          <TextInput
            label="Email"
            type="email"
            value={data.personal.email}
            error={emailError}
            onChange={(e) =>
              updateData((d) => ({ ...d, personal: { ...d.personal, email: e.target.value } }))
            }
          />
          <TextInput
            label="Phone"
            value={data.personal.phone}
            onChange={(e) =>
              updateData((d) => ({ ...d, personal: { ...d.personal, phone: e.target.value } }))
            }
          />
          <TextInput
            label="Location"
            value={data.personal.location}
            onChange={(e) =>
              updateData((d) => ({ ...d, personal: { ...d.personal, location: e.target.value } }))
            }
          />
          <TextInput
            label="Website"
            value={data.personal.website}
            onChange={(e) =>
              updateData((d) => ({ ...d, personal: { ...d.personal, website: e.target.value } }))
            }
          />
        </div>
      </SectionShell>
      {data.sectionOrder.map(renderSection)}
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button size="sm" variant="secondary" onClick={onClick}>
      <Plus size={15} />
      {label}
    </Button>
  );
}
