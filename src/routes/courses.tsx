import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PROGRAMMES, COURSES } from "@/components/marketing/data/courses";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { Search, MapPin, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Browse UK university courses · UniPath" },
      { name: "description", content: "Search the full catalogue of UK foundation, undergraduate, top-up and postgraduate courses across our partner universities." },
    ],
  }),
  component: CoursesPage,
});

const LEVELS = ["Foundation", "HNC", "HND", "Undergraduate", "Top-up", "Postgraduate", "MBA"];

function CoursesPage() {
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState<string>("all");
  const [level, setLevel] = useState<string>("all");

  const filtered = useMemo(() => {
    return PROGRAMMES.filter((p) => {
      if (subject !== "all" && p.subject !== subject) return false;
      if (level !== "all" && p.level !== level) return false;
      if (q) {
        const hay = `${p.name} ${p.partner} ${p.cities.join(" ")}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [q, subject, level]);

  return (
    <>
      <Header />
      <main className="bg-background">
        <section className="aurora">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Catalogue</p>
            <h1 className="mt-3 text-display-lg text-foreground">
              Every UK course we offer.
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Filter {PROGRAMMES.length} programmes across {new Set(PROGRAMMES.map(p => p.partner)).size} partner universities. Find the right level, subject, intake and city.
            </p>

            <div className="mt-8 glass-strong rounded-3xl p-4 sm:p-5">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search course, partner or city"
                    className="tap w-full rounded-2xl border border-input bg-background pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="tap rounded-2xl border border-input bg-background px-4 py-3 text-sm"
                >
                  <option value="all">All subjects</option>
                  {COURSES.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="tap rounded-2xl border border-input bg-background px-4 py-3 text-sm"
                >
                  <option value="all">All levels</option>
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-24">
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {filtered.length} results
          </p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => (
              <article key={p.id} className="rounded-3xl border border-border bg-surface p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {p.level} · {p.partner}
                </p>
                <h3 className="mt-2 text-lg font-display tracking-tight">{p.name}</h3>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{p.cities.join(", ")}</span>
                  <span className="inline-flex items-center gap-1"><GraduationCap className="size-3.5" />{p.duration}</span>
                  <span>{p.modes.join(" · ")}</span>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 rounded-3xl border border-border bg-surface-muted p-6 text-center">
            <p className="text-muted-foreground">Not sure which course is right?</p>
            <Link to="/signup" className="mt-3 inline-flex tap rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90">
              Get a personalised shortlist
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
