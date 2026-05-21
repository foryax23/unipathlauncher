const FEATURES = [
  {
    eyebrow: "Personalised recommendations",
    title: "Know which unis fit you, instantly.",
    body: "Our tech scans 40+ UK universities to check entry requirements, location, fees, ranking and scholarship eligibility against your profile, so you don't have to.",
    bullets: ["Entry requirement check", "Budget estimate", "Course eligibility", "Ranking match"],
    img: "ui-uni-recommendations-dashboard",
  },
  {
    eyebrow: "Research checklist",
    title: "Consolidate every key finding in one place.",
    body: "Know exactly what to look for in a course before deciding. Add notes from your adviser, see what's outstanding, and never miss a detail.",
    bullets: ["Adviser notes", "Open days", "Module breakdown", "Career outcomes"],
    img: "ui-research-checklist-ui",
  },
  {
    eyebrow: "Course comparison",
    title: "Compare shortlisted courses side-by-side.",
    body: "Study environment, subject ranking, entry requirements, accreditation, all in one table. Plus a fit analysis based on your budget and goals.",
    bullets: ["Side-by-side metrics", "Fit-score", "Scholarship flags", "City compare"],
    img: "ui-comparison-table-courses",
  },
  {
    eyebrow: "Parent / guardian access",
    title: "Keep parents in the loop with one tap.",
    body: "Grant guest access so families can review uni details, comparisons and recommendations together, at any time.",
    bullets: ["Guest invites", "Shared notes", "Read-only mode", "Email digests"],
    img: "ui-parent-guest-dashboard",
  },
  {
    eyebrow: "Application & visa support",
    title: "Apply worry-free with end-to-end support.",
    body: "Track UCAS deadlines, document checklists, offer acceptance, visa applications and accommodation, all from your dashboard.",
    bullets: ["UCAS tracking", "Document review", "Visa support", "Accommodation"],
    img: "ui-application-tracker-uk",
  },
];

export function HowWeHelp() {
  return (
    <section id="how" className="border-t border-border bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="mb-16 max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-coral">
            How we help
          </p>
          <h2 className="mt-3 text-display-lg text-foreground">
            Taking the stress out of your UK uni journey
          </h2>
          <p className="mt-4 text-muted-foreground">
            Our advisers combine real experience with smart tech to make sure every application
            lands in the right place at the right time.
          </p>
        </div>

        <div className="space-y-20 lg:space-y-28">
          {FEATURES.map((f, i) => {
            const flip = i % 2 === 1;
            return (
              <div
                key={f.eyebrow}
                className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
                  flip ? "lg:[&>div:first-child]:order-2" : ""
                }`}
              >
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-coral">
                    {String(i + 1).padStart(2, "0")} · {f.eyebrow}
                  </p>
                  <h3 className="mt-3 text-display-md text-foreground">{f.title}</h3>
                  <p className="mt-4 text-muted-foreground">{f.body}</p>
                  <ul className="mt-6 grid grid-cols-2 gap-2.5">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-coral" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative">
                  <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-warm opacity-20 blur-2xl" />
                  <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-xl">
                    <img
                      src={`https://picsum.photos/seed/${f.img}/900/620`}
                      alt={f.title}
                      loading="lazy"
                      className="aspect-[3/2] w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
