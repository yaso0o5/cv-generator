"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

type ToastTone = "info" | "success" | "error";

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastAPI {
  toast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastAPI>({ toast: () => {} });

export function useToast(): ToastAPI {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const counter = useRef(0);

  const toast = useCallback((message: string, tone: ToastTone = "info") => {
    counter.current += 1;
    const id = counter.current;
    setItems((prev) => [...prev.slice(-3), { id, message, tone }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 4200);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(360px,calc(100vw-32px))] flex-col gap-2"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className="animate-fade-up pointer-events-auto rounded-[6px] border border-line bg-surface px-3 py-2.5 text-[14px] text-ink shadow-[0_1px_2px_rgba(0,0,0,.06)]"
          >
            <span
              className={
                t.tone === "error"
                  ? "text-danger"
                  : t.tone === "success"
                    ? "text-success"
                    : "text-ink"
              }
            >
              {t.message}
            </span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
