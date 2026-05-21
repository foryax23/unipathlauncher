import { HeroMatchCard } from "./HeroMatchCard";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-warm">
      {/* warm gradient backdrop */}
      <div className="absolute inset-0 -z-10 hero-warm" />
      <div className="absolute inset-0 -z-10 opacity-60">
        <div className="absolute -right-32 top-10 h-[520px] w-[520px] rounded-full bg-gradient-warm blur-3xl opacity-50" />
        <div className="absolute -left-20 -bottom-20 h-[420px] w-[420px] rounded-full bg-amber/40 blur-3xl" />
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 pt-20 pb-24 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:pt-28 lg:pb-32">
        <div className="flex flex-col justify-center">
          <p className="mb-5 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-coral">
            <span className="h-px w-8 bg-coral" />
            UK's trusted student platform
          </p>
          <h1 className="text-display-xl text-foreground">
            Apply to the UK's <span className="bg-gradient-warm bg-clip-text text-transparent">leading universities</span> with confidence.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl">
            Discover, compare and apply to 40+ UK partner institutions.
            Free expert guidance on courses, scholarships and visas, all in one place.
          </p>

          <div className="mt-8 lg:hidden">
            <HeroMatchCard />
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-6">
            {[
              ["40+", "UK partners"],
              ["98%", "Offer rate"],
              ["Free", "Always"],
            ].map(([k, v]) => (
              <div key={v}>
                <dt className="text-3xl font-semibold tracking-tight text-foreground">{k}</dt>
                <dd className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative hidden lg:flex lg:items-center lg:justify-center">
          {/* Landmark line art backdrop */}
          <svg
            viewBox="0 0 600 600"
            className="absolute inset-0 h-full w-full text-coral/30"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden
          >
            {/* Big Ben tower */}
            <g>
              <rect x="80" y="240" width="50" height="260" />
              <polygon points="80,240 130,240 105,200" />
              <circle cx="105" cy="270" r="14" />
              <line x1="105" y1="270" x2="105" y2="260" />
              <line x1="105" y1="270" x2="113" y2="270" />
            </g>
            {/* Tower Bridge */}
            <g>
              <rect x="200" y="320" width="40" height="180" />
              <rect x="380" y="320" width="40" height="180" />
              <line x1="240" y1="380" x2="380" y2="380" />
              <line x1="240" y1="420" x2="380" y2="420" />
              <polygon points="200,320 240,320 220,290" />
              <polygon points="380,320 420,320 400,290" />
            </g>
            {/* Plane */}
            <path d="M450,140 L520,160 L470,180 Z" />
            {/* Sun arc */}
            <circle cx="480" cy="260" r="80" />
          </svg>
          <div className="relative">
            <img
              src="https://picsum.photos/seed/uk-student-laptop-headphones/720/720"
              alt="UK student smiling with laptop"
              className="relative h-[460px] w-[460px] rounded-[3rem] object-cover shadow-2xl ring-1 ring-white/40"
              loading="eager"
              decoding="async"
            />
            <div className="absolute -left-6 bottom-10 w-72">
              <HeroMatchCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
