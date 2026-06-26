import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminBeforeLoad } from "@/components/admin/route-guard";
import { getStaffApplication, assignApplication, listAdvisers } from "@/lib/staff.functions";
import { updateApplicationStatus } from "@/lib/applications.functions";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const STATUSES = ["draft","submitted","interview","offer","accepted","rejected","withdrawn","enrolled"] as const;

export const Route = createFileRoute("/admin/applications/$id")({
  beforeLoad: ({ params }) =>
    requireAdminBeforeLoad({ to: `/admin/applications/${params.id}` }),
  head: () => ({ meta: [{ title: "Application · Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminApplicationDetail,
});

function AdminApplicationDetail() {
  const { id } = Route.useParams();
  const fetchApp = useServerFn(getStaffApplication);
  const fetchAdvisers = useServerFn(listAdvisers);
  const updateStatus = useServerFn(updateApplicationStatus);
  const assign = useServerFn(assignApplication);

  const [data, setData] = useState<Awaited<ReturnType<typeof getStaffApplication>> | null>(null);
  const [advisers, setAdvisers] = useState<{ id: string; email: string | null }[]>([]);

  const reload = () =>
    fetchApp({ data: { id } }).then((r) => setData(r as never));

  useEffect(() => {
    reload();
    fetchAdvisers().then((r) => setAdvisers(r.advisers));
    /* eslint-disable-next-line */
  }, [id]);

  const app = data?.application as { id: string; status: string; adviser_id: string | null; user_id: string; notes: string | null; courses?: { name?: string | null; universities?: { name?: string | null } | null } | null } | null;
  const events = (data?.events ?? []) as { id: string; type: string; created_at: string; payload?: Record<string, unknown> | null }[];
  const student = data?.student as { name: string | null; email: string | null; profile: Record<string, unknown> | null } | null;

  return (
    <AdminShell eyebrow="Application" title={app?.courses?.name ?? "Application"}>
      <Link to="/admin/applications" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="size-4" /> Back to pipeline
      </Link>

      {!data && <p className="text-muted-foreground">Loading…</p>}

      {app && (
        <div className="grid gap-5 lg:grid-cols-3">
          <section className="glass-strong rounded-3xl p-5 lg:col-span-2 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">University</p>
              <p className="font-serif text-2xl">{app.courses?.universities?.name ?? "—"}</p>
              <p className="text-sm text-muted-foreground">{app.courses?.name ?? ""}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Status</span>
                <Select value={app.status} onValueChange={async (v) => {
                  try { await updateStatus({ data: { id: app.id, status: v as never } }); toast.success(`Status → ${v}`); reload(); }
                  catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
                }}>
                  <SelectTrigger className="mt-1 h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Assigned adviser</span>
                <Select value={app.adviser_id ?? "_none"} onValueChange={async (v) => {
                  try { await assign({ data: { id: app.id, adviser_id: v === "_none" ? null : v } }); toast.success("Assigned"); reload(); }
                  catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
                }}>
                  <SelectTrigger className="mt-1 h-11"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Unassigned</SelectItem>
                    {advisers.map((a) => <SelectItem key={a.id} value={a.id}>{a.email ?? a.id.slice(0,8)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </label>
            </div>

            {app.notes && (
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Student notes</p>
                <p className="mt-1 whitespace-pre-wrap text-sm">{app.notes}</p>
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <div className="glass-strong rounded-3xl p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Student</p>
              <p className="mt-1 font-serif text-xl">{student?.name ?? "—"}</p>
              <p className="text-sm text-muted-foreground">{student?.email ?? "—"}</p>
            </div>
            <div className="glass-strong rounded-3xl p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-2">Timeline</p>
              <ul className="space-y-2 text-sm">
                {events.map((e) => (
                  <li key={e.id} className="rounded-lg border border-border bg-card/60 px-3 py-2">
                    <p className="text-foreground">{e.type}</p>
                    <p className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString("en-GB")}</p>
                  </li>
                ))}
                {events.length === 0 && <p className="text-xs text-muted-foreground">No events yet.</p>}
              </ul>
            </div>
          </aside>
        </div>
      )}
    </AdminShell>
  );
}
