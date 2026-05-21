export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img
          src="https://picsum.photos/seed/oxford-quad-spires/1920/1200"
          alt="A British university campus quadrangle at golden hour"
          className="h-full w-full object-cover"
          loading="eager"
          decoding="async"
        />
        <div className="hero-gradient absolute inset-0" />
      </div>

      <div className="mx-auto flex min-h-[640px] w-full max-w-6xl flex-col justify-center px-4 py-24 text-white sm:px-6 lg:py-32">
        <p className="mb-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-gold">
          <span className="h-px w-8 bg-gold" />
          Free university guidance for UK students
        </p>
        <h1 className="max-w-3xl font-serif text-5xl leading-[1.05] text-white sm:text-6xl md:text-7xl">
          Your UK university journey starts here
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-white/85 sm:text-xl">
          Find the right university, course, and funding path — in minutes.
          Speak to a real adviser, with no obligation.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <a
            href="#apply"
            className="inline-flex h-12 min-w-[180px] items-center justify-center rounded-full bg-gold px-6 text-sm font-semibold text-gold-foreground transition-transform hover:-translate-y-0.5"
          >
            Get free guidance
          </a>
          <a
            href="#stories"
            className="inline-flex h-12 min-w-[180px] items-center justify-center rounded-full border border-white/30 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
          >
            Explore universities
          </a>
        </div>

        <dl className="mt-16 grid max-w-2xl grid-cols-1 gap-6 border-t border-white/15 pt-8 sm:grid-cols-3">
          {[
            ["5,000+", "Students guided"],
            ["120+", "UK universities"],
            ["Free", "Impartial advice"],
          ].map(([k, v]) => (
            <div key={v}>
              <dt className="font-serif text-3xl text-white">{k}</dt>
              <dd className="mt-1 text-sm uppercase tracking-wider text-white/70">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
