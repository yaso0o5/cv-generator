"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CVData, CVRecord } from "@/types/cv";
import { cvStore } from "@/lib/storage";

export type SaveState = "idle" | "saving" | "saved" | "error";

const HISTORY_LIMIT = 60;
const COALESCE_MS = 700;

export function useCVEditor(initial: CVRecord) {
  const [record, setRecord] = useState<CVRecord>(initial);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [savedAt, setSavedAt] = useState<string | null>(initial.updatedAt);
  const [error, setError] = useState<string | null>(null);

  const past = useRef<CVRecord[]>([]);
  const future = useRef<CVRecord[]>([]);
  const lastPush = useRef(0);
  const [historyTick, setHistoryTick] = useState(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirty = useRef(false);

  const persist = useCallback(async (next: CVRecord) => {
    setSaveState("saving");
    try {
      const saved = await cvStore.save(next);
      setSavedAt(saved.updatedAt);
      setSaveState("saved");
      setError(null);
      dirty.current = false;
    } catch (e) {
      setSaveState("error");
      setError(e instanceof Error ? e.message : "Could not save.");
    }
  }, []);

  const scheduleSave = useCallback(
    (next: CVRecord) => {
      dirty.current = true;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => void persist(next), 700);
    },
    [persist],
  );

  const commit = useCallback(
    (updater: (current: CVRecord) => CVRecord, options?: { history?: boolean }) => {
      setRecord((current) => {
        const next = updater(current);
        if (next === current) return current;
        const now = Date.now();
        if (options?.history !== false && now - lastPush.current > COALESCE_MS) {
          past.current = [...past.current.slice(-HISTORY_LIMIT), current];
          future.current = [];
          lastPush.current = now;
          setHistoryTick((t) => t + 1);
        }
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave],
  );

  const updateData = useCallback(
    (updater: (data: CVData) => CVData) => {
      commit((current) => ({ ...current, data: updater(current.data) }));
    },
    [commit],
  );

  const undo = useCallback(() => {
    setRecord((current) => {
      const previous = past.current.pop();
      if (!previous) return current;
      future.current = [current, ...future.current].slice(0, HISTORY_LIMIT);
      lastPush.current = 0;
      setHistoryTick((t) => t + 1);
      scheduleSave(previous);
      return previous;
    });
  }, [scheduleSave]);

  const redo = useCallback(() => {
    setRecord((current) => {
      const [next, ...rest] = future.current;
      if (!next) return current;
      future.current = rest;
      past.current = [...past.current, current];
      lastPush.current = 0;
      setHistoryTick((t) => t + 1);
      scheduleSave(next);
      return next;
    });
  }, [scheduleSave]);

  const saveNow = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    void persist(record);
  }, [persist, record]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;
      if (e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.key.toLowerCase() === "z" && e.shiftKey) || e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      } else if (e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveNow();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, saveNow]);

  useEffect(() => {
    const onLeave = (e: BeforeUnloadEvent) => {
      if (dirty.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, []);

  return {
    record,
    commit,
    updateData,
    undo,
    redo,
    canUndo: past.current.length > 0 && historyTick >= 0,
    canRedo: future.current.length > 0,
    saveState,
    savedAt,
    error,
    saveNow,
  };
}
