import { useCallback, useEffect, useRef, useState } from "react";

const KEY = "bgc:onboarding:sound";

export function useOnboardingSound() {
  const [enabled, setEnabled] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    try { setEnabled(localStorage.getItem(KEY) === "1"); } catch { /* noop */ }
  }, []);

  const toggle = useCallback(() => {
    setEnabled((v) => {
      const n = !v;
      try { localStorage.setItem(KEY, n ? "1" : "0"); } catch { /* noop */ }
      return n;
    });
  }, []);

  const play = useCallback((kind: "pop" | "ding" | "cheer") => {
    if (!enabled) return;
    if (typeof window === "undefined") return;
    try {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      if (!ctxRef.current) ctxRef.current = new Ctx();
      const ctx = ctxRef.current;
      const now = ctx.currentTime;
      const tones: number[] = kind === "ding" ? [880, 1320] : kind === "cheer" ? [660, 880, 1320] : [520];
      tones.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.15, now + i * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.25);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.3);
      });
    } catch { /* noop */ }
  }, [enabled]);

  return { enabled, toggle, play };
}
