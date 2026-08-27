"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Minus, Plus } from "lucide-react";
import type { CVRecord } from "@/types/cv";
import { getTemplate } from "@/components/cv/templates";

export const A4_WIDTH = 794;
export const A4_HEIGHT = 1123;

export function CVPage({ record, print = false }: { record: CVRecord; print?: boolean }) {
  const Template = getTemplate(record.template).component;
  return (
    <div
      className="cv-page bg-white text-black"
      style={
        print
          ? { width: "210mm" }
          : {
              width: A4_WIDTH,
              minHeight: A4_HEIGHT,
              border: "1px solid var(--color-line)",
            }
      }
    >
      <Template data={record.data} />
    </div>
  );
}

/** A hidden copy of the CV at true A4 width, used by the browser print dialog. */
export function PrintRoot({ record }: { record: CVRecord }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(
    <div id="print-root">
      <CVPage record={record} print />
    </div>,
    document.body,
  );
}

export function CVPreview({ record }: { record: CVRecord }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.72);
  const [fit, setFit] = useState(true);
  const [pageHeight, setPageHeight] = useState(A4_HEIGHT);

  useLayoutEffect(() => {
    const el = pageRef.current;
    if (!el) return;
    const update = () => setPageHeight(el.getBoundingClientRect().height / (zoom || 1));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [zoom, record]);

  useLayoutEffect(() => {
    if (!fit) return;
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      const available = el.clientWidth - 48;
      setZoom(Math.max(0.3, Math.min(1.2, available / A4_WIDTH)));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [fit]);

  const step = (delta: number) => {
    setFit(false);
    setZoom((z) => Math.max(0.35, Math.min(1.5, Math.round((z + delta) * 100) / 100)));
  };

  return (
    <div ref={wrapRef} className="relative flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-line px-4 py-2">
        <p className="text-[13px] text-ink-3">
          {getTemplate(record.template).name} · A4
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => step(-0.1)}
            aria-label="Zoom out"
            className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-line text-ink-2 transition-colors duration-150 hover:bg-surface-2"
          >
            <Minus size={16} />
          </button>
          <span className="w-12 text-center font-mono text-[13px] text-ink-2">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => step(0.1)}
            aria-label="Zoom in"
            className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-line text-ink-2 transition-colors duration-150 hover:bg-surface-2"
          >
            <Plus size={16} />
          </button>
          <button
            type="button"
            onClick={() => setFit(true)}
            className="ml-1 h-8 rounded-[6px] border border-line px-2.5 text-[13px] text-ink-2 transition-colors duration-150 hover:bg-surface-2"
          >
            Fit
          </button>
        </div>
      </div>
      <div className="thin-scroll flex-1 overflow-auto bg-surface-2 p-6">
        <div
          style={{
            width: A4_WIDTH * zoom,
            height: pageHeight * zoom,
            margin: "0 auto",
          }}
        >
          <div
            ref={pageRef}
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
              width: A4_WIDTH,
            }}
          >
            <CVPage record={record} />
          </div>
        </div>
      </div>
    </div>
  );
}
