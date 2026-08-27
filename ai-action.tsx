"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { callAI } from "@/lib/ai/client";
import type { AIRequestBody, AIResult } from "@/lib/ai/tasks";

export function AIConfigNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`rounded-[6px] border border-line bg-surface-2 ${compact ? "p-2.5" : "p-4"}`}
    >
      <p className="text-[13px] font-medium text-ink">AI writing tools are not configured</p>
      <p className="mt-1 max-w-[62ch] text-[13px] leading-relaxed text-ink-2">
        Add <code className="font-mono text-[12px] text-accent">AI_API_KEY</code> to the server
        environment and restart. Optional:{" "}
        <code className="font-mono text-[12px]">AI_BASE_URL</code> and{" "}
        <code className="font-mono text-[12px]">AI_MODEL</code>. Everything else in the builder,
        including the ATS analyser, works without it.
      </p>
    </div>
  );
}

export function AIAction({
  label,
  build,
  onResult,
  onMissingKey,
  disabled,
}: {
  label: string;
  build: () => AIRequestBody | null;
  onResult: (result: AIResult) => void;
  onMissingKey?: () => void;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const run = async () => {
    const body = build();
    if (!body) {
      toast("Add some content first.", "error");
      return;
    }
    setLoading(true);
    const response = await callAI(body);
    setLoading(false);
    if (response.ok) {
      onResult(response.result);
      toast(`${label} done.`, "success");
      return;
    }
    if (response.code === "missing_key") {
      onMissingKey?.();
      toast("AI is not configured on this server.", "error");
      return;
    }
    toast(response.message, "error");
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      loading={loading}
      disabled={disabled}
      onClick={() => void run()}
      className="text-accent hover:text-accent"
    >
      {label}
    </Button>
  );
}
