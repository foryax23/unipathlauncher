const ITEMS = [
  {
    title: "Direct access to 40+ UK universities",
    body: "Official partnerships with leading UK institutions, book counselling, arrange campus tours and apply online, free.",
    cta: "Browse universities",
    href: "/courses",
    img: "uk-university-campus-students",
  },
  {
    title: "Save more with scholarships",
    body: "We've helped over 5,000 students secure scholarships and bursaries worth £2M+ across the UK.",
    cta: "Scholarship guide",
    href: "/courses",
    img: "scholarship-students-celebrating-uk",
  },
  {
    title: "Expert UK education advisers",
    body: "Our in-house team guides you through UCAS, Clearing, visa and accommodation with confidence.",
    cta: "Meet the team",
    href: "/courses",
    img: "uk-education-adviser-meeting",
  },
];

export function WhyUs() {
  return (
    <section id="why" className="border-t border-border bg-surface-muted">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="mb-12 max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-coral">
            Why students prefer us
          </p>
          <h2 className="mt-3 text-display-lg text-foreground">
            The UK's modern way to apply to university
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {ITEMS.map((it) => (
            <article
              key={it.title}
              className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm"
            >
              <img
                src={`https://picsum.photos/seed/${it.img}/800/520`}
                alt={it.title}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold tracking-tight text-foreground">{it.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{it.body}</p>
                <a href={it.href} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-coral hover:underline">
                  {it.cta} →
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
