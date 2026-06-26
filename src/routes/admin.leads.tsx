import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminBeforeLoad } from "@/components/admin/route-guard";
import { listLeads, updateLead } from "@/lib/leads.functions";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type Lead = {
  id: string; name: string | null; email: string | null; phone: string | null;
  city: string | null; subject: string | null; study_level: string | null;
  start_year: string | null; status: string | null; internal_notes: string | null;
  created_at: string;
};

const STATUS = ["new","contacted","qualified","converted","lost","spam"] as const;

export const Route = createFileRoute("/admin/leads")({
  beforeLoad: () => requireAdminBeforeLoad({ to: "/admin/leads" }),
  head: () => ({ meta: [{ title: "Leads · Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminLeadsPage,
});

function AdminLeadsPage() {
  const fetch = useServerFn(listLeads);
  const save = useServerFn(updateLead);
  const [rows, setRows] = useState<Lead[] | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const reload = () => fetch().then((r) => setRows(r.leads as Lead[]));
  useEffect(() => { reload(); /* eslint-disable-next-line */ }, []);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const s = search.trim().toLowerCase();
    return rows.filter((l) => {
      if (filter !== "all" && (l.status ?? "new") !== filter) return false;
      if (s) {
        const hay = `${l.name ?? ""} ${l.email ?? ""} ${l.city ?? ""} ${l.subject ?? ""}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }, [rows, filter, search]);

  return (
    <AdminShell eyebrow="Inbox" title="Leads">
      <div className="glass rounded-2xl p-3 mb-5 flex flex-wrap gap-3 items-center">
        <div className="relative max-w-sm flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-11 pl-9" />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="h-11 w-[170px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="ml-auto inline-flex h-11 items-center rounded-full bg-gold px-4 text-sm font-semibold text-gold-foreground">
          {rows ? `${filtered.length} of ${rows.length}` : "…"}
        </span>
      </div>

      <div className="glass-strong overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>{["When","Name","Email","Phone","Subject","Status",""].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {!rows && <tr><td className="px-4 py-6 text-muted-foreground" colSpan={7}>Loading…</td></tr>}
              {filtered.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{new Date(l.created_at).toLocaleDateString("en-GB")}</td>
                  <td className="px-4 py-3 font-medium">{l.name ?? "—"}</td>
                  <td className="px-4 py-3">{l.email ?? "—"}</td>
                  <td className="px-4 py-3">{l.phone ?? "—"}</td>
                  <td className="px-4 py-3">{l.subject ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Select
                      value={l.status ?? "new"}
                      onValueChange={async (v) => {
                        try { await save({ data: { id: l.id, status: v as never } }); toast.success(`Updated to ${v}`); reload(); }
                        catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
                      }}
                    >
                      <SelectTrigger className="h-9 w-[140px]"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {l.email && (
                      <a className="text-sm underline-offset-4 hover:underline" href={`mailto:${l.email}`}>Email</a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
