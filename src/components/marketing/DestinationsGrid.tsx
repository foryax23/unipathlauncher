import { Link } from "@tanstack/react-router";
import { REGIONS } from "./data/regions";

export function DestinationsGrid() {
  return (
    <section id="destinations" className="border-t border-border bg-surface-muted">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="mb-12 max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-coral">
            Explore study destinations
          </p>
          <h2 className="mt-3 text-display-lg text-foreground">
            Start your successful study journey across the UK
          </h2>
          <p className="mt-4 text-muted-foreground">
            Find the city, university and course that fits you best — from London to Edinburgh.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {REGIONS.map((r, i) => (
            <Link
              key={r.id}
              to="/courses"
              hash={r.id}
              className="group relative overflow-hidden rounded-3xl border border-border bg-surface shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
              style={{ minHeight: i === 0 ? 380 : 340 }}
            >
              <div className="absolute inset-0">
                <img
                  src={`https://picsum.photos/seed/${r.imgSeed}/800/600`}
                  alt={r.name}
                  className="h-full w-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/30 to-transparent" />
              </div>
              <div className="relative flex h-full min-h-[340px] flex-col justify-end p-6 text-white">
                <div className="flex items-center gap-2">
                  <span className="text-2xl" aria-hidden>{r.flag}</span>
                  <h3 className="text-2xl font-semibold tracking-tight">{r.name}</h3>
                </div>
                <p className="mt-1 text-sm text-white/80">{r.cities}</p>
                <p className="mt-4 text-base font-semibold">{r.rankingNote}</p>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <dt className="text-white/60 uppercase tracking-wider">Tuition</dt>
                    <dd className="mt-0.5 text-sm font-medium">{r.tuitionFrom}</dd>
                  </div>
                  <div>
                    <dt className="text-white/60 uppercase tracking-wider">Living</dt>
                    <dd className="mt-0.5 text-sm font-medium">{r.livingFrom}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {r.partners.slice(0, 4).map((p) => (
                    <span key={p} className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] backdrop-blur">
                      {p}
                    </span>
                  ))}
                  {r.partners.length > 4 && (
                    <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] backdrop-blur">
                      +{r.partners.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
