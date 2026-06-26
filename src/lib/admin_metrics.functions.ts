import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertStaff(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["admin", "adviser"])
    .maybeSingle();
  if (!data) throw new Error("Forbidden");
}

function isoDaysAgo(n: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

export const getAdminMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.userId);

    const since30 = isoDaysAgo(30);
    const since7 = isoDaysAgo(7);

    const [
      leadsTotal,
      leads7,
      appsTotal,
      apps7,
      bookings7,
      students,
      leadFunnel,
      appFunnel,
      workload,
    ] = await Promise.all([
      supabaseAdmin.from("leads").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("leads").select("id", { count: "exact", head: true }).gte("created_at", since7),
      supabaseAdmin.from("applications").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("applications").select("id", { count: "exact", head: true }).gte("created_at", since7),
      supabaseAdmin.from("bookings").select("id", { count: "exact", head: true }).gte("created_at", since7),
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("v_lead_funnel").select("*").gte("day", since30.slice(0, 10)),
      supabaseAdmin.from("v_application_funnel").select("*").gte("day", since30.slice(0, 10)),
      supabaseAdmin.from("v_adviser_workload").select("*"),
    ]);

    return {
      kpis: {
        leadsTotal: leadsTotal.count ?? 0,
        leadsLast7: leads7.count ?? 0,
        appsTotal: appsTotal.count ?? 0,
        appsLast7: apps7.count ?? 0,
        bookingsLast7: bookings7.count ?? 0,
        studentsTotal: students.count ?? 0,
      },
      leadFunnel: leadFunnel.data ?? [],
      appFunnel: appFunnel.data ?? [],
      workload: workload.data ?? [],
    };
  });
