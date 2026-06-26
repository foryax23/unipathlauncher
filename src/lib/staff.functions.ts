import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { assertStaff } from "@/lib/auth/assert.server";

export const listAllApplications = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        status: z.string().trim().max(40).optional(),
        search: z.string().trim().max(120).optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context.userId);
    let q = supabaseAdmin
      .from("applications")
      .select(
        "id,status,submitted_at,decision,decision_at,notes,created_at,user_id,adviser_id,courses(id,slug,name,level,subject,universities(id,slug,name,city,logo_url))",
      )
      .order("created_at", { ascending: false })
      .limit(500);
    if (data.status && data.status !== "all") q = q.eq("status", data.status as never);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    // Resolve student names + emails (best-effort)
    const userIds = Array.from(new Set((rows ?? []).map((r) => r.user_id)));
    const profiles = new Map<string, { full_name: string | null }>();
    const emails = new Map<string, string>();
    if (userIds.length) {
      const { data: profs } = await supabaseAdmin
        .from("profiles")
        .select("user_id,full_name")
        .in("user_id", userIds);
      for (const p of profs ?? []) profiles.set(p.user_id, { full_name: p.full_name });
      const { data: users } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      for (const u of users?.users ?? []) if (u.email) emails.set(u.id, u.email);
    }
    let apps = (rows ?? []).map((r) => ({
      ...r,
      student_name: profiles.get(r.user_id)?.full_name ?? null,
      student_email: emails.get(r.user_id) ?? null,
    }));
    if (data.search) {
      const s = data.search.toLowerCase();
      apps = apps.filter((a) =>
        `${a.student_name ?? ""} ${a.student_email ?? ""} ${a.courses?.name ?? ""}`
          .toLowerCase()
          .includes(s),
      );
    }
    return { applications: apps };
  });

export const getStaffApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context.userId);
    const [{ data: app, error: ae }, { data: events, error: ee }] = await Promise.all([
      supabaseAdmin
        .from("applications")
        .select(
          "*,courses(id,slug,name,level,subject,universities(id,slug,name,city,logo_url))",
        )
        .eq("id", data.id)
        .maybeSingle(),
      supabaseAdmin
        .from("application_events")
        .select("*")
        .eq("application_id", data.id)
        .order("created_at", { ascending: false }),
    ]);
    if (ae) throw new Error(ae.message);
    if (ee) throw new Error(ee.message);
    let studentEmail: string | null = null;
    let studentName: string | null = null;
    if (app?.user_id) {
      const { data: u } = await supabaseAdmin.auth.admin.getUserById(app.user_id);
      studentEmail = u?.user?.email ?? null;
      const { data: p } = await supabaseAdmin
        .from("profiles")
        .select("full_name,phone,city,subject,study_level,start_year")
        .eq("user_id", app.user_id)
        .maybeSingle();
      studentName = p?.full_name ?? null;
      return { application: app, events: events ?? [], student: { email: studentEmail, name: studentName, profile: p } };
    }
    return { application: app, events: events ?? [], student: null };
  });

export const assignApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        adviser_id: z.string().uuid().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context.userId);
    const { error } = await supabaseAdmin
      .from("applications")
      .update({ adviser_id: data.adviser_id })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("application_events").insert({
      application_id: data.id,
      type: "assigned",
      actor_id: context.userId,
      payload: { adviser_id: data.adviser_id } as never,
    });
    const { logAudit } = await import("@/lib/audit.server");
    await logAudit({
      actorId: context.userId,
      actorEmail: context.claims?.email ?? null,
      action: "application.assign",
      targetType: "application",
      targetId: data.id,
      payload: { adviser_id: data.adviser_id },
    });
    return { ok: true as const };
  });

export const listStaffAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        action: z.string().trim().max(80).optional(),
        limit: z.number().int().positive().max(500).default(200),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context.userId);
    let q = supabaseAdmin
      .from("admin_audit")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.action) q = q.eq("action", data.action);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { entries: rows ?? [] };
  });

export const listAdvisers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.userId);
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("user_id,role")
      .in("role", ["admin", "adviser"]);
    const ids = Array.from(new Set((roles ?? []).map((r) => r.user_id)));
    if (!ids.length) return { advisers: [] };
    const { data: users } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const out = ids
      .map((id) => {
        const u = users?.users.find((x) => x.id === id);
        return { id, email: u?.email ?? null };
      })
      .filter((x) => !!x.email);
    return { advisers: out };
  });
