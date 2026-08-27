"use client";

import { useEffect, useState } from "react";
import { Copy, Sparkles } from "lucide-react";
import type { CVRecord } from "@/types/cv";
import { cvToPlainText } from "@/lib/cv/defaults";
import { callAI, fetchAIStatus } from "@/lib/ai/client";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/inputs";
import { useToast } from "@/components/ui/toast";
import { AIConfigNotice } from "@/components/editor/ai-action";

export function AIToolsPanel({ record }: { record: CVRecord }) {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const [jobOutput, setJobOutput] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    void fetchAIStatus().then(setConfigured);
  }, []);

  const rewrite = async () => {
    if (!input.trim()) {
      toast("Paste the text you want rewritten.", "error");
      return;
    }
    setBusy("rewrite");
    const response = await callAI({ task: "rewrite", input });
    setBusy(null);
    if (response.ok && response.result.kind === "text") {
      setOutput(response.result.text);
      return;
    }
    if (!response.ok) {
      if (response.code === "missing_key") setConfigured(false);
      toast(response.message, "error");
    }
  };

  const suggestSkills = async () => {
    setBusy("skills");
    const response = await callAI({ task: "suggest_skills", cvText: cvToPlainText(record) });
    setBusy(null);
    if (response.ok && response.result.kind === "list") {
      setSkills(response.result.items);
      return;
    }
    if (!response.ok) {
      if (response.code === "missing_key") setConfigured(false);
      toast(response.message, "error");
    }
  };

  const runJobTool = async (task: "generate_summary" | "tailor_summary" | "cover_letter" | "interview_prep") => {
    const cvText = cvToPlainText(record);
    if ((task !== "generate_summary") && !jobDescription.trim()) {
      toast("Paste the job description first.", "error");
      return;
    }
    setBusy(task);
    const response = await callAI({
      task,
      input: task === "tailor_summary" ? record.data.summary : undefined,
      cvText,
      jobDescription,
      context: { role: record.data.personal.headline },
    });
    setBusy(null);
    if (response.ok && response.result.kind === "text") {
      setJobOutput(response.result.text);
      return;
    }
    if (!response.ok) {
      if (response.code === "missing_key") setConfigured(false);
      toast(response.message, "error");
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast("Copied.", "success");
    } catch {
      toast("Your browser blocked clipboard access.", "error");
    }
  };

  return (
    <div className="space-y-5 p-4">
      <div>
        <h2 className="text-[20px] font-semibold tracking-tight text-ink">AI tools</h2>
        <p className="mt-1 max-w-[62ch] text-[14px] text-ink-2">
          Requests run on the server with the key from{" "}
          <code className="font-mono text-[13px]">AI_API_KEY</code>. Nothing is sent anywhere until
          you press a button.
        </p>
      </div>

      {configured === false ? <AIConfigNotice /> : null}
      {configured === true ? (
        <p className="text-[13px] text-success">AI provider configured and reachable.</p>
      ) : null}

      <TextArea
        label="Rewrite text professionally"
        rows={5}
        value={input}
        placeholder="Paste a bullet, a cover letter line, or a paragraph."
        onChange={(e) => setInput(e.target.value)}
      />
      <Button variant="primary" onClick={() => void rewrite()} loading={busy === "rewrite"}>
        Rewrite
      </Button>

      {output ? (
        <div className="rounded-[6px] border border-line p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="max-w-[64ch] text-[14px] leading-relaxed text-ink">{output}</p>
            <Button size="sm" variant="ghost" onClick={() => void copy(output)}>
              <Copy size={14} />
              Copy
            </Button>
          </div>
        </div>
      ) : null}

      <div className="border-t border-line pt-5">
        <h3 className="text-[15px] font-medium text-ink">Skill suggestions</h3>
        <p className="mt-1 max-w-[62ch] text-[14px] text-ink-2">
          Reads your experience and projects, then proposes skills you have not listed.
        </p>
        <Button className="mt-3" onClick={() => void suggestSkills()} loading={busy === "skills"}>
          Suggest skills
        </Button>
        {skills.length ? (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {skills.map((s) => (
              <li
                key={s}
                className="rounded-[4px] border border-line px-2 py-0.5 text-[13px] text-ink-2"
              >
                {s}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="border-t border-line pt-5">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-accent" />
          <h3 className="text-[15px] font-medium text-ink">Job application copilot</h3>
        </div>
        <p className="mt-1 max-w-[62ch] text-[14px] text-ink-2">
          Use the same CV against a real vacancy. Generate a summary, tailor it to the role, draft a cover letter, or prepare for the interview.
        </p>
        <TextArea
          className="mt-3"
          label="Job description"
          rows={7}
          value={jobDescription}
          placeholder="Paste the full vacancy here..."
          onChange={(e) => setJobDescription(e.target.value)}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={() => void runJobTool("generate_summary")} loading={busy === "generate_summary"}>
            Generate summary
          </Button>
          <Button onClick={() => void runJobTool("tailor_summary")} loading={busy === "tailor_summary"}>
            Tailor to job
          </Button>
          <Button onClick={() => void runJobTool("cover_letter")} loading={busy === "cover_letter"}>
            Cover letter
          </Button>
          <Button onClick={() => void runJobTool("interview_prep")} loading={busy === "interview_prep"}>
            Interview prep
          </Button>
        </div>
        {jobOutput ? (
          <div className="mt-4 rounded-[6px] border border-line p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="whitespace-pre-wrap max-w-[72ch] text-[14px] leading-relaxed text-ink">{jobOutput}</p>
              <Button size="sm" variant="ghost" onClick={() => void copy(jobOutput)}>
                <Copy size={14} />
                Copy
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
