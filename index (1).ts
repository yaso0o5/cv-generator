import type { CVRecord } from "@/types/cv";
import { normalizeCV, uid } from "@/lib/cv/defaults";

/**
 * Storage contract. The app only ever talks to this interface, so a remote
 * store (Supabase, the Postgres API routes, anything) can replace the local
 * one without touching a single component.
 */
export interface CVStore {
  list(): Promise<CVRecord[]>;
  get(id: string): Promise<CVRecord | null>;
  save(record: CVRecord): Promise<CVRecord>;
  remove(id: string): Promise<void>;
  duplicate(id: string): Promise<CVRecord | null>;
}

const KEY = "cvforge.cvs.v1";

function readAll(): CVRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeCV).filter((r): r is CVRecord => r !== null);
  } catch (error) {
    console.warn("Could not read saved CVs", error);
    return [];
  }
}

function writeAll(records: CVRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(records));
  } catch (error) {
    console.warn("Could not save CVs", error);
    throw new Error(
      "Saving failed. Your browser storage may be full or blocked in private mode.",
    );
  }
}

export const localCVStore: CVStore = {
  async list() {
    return readAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },
  async get(id) {
    return readAll().find((r) => r.id === id) ?? null;
  },
  async save(record) {
    const all = readAll();
    const next: CVRecord = { ...record, updatedAt: new Date().toISOString() };
    const idx = all.findIndex((r) => r.id === record.id);
    if (idx >= 0) all[idx] = next;
    else all.unshift(next);
    writeAll(all);
    return next;
  },
  async remove(id) {
    writeAll(readAll().filter((r) => r.id !== id));
  },
  async duplicate(id) {
    const all = readAll();
    const source = all.find((r) => r.id === id);
    if (!source) return null;
    const now = new Date().toISOString();
    const copy: CVRecord = {
      ...structuredClone(source),
      id: uid("cv"),
      name: `${source.name} (copy)`,
      createdAt: now,
      updatedAt: now,
    };
    writeAll([copy, ...all]);
    return copy;
  },
};

export const cvStore: CVStore = localCVStore;
