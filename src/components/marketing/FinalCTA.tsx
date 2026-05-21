import { Link } from "@tanstack/react-router";

export function FinalCTA() {
  return (
    <section className="border-t border-border bg-warm">
      <div className="mx-auto w-full max-w-4xl px-4 py-20 text-center sm:px-6 lg:py-28">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-coral">
          Ready when you are
        </p>
        <h2 className="mt-3 text-display-lg text-foreground">
          Find your UK course in <span className="bg-gradient-warm bg-clip-text text-transparent">2 minutes</span>.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Create a free account, tell us what you're studying, and meet your personal adviser today.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/signup"
            className="tap inline-flex h-12 items-center justify-center rounded-full bg-gradient-warm px-7 text-sm font-semibold text-white shadow-lg shadow-coral/30 transition-transform hover:-translate-y-0.5"
          >
            Start my free match
          </Link>
          <Link
            to="/courses"
            className="tap inline-flex h-12 items-center justify-center rounded-full border border-border bg-surface px-7 text-sm font-semibold text-foreground hover:bg-accent"
          >
            Browse courses
          </Link>
        </div>
      </div>
    </section>
  );
}
