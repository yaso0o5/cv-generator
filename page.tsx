import Link from "next/link";
import { Check } from "lucide-react";
import { createCV, sampleCVData } from "@/lib/cv/defaults";
import { TEMPLATES } from "@/components/cv/templates";
import { TemplateThumb } from "@/components/cv/template-picker";
import { ThemeToggle } from "@/components/theme-toggle";
import { Meter } from "@/components/ui/meters";

export default function LandingPage() {
  const sample = createCV("Sample", "modern", sampleCVData());

  return (
    <div className="min-h-screen bg-transparent">
      <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1180px] items-center gap-6 px-5">
          <Link href="/" className="text-[15px] font-semibold tracking-tight text-ink">
            Vellum
          </Link>
          <nav className="hidden items-center gap-5 text-[14px] text-ink-2 sm:flex">
            <a className="transition-colors duration-150 hover:text-ink" href="#templates">
              Templates
            </a>
            <a className="transition-colors duration-150 hover:text-ink" href="#writing">
              Writing help
            </a>
            <a className="transition-colors duration-150 hover:text-ink" href="#ats">
              ATS check
            </a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="flex h-9 items-center rounded-[6px] border border-line px-3 text-[14px] text-ink transition-colors duration-150 hover:bg-surface-2"
            >
              Open dashboard
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="border-b border-line">
          <div className="mx-auto grid max-w-[1180px] gap-10 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
            <div className="max-w-[34rem]">
              <h1 className="text-[34px] font-semibold leading-[1.1] tracking-tight text-ink sm:text-[48px]">
                Build a CV that gets noticed.
              </h1>
              <p className="mt-4 max-w-[62ch] text-[16px] leading-relaxed text-ink-2">
                Write on the left, watch the A4 page update on the right. Five templates that change
                the actual layout, an ATS check that scores your CV against a real job description,
                and a PDF export that matches the preview line for line.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/dashboard"
                  className="flex h-11 items-center rounded-[6px] border border-accent bg-accent px-5 text-[15px] font-medium text-white transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--color-accent)_88%,black)]"
                >
                  Create your CV
                </Link>
                <a
                  href="#templates"
                  className="flex h-11 items-center rounded-[6px] border border-line px-4 text-[15px] text-ink transition-colors duration-150 hover:bg-surface-2"
                >
                  See the templates
                </a>
              </div>
              <ul className="mt-8 space-y-2">
                {[
                  "Saved in your browser, no account and no upload",
                  "Export in A4 with real page breaks, not a screenshot",
                  "Offline ATS score works with or without an AI key",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[14px] text-ink-2">
                    <Check size={16} className="mt-[3px] shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative min-h-[380px] overflow-hidden rounded-[6px] border border-line">
              <iframe
                src="/halftone.html"
                title=""
                aria-hidden="true"
                tabIndex={-1}
                className="absolute inset-0 h-full w-full border-0"
              />
              <div className="relative flex h-full items-center justify-center p-8">
                <div className="rotate-[-1.5deg]">
                  <TemplateThumb record={sample} width={272} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Templates */}
        <section id="templates" className="border-b border-line">
          <div className="mx-auto max-w-[1180px] px-5 py-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-[28px] font-semibold tracking-tight text-ink">
                  Five templates, five layouts
                </h2>
                <p className="mt-2 max-w-[62ch] text-[15px] text-ink-2">
                  Not one design with five colour swaps. The serif Minimal sets its section labels in
                  the margin, Professional runs a skills rail down the right, Creative uses a dark
                  sidebar, and the ATS template drops to one Arial column that any parser reads.
                </p>
              </div>
              <Link
                href="/dashboard"
                className="flex h-10 items-center rounded-[6px] border border-line px-4 text-[14px] text-ink transition-colors duration-150 hover:bg-surface-2"
              >
                Try them with your content
              </Link>
            </div>
            <ul className="mt-8 flex snap-x gap-4 overflow-x-auto pb-2">
              {TEMPLATES.map((t) => (
                <li key={t.id} className="w-[196px] shrink-0 snap-start">
                  <TemplateThumb record={{ ...sample, template: t.id }} width={196} />
                  <p className="mt-2.5 text-[15px] font-medium text-ink">{t.name}</p>
                  <p className="mt-0.5 text-[13px] leading-snug text-ink-3">{t.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Editor features */}
        <section className="border-b border-line">
          <div className="mx-auto max-w-[1180px] px-5 py-16">
            <h2 className="text-[28px] font-semibold tracking-tight text-ink">
              An editor built for one job
            </h2>
            <div className="mt-8 grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Ten sections, in any order",
                  body: "Experience, education, skills, projects, certifications, languages, links and your own custom sections. Move any of them up, down, or out of the page.",
                },
                {
                  title: "Autosave and undo",
                  body: "Every keystroke is saved to your browser 700ms after you stop typing. Cmd+Z steps back through 60 edits, Cmd+S saves immediately.",
                },
                {
                  title: "Real A4 preview",
                  body: "794 by 1123 pixels at 96dpi, the same geometry the print pipeline uses. Zoom from 35% to 150% or fit to the pane.",
                },
                {
                  title: "PDF without a server",
                  body: "Export goes through the browser print pipeline, so text stays selectable, page breaks fall between entries and nothing is rasterised.",
                },
                {
                  title: "Works on a phone",
                  body: "The editor and preview become two tabs under 900px, with the same fields and the same export button.",
                },
                {
                  title: "Multiple CVs",
                  body: "Keep a version per application. Duplicate, rename and delete from the dashboard, each with its own template.",
                },
              ].map((f) => (
                <article key={f.title}>
                  <h3 className="text-[16px] font-medium text-ink">{f.title}</h3>
                  <p className="mt-1.5 max-w-[46ch] text-[14px] leading-relaxed text-ink-2">{f.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* AI */}
        <section id="writing" className="border-b border-line">
          <div className="mx-auto grid max-w-[1180px] gap-10 px-5 py-16 lg:grid-cols-[1fr_0.85fr]">
            <div>
              <h2 className="text-[28px] font-semibold tracking-tight text-ink">
                AI writing help, on your own key
              </h2>
              <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-ink-2">
                Vellum calls whichever OpenAI-compatible endpoint you configure with the{" "}
                <code className="font-mono text-[13px] text-accent">AI_API_KEY</code> environment
                variable. Requests go through the server, so the key never reaches the browser. With
                no key set, the buttons explain what is missing and the rest of the app carries on.
              </p>
              <ul className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {[
                  "Generate a summary from your whole CV",
                  "Tailor your summary to a real vacancy",
                  "Improve work experience bullets",
                  "Generate project descriptions",
                  "Draft a targeted cover letter",
                  "Prepare likely interview questions",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[14px] text-ink-2">
                    <Check size={16} className="mt-[3px] shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[6px] border border-line p-5">
              <p className="text-[13px] uppercase tracking-wide text-ink-3">Before</p>
              <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">
                Responsible for the payments team and various backend systems. Helped improve the
                settlement process.
              </p>
              <p className="mt-5 text-[13px] uppercase tracking-wide text-ink-3">After</p>
              <p className="mt-1.5 text-[14px] leading-relaxed text-ink">
                Owned the settlement platform handling 4.2M transactions a day. Rebuilt
                reconciliation on Kafka and Postgres, cutting the nightly close from 6 hours to 11
                minutes.
              </p>
            </div>
          </div>
        </section>

        {/* ATS */}
        <section id="ats" className="border-b border-line">
          <div className="mx-auto grid max-w-[1180px] items-start gap-10 px-5 py-16 lg:grid-cols-[0.9fr_1fr]">
            <div className="rounded-[6px] border border-line p-5">
              <div className="flex items-baseline justify-between">
                <p className="text-[13px] uppercase tracking-wide text-ink-3">Overall score</p>
                <p className="font-mono text-[32px] font-semibold text-ink">78</p>
              </div>
              <div className="mt-4 space-y-3">
                <Meter label="Keyword match" value={71} />
                <Meter label="Skills match" value={82} />
                <Meter label="Experience quality" value={86} />
                <Meter label="Formatting" value={74} />
              </div>
              <p className="mt-5 text-[13px] text-ink-3">
                Missing from your CV: terraform, sre, incident, sla
              </p>
            </div>
            <div>
              <h2 className="text-[28px] font-semibold tracking-tight text-ink">
                Check it against the actual vacancy
              </h2>
              <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-ink-2">
                Paste the job description and the analyser ranks its 40 most frequent meaningful
                terms, then reports which ones your CV never mentions. It also counts how many of
                your bullets contain a number, flags entries with missing dates, and warns when a
                two-column layout could confuse an older parser.
              </p>
              <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-ink-2">
                That check is deterministic and runs in your browser. If an AI key is configured you
                can run the same CV past the model for a second opinion.
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-5 px-5 py-14">
            <div>
              <h2 className="text-[24px] font-semibold tracking-tight text-ink">
                Start with a blank page or the sample CV
              </h2>
              <p className="mt-1.5 text-[15px] text-ink-2">
                Nothing to sign up for. Your CVs stay in this browser until you export them.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="flex h-11 items-center rounded-[6px] border border-accent bg-accent px-5 text-[15px] font-medium text-white transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--color-accent)_88%,black)]"
            >
              Create your CV
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 px-5 py-8 text-[13px] text-ink-3">
          <p>Vellum. CV builder with local storage, A4 export and an ATS check.</p>
          <p>Data stays in your browser.</p>
        </div>
      </footer>
    </div>
  );
}
