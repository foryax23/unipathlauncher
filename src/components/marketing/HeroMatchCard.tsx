import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

const LEVELS = [
  { value: "A-Level", label: "A-Levels" },
  { value: "BTEC", label: "BTEC" },
  { value: "IB", label: "IB" },
  { value: "Access", label: "Access to HE" },
  { value: "International Foundation", label: "International Foundation" },
  { value: "Undergraduate", label: "Already at uni" },
];

export function HeroMatchCard() {
  const navigate = useNavigate();
  const [level, setLevel] = useState(LEVELS[0].value);

  const start = () => {
    if (typeof window !== "undefined") {
      try { localStorage.setItem("unipath:level", level); } catch { /* noop */ }
    }
    navigate({ to: "/onboarding" });
  };

  return (
    <div className="rounded-3xl bg-surface p-6 shadow-2xl ring-1 ring-black/5 sm:p-7">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        Match your study path
      </p>
      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        <span className="text-coral">2-minute</span> course match
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Tell us what you're studying, get a UK-wide shortlist instantly.
      </p>

      <label className="mt-5 block">
        <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          I'm studying
        </span>
        <div className="relative mt-2">
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="tap w-full appearance-none rounded-2xl border border-border bg-surface px-4 py-3 pr-10 text-base font-medium text-foreground outline-none focus:ring-2 focus:ring-ring"
          >
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">▾</span>
        </div>
      </label>

      <button
        type="button"
        onClick={start}
        className="tap mt-5 w-full rounded-full bg-gradient-warm px-6 py-4 text-base font-semibold text-white shadow-lg shadow-coral/30 transition-transform hover:-translate-y-0.5"
      >
        Start my free match →
      </button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Covers A-Level • BTEC • IB • Access • International Foundation
      </p>
    </div>
  );
}
