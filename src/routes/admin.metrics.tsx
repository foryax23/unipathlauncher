import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getMyAdminStatus } from "@/lib/admin.functions";
import { getAdminMetrics } from "@/lib/admin_metrics.functions";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { TrendingUp, Users, FileText, CalendarCheck2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/admin/metrics")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/login", search: { redirect: "/admin/metrics" } });
    try {
      const status = await getMyAdminStatus();
      if (!status.isAdmin) throw redirect({ to: "/dashboard" });
    } catch (err) {
      if (err && typeof err === "object" && "isRedirect" in (err as Record<string, unknown>)) throw err;
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [
      { title: "Metrics · Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: MetricsPage,
});

type Metrics = Awaited<ReturnType<typeof getAdminMetrics>>;

function MetricsPage() {
  const load = useServerFn(getAdminMetrics);
  const [m, setM] = useState<Metrics | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    load()
      .then((r) => setM(r as Metrics))
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed"));
  }, [load]);

  return (
    <>
      <Header />
      <main className="hero-warm min-h-[calc(100vh-4rem)]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Admin</p>
              <h1 className="mt-1 font-serif text-4xl">Operations metrics</h1>
              <p className="mt-1 text-sm text-muted-foreground">Last 30 days · live</p>
            </div>
          </div>

          {err && (
            <p className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {err}
            </p>
          )}

          <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi icon={<Users className="h-5 w-5" />} label="Students" value={m?.kpis.studentsTotal} />
            <Kpi icon={<TrendingUp className="h-5 w-5" />} label="Leads (7d)" value={m?.kpis.leadsLast7} sub={`Total ${m?.kpis.leadsTotal ?? "—"}`} />
            <Kpi icon={<FileText className="h-5 w-5" />} label="Applications (7d)" value={m?.kpis.appsLast7} sub={`Total ${m?.kpis.appsTotal ?? "—"}`} />
            <Kpi icon={<CalendarCheck2 className="h-5 w-5" />} label="Bookings (7d)" value={m?.kpis.bookingsLast7} />
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            <FunnelCard title="Lead funnel" rows={normaliseFunnel(m?.leadFunnel)} />
            <FunnelCard title="Application funnel" rows={normaliseFunnel(m?.appFunnel)} />

          </section>

          <section className="mt-8">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold" />
              <h2 className="font-serif text-2xl">Adviser workload</h2>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Adviser</th>
                    <th className="px-4 py-3">Open leads</th>
                    <th className="px-4 py-3">Open applications</th>
                    <th className="px-4 py-3">Upcoming bookings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(m?.workload ?? []).map((row: any) => (
                    <tr key={row.adviser_id}>
                      <td className="px-4 py-3 font-mono text-xs">{row.adviser_id.slice(0, 8)}…</td>
                      <td className="px-4 py-3">{row.open_leads}</td>
                      <td className="px-4 py-3">{row.open_applications}</td>
                      <td className="px-4 py-3">{row.upcoming_bookings}</td>
                    </tr>
                  ))}
                  {m && m.workload.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No staff yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Kpi({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: number | undefined; sub?: string }) {
  return (
    <div className="glass-strong rounded-2xl p-5">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs uppercase tracking-wider">{label}</span>
        <span className="text-gold">{icon}</span>
      </div>
      <p className="mt-2 font-serif text-4xl text-foreground">{value ?? "—"}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function FunnelCard({ title, rows }: { title: string; rows: Array<{ status: string; n: number; day: string }> }) {
  const byStatus = new Map<string, number>();
  for (const r of rows) byStatus.set(r.status, (byStatus.get(r.status) ?? 0) + Number(r.n));
  const entries = Array.from(byStatus.entries()).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((a, [, n]) => a + n, 0) || 1;
  return (
    <div className="glass-strong rounded-2xl p-6">
      <h3 className="font-serif text-xl">{title}</h3>
      <p className="text-xs text-muted-foreground">Last 30 days</p>
      <ul className="mt-4 space-y-2.5">
        {entries.length === 0 && <li className="text-sm text-muted-foreground">No data yet.</li>}
        {entries.map(([status, n]) => (
          <li key={status}>
            <div className="flex items-center justify-between text-sm">
              <span className="capitalize text-foreground">{status}</span>
              <span className="font-medium tabular-nums">{n}</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gold transition-all"
                style={{ width: `${Math.max(4, (n / total) * 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
