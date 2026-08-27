"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Redo2, Undo2 } from "lucide-react";
import type { CVRecord, TemplateId } from "@/types/cv";
import { cvStore } from "@/lib/storage";
import { useCVEditor } from "@/lib/cv/use-cv-editor";
import { exportToPDF } from "@/lib/pdf/export";
import { isCVEmpty } from "@/lib/cv/defaults";
import { CVPreview, PrintRoot } from "@/components/cv/preview";
import { TemplatePicker } from "@/components/cv/template-picker";
import { AtsPanel } from "@/components/ats/ats-panel";
import { EditorPanel } from "@/components/editor/editor-panel";
import { AIConfigNotice } from "@/components/editor/ai-action";
import { AIToolsPanel } from "@/components/editor/ai-tools-panel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/meters";
import { useToast } from "@/components/ui/toast";
import { ThemeToggle } from "@/components/theme-toggle";

type Tab = "content" | "template" | "ats" | "tools";
const TABS: { id: Tab; label: string }[] = [
  { id: "content", label: "Content" },
  { id: "template", label: "Template" },
  { id: "ats", label: "ATS" },
  { id: "tools", label: "AI tools" },
];

export function BuilderLoader({ id }: { id: string }) {
  const [state, setState] = useState<{ status: "loading" | "missing" | "ready"; record?: CVRecord }>(
    { status: "loading" },
  );

  useEffect(() => {
    let active = true;
    cvStore
      .get(id)
      .then((record) => {
        if (!active) return;
        setState(record ? { status: "ready", record } : { status: "missing" });
      })
      .catch(() => active && setState({ status: "missing" }));
    return () => {
      active = false;
    };
  }, [id]);

  if (state.status === "loading") {
    return (
      <div className="mx-auto max-w-[1180px] space-y-4 p-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[520px]" />
          <Skeleton className="h-[520px]" />
        </div>
      </div>
    );
  }

  if (state.status === "missing" || !state.record) {
    return (
      <div className="mx-auto max-w-[560px] px-5 py-24 text-center">
        <h1 className="text-[24px] font-semibold tracking-tight text-ink">CV not found</h1>
        <p className="mt-2 text-[15px] text-ink-2">
          This CV is not stored in this browser. It may have been deleted, or saved in another
          browser or profile.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex h-10 items-center rounded-[6px] border border-line px-4 text-[15px] text-ink transition-colors duration-150 hover:bg-surface-2"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  return <Builder initial={state.record} />;
}

function Builder({ initial }: { initial: CVRecord }) {
  const { record, commit, updateData, undo, redo, canUndo, canRedo, saveState, error } =
    useCVEditor(initial);
  const [tab, setTab] = useState<Tab>("content");
  const [mobileView, setMobileView] = useState<"editor" | "preview">("editor");
  const [missingKey, setMissingKey] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const runExport = async () => {
    if (isCVEmpty(record)) {
      toast("Add your name and at least one section before exporting.", "error");
      return;
    }
    setExporting(true);
    try {
      await exportToPDF(record.name);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Export failed.", "error");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-transparent">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line px-3 sm:px-4">
        <Link
          href="/dashboard"
          aria-label="Back to dashboard"
          className="flex h-9 w-9 items-center justify-center rounded-[6px] text-ink-2 transition-colors duration-150 hover:bg-surface-2 hover:text-ink"
        >
          <ArrowLeft size={17} />
        </Link>
        <input
          value={record.name}
          onChange={(e) => commit((c) => ({ ...c, name: e.target.value }))}
          aria-label="CV name"
          className="h-9 w-[9rem] rounded-[6px] border border-transparent bg-transparent px-2 text-[15px] font-medium text-ink transition-colors duration-150 hover:border-line focus:border-accent focus:outline-none sm:w-[16rem]"
        />
        <span className="hidden text-[13px] text-ink-3 sm:inline">
          {saveState === "saving"
            ? "Saving"
            : saveState === "error"
              ? error ?? "Not saved"
              : "All changes saved"}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            aria-label="Undo"
            className="flex h-9 w-9 items-center justify-center rounded-[6px] text-ink-2 transition-colors duration-150 hover:bg-surface-2 hover:text-ink disabled:opacity-40"
          >
            <Undo2 size={16} />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            aria-label="Redo"
            className="flex h-9 w-9 items-center justify-center rounded-[6px] text-ink-2 transition-colors duration-150 hover:bg-surface-2 hover:text-ink disabled:opacity-40"
          >
            <Redo2 size={16} />
          </button>
          <ThemeToggle />
          <Button variant="primary" onClick={() => void runExport()} loading={exporting}>
            <Download size={15} />
            <span className="hidden sm:inline">Export PDF</span>
          </Button>
        </div>
      </header>

      <div className="flex items-center gap-1 border-b border-line px-3 lg:hidden">
        {(["editor", "preview"] as const).map((view) => (
          <button
            key={view}
            type="button"
            onClick={() => setMobileView(view)}
            className={`h-10 px-3 text-[14px] transition-colors duration-150 ${
              mobileView === view
                ? "border-b-2 border-accent text-ink"
                : "text-ink-3 hover:text-ink"
            }`}
          >
            {view === "editor" ? "Editor" : "Preview"}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(400px,44%)_1fr]">
        <div
          className={`flex min-h-0 flex-col border-line lg:border-r ${
            mobileView === "editor" ? "flex" : "hidden lg:flex"
          }`}
        >
          <nav className="flex shrink-0 items-center gap-1 border-b border-line px-3">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id}
                className={`h-11 px-3 text-[14px] transition-colors duration-150 ${
                  tab === t.id ? "border-b-2 border-accent text-ink" : "text-ink-3 hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <div className="thin-scroll min-h-0 flex-1 overflow-y-auto">
            {missingKey && tab === "content" ? (
              <div className="p-4">
                <AIConfigNotice compact />
              </div>
            ) : null}
            {tab === "content" ? (
              <EditorPanel
                record={record}
                updateData={updateData}
                onMissingKey={() => setMissingKey(true)}
              />
            ) : null}
            {tab === "template" ? (
              <TemplatePicker
                record={record}
                onSelect={(id: TemplateId) => commit((c) => ({ ...c, template: id }))}
                onAccent={(color) => updateData((d) => ({ ...d, accent: color }))}
              />
            ) : null}
            {tab === "ats" ? <AtsPanel record={record} /> : null}
            {tab === "tools" ? <AIToolsPanel record={record} /> : null}
          </div>
        </div>

        <div
          className={`min-h-0 ${mobileView === "preview" ? "block" : "hidden lg:block"}`}
        >
          <CVPreview record={record} />
        </div>
      </div>

      <PrintRoot record={record} />
    </div>
  );
}
