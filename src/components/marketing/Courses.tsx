import { COURSES } from "./data/courses";
import { useReveal } from "@/hooks/use-reveal";

export function Courses({ onSelectSubject }: { onSelectSubject: (subject: string) => void }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="courses" className="border-t border-border bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 lg:py-32">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Course categories
            </p>
            <h2 className="mt-4 font-serif text-4xl text-foreground sm:text-5xl">
              Popular subjects for the May/June 2026 intake.
            </h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            Tap any subject to start your shortlist — we'll pre-select it on the form below.
          </p>
        </div>

        <div
          ref={ref}
          className="reveal mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {COURSES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectSubject(c.title)}
              className="group flex h-full flex-col rounded-xl border border-border bg-surface p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <h3 className="font-serif text-2xl leading-tight text-foreground">
                {c.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.blurb}</p>

              <div className="mt-5 flex flex-wrap gap-1.5">
                {c.levels.map((l) => (
                  <span
                    key={l}
                    className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {l}
                  </span>
                ))}
              </div>

              <div className="mt-6 border-t border-border pt-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Partner institutions
                </p>
                <ul className="mt-2 space-y-1 text-sm text-foreground/85">
                  {c.partners.slice(0, 3).map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>

              <span className="mt-6 inline-flex items-center text-sm font-medium text-primary dark:text-gold">
                Start shortlist
                <span
                  aria-hidden="true"
                  className="ml-1 transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
