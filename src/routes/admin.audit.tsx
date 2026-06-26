import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminBeforeLoad } from "@/components/admin/route-guard";
import { listStaffAudit } from "@/lib/staff.functions";

type Entry = {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  payload: Record<string, unknown> | null;
  ip: string | null;
  created_at: string;
};

export const Route = createFileRoute("/admin/audit")({
  beforeLoad: () => requireAdminBeforeLoad({ to: "/admin/audit" }),
  head: () => ({ meta: [{ title: "Audit · Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminAuditPage,
});

function AdminAuditPage() {
  const fetch = useServerFn(listStaffAudit);
  const [rows, setRows] = useState<Entry[] | null>(null);

  useEffect(() => {
    fetch({ data: {} }).then((r) => setRows(r.entries as Entry[]));
  }, [fetch]);

  return (
    <AdminShell eyebrow="Compliance" title="Audit log">
      <div className="glass-strong overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>{["When","Actor","Action","Target","IP"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {!rows && <tr><td className="px-4 py-6 text-muted-foreground" colSpan={5}>Loading…</td></tr>}
              {rows && rows.length === 0 && <tr><td className="px-4 py-6 text-muted-foreground" colSpan={5}>No activity yet.</td></tr>}
              {rows?.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(r.created_at).toLocaleString("en-GB")}</td>
                  <td className="px-4 py-3">{r.actor_email ?? r.actor_id?.slice(0,8) ?? "—"}</td>
                  <td className="px-4 py-3 font-medium">{r.action}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.target_type ? `${r.target_type}: ${r.target_id?.slice(0,8) ?? ""}` : "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.ip ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
