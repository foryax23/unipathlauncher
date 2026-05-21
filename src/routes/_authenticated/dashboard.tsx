import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getMyProfile } from "@/lib/profile.functions";
import { PROGRAMMES, COURSES, CAMPUSES } from "@/components/marketing/data/courses";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, MapPin, Sparkles, LogOut } from "lucide-react";
import { Logo } from "@/components/marketing/Logo";
import { VerifyEmailBanner } from "@/components/dashboard/VerifyEmailBanner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Your shortlist · Bridge Gateway" }] }),
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const matches = rankMatches(profile);
  const subjectTitle = COURSES.find((c) => c.id === profile.subject)?.title ?? "any subject";

  return (
    <div className="min-h-screen bg-background safe-top">
      <header className="border-b border-border bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/"><Logo /></Link>
          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/" });
            }}
            className="tap inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 pb-24">
        {email && (
          <VerifyEmailBanner email={email} verifiedAt={profile.email_verified_at} />
        )}
        <div className="rounded-3xl aurora glass-strong p-6 sm:p-10">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Your personalised shortlist
          </p>
          <h1 className="mt-3 text-display-lg text-foreground">
            Hi {profile.full_name?.split(" ")[0] ?? "there"} -
            <br />
            here are the best {subjectTitle.toLowerCase()} routes for you.
          </h1>
          <p className="mt-3 text-muted-foreground">
            Based on {profile.study_level} level near {profile.city ?? "your location"}.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              to="/onboarding"
              className="tap rounded-full border border-border bg-surface px-4 py-2 text-sm hover:bg-accent"
            >
              Edit preferences
            </Link>
            <Link
              to="/courses"
              className="tap rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
            >
              Browse full catalogue
            </Link>
          </div>
        </div>

        <h2 className="mt-12 text-display-md">Top matches</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {matches.map((m) => (
            <article
              key={m.id}
              className="group rounded-3xl border border-border bg-surface p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {m.level} · {m.partner}
                  </p>
                  <h3 className="mt-2 text-xl font-display tracking-tight text-foreground">
                    {m.name}
                  </h3>
                </div>
                <span className="rounded-full bg-gold/20 px-2.5 py-1 text-xs font-medium text-gold-foreground dark:text-gold">
                  {Math.round(m.score)}% match
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{m.cities.join(", ")}</span>
                <span className="inline-flex items-center gap-1"><GraduationCap className="size-3.5" />{m.duration}</span>
                <span>{m.modes.join(" · ")}</span>
                {m.km !== null && (
                  <span className="font-mono">{Math.round(m.km)} km away</span>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-border bg-surface p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-1 size-5 text-gold" />
            <div>
              <h3 className="text-lg font-display tracking-tight">Talk to an adviser</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                A Bridge Gateway adviser will call within 24 hours to walk you through your matches and the application process.
              </p>
            </div>
          </div>
        </div>
      </main>
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
