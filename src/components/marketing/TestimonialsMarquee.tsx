import { TESTIMONIALS } from "./data/testimonials";

export function TestimonialsMarquee() {
  // duplicate for seamless loop
  const items = [...TESTIMONIALS, ...TESTIMONIALS];
  return (
    <section id="stories" className="border-t border-border bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="mb-12 max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-coral">
            Hear from our students
          </p>
          <h2 className="mt-3 text-display-lg text-foreground">
            Making UK university dreams come true
          </h2>
        </div>
      </div>
      <div className="group relative overflow-hidden pb-20" aria-label="Student testimonials">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
        <div className="flex w-max gap-5 marquee-track group-hover:[animation-play-state:paused]">
          {items.map((t, i) => (
            <article
              key={i}
              className="flex w-[340px] shrink-0 flex-col rounded-3xl border border-border bg-surface p-6 shadow-sm sm:w-[380px]"
            >
              <div className="flex items-center gap-3">
                <img
                  src={`https://picsum.photos/seed/${t.avatarSeed}/120/120`}
                  alt={t.name}
                  loading="lazy"
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.programme}</p>
                </div>
                {t.badge && (
                  <span className="ml-auto rounded-full bg-gradient-warm px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                    {t.badge}
                  </span>
                )}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-foreground">"{t.quote}"</p>
              <p className="mt-4 border-t border-border pt-3 text-xs font-medium text-muted-foreground">
                {t.uni}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
