const STATS = [
  { k: "98%", v: "Students receive an offer" },
  { k: "40+", v: "UK partner institutions" },
  { k: "10+", v: "Years of expert guidance" },
  { k: "£2M+", v: "Scholarships secured" },
];

export function StatsBand() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-warm opacity-95" />
      {/* Top fade from previous section (surface-muted) into gold */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[var(--surface-muted)] to-transparent" />
      {/* Bottom fade from gold into next section (background) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[var(--background)]" />

      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-2 gap-4 px-4 py-20 text-white sm:gap-6 sm:px-6 md:grid-cols-4 lg:py-24">
        {STATS.map((s) => (
          <div
            key={s.v}
            className="group relative rounded-2xl bg-white/10 p-5 ring-1 ring-white/20 backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/15 sm:p-6"
          >
            <p className="font-editorial text-5xl italic leading-none tracking-tight sm:text-6xl">
              {s.k}
            </p>
            <div className="mt-4 h-px w-10 bg-coral/80" />
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/90 sm:text-[11px]">
              {s.v}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
