"use client";

import { useState } from "react";
import type { AtsReport, CVRecord } from "@/types/cv";
import { analyzeLocally } from "@/lib/ats/score";
import { cvToPlainText, isCVEmpty } from "@/lib/cv/defaults";
import { callAI } from "@/lib/ai/client";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/inputs";
import { Meter, ScoreRing, Skeleton } from "@/components/ui/meters";
import { useToast } from "@/components/ui/toast";
import { AIConfigNotice } from "@/components/editor/ai-action";

export function AtsPanel({ record }: { record: CVRecord }) {
  const [jd, setJd] = useState("");
  const [report, setReport] = useState<AtsReport | null>(null);
  const [loading, setLoading] = useState<null | string>(null);
  const [missingKey, setMissingKey] = useState(false);
  const { toast } = useToast();

  const empty = isCVEmpty(record);

  const runLocal = () => {
    if (empty) {
      toast("Add some content to your CV first.", "error");
      return;
    }
    setLoading("local");
    // Keep the loading state visible for one frame so the change is legible.
    setTimeout(() => {
      try {
        setReport(analyzeLocally(record, jd));
      } catch (e) {
        toast(e instanceof Error ? e.message : "Analysis failed.", "error");
      } finally {
        setLoading(null);
      }
    }, 120);
  };

  const runAI = async (task: "analyze_cv" | "ats_score" | "jd_match", label: string) => {
    if (empty) {
      toast("Add some content to your CV first.", "error");
      return;
    }
    if (task === "jd_match" && !jd.trim()) {
      toast("Paste a job description first.", "error");
      return;
    }
    setLoading(task);
    const response = await callAI({
      task,
      cvText: cvToPlainText(record),
      jobDescription: jd,
    });
    setLoading(null);
    if (response.ok && response.result.kind === "report") {
      setReport(response.result.report);
      setMissingKey(false);
      toast(`${label} complete.`, "success");
      return;
    }
    if (!response.ok && response.code === "missing_key") {
      setMissingKey(true);
      setReport(analyzeLocally(record, jd));
      toast("AI is not configured. Showing the offline analysis instead.", "error");
      return;
    }
    toast(response.ok ? "Unexpected AI response." : response.message, "error");
  };

  return (
    <div className="space-y-5 p-4">
      <div>
        <h2 className="text-[20px] font-semibold tracking-tight text-ink">ATS analysis</h2>
        <p className="mt-1 max-w-[62ch] text-[14px] text-ink-2">
          The offline check runs instantly in your browser and scores structure, dates, quantified
          results and keyword overlap. The AI checks add a recruiter&apos;s reading of the same CV.
        </p>
      </div>

      <TextArea
        label="Job description"
        rows={6}
        value={jd}
        placeholder="Paste the vacancy text here to score keyword coverage."
        onChange={(e) => setJd(e.target.value)}
        hint={`${jd.trim() ? jd.trim().split(/\s+/).length : 0} words pasted.`}
      />

      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onClick={runLocal} loading={loading === "local"}>
          Run check
        </Button>
        <Button onClick={() => void runAI("ats_score", "ATS score")} loading={loading === "ats_score"}>
          ATS score with AI
        </Button>
        <Button
          onClick={() => void runAI("jd_match", "Job match")}
          loading={loading === "jd_match"}
        >
          Match job description
        </Button>
        <Button
          onClick={() => void runAI("analyze_cv", "CV analysis")}
          loading={loading === "analyze_cv"}
        >
          Analyse CV with AI
        </Button>
      </div>

      {missingKey ? <AIConfigNotice /> : null}

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ) : report ? (
        <ReportView report={report} />
      ) : (
        <div className="rounded-[6px] border border-line p-6">
          <p className="text-[15px] font-medium text-ink">No analysis yet</p>
          <p className="mt-1 max-w-[58ch] text-[14px] text-ink-2">
            Run the check to see your score across keywords, skills, experience quality and
            formatting, plus the terms a parser could not find.
          </p>
        </div>
      )}
    </div>
  );
}

function ReportView({ report }: { report: AtsReport }) {
  return (
    <div className="space-y-5">
      <div className="rounded-[6px] border border-line p-5">
        <ScoreRing score={report.overall} label="Overall ATS score" />
        <p className="mt-3 text-[12px] text-ink-3">
          Source: {report.source === "ai" ? "AI analysis" : "offline heuristic"}
        </p>
      </div>

      <div className="grid gap-4 rounded-[6px] border border-line p-5 sm:grid-cols-2">
        <Meter label="Keyword match" value={report.keywordMatch} />
        <Meter label="Skills match" value={report.skillsMatch} />
        <Meter label="Experience quality" value={report.experienceQuality} />
        <Meter label="Formatting" value={report.formatting} />
      </div>

      {report.missingKeywords.length ? (
        <div className="rounded-[6px] border border-line p-5">
          <h3 className="text-[15px] font-medium text-ink">Missing keywords</h3>
          <p className="mt-1 text-[13px] text-ink-3">
            Present in the job description, absent from your CV.
          </p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {report.missingKeywords.map((k) => (
              <li
                key={k}
                className="rounded-[4px] border border-line px-2 py-0.5 font-mono text-[12px] text-ink-2"
              >
                {k}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {report.matchedKeywords.length ? (
        <div className="rounded-[6px] border border-line p-5">
          <h3 className="text-[15px] font-medium text-ink">Matched keywords</h3>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {report.matchedKeywords.map((k) => (
              <li
                key={k}
                className="rounded-[4px] border border-accent px-2 py-0.5 font-mono text-[12px] text-accent"
              >
                {k}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {report.suggestions.length ? (
        <div className="rounded-[6px] border border-line p-5">
          <h3 className="text-[15px] font-medium text-ink">Suggestions</h3>
          <ol className="mt-3 space-y-2">
            {report.suggestions.map((s, i) => (
              <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-ink-2">
                <span className="font-mono text-[13px] text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                <span className="max-w-[64ch]">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
