import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getDashboardOverview } from "@/lib/dashboard.functions";
import { supabase } from "@/integrations/supabase/client";
import {
  GraduationCap, MapPin, Sparkles, LogOut, BookOpen, Phone,
  Check, ChevronRight, FileText, Calendar, Activity, Star, ArrowRight,
} from "lucide-react";
import { Logo } from "@/components/marketing/Logo";
import { VerifyEmailBanner } from "@/components/dashboard/VerifyEmailBanner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your dashboard · Bridge Gateway" },
      { name: "description", content: "Your personalised UK university shortlist and adviser updates." },
      { name: "robots", content: "noindex,nofollow" },
      { property: "og:url", content: "/dashboard" },
    ],
    links: [{ rel: "canonical", href: "/dashboard" }],
  }),
  component: Dashboard,
});

type Overview = Awaited<ReturnType<typeof getDashboardOverview>>;

function Dashboard() {
  const navigate = useNavigate();
  const fetchOverview = useServerFn(getDashboardOverview);
  const [data, setData] = useState<Overview | null>(null);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setEmail(session?.user.email ?? "");
      const r = await fetchOverview();
      if (!r.profile?.onboarding_complete) {
        navigate({ to: "/onboarding" });
        return;
      }
      setData(r);
    })();
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen hero-warm flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const { profile, checklist, completionPct, completed, total, nextStep, recommendations, activity, counts } = data;
  const firstName = profile?.full_name?.trim().split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen hero-warm safe-top">
      <header className="glass border-b border-border/50 sticky top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/"><Logo /></Link>
          <div className="flex items-center gap-1">
            <Link to="/dashboard/shortlist" className="tap inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/40 transition">
              <BookOpen className="size-4" /> Shortlist
            </Link>
            <Link to="/dashboard/applications" className="tap inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/40 transition">
              <FileText className="size-4" /> Applications
            </Link>
            <Link to="/dashboard/bookings" className="tap inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/40 transition">
              <Calendar className="size-4" /> Bookings
            </Link>
            <Link to="/dashboard/referrals" className="tap inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/40 transition">
              <Sparkles className="size-4" /> Refer
            </Link>
            <button
              type="button"
              onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }}
              className="tap inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/40 transition"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 pb-24">
        {email && (
          <div className="mb-6">
            <VerifyEmailBanner email={email} verifiedAt={profile?.email_verified_at ?? null} />
          </div>
        )}

        {/* Hero + completion */}
        <section className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 glass-strong rounded-3xl p-7 sm:p-10 shadow-xl">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Welcome back</p>
            <h1 className="mt-3 font-serif text-display-md text-foreground leading-tight">
              Hi <span className="font-chalk text-gold/90">{firstName}</span> — let's move your application forward.
            </h1>
            {nextStep ? (
              <Link
                to={nextStep.href}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-gold-foreground hover:opacity-90 transition shadow-lg"
              >
                Next: {nextStep.label} <ArrowRight className="size-4" />
              </Link>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">Your profile is complete — adviser will be in touch.</p>
            )}
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <CountChip icon={<BookOpen className="size-3.5" />} label="Shortlist" n={counts.shortlist} />
              <CountChip icon={<FileText className="size-3.5" />} label="Applications" n={counts.applications} />
              <CountChip icon={<FileText className="size-3.5" />} label="Documents" n={counts.documents} />
              <CountChip icon={<Calendar className="size-3.5" />} label="Bookings" n={counts.bookings} />
            </div>
          </div>

          <div className="glass-strong rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Profile</p>
              <span className="text-xs text-muted-foreground">{completed}/{total}</span>
            </div>
            <p className="mt-2 font-serif text-3xl">{completionPct}<span className="text-xl text-muted-foreground">%</span></p>
            <div className="mt-3 h-2 w-full rounded-full bg-border overflow-hidden">
              <div className="h-full bg-gold transition-all" style={{ width: `${completionPct}%` }} />
            </div>
            <ul className="mt-4 space-y-1.5">
              {checklist.map((c) => (
                <li key={c.key}>
                  <Link to={c.href} className="group flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm hover:bg-accent/40 transition">
                    <span className={`inline-flex size-5 items-center justify-center rounded-full ${c.done ? "bg-gold text-gold-foreground" : "bg-border text-muted-foreground"}`}>
                      {c.done && <Check className="size-3" />}
                    </span>
                    <span className={c.done ? "line-through text-muted-foreground" : "text-foreground"}>{c.label}</span>
                    {!c.done && <ChevronRight className="ml-auto size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Recommendations */}
        <section className="mt-12">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Recommended for you</p>
              <h2 className="mt-1 font-serif text-display-sm">Courses we think you'll love</h2>
            </div>
            <Link to="/courses" className="text-sm text-gold hover:underline">Browse catalogue →</Link>
          </div>
          {recommendations.length === 0 ? (
            <div className="mt-6 glass rounded-3xl p-6 text-sm text-muted-foreground">
              Tell us your subject and study level in <Link to="/onboarding" className="text-gold underline">onboarding</Link> to unlock tailored recommendations.
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {recommendations.map((r) => (
                <Link
                  key={r.id}
                  to="/courses/$slug"
                  params={{ slug: r.slug }}
                  className="group glass rounded-3xl p-5 transition hover:-translate-y-0.5 hover:shadow-xl flex flex-col"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {r.university.logo_url ? (
                        <img src={r.university.logo_url} alt="" className="size-8 rounded-lg object-contain bg-white p-0.5" />
                      ) : (
                        <span className="inline-flex size-8 items-center justify-center rounded-lg bg-gold/15 text-gold"><GraduationCap className="size-4" /></span>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-widest text-muted-foreground truncate">{r.university.name}</p>
                        {r.university.is_partner && <p className="text-[10px] text-gold">Partner university</p>}
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-gold/20 px-2 py-0.5 text-xs font-medium text-gold-foreground dark:text-gold">
                      {Math.round(r.score)}%
                    </span>
                  </div>
                  <h3 className="mt-3 font-serif text-lg text-foreground line-clamp-2">{r.name}</h3>
                  <div className="mt-auto pt-4 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Star className="size-3 text-gold" />{r.level}</span>
                    {r.university.city && <span className="inline-flex items-center gap-1"><MapPin className="size-3 text-gold" />{r.university.city}</span>}
                    {r.duration_months && <span>{r.duration_months} mo</span>}
                    {r.fee_gbp != null && <span>£{r.fee_gbp.toLocaleString()}</span>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Activity + Adviser */}
        <section className="mt-12 grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 glass-strong rounded-3xl p-6 sm:p-8 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl tracking-tight inline-flex items-center gap-2">
                <Activity className="size-5 text-gold" /> Recent activity
              </h3>
            </div>
            {activity.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No activity yet. Save a course or start an application to see updates here.</p>
            ) : (
              <ul className="mt-4 divide-y divide-border/60">
                {activity.map((a) => {
                  const inner = (
                    <div className="flex items-start gap-3 py-3">
                      <span className="mt-1 size-2 rounded-full bg-gold shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground line-clamp-2">{a.title}</p>
                        <p className="text-[11px] text-muted-foreground capitalize">{a.kind.replace(/_/g, " ")} · {new Date(a.at).toLocaleString("en-GB")}</p>
                      </div>
                      {a.href && <ChevronRight className="size-4 text-muted-foreground" />}
                    </div>
                  );
                  return (
                    <li key={a.id}>
                      {a.href ? <Link to={a.href} className="block hover:bg-accent/30 rounded-xl px-2 -mx-2">{inner}</Link> : <div className="px-2 -mx-2">{inner}</div>}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="glass-strong rounded-3xl p-6 shadow-lg flex flex-col">
            <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-gold/20 text-gold">
              <Sparkles className="size-5" />
            </span>
            <h3 className="mt-3 font-serif text-xl tracking-tight">Talk to an adviser</h3>
            <p className="mt-2 text-sm text-muted-foreground">Book a 1:1 call with a Bridge Gateway adviser to walk through your matches.</p>
            <Link
              to="/dashboard/bookings"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-medium text-gold-foreground hover:opacity-90 transition shadow"
            >
              <Phone className="size-4" /> Book a call
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function CountChip({ icon, label, n }: { icon: React.ReactNode; label: string; n: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs">
      <span className="text-gold">{icon}</span>
      <span className="font-medium">{n}</span>
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}
