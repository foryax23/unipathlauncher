import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  getApplication,
  updateMyApplicationNotes,
  withdrawApplication,
} from "@/lib/applications.functions";
import { DashShell } from "@/components/dashboard/DashShell";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { toast } from "sonner";
import { ArrowLeft, Save, Trash2 } from "lucide-react";

const appQuery = (id: string) =>
  queryOptions({
    queryKey: ["application", id],
    queryFn: () => getApplication({ data: { id } }),
  });

export const Route = createFileRoute("/_authenticated/dashboard/applications/$id")({
  loader: async ({ context, params }) => {
    const res = await context.queryClient.ensureQueryData(appQuery(params.id));
    if (!res.application) throw notFound();
    return res;
  },
  head: () => ({
    meta: [
      { title: "Application · Bridge Gateway" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AppDetail,
  notFoundComponent: () => (
    <DashShell title="Not found">
      <Link to="/dashboard/applications" className="text-gold underline">Back to applications</Link>
    </DashShell>
  ),
});

function AppDetail() {
  const params = Route.useParams();
  const { data } = useSuspenseQuery(appQuery(params.id));
  const qc = useQueryClient();
  const app = data.application!;
  const c = (app as { courses?: { id?: string; name?: string; level?: string; subject?: string; slug?: string; universities?: { id?: string; name?: string; city?: string; slug?: string } } }).courses;
  const uni = c?.universities;
  const canReview = (app.status === "accepted" || app.status === "enrolled") && uni?.id;

  const [notes, setNotes] = useState(app.notes ?? "");
  const saveNotes = useServerFn(updateMyApplicationNotes);
  const withdrawFn = useServerFn(withdrawApplication);

  const save = useMutation({
    mutationFn: () => saveNotes({ data: { id: app.id, notes } }),
    onSuccess: () => {
      toast.success("Notes saved");
      qc.invalidateQueries({ queryKey: ["application", app.id] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save"),
  });

  const withdraw = useMutation({
    mutationFn: () => withdrawFn({ data: { id: app.id } }),
    onSuccess: () => {
      toast.success("Application withdrawn");
      qc.invalidateQueries({ queryKey: ["application", app.id] });
      qc.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  return (
    <DashShell>
      <Link
        to="/dashboard/applications"
        className="tap inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All applications
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            {c?.level ?? "Application"} · {uni?.name ?? ""}
          </p>
          <h1 className="mt-2 font-serif text-display-md">{c?.name ?? "Application"}</h1>
        </div>
        <StatusPill status={app.status} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="glass-strong rounded-3xl p-6">
          <h2 className="font-serif text-xl">Timeline</h2>
          <ol className="mt-4 relative border-l border-border pl-5 space-y-4">
            {data.events.map((e) => (
              <li key={e.id} className="">
                <span className="absolute -left-1.5 mt-1 size-3 rounded-full bg-gold" />
                <p className="text-sm font-medium">{prettyEvent(e.type)}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(e.created_at).toLocaleString()}
                </p>
              </li>
            ))}
            {data.events.length === 0 && (
              <li className="text-sm text-muted-foreground">No events yet.</li>
            )}
          </ol>
        </section>

        <aside className="space-y-4">
          <div className="glass rounded-3xl p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Notes</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
              maxLength={4000}
              placeholder="Add any context for your adviser…"
              className="mt-2 w-full rounded-2xl border border-border bg-background/60 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
            <button
              type="button"
              onClick={() => save.mutate()}
              disabled={save.isPending}
              className="tap mt-3 inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-medium text-gold-foreground hover:opacity-90 transition"
            >
              <Save className="size-4" /> {save.isPending ? "Saving…" : "Save notes"}
            </button>
          </div>

          {c?.slug && (
            <Link
              to="/courses/$slug"
              params={{ slug: c.slug }}
              className="tap block glass rounded-3xl p-5 hover:bg-accent/30 transition"
            >
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Course</p>
              <p className="mt-1 font-serif text-lg">{c.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">View course details →</p>
            </Link>
          )}

          <Link
            to="/dashboard/applications/$id/submit"
            params={{ id: app.id }}
            className="tap block rounded-full bg-gold px-5 py-3 text-center text-sm font-medium text-gold-foreground hover:opacity-90 transition"
          >
            {app.status === "draft" ? "Complete & submit application →" : "Edit application details →"}
          </Link>

          {app.status !== "withdrawn" && app.status !== "enrolled" && (
            <button
              type="button"
              onClick={() => {
                if (confirm("Withdraw this application?")) withdraw.mutate();
              }}
              disabled={withdraw.isPending}
              className="tap inline-flex w-full items-center justify-center gap-2 rounded-full border border-destructive/40 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition"
            >
              <Trash2 className="size-4" /> Withdraw application
            </button>
          )}
        </aside>
      </div>
    </DashShell>
  );
}

function prettyEvent(type: string) {
  const map: Record<string, string> = {
    created: "Application created",
    "status.submitted": "Submitted to university",
    "status.interview": "Interview scheduled",
    "status.offer": "Offer received",
    "status.accepted": "Offer accepted",
    "status.rejected": "Decision: not progressed",
    "status.withdrawn": "Application withdrawn",
    "status.enrolled": "Enrolled",
  };
  return map[type] ?? type;
}
