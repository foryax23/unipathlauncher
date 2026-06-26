import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getApplication,
  updateMyApplicationData,
  submitMyApplication,
} from "@/lib/applications.functions";
import { listMyDocuments } from "@/lib/documents.functions";
import { DashShell } from "@/components/dashboard/DashShell";
import { ArrowLeft, ArrowRight, Check, FileText, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

const appQuery = (id: string) =>
  queryOptions({
    queryKey: ["application", id],
    queryFn: () => getApplication({ data: { id } }),
  });

const docsQuery = queryOptions({
  queryKey: ["documents"],
  queryFn: () => listMyDocuments({}),
});

export const Route = createFileRoute("/_authenticated/dashboard/applications/$id/submit")({
  loader: async ({ context, params }) => {
    const res = await context.queryClient.ensureQueryData(appQuery(params.id));
    if (!res.application) throw notFound();
    await context.queryClient.ensureQueryData(docsQuery);
    return res;
  },
  head: () => ({
    meta: [
      { title: "Submit application · Bridge Gateway" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: WizardPage,
  notFoundComponent: () => (
    <DashShell title="Not found">
      <Link to="/dashboard/applications" className="text-gold underline">Back to applications</Link>
    </DashShell>
  ),
});

type WizardData = {
  personal: { full_name: string; email: string; phone: string; nationality: string; date_of_birth: string };
  academic: { last_school: string; qualification: string; grades: string; english_test: string; english_score: string };
  documents: string[]; // document ids
  notes: string;
};

const EMPTY: WizardData = {
  personal: { full_name: "", email: "", phone: "", nationality: "", date_of_birth: "" },
  academic: { last_school: "", qualification: "", grades: "", english_test: "", english_score: "" },
  documents: [],
  notes: "",
};

const STEPS = ["Personal", "Academic", "Documents", "Review"];

function WizardPage() {
  const params = Route.useParams();
  const navigate = useNavigate();
  const { data } = useSuspenseQuery(appQuery(params.id));
  const { data: docsData } = useSuspenseQuery(docsQuery);
  const app = data.application!;

  const initial = useMemo<WizardData>(() => {
    const stored = (app as { application_data?: Partial<WizardData> }).application_data ?? {};
    return {
      personal: { ...EMPTY.personal, ...(stored.personal ?? {}) },
      academic: { ...EMPTY.academic, ...(stored.academic ?? {}) },
      documents: stored.documents ?? [],
      notes: stored.notes ?? app.notes ?? "",
    };
  }, [app]);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<WizardData>(initial);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const saveFn = useServerFn(updateMyApplicationData);
  const submitFn = useServerFn(submitMyApplication);
  const dirtyRef = useRef(false);

  // Autosave (debounced)
  useEffect(() => {
    if (!dirtyRef.current) return;
    const t = setTimeout(async () => {
      try {
        await saveFn({ data: { id: app.id, application_data: form as unknown as Record<string, unknown> } });
        setSavedAt(new Date());
        dirtyRef.current = false;
      } catch { /* silent */ }
    }, 800);
    return () => clearTimeout(t);
  }, [form, app.id, saveFn]);

  const setPersonal = (p: Partial<WizardData["personal"]>) => { dirtyRef.current = true; setForm((f) => ({ ...f, personal: { ...f.personal, ...p } })); };
  const setAcademic = (p: Partial<WizardData["academic"]>) => { dirtyRef.current = true; setForm((f) => ({ ...f, academic: { ...f.academic, ...p } })); };
  const toggleDoc = (id: string) => { dirtyRef.current = true; setForm((f) => ({ ...f, documents: f.documents.includes(id) ? f.documents.filter((x) => x !== id) : [...f.documents, id] })); };
  const setNotes = (v: string) => { dirtyRef.current = true; setForm((f) => ({ ...f, notes: v })); };

  const canNext = () => {
    if (step === 0) {
      const p = form.personal;
      return !!(p.full_name && p.email && p.phone);
    }
    if (step === 1) {
      const a = form.academic;
      return !!(a.qualification && a.grades);
    }
    return true;
  };

  const submit = useMutation({
    mutationFn: () => submitFn({ data: { id: app.id, application_data: form as unknown as Record<string, unknown> } }),
    onSuccess: () => {
      toast.success("Application submitted!");
      navigate({ to: "/dashboard/applications/$id", params: { id: app.id } });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not submit"),
  });

  const isSubmitted = app.status !== "draft";

  return (
    <DashShell eyebrow={`Step ${step + 1} of ${STEPS.length}`} title="Submit application">
      <Link to="/dashboard/applications/$id" params={{ id: app.id }} className="tap inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to application
      </Link>

      {isSubmitted && (
        <div className="mt-4 rounded-2xl border border-gold/40 bg-gold/10 p-4 text-sm">
          This application has already been submitted. You can still edit details, but a new submission isn't required.
        </div>
      )}

      {/* Progress */}
      <div className="mt-6 grid grid-cols-4 gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className={`h-1.5 rounded-full ${i <= step ? "bg-gold" : "bg-border"}`} />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{STEPS[step]}</span>
        <span className="inline-flex items-center gap-1">
          {dirtyRef.current ? <Loader2 className="size-3 animate-spin" /> : savedAt ? <Save className="size-3" /> : null}
          {savedAt ? `Saved ${savedAt.toLocaleTimeString()}` : "Autosave on"}
        </span>
      </div>

      <div className="mt-6 glass-strong rounded-3xl p-6">
        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" value={form.personal.full_name} onChange={(v) => setPersonal({ full_name: v })} required />
            <Field label="Email" type="email" value={form.personal.email} onChange={(v) => setPersonal({ email: v })} required />
            <Field label="Phone" value={form.personal.phone} onChange={(v) => setPersonal({ phone: v })} required />
            <Field label="Nationality" value={form.personal.nationality} onChange={(v) => setPersonal({ nationality: v })} />
            <Field label="Date of birth" type="date" value={form.personal.date_of_birth} onChange={(v) => setPersonal({ date_of_birth: v })} />
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Most recent school / college" value={form.academic.last_school} onChange={(v) => setAcademic({ last_school: v })} />
            <Field label="Qualification (e.g. A-Levels, IB)" value={form.academic.qualification} onChange={(v) => setAcademic({ qualification: v })} required />
            <Field label="Grades / predicted grades" value={form.academic.grades} onChange={(v) => setAcademic({ grades: v })} required className="sm:col-span-2" />
            <Field label="English test (IELTS, TOEFL, none)" value={form.academic.english_test} onChange={(v) => setAcademic({ english_test: v })} />
            <Field label="English score" value={form.academic.english_score} onChange={(v) => setAcademic({ english_score: v })} />
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="text-sm text-muted-foreground mb-3">Attach documents from your vault.</p>
            {docsData.documents.length === 0 ? (
              <Link to="/dashboard/documents" className="text-gold underline">Upload documents in your vault →</Link>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {docsData.documents.map((d) => {
                  const sel = form.documents.includes(d.id);
                  return (
                    <li key={d.id}>
                      <button
                        type="button"
                        onClick={() => toggleDoc(d.id)}
                        className={`tap w-full text-left rounded-2xl border p-3 flex items-center gap-3 transition ${sel ? "border-gold bg-gold/10" : "border-border hover:bg-accent/40"}`}
                      >
                        <FileText className="size-4 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{d.original_name}</p>
                          <p className="text-xs text-muted-foreground truncate capitalize">{d.type.replace(/_/g, " ")}</p>
                        </div>
                        {sel && <Check className="size-4 text-gold" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <label className="block mt-5">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Notes for adviser</span>
              <textarea
                value={form.notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                maxLength={2000}
                className="mt-2 w-full rounded-2xl border border-border bg-background/60 p-3 text-sm"
              />
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 text-sm">
            <Review title="Personal" rows={Object.entries(form.personal)} />
            <Review title="Academic" rows={Object.entries(form.academic)} />
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Documents attached</p>
              <p>{form.documents.length} document{form.documents.length === 1 ? "" : "s"}</p>
            </div>
            {form.notes && (
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Notes</p>
                <p className="whitespace-pre-wrap">{form.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="tap inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm disabled:opacity-50"
        >
          <ArrowLeft className="size-4" /> Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            disabled={!canNext()}
            className="tap inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            Next <ArrowRight className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => submit.mutate()}
            disabled={submit.isPending || isSubmitted}
            className="tap inline-flex items-center gap-1.5 rounded-full bg-gold px-5 py-2 text-sm font-medium text-gold-foreground disabled:opacity-50"
          >
            <Check className="size-4" /> {isSubmitted ? "Already submitted" : submit.isPending ? "Submitting…" : "Submit application"}
          </button>
        )}
      </div>
    </DashShell>
  );
}

function Field({ label, value, onChange, type = "text", required, className }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}{required && " *"}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-11 w-full rounded-full border border-border bg-background/60 px-4 text-sm"
      />
    </label>
  );
}

function Review({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{title}</p>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 border-b border-border/40 py-1">
            <dt className="text-muted-foreground capitalize">{k.replace(/_/g, " ")}</dt>
            <dd className="text-right">{v || "—"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
