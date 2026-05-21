import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft, ArrowRight, Check, GraduationCap, Briefcase, Stethoscope,
  Code, Scale, Wrench, Palette, BookOpen, Plane, Brain, Mail,
} from "lucide-react";
import { LocationStep } from "@/components/onboarding/LocationStep";
import { COURSES } from "@/components/marketing/data/courses";
import { updateMyProfile, getMyProfile } from "@/lib/profile.functions";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Get matched · Bridge Gateway" },
      { name: "description", content: "Tell us about you and get a personalised UK university shortlist in 2 minutes." },
    ],
  }),
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

const EMPTY: State = {
  full_name: "",
  study_level: "",
  subject: "",
  start_year: "",
  location: null,
  phone: "",
  reason: "",
  consent: false,
};

const STATE_KEY = "bgc:onboarding";
const STEP_KEY = "bgc:onboarding:step";
const LEVEL_KEY = "bgc:level";

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

function loadState(): { state: State; step: number } {
  if (typeof window === "undefined") return { state: EMPTY, step: 0 };
  try {
    const raw = localStorage.getItem(STATE_KEY);
    const parsed = raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
    const preLevel = localStorage.getItem(LEVEL_KEY);
    if (preLevel && !parsed.study_level) parsed.study_level = preLevel;
    const step = Number(localStorage.getItem(STEP_KEY) ?? "0") || 0;
    return { state: parsed, step };
  } catch {
    return { state: EMPTY, step: 0 };
  }
}

function OnboardingPage() {
  const navigate = useNavigate();
  const update = useServerFn(updateMyProfile);
  const fetchProfile = useServerFn(getMyProfile);

  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [s, setS] = useState<State>(EMPTY);
  const [hasSession, setHasSession] = useState(false);
  const persisting = useRef(false);

  // Account step
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Hydrate from localStorage + any existing session
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { state, step } = loadState();
      if (!cancelled) {
        setS(state);
        setStep(Math.min(step, 6));
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session) {
        setHasSession(true);
        setEmail(session.user.email ?? "");
        try {
          const r = await fetchProfile({});
          if (cancelled) return;
          if (r.profile?.onboarding_complete) {
            navigate({ to: "/dashboard" });
            return;
          }
          if (r.profile) {
            setS((prev) => ({
              ...prev,
              full_name: r.profile?.full_name || prev.full_name,
              study_level: r.profile?.study_level || prev.study_level,
              subject: r.profile?.subject || prev.subject,
              start_year: r.profile?.start_year || prev.start_year,
              phone: r.profile?.phone || prev.phone,
              location: r.profile?.lat != null && r.profile?.lng != null
                ? { lat: r.profile.lat, lng: r.profile.lng, city: r.profile.city }
                : prev.location,
            }));
          }
        } catch (err) {
          console.error(err);
        }
      }
      setHydrated(true);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist state + step on every change
  useEffect(() => {
    if (!hydrated || persisting.current) return;
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(s));
      localStorage.setItem(STEP_KEY, String(step));
    } catch { /* noop */ }
  }, [s, step, hydrated]);

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
            { id: "Foundation", label: "Foundation", desc: "Entry route, no prior degree" },
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
      body: <LocationStep value={s.location} onChange={(v) => setS({ ...s, location: v })} />,
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
              I agree to be contacted by a Bridge Gateway adviser about UK university options.
              See our privacy policy.
            </span>
          </label>
        </div>
      ),
    },
    {
      title: hasSession ? "All set!" : "Create your account",
      hint: hasSession
        ? "We'll save your matches and take you to your dashboard."
        : "Save your shortlist and finish in one tap.",
      ok: () => hasSession || (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) && password.length >= 6),
      body: hasSession ? (
        <div className="rounded-2xl border border-border bg-surface p-5 text-sm text-muted-foreground">
          You're signed in as <span className="font-medium text-foreground">{email}</span>.
          Hit Finish to see your dashboard.
        </div>
      ) : (
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={saving}
            className="tap w-full inline-flex items-center justify-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground transition hover:bg-accent disabled:opacity-50"
          >
            <GoogleIcon /> Continue with Google
          </button>
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="space-y-3">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="tap w-full rounded-2xl border border-input bg-background px-4 py-4 pl-11 text-base outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <input
              type="password"
              autoComplete="new-password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6 chars)"
              className="tap w-full rounded-2xl border border-input bg-background px-4 py-4 text-base outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground">
              By continuing you agree to our terms. We'll email you a link to verify your address.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const current = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  async function handleGoogle() {
    setSaving(true);
    try {
      // Persist before redirecting so we restore on return.
      try {
        localStorage.setItem(STATE_KEY, JSON.stringify(s));
        localStorage.setItem(STEP_KEY, String(step));
      } catch { /* noop */ }
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/onboarding",
      });
      if (result.error) {
        toast.error("Google sign-in failed. Try email instead.");
        setSaving(false);
        return;
      }
      if (!result.redirected) {
        await finishOnboarding();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
      setSaving(false);
    }
  }

  async function ensureSession(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) return true;
    // Try sign up first; if email exists, fall back to sign in.
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: s.full_name } },
    });
    if (!signUpErr && signUpData.session) return true;
    if (signUpErr && /already|registered|exists/i.test(signUpErr.message)) {
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) {
        toast.error("That email is already registered. Use the correct password or sign in.");
        return false;
      }
      return true;
    }
    if (signUpErr) {
      toast.error(signUpErr.message);
      return false;
    }
    return !!signUpData.session;
  }

  async function finishOnboarding() {
    setSaving(true);
    try {
      const ok = await ensureSession();
      if (!ok) return;
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
      persisting.current = true;
      try {
        localStorage.removeItem(STATE_KEY);
        localStorage.removeItem(STEP_KEY);
        localStorage.removeItem(LEVEL_KEY);
      } catch { /* noop */ }
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  async function next() {
    if (!current.ok()) return;
    if (step < steps.length - 1) {
      setStep(step + 1);
      return;
    }
    await finishOnboarding();
  }

  if (!hydrated) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col safe-top">
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
            onClick={() => navigate({ to: "/" })}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Save & exit
          </button>
        </div>
        <div className="mx-auto mt-3 h-1.5 max-w-xl overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-gradient-to-r from-primary to-gold transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main className="flex-1 px-4 pb-32 pt-8">
        <div key={step} className="mx-auto max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-display-md text-foreground">{current.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{current.hint}</p>
          <div className="mt-6">{current.body}</div>
        </div>
      </main>

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
  options, value, onChange,
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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.4 26.8 36 24 36c-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.6 39.7 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C41.4 35.6 44 30.2 44 24c0-1.2-.1-2.3-.4-3.5z"/>
    </svg>
  );
}
