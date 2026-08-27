"use client";

import type { CVRecord, TemplateId } from "@/types/cv";
import { TEMPLATES } from "@/components/cv/templates";
import { A4_HEIGHT, A4_WIDTH, CVPage } from "@/components/cv/preview";

const ACCENTS = [
  { value: "#b0442a", name: "Rust" },
  { value: "#1f3d2b", name: "Forest" },
  { value: "#2b3a55", name: "Slate blue" },
  { value: "#5a4632", name: "Bronze" },
  { value: "#1a1a1a", name: "Black" },
];

export function TemplateThumb({ record, width = 168 }: { record: CVRecord; width?: number }) {
  const scale = width / A4_WIDTH;
  return (
    <div
      className="overflow-hidden border border-line bg-white"
      style={{ width, height: A4_HEIGHT * scale }}
      aria-hidden="true"
    >
      <div style={{ width: A4_WIDTH, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <CVPage record={record} />
      </div>
    </div>
  );
}

export function TemplatePicker({
  record,
  onSelect,
  onAccent,
}: {
  record: CVRecord;
  onSelect: (id: TemplateId) => void;
  onAccent: (color: string) => void;
}) {
  return (
    <div className="space-y-6 p-4">
      <div>
        <h2 className="text-[20px] font-semibold tracking-tight text-ink">Template</h2>
        <p className="mt-1 max-w-[62ch] text-[14px] text-ink-2">
          Each template changes the layout, type family and spacing, not just the colour. Previews
          use your own content.
        </p>
      </div>
      <ul className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        {TEMPLATES.map((t) => {
          const active = t.id === record.template;
          return (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => onSelect(t.id)}
                aria-pressed={active}
                className={`w-full rounded-[6px] border p-2 text-left transition-colors duration-150 ${
                  active ? "border-accent bg-accent-soft" : "border-line hover:bg-surface-2"
                }`}
              >
                <TemplateThumb record={{ ...record, template: t.id }} width={148} />
                <p className="mt-2 text-[14px] font-medium text-ink">{t.name}</p>
                <p className="mt-0.5 text-[12px] leading-snug text-ink-3">{t.description}</p>
              </button>
            </li>
          );
        })}
      </ul>

      <div>
        <h3 className="text-[15px] font-medium text-ink">Accent colour</h3>
        <p className="mt-1 text-[13px] text-ink-3">Used for headings and rules only.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ACCENTS.map((a) => (
            <button
              key={a.value}
              type="button"
              onClick={() => onAccent(a.value)}
              aria-label={a.name}
              aria-pressed={record.data.accent === a.value}
              className={`h-8 w-8 rounded-[6px] border transition-colors duration-150 ${
                record.data.accent === a.value ? "border-ink" : "border-line"
              }`}
              style={{ background: a.value }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
