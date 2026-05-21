import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRight, Check, GraduationCap, Briefcase, Stethoscope, Code, Scale, Wrench, Palette, BookOpen, Plane, Brain } from "lucide-react";
import { LocationStep } from "@/components/onboarding/LocationStep";
import { COURSES } from "@/components/marketing/data/courses";
import { updateMyProfile, getMyProfile } from "@/lib/profile.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: OnboardingPage,
});

type State = {
  full_name: string;
  study_level: string;
  subject: string;
  start_year: string;
  location: { lat: number; lng: number; city: string | null } | null;
  phone: string;
  reason: string;
  consent: boolean;
};

const SUBJECT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "business-finance": Briefcase,
  "health-social-care": Stethoscope,
  "public-health": Stethoscope,
  "computer-science": Code,
  law: Scale,
  engineering: Wrench,
  "arts-design": Palette,
  education: BookOpen,
  "hospitality-tourism": Plane,
  psychology: Brain,
};

function OnboardingPage() {
  const navigate = useNavigate();
  const update = useServerFn(updateMyProfile);
  const fetchProfile = useServerFn(getMyProfile);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [s, setS] = useState<State>({
    full_name: "",
    study_level: "",
    subject: "",
    start_year: "",
    location: null,
    phone: "",
    reason: "",
    consent: false,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Wait for the browser session to hydrate before calling the protected fn.
      await supabase.auth.getSession();
      try {
        const r = await fetchProfile({});
        if (cancelled) return;
        // Pull any hero pre-selection (study level) from sessionStorage.
        const preLevel = typeof window !== "undefined" ? sessionStorage.getItem("unipath:level") : null;
        if (r.profile) {
          setS((prev) => ({
            ...prev,
            full_name: r.profile?.full_name ?? prev.full_name,
            study_level: r.profile?.study_level ?? preLevel ?? "",
            subject: r.profile?.subject ?? "",
            start_year: r.profile?.start_year ?? "",
            phone: r.profile?.phone ?? "",
            location:
              r.profile?.lat != null && r.profile?.lng != null
                ? { lat: r.profile.lat, lng: r.profile.lng, city: r.profile.city }
                : null,
          }));
          if (r.profile.onboarding_complete) {
            navigate({ to: "/dashboard" });
            return;
          }
        } else if (preLevel) {
          setS((prev) => ({ ...prev, study_level: preLevel }));
        }
      } catch (err) {
        console.error("Profile fetch failed", err);
        toast.error("Couldn't load your profile — you can still continue.");
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const steps = [
    {
      title: "What's your name?",
      hint: "We'll personalise your shortlist.",
      ok: () => s.full_name.trim().length >= 2,
      body: (
        <input
          autoFocus
          value={s.full_name}
          onChange={(e) => setS({ ...s, full_name: e.target.value })}
          placeholder="Your full name"
          className="tap w-full rounded-2xl border border-input bg-background px-4 py-4 text-base outline-none focus:ring-2 focus:ring-ring"
        />
      ),
    },
    {
      title: "Which level suits you?",
      hint: "Pick your starting point.",
      ok: () => !!s.study_level,
      body: (
        <CardGrid
          options={[
            { id: "Foundation", label: "Foundation", desc: "Entry route — no prior degree" },
            { id: "Undergraduate", label: "Undergraduate", desc: "Bachelor's degree (BSc / BA)" },
            { id: "Top-up", label: "Top-up", desc: "Convert your HND / Level 5 to a degree" },
            { id: "Postgraduate", label: "Postgraduate", desc: "MSc, MA, MBA" },
          ]}
          value={s.study_level}
          onChange={(v) => setS({ ...s, study_level: v })}
        />
      ),
    },
    {
      title: "What do you want to study?",
      hint: "Choose your main interest.",
      ok: () => !!s.subject,
      body: (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {COURSES.map((c) => {
            const Icon = SUBJECT_ICONS[c.id] ?? GraduationCap;
            const active = s.subject === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setS({ ...s, subject: c.id })}
                className={`tap flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition active:scale-[0.98] ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface hover:bg-accent"
                }`}
              >
                <Icon className="size-5" />
                <span className="text-sm font-medium leading-tight">{c.title}</span>
              </button>
            );
          })}
        </div>
      ),
    },
    {
      title: "When do you want to start?",
      hint: "We'll match the right intake.",
      ok: () => !!s.start_year,
      body: (
        <CardGrid
          options={[
            { id: "May 2026", label: "May 2026", desc: "Spring intake" },
            { id: "September 2026", label: "September 2026", desc: "Main UK intake" },
            { id: "January 2027", label: "January 2027", desc: "Winter intake" },
            { id: "Not sure", label: "I'm flexible", desc: "Show me all options" },
          ]}
          value={s.start_year}
          onChange={(v) => setS({ ...s, start_year: v })}
        />
      ),
    },
    {
      title: "Where are you based?",
      hint: "We'll find the closest campuses.",
      ok: () => !!s.location,
      body: (
        <LocationStep value={s.location} onChange={(v) => setS({ ...s, location: v })} />
      ),
    },
    {
      title: "How can an adviser reach you?",
      hint: "We call only once. Promise.",
      ok: () => /^\+?[0-9 ()-]{7,}$/.test(s.phone) && s.consent,
      body: (
        <div className="space-y-4">
          <input
            type="tel"
            value={s.phone}
            onChange={(e) => setS({ ...s, phone: e.target.value })}
            placeholder="UK mobile e.g. 07700 900 123"
            className="tap w-full rounded-2xl border border-input bg-background px-4 py-4 text-base outline-none focus:ring-2 focus:ring-ring"
          />
          <textarea
            value={s.reason}
            onChange={(e) => setS({ ...s, reason: e.target.value })}
            placeholder="Anything else we should know? (optional)"
            rows={3}
            maxLength={500}
            className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <label className="flex items-start gap-3 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={s.consent}
              onChange={(e) => setS({ ...s, consent: e.target.checked })}
              className="mt-1 size-5"
            />
            <span>
              I agree to be contacted by a UniPath adviser about UK university options.
              See our privacy policy.
            </span>
          </label>
        </div>
      ),
    },
  ];

  const current = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  async function next() {
    if (!current.ok()) return;
    if (step < steps.length - 1) {
      setStep(step + 1);
      return;
    }
    // final submit
    setSaving(true);
    try {
      await update({
        data: {
          full_name: s.full_name,
          study_level: s.study_level,
          subject: s.subject,
          start_year: s.start_year,
          phone: s.phone,
          reason: s.reason,
          city: s.location?.city ?? undefined,
          lat: s.location?.lat,
          lng: s.location?.lng,
          onboarding_complete: true,
        },
      });
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  if (!ready) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading your onboarding…</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col safe-top">
      {/* Header */}
      <header className="px-4 pt-4">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <button
            type="button"
            onClick={() => (step > 0 ? setStep(step - 1) : navigate({ to: "/" }))}
            className="tap inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-5" />
          </button>
          <span className="font-mono text-xs text-muted-foreground">
            {step + 1} / {steps.length}
          </span>
          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/" });
            }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Sign out
          </button>
        </div>
        <div className="mx-auto mt-3 h-1.5 max-w-xl overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-gradient-to-r from-primary to-gold transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 px-4 pb-32 pt-8">
        <div key={step} className="mx-auto max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-display-md text-foreground">{current.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{current.hint}</p>
          <div className="mt-6">{current.body}</div>
        </div>
      </main>

      {/* Sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-10 safe-bottom px-4 pb-4 pt-2 glass-strong border-t border-border">
        <div className="mx-auto flex max-w-xl gap-3">
          <button
            type="button"
            onClick={next}
            disabled={!current.ok() || saving}
            className="tap flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 text-base font-medium text-primary-foreground transition active:scale-[0.98] disabled:opacity-40"
          >
            {saving ? "Finishing…" : step === steps.length - 1 ? (
              <>Finish <Check className="size-5" /></>
            ) : (
              <>Continue <ArrowRight className="size-5" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function CardGrid({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string; desc: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-3">
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={`tap rounded-2xl border p-4 text-left transition active:scale-[0.99] ${
              active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface hover:bg-accent"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium">{o.label}</p>
                <p className={`mt-0.5 text-xs ${active ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {o.desc}
                </p>
              </div>
              {active && <Check className="size-5" />}
            </div>
          </button>
        );
      })}
    </div>
  );
}
