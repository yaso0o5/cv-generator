"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Download, FileText, Pencil, Trash2 } from "lucide-react";
import type { CVRecord } from "@/types/cv";
import { createCV, emptyCVData, sampleCVData } from "@/lib/cv/defaults";
import { cvStore } from "@/lib/storage";
import { exportToPDF } from "@/lib/pdf/export";
import { getTemplate } from "@/components/cv/templates";
import { PrintRoot } from "@/components/cv/preview";
import { TemplateThumb } from "@/components/cv/template-picker";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, Modal } from "@/components/ui/dialog";
import { TextInput } from "@/components/ui/inputs";
import { Skeleton } from "@/components/ui/meters";
import { useToast } from "@/components/ui/toast";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [records, setRecords] = useState<CVRecord[] | null>(null);
  const [renaming, setRenaming] = useState<CVRecord | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleting, setDeleting] = useState<CVRecord | null>(null);
  const [printing, setPrinting] = useState<CVRecord | null>(null);

  const load = useCallback(async () => {
    try {
      setRecords(await cvStore.list());
    } catch {
      setRecords([]);
      toast("Could not read saved CVs from this browser.", "error");
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!printing) return;
    const timer = setTimeout(() => {
      exportToPDF(printing.name)
        .catch((e: unknown) => toast(e instanceof Error ? e.message : "Export failed.", "error"))
        .finally(() => setPrinting(null));
    }, 120);
    return () => clearTimeout(timer);
  }, [printing, toast]);

  const create = async (withSample: boolean) => {
    const record = createCV(
      withSample ? "Sample CV" : "Untitled CV",
      "modern",
      withSample ? sampleCVData() : emptyCVData(),
    );
    try {
      await cvStore.save(record);
      router.push(`/builder/${record.id}`);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not create the CV.", "error");
    }
  };

  const duplicate = async (id: string) => {
    const copy = await cvStore.duplicate(id);
    if (copy) {
      toast("Duplicated.", "success");
      void load();
    } else {
      toast("Could not duplicate that CV.", "error");
    }
  };

  const confirmRename = async () => {
    if (!renaming) return;
    const name = renameValue.trim();
    if (!name) {
      toast("Give the CV a name.", "error");
      return;
    }
    await cvStore.save({ ...renaming, name });
    setRenaming(null);
    toast("Renamed.", "success");
    void load();
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    await cvStore.remove(deleting.id);
    setDeleting(null);
    toast("Deleted.", "success");
    void load();
  };

  return (
    <div className="min-h-screen bg-transparent">
      <header className="border-b border-line">
        <div className="mx-auto flex h-14 max-w-[1180px] items-center gap-4 px-5">
          <Link href="/" className="text-[15px] font-semibold tracking-tight text-ink">
            Vellum
          </Link>
          <span className="text-[14px] text-ink-3">Dashboard</span>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Button variant="primary" onClick={() => void create(false)}>
              New CV
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1180px] px-5 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight text-ink">Your CVs</h1>
            <p className="mt-1 text-[14px] text-ink-2">
              Stored in this browser. Export a PDF to keep a copy elsewhere.
            </p>
          </div>
          {records && records.length > 0 ? (
            <Button onClick={() => void create(true)}>Start from the sample</Button>
          ) : null}
        </div>

        {records === null ? (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <li key={i} className="rounded-[6px] border border-line p-4">
                <Skeleton className="h-[212px] w-full" />
                <Skeleton className="mt-3 h-4 w-1/2" />
                <Skeleton className="mt-2 h-3 w-1/3" />
              </li>
            ))}
          </ul>
        ) : records.length === 0 ? (
          <div className="mt-8 rounded-[6px] border border-line px-6 py-14 text-center">
            <FileText size={24} className="mx-auto text-ink-3" />
            <h2 className="mt-3 text-[18px] font-medium text-ink">No CVs yet</h2>
            <p className="mx-auto mt-1.5 max-w-[46ch] text-[14px] leading-relaxed text-ink-2">
              Start from a blank page, or load a filled-in sample to see how the templates,
              ATS check and PDF export behave before you type anything.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button variant="primary" onClick={() => void create(false)}>
                Create a blank CV
              </Button>
              <Button onClick={() => void create(true)}>Load the sample</Button>
            </div>
          </div>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {records.map((record) => (
              <li key={record.id} className="rounded-[6px] border border-line p-4">
                <Link href={`/builder/${record.id}`} className="block">
                  <TemplateThumb record={record} width={150} />
                </Link>
                <div className="mt-3">
                  <Link
                    href={`/builder/${record.id}`}
                    className="text-[15px] font-medium text-ink transition-colors duration-150 hover:text-accent"
                  >
                    {record.name}
                  </Link>
                  <p className="mt-0.5 text-[13px] text-ink-3">
                    {getTemplate(record.template).name} · edited{" "}
                    {new Date(record.updatedAt).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  <Button size="sm" onClick={() => router.push(`/builder/${record.id}`)}>
                    <Pencil size={14} />
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setPrinting(record)}>
                    <Download size={14} />
                    PDF
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => void duplicate(record.id)}>
                    <Copy size={14} />
                    Duplicate
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setRenaming(record);
                      setRenameValue(record.name);
                    }}
                  >
                    Rename
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleting(record)}>
                    <Trash2 size={14} />
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      <Modal
        open={renaming !== null}
        title="Rename CV"
        onClose={() => setRenaming(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setRenaming(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => void confirmRename()}>
              Save
            </Button>
          </>
        }
      >
        <TextInput
          label="Name"
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void confirmRename();
          }}
        />
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title={`Delete ${deleting?.name ?? "this CV"}?`}
        description="This removes it from this browser. It cannot be undone."
        onCancel={() => setDeleting(null)}
        onConfirm={() => void confirmDelete()}
      />

      {printing ? <PrintRoot record={printing} /> : null}
    </div>
  );
}
