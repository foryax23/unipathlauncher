const STATS = [
  { k: "98%", v: "Students receive an offer" },
  { k: "40+", v: "UK partner institutions" },
  { k: "10+", v: "Years of expert guidance" },
  { k: "£2M+", v: "Scholarships secured" },
];

export function StatsBand() {
  return (
    <section className="relative overflow-hidden border-y border-border">
      <div className="absolute inset-0 -z-10 bg-gradient-warm opacity-95" />
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-8 px-4 py-16 text-white sm:px-6 md:grid-cols-4 lg:py-20">
        {STATS.map((s) => (
          <div key={s.v}>
            <p className="text-4xl font-semibold tracking-tight sm:text-5xl">{s.k}</p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/85">{s.v}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
