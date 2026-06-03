import { useEffect, useRef, useState } from "react";

export function CinematicMedia({
  src,
  alt,
  index,
  total,
}: {
  src: string;
  alt: string;
  index: number;
  total: number;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [offset, setOffset] = useState(0);

  // Reveal once in view
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setRevealed(true);
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -60px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Parallax-lite: translate image based on element's center vs viewport center
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = wrapRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        const center = rect.top + rect.height / 2;
        // -1 (above) ... 1 (below)
        const ratio = Math.max(-1, Math.min(1, (center - vh / 2) / (vh / 2)));
        setOffset(ratio * 6); // up to ±6%
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="relative">
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-warm opacity-25 blur-3xl" />

      <div
        ref={wrapRef}
        className="group relative overflow-hidden rounded-3xl border border-border bg-surface shadow-xl ring-1 ring-white/5"
      >
        {/* Image: ken-burns + parallax-lite + cinematic clip reveal */}
        <div
          className={`relative aspect-[3/2] w-full overflow-hidden ${
            revealed ? "animate-cinematic-reveal" : "opacity-0"
          }`}
        >
          <img
            src={src}
            alt={alt}
            loading="eager"
            decoding="async"
            width={1280}
            height={854}
            className="h-full w-full scale-[1.08] object-cover animate-kenburns will-change-transform"
            style={{ transform: `translate3d(0, ${offset}%, 0) scale(1.08)` }}
          />

          {/* Vignette */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/55 via-background/0 to-background/15" />

          {/* Sheen sweep on reveal */}
          {revealed && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -inset-y-4 -left-1/3 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-sheen mix-blend-overlay" />
            </div>
          )}
        </div>

        {/* Top-left meta chip */}
        <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-2.5 py-1 backdrop-blur-md">
          <span className="size-1.5 rounded-full bg-coral shadow-[0_0_8px_2px_color-mix(in_oklab,var(--coral)_60%,transparent)]" />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/85">
            {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>

        {/* Top-right LIVE label */}
        <div className="pointer-events-none absolute right-4 top-4 rounded-full border border-white/15 bg-black/35 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-white/75 backdrop-blur-md">
          REC · BGC
        </div>
      </div>
    </div>
  );
}
