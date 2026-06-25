import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const createSchema = z.object({
  course_id: z.string().uuid(),
  intake_id: z.string().uuid().optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const listMyApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("applications")
      .select(
        "id,status,submitted_at,decision,decision_at,notes,created_at,courses(id,slug,name,level,subject,universities(id,slug,name,city,logo_url))",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { applications: data ?? [] };
  });

export const createApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => createSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("applications")
      .insert({
        user_id: userId,
        course_id: data.course_id,
        intake_id: data.intake_id ?? null,
        notes: data.notes ?? null,
        status: "draft",
      })
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);

    if (row) {
      await supabase.from("application_events").insert({
        application_id: row.id,
        type: "created",
        actor_id: userId,
        payload: { source: "student" },
      });
    }
    return { application: row };
  });

export const createApplicationBySlug = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        slug: z.string().trim().min(1).max(160),
        notes: z.string().trim().max(2000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: course, error: ce } = await supabase
      .from("courses")
      .select("id")
      .eq("slug", data.slug)
      .eq("is_active", true)
      .maybeSingle();
    if (ce) throw new Error(ce.message);
    if (!course) throw new Error("Course not found");

    // De-dupe: if an active application exists already, return it
    const { data: existing } = await supabase
      .from("applications")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", course.id)
      .not("status", "in", "(rejected,withdrawn)")
      .maybeSingle();
    if (existing) return { application: existing };

    const { data: row, error } = await supabase
      .from("applications")
      .insert({
        user_id: userId,
        course_id: course.id,
        notes: data.notes ?? null,
        status: "draft",
      })
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);

    if (row) {
      await supabase.from("application_events").insert({
        application_id: row.id,
        type: "created",
        actor_id: userId,
        payload: { source: "student" },
      });
    }
    return { application: row };
  });

const notesSchema = z.object({
  id: z.string().uuid(),
  notes: z.string().trim().max(4000),
});

export const updateMyApplicationNotes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => notesSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("applications")
      .update({ notes: data.notes })
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const withdrawApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("applications")
      .update({ status: "withdrawn" })
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    await supabase.from("application_events").insert({
      application_id: data.id,
      type: "status.withdrawn",
      actor_id: userId,
      payload: { source: "student" },
    });
    return { ok: true as const };
  });

export const getApplication = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const [{ data: app, error: ae }, { data: events, error: ee }] = await Promise.all([
      supabase
        .from("applications")
        .select(
          "*,courses(id,slug,name,level,subject,universities(id,slug,name,city,logo_url))",
        )
        .eq("id", data.id)
        .maybeSingle(),
      supabase
        .from("application_events")
        .select("*")
        .eq("application_id", data.id)
        .order("created_at", { ascending: false }),
    ]);
    if (ae) throw new Error(ae.message);
    if (ee) throw new Error(ee.message);
    return { application: app, events: events ?? [] };
  });

export const addApplicationEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        application_id: z.string().uuid(),
        type: z.string().trim().min(1).max(60),
        payload: z.record(z.unknown()).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("application_events").insert({
      application_id: data.application_id,
      type: data.type,
      actor_id: userId,
      payload: (data.payload ?? {}) as never,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

const updateStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum([
    "draft",
    "submitted",
    "interview",
    "offer",
    "accepted",
    "rejected",
    "withdrawn",
    "enrolled",
  ]),
  decision: z.string().trim().max(200).optional(),
});

export const updateApplicationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => updateStatusSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertStaff } = await import("@/lib/auth/assert.server");
    await assertStaff(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const patch: Record<string, unknown> = { status: data.status };
    if (data.status === "submitted") patch.submitted_at = new Date().toISOString();
    if (["offer", "accepted", "rejected"].includes(data.status)) {
      patch.decision_at = new Date().toISOString();
      if (data.decision) patch.decision = data.decision;
    }

    const { data: row, error } = await supabaseAdmin
      .from("applications")
      .update(patch as never)
      .eq("id", data.id)
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("application_events").insert({
      application_id: data.id,
      type: `status.${data.status}`,
      actor_id: context.userId,
      payload: patch as never,
    });

    const { logAudit } = await import("@/lib/audit.server");
    await logAudit({
      actorId: context.userId,
      actorEmail: context.claims?.email ?? null,
      action: "application.update_status",
      targetType: "application",
      targetId: data.id,
      payload: patch,
    });

    return { application: row };
  });
