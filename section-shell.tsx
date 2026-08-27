"use client";

import { ArrowDown, ArrowUp, ChevronDown, Eye, EyeOff, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

export function SectionShell({
  title,
  meta,
  open,
  onToggle,
  onMoveUp,
  onMoveDown,
  hidden,
  onToggleHidden,
  children,
}: {
  title: string;
  meta?: string;
  open: boolean;
  onToggle: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  hidden?: boolean;
  onToggleHidden?: () => void;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-line">
      <div className="flex items-center gap-1 px-4 py-2.5">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex flex-1 items-center gap-2 text-left text-[15px] font-medium text-ink"
        >
          <ChevronDown
            size={16}
            className="text-ink-3 transition-transform duration-150"
            style={{ transform: open ? "none" : "rotate(-90deg)" }}
          />
          <span className={hidden ? "text-ink-3 line-through" : ""}>{title}</span>
          {meta ? <span className="text-[13px] font-normal text-ink-3">{meta}</span> : null}
        </button>
        <div className="flex items-center gap-0.5">
          {onToggleHidden ? (
            <IconButton
              label={hidden ? `Show ${title}` : `Hide ${title}`}
              onClick={onToggleHidden}
            >
              {hidden ? <EyeOff size={15} /> : <Eye size={15} />}
            </IconButton>
          ) : null}
          {onMoveUp ? (
            <IconButton label={`Move ${title} up`} onClick={onMoveUp}>
              <ArrowUp size={15} />
            </IconButton>
          ) : null}
          {onMoveDown ? (
            <IconButton label={`Move ${title} down`} onClick={onMoveDown}>
              <ArrowDown size={15} />
            </IconButton>
          ) : null}
        </div>
      </div>
      {open ? <div className="space-y-4 px-4 pb-5">{children}</div> : null}
    </section>
  );
}

export function IconButton({
  label,
  onClick,
  children,
  tone = "default",
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex h-7 w-7 items-center justify-center rounded-[6px] transition-colors duration-150 hover:bg-surface-2 ${
        tone === "danger" ? "text-ink-3 hover:text-danger" : "text-ink-3 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function ItemCard({
  title,
  onRemove,
  onMoveUp,
  onMoveDown,
  children,
}: {
  title: string;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[6px] border border-line bg-surface p-3">
      <div className="mb-3 flex items-center gap-1">
        <p className="flex-1 truncate text-[13px] font-medium text-ink-2">{title}</p>
        {onMoveUp ? (
          <IconButton label="Move up" onClick={onMoveUp}>
            <ArrowUp size={15} />
          </IconButton>
        ) : null}
        {onMoveDown ? (
          <IconButton label="Move down" onClick={onMoveDown}>
            <ArrowDown size={15} />
          </IconButton>
        ) : null}
        <IconButton label="Remove" onClick={onRemove} tone="danger">
          <Trash2 size={15} />
        </IconButton>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
