import { HeroMatchCard } from "./HeroMatchCard";
import { LiveOffersBand } from "./LiveOffersBand";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* Bold warm gradient backdrop */}
      <div className="absolute inset-0 -z-10 bg-gradient-warm" />
      <div className="absolute inset-0 -z-10 opacity-70">
        <div className="absolute -right-32 top-10 h-[560px] w-[560px] rounded-full bg-amber/60 blur-3xl" />
        <div className="absolute -left-24 top-40 h-[420px] w-[420px] rounded-full bg-coral/50 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pt-20 pb-40 sm:px-6 lg:pt-24 lg:pb-56">
        {/* Centered headline */}
        <div className="mx-auto max-w-3xl text-center text-white">
          <p className="mb-5 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-white/85">
            <span className="h-px w-8 bg-white/70" />
            UK's trusted student platform
            <span className="h-px w-8 bg-white/70" />
          </p>
          <h1 className="text-display-xl">
            Apply with the UK's <br className="hidden sm:block" />
            <span className="italic font-editorial">Leading Universities</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-white/90 sm:text-lg">
            Discover, compare and apply to 40+ UK partner institutions. Free expert guidance on
            courses, scholarships and visas, all in one place.
          </p>
        </div>

        {/* Two-column: card + image */}
        <div className="mt-12 grid items-end gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="relative z-10">
            <HeroMatchCard />
          </div>

          <div className="relative hidden lg:flex lg:items-end lg:justify-center">
            <svg
              viewBox="0 0 600 600"
              className="absolute inset-0 h-full w-full text-white/40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden
            >
              <g>
                <rect x="80" y="240" width="50" height="260" />
                <polygon points="80,240 130,240 105,200" />
                <circle cx="105" cy="270" r="14" />
              </g>
              <g>
                <rect x="200" y="320" width="40" height="180" />
                <rect x="380" y="320" width="40" height="180" />
                <line x1="240" y1="380" x2="380" y2="380" />
                <line x1="240" y1="420" x2="380" y2="420" />
                <polygon points="200,320 240,320 220,290" />
                <polygon points="380,320 420,320 400,290" />
              </g>
              <path d="M450,140 L520,160 L470,180 Z" />
              <circle cx="480" cy="260" r="80" />
            </svg>
            <img
              src="https://picsum.photos/seed/uk-student-laptop-headphones/720/720"
              alt="UK student smiling with laptop"
              className="relative h-[420px] w-[420px] rounded-[3rem] object-cover shadow-2xl ring-4 ring-white/30"
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
      </div>

      {/* Soft curve into next section */}
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 right-0 h-20 w-full text-background sm:h-28"
        aria-hidden
      >
        <path d="M0,80 C360,140 1080,0 1440,60 L1440,120 L0,120 Z" fill="currentColor" />
      </svg>
    </section>
  );
}
