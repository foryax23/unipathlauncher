import { useReveal } from "@/hooks/use-reveal";

const TESTIMONIALS = [
  {
    name: "Aisha",
    age: 19,
    city: "Manchester",
    quote:
      "Bridge Gateway cut through the noise. Within a week I had a shortlist that actually matched my grades and budget.",
  },
  {
    name: "Daniel",
    age: 22,
    city: "Birmingham",
    quote:
      "I was changing careers and felt completely lost. My adviser walked me through funding and entry routes patiently.",
  },
  {
    name: "Priya",
    age: 24,
    city: "London",
    quote:
      "Honest, warm guidance, no pressure. I ended up at a university I'd never have considered on my own.",
  },
];

const PARTNERS = [
  "Canterbury Christ Church",
  "University of Suffolk",
  "University of Bolton",
  "Arden University",
  "Staffordshire University",
  "London Metropolitan",
  "Leeds Trinity",
  "Global Banking School",
];

export function Testimonials() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="stories" className="border-t border-border bg-surface-muted">
      <div className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 lg:py-32">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Student stories
        </p>
        <h2 className="mt-4 max-w-2xl font-serif text-4xl text-foreground sm:text-5xl">
          Trusted by thousands of UK students each year.
        </h2>

        <div ref={ref} className="reveal mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="flex h-full flex-col rounded-xl border border-border bg-surface p-7 shadow-sm"
            >
              <div aria-label="5 out of 5 stars" className="text-gold">
                {"★★★★★"}
              </div>
              <blockquote className="mt-4 font-serif text-xl leading-snug text-foreground">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6 text-sm text-muted-foreground">
                {t.name}, {t.age}, {t.city}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-16 border-t border-border pt-10">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Partner institutions
          </p>
          <ul className="mt-5 flex flex-wrap gap-x-8 gap-y-3 text-sm text-foreground/80">
            {PARTNERS.map((p) => (
              <li key={p} className="font-serif text-lg">
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
