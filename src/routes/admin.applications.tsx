import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminBeforeLoad } from "@/components/admin/route-guard";
import { listAllApplications } from "@/lib/staff.functions";
import { updateApplicationStatus } from "@/lib/applications.functions";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { toast } from "sonner";

const COLUMNS: Array<{ key: string; label: string }> = [
  { key: "draft", label: "Draft" },
  { key: "submitted", label: "Submitted" },
  { key: "interview", label: "Interview" },
  { key: "offer", label: "Offer" },
  { key: "accepted", label: "Accepted" },
  { key: "rejected", label: "Rejected" },
];

export const Route = createFileRoute("/admin/applications")({
  beforeLoad: () => requireAdminBeforeLoad({ to: "/admin/applications" }),
  head: () => ({
    meta: [{ title: "Applications · Admin" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: AdminApplicationsPage,
});

type App = Awaited<ReturnType<typeof listAllApplications>>["applications"][number];

function AdminApplicationsPage() {
  const fetchList = useServerFn(listAllApplications);
  const updateStatus = useServerFn(updateApplicationStatus);
  const [apps, setApps] = useState<App[] | null>(null);
  const [search, setSearch] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);

  const load = () => fetchList({ data: {} }).then((r) => setApps(r.applications as App[]));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const filtered = useMemo(() => {
    if (!apps) return [];
    const s = search.trim().toLowerCase();
    if (!s) return apps;
    return apps.filter((a) =>
      `${a.student_name ?? ""} ${a.student_email ?? ""} ${a.courses?.name ?? ""}`
        .toLowerCase()
        .includes(s),
    );
  }, [apps, search]);

  const columns = useMemo(() => {
    const map = new Map<string, App[]>(COLUMNS.map((c) => [c.key, []]));
    for (const a of filtered) {
      if (!map.has(a.status)) map.set(a.status, []);
      map.get(a.status)!.push(a);
    }
    return map;
  }, [filtered]);

  const move = async (id: string, status: string) => {
    const prev = apps;
    setApps((cur) => cur?.map((a) => (a.id === id ? { ...a, status } : a)) ?? cur);
    try {
      await updateStatus({ data: { id, status: status as never } });
      toast.success(`Moved to ${status}`);
    } catch (e) {
      setApps(prev);
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
  };

  return (
    <AdminShell eyebrow="Pipeline" title="Applications">
      <div className="glass rounded-2xl p-3 mb-5">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search student, course…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 pl-9"
          />
        </div>
      </div>

      <div className="grid gap-3 overflow-x-auto pb-4" style={{ gridTemplateColumns: `repeat(${COLUMNS.length}, minmax(260px, 1fr))` }}>
        {COLUMNS.map((col) => {
          const items = columns.get(col.key) ?? [];
          return (
            <div
              key={col.key}
              onDragOver={(e) => { e.preventDefault(); }}
              onDrop={() => { if (dragId) { move(dragId, col.key); setDragId(null); } }}
              className="glass-strong rounded-2xl p-3 min-h-[60vh]"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-foreground">{col.label}</h2>
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </div>
              <ul className="space-y-2">
                {items.map((a) => (
                  <li
                    key={a.id}
                    draggable
                    onDragStart={() => setDragId(a.id)}
                    onDragEnd={() => setDragId(null)}
                    className="rounded-xl border border-border bg-card p-3 shadow-sm cursor-grab active:cursor-grabbing hover:border-gold/50 transition"
                  >
                    <Link to="/admin/applications/$id" params={{ id: a.id }} className="block">
                      <p className="text-sm font-medium text-foreground line-clamp-2">{a.courses?.name ?? "Course"}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {a.courses?.universities?.name ?? ""}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-foreground">{a.student_name ?? a.student_email ?? "Unknown"}</span>
                        <span className="text-muted-foreground">{new Date(a.created_at).toLocaleDateString("en-GB")}</span>
                      </div>
                    </Link>
                  </li>
                ))}
                {items.length === 0 && (
                  <li className="text-center text-xs text-muted-foreground py-6">Drop here</li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
}
