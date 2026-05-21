import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { submitLead } from "@/lib/leads.functions";
import { COURSES } from "./data/courses";

const SUBJECT_OPTIONS: string[] = COURSES.map((c) => c.title);

const stepSchemas = [
  z.object({
    name: z.string().trim().min(2, "Please enter your full name"),
    email: z.string().trim().email("Please enter a valid email"),
    phone: z
      .string()
      .trim()
      .min(7, "Please enter a UK phone number")
      .regex(/^[+0-9 ()-]+$/, "Digits, spaces and + only"),
    city: z.string().trim().min(2, "Please enter your city or postcode"),
  }),
  z.object({
    subject: z.string().min(2, "Please choose a subject"),
    study_level: z.enum(["Foundation", "Undergraduate", "Postgraduate"]),
    start_year: z.enum(["2025", "2026", "2027"]),
  }),
  z.object({
    reason: z.string().min(2, "Please choose a reason"),
    source: z.string().min(2, "Please choose an option"),
    consent: z.literal(true, {
      errorMap: () => ({ message: "Please tick the consent box to continue" }),
    }),
  }),
];

type Errors = Record<string, string>;

type FormState = {
  name: string;
  email: string;
  phone: string;
  city: string;
  subject: string;
  study_level: "" | "Foundation" | "Undergraduate" | "Postgraduate";
  start_year: "" | "2025" | "2026" | "2027";
  reason: string;
  source: string;
  consent: boolean;
};

const INITIAL: FormState = {
  name: "",
  email: "",
  phone: "",
  city: "",
  subject: "",
  study_level: "",
  start_year: "",
  reason: "",
  source: "",
  consent: false,
};

export function LeadForm({ preselectedSubject }: { preselectedSubject: string | null }) {
  const submit = useServerFn(submitLead);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Sync preselected subject in
  if (preselectedSubject && data.subject !== preselectedSubject && step <= 1) {
    setData((d) => ({ ...d, subject: preselectedSubject }));
  }

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const validateStep = (i: number) => {
    const schema = stepSchemas[i];
    const result = schema.safeParse(data);
    if (result.success) {
      setErrors({});
      return true;
    }
    const errs: Errors = {};
    for (const issue of result.error.issues) {
      const k = String(issue.path[0]);
      if (!errs[k]) errs[k] = issue.message;
    }
    setErrors(errs);
    return false;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, 2));
  };

  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(2)) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submit({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          city: data.city,
          subject: data.subject,
          study_level: data.study_level as "Foundation" | "Undergraduate" | "Postgraduate",
          start_year: data.start_year as "2025" | "2026" | "2027",
          reason: data.reason,
          source: data.source,
          consent: true,
        },
      });
      setSuccess(data.name);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-10 text-center shadow-sm">
        <p className="text-xs uppercase tracking-[0.22em] text-gold">All done</p>
        <h3 className="mt-4 font-serif text-3xl text-foreground sm:text-4xl">
          Thank you, {success}.
        </h3>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          A university adviser will contact you within 24 hours with your free
          shortlist. Keep an eye on your inbox.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-10"
      noValidate
    >
      <Progress step={step} />

      {step === 0 && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <Field label="Full name" id="name" error={errors.name}>
            <input
              id="name"
              autoComplete="name"
              value={data.name}
              onChange={(e) => update("name", e.target.value)}
              className={inputCls(errors.name)}
            />
          </Field>
          <Field label="Email" id="email" error={errors.email}>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={data.email}
              onChange={(e) => update("email", e.target.value)}
              className={inputCls(errors.email)}
            />
          </Field>
          <Field label="Phone (UK)" id="phone" hint="e.g. 07123 456 789" error={errors.phone}>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              value={data.phone}
              onChange={(e) => update("phone", e.target.value)}
              className={inputCls(errors.phone)}
            />
          </Field>
          <Field label="City or postcode" id="city" error={errors.city}>
            <input
              id="city"
              autoComplete="address-level2"
              value={data.city}
              onChange={(e) => update("city", e.target.value)}
              className={inputCls(errors.city)}
            />
          </Field>
        </div>
      )}

      {step === 1 && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <Field label="Desired subject" id="subject" error={errors.subject}>
            <select
              id="subject"
              value={data.subject}
              onChange={(e) => update("subject", e.target.value)}
              className={inputCls(errors.subject)}
            >
              <option value="">Choose a subject…</option>
              {SUBJECT_OPTIONS.map((s: string) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Study level" id="study_level" error={errors.study_level}>
            <select
              id="study_level"
              value={data.study_level}
              onChange={(e) =>
                update("study_level", e.target.value as FormState["study_level"])
              }
              className={inputCls(errors.study_level)}
            >
              <option value="">Choose…</option>
              <option>Foundation</option>
              <option>Undergraduate</option>
              <option>Postgraduate</option>
            </select>
          </Field>
          <Field label="Intended start year" id="start_year" error={errors.start_year}>
            <select
              id="start_year"
              value={data.start_year}
              onChange={(e) =>
                update("start_year", e.target.value as FormState["start_year"])
              }
              className={inputCls(errors.start_year)}
            >
              <option value="">Choose…</option>
              <option>2025</option>
              <option>2026</option>
              <option>2027</option>
            </select>
          </Field>
        </div>
      )}

      {step === 2 && (
        <div className="mt-8 grid gap-5">
          <Field label="Main reason for applying" id="reason" error={errors.reason}>
            <select
              id="reason"
              value={data.reason}
              onChange={(e) => update("reason", e.target.value)}
              className={inputCls(errors.reason)}
            >
              <option value="">Choose…</option>
              <option>First-time applicant</option>
              <option>Career change</option>
              <option>Upgrade qualification</option>
              <option>International study</option>
            </select>
          </Field>
          <Field label="How did you hear about us?" id="source" error={errors.source}>
            <select
              id="source"
              value={data.source}
              onChange={(e) => update("source", e.target.value)}
              className={inputCls(errors.source)}
            >
              <option value="">Choose…</option>
              <option>Instagram</option>
              <option>TikTok</option>
              <option>Google search</option>
              <option>Friend or family</option>
              <option>School or college</option>
              <option>Other</option>
            </select>
          </Field>
          <label className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-4 text-sm">
            <input
              type="checkbox"
              checked={data.consent}
              onChange={(e) => update("consent", e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-border accent-primary"
            />
            <span className="text-foreground/85">
              I agree that Bridge Gateway Consulting may contact me about my university enquiry. I
              can withdraw consent at any time. See our Privacy Policy.
            </span>
          </label>
          {errors.consent && (
            <p className="-mt-2 text-sm text-destructive">{errors.consent}</p>
          )}
        </div>
      )}

      {submitError && (
        <p className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {submitError}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="inline-flex h-12 min-w-[100px] items-center justify-center rounded-full border border-border bg-surface px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          Back
        </button>
        {step < 2 ? (
          <button
            type="button"
            onClick={next}
            className="inline-flex h-12 min-w-[140px] items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-12 min-w-[200px] items-center justify-center rounded-full bg-gold px-6 text-sm font-semibold text-gold-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Get my free shortlist →"}
          </button>
        )}
      </div>
    </form>
  );
}

function Progress({ step }: { step: number }) {
  const labels = ["About you", "Your studies", "Your goals"];
  return (
    <ol className="grid grid-cols-3 gap-3" aria-label="Form progress">
      {labels.map((label, i) => (
        <li key={label} className="flex flex-col gap-2">
          <div
            className={`h-1.5 rounded-full ${
              i <= step ? "bg-gold" : "bg-muted"
            }`}
          />
          <span
            className={`text-xs uppercase tracking-wider ${
              i <= step ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {String(i + 1).padStart(2, "0")} · {label}
          </span>
        </li>
      ))}
    </ol>
  );
}

function Field({
  label,
  id,
  hint,
  error,
  children,
}: {
  label: string;
  id: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function inputCls(error?: string) {
  return `h-12 w-full rounded-lg border bg-background px-3.5 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring ${
    error ? "border-destructive" : "border-border"
  }`;
}
