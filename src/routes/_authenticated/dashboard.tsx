import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getMyProfile } from "@/lib/profile.functions";
import { PROGRAMMES, COURSES, CAMPUSES } from "@/components/marketing/data/courses";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, MapPin, Sparkles, LogOut, BookOpen, Phone } from "lucide-react";
import { Logo } from "@/components/marketing/Logo";
import { VerifyEmailBanner } from "@/components/dashboard/VerifyEmailBanner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your shortlist · Bridge Gateway" },
      { name: "description", content: "Your personalised UK university shortlist and adviser updates." },
      { name: "robots", content: "noindex,nofollow" },
      { property: "og:url", content: "/dashboard" },
    ],
    links: [{ rel: "canonical", href: "/dashboard" }],
  }),
  component: Dashboard,
});

type Profile = {
  full_name: string | null;
  subject: string | null;
  study_level: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  onboarding_complete: boolean;
  email_verified_at: string | null;
};

function Dashboard() {
  const navigate = useNavigate();
  const fetchProfile = useServerFn(getMyProfile);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setEmail(session?.user.email ?? "");
      const r = await fetchProfile({});
      if (!r.profile?.onboarding_complete) {
        navigate({ to: "/onboarding" });
        return;
      }
      setProfile(r.profile as Profile);
    })();
  }, []);

  if (!profile) {
    return (
      <div className="min-h-screen hero-warm flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const matches = rankMatches(profile);
  const subjectTitle = COURSES.find((c) => c.id === profile.subject)?.title ?? "any subject";
  const firstName = profile.full_name?.trim().split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen hero-warm safe-top">
      <header className="glass border-b border-border/50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/"><Logo /></Link>
          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/" });
            }}
            className="tap inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/40 transition"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 pb-24">
        {email && (
          <div className="mb-6">
            <VerifyEmailBanner email={email} verifiedAt={profile.email_verified_at} />
          </div>
        )}

        {/* Hero */}
        <section className="glass-strong rounded-3xl p-7 sm:p-10 shadow-xl">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Your personalised shortlist
          </p>
          <h1 className="mt-4 font-serif text-display-lg text-foreground leading-tight">
            Hi{" "}
            <span className="font-chalk text-gold/90 align-baseline">
              {firstName}
            </span>
            <svg viewBox="0 0 200 12" className="block h-3 w-48 text-gold/60 -mt-1">
              <path d="M4 7 C 40 2, 80 11, 120 5 S 190 7, 196 5" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="block mt-2">
              here are the best {subjectTitle.toLowerCase()} routes for you.
            </span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Based on {profile.study_level} level near {profile.city ?? "your location"}.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              to="/onboarding"
              className="tap rounded-full border border-border bg-surface/60 px-5 py-2.5 text-sm hover:bg-accent transition"
            >
              Edit preferences
            </Link>
            <Link
              to="/courses"
              className="tap rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-gold-foreground hover:opacity-90 transition shadow-lg"
            >
              Browse full catalogue
            </Link>
          </div>
        </section>

        {/* Snapshot chips */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SnapshotChip icon={<BookOpen className="size-4" />} label="Subject" value={subjectTitle} />
          <SnapshotChip icon={<GraduationCap className="size-4" />} label="Level" value={profile.study_level ?? "—"} />
          <SnapshotChip icon={<MapPin className="size-4" />} label="Near" value={profile.city ?? "—"} />
        </div>

        {/* Top matches */}
        <div className="mt-12">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Top matches</p>
          <h2 className="mt-2 font-serif text-display-md">Hand-picked for you</h2>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {matches.map((m) => (
            <article
              key={m.id}
              className="group glass rounded-3xl p-6 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {m.level} · {m.partner}
                  </p>
                  <h3 className="mt-2 font-serif text-xl tracking-tight text-foreground">
                    {m.name}
                  </h3>
                </div>
                <span className="shrink-0 rounded-full bg-gold/20 px-2.5 py-1 text-xs font-medium text-gold-foreground dark:text-gold">
                  {Math.round(m.score)}% match
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><MapPin className="size-3.5 text-gold" />{m.cities.join(", ")}</span>
                <span className="text-border">·</span>
                <span className="inline-flex items-center gap-1"><GraduationCap className="size-3.5 text-gold" />{m.duration}</span>
                <span className="text-border">·</span>
                <span>{m.modes.join(" · ")}</span>
                {m.km !== null && (
                  <>
                    <span className="text-border">·</span>
                    <span className="font-mono">{Math.round(m.km)} km away</span>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Adviser card */}
        <section className="mt-12 glass-strong rounded-3xl p-6 sm:p-8 shadow-lg">
          <div className="flex items-start gap-4">
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gold/20 text-gold">
              <Sparkles className="size-5" />
            </span>
            <div className="flex-1">
              <h3 className="font-serif text-xl tracking-tight">Talk to an adviser</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                A Bridge Gateway adviser will call within 24 hours to walk you through your matches and the application process.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="size-3.5 text-gold" />
                We'll reach out on the number you shared during sign-up.
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function SnapshotChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
      <span className="inline-flex size-8 items-center justify-center rounded-xl bg-gold/15 text-gold">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

function rankMatches(p: Profile) {
  const haversine = (la1: number, ln1: number, la2: number, ln2: number) => {
    const R = 6371;
    const dLat = ((la2 - la1) * Math.PI) / 180;
    const dLng = ((ln2 - ln1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((la1 * Math.PI) / 180) * Math.cos((la2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  };
  return PROGRAMMES.map((prog) => {
    let score = 0;
    if (prog.subject === p.subject) score += 60;
    if (p.study_level && prog.level === p.study_level) score += 30;
    let km: number | null = null;
    if (p.lat != null && p.lng != null) {
      const dists = prog.cities
        .map((c) => CAMPUSES.find((x) => x.city === c))
        .filter(Boolean)
        .map((c) => haversine(p.lat!, p.lng!, c!.lat, c!.lng));
      km = dists.length ? Math.min(...dists) : null;
      if (km !== null) {
        if (km < 30) score += 10;
        else if (km < 100) score += 6;
        else if (km < 300) score += 2;
      }
    }
    return { ...prog, score, km };
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}
