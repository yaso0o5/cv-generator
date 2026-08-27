"use client";

export function ScoreRing({ score, label }: { score: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  return (
    <div className="flex items-center gap-4">
      <svg width="128" height="128" viewBox="0 0 128 128" role="img" aria-label={`${label}: ${clamped} out of 100`}>
        <circle cx="64" cy="64" r={radius} fill="none" stroke="var(--color-line)" strokeWidth="10" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="10"
          strokeLinecap="butt"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 64 64)"
          style={{ transition: "stroke-dashoffset 300ms ease-out" }}
        />
        <text
          x="64"
          y="60"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-ink"
          style={{ fontSize: 32, fontWeight: 600 }}
        >
          {clamped}
        </text>
        <text
          x="64"
          y="84"
          textAnchor="middle"
          className="fill-ink-3"
          style={{ fontSize: 12 }}
        >
          / 100
        </text>
      </svg>
      <div>
        <p className="text-[13px] font-medium uppercase tracking-wide text-ink-3">{label}</p>
        <p className="mt-1 max-w-[26ch] text-[14px] text-ink-2">{verdict(clamped)}</p>
      </div>
    </div>
  );
}

function verdict(score: number): string {
  if (score >= 85) return "Strong. Ready to submit through most portals.";
  if (score >= 70) return "Solid. A few keyword gaps left to close.";
  if (score >= 50) return "Parsable, but thin on measurable results.";
  return "Needs work before applying. Start with the suggestions below.";
}

export function Meter({ label, value }: { label: string; value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] text-ink-2">{label}</span>
        <span className="font-mono text-[13px] text-ink">{clamped}</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${clamped}%`, transition: "width 300ms ease-out" }}
        />
      </div>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-[4px] bg-surface-2 ${className}`} />;
}
