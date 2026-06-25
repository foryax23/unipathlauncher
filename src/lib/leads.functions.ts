import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, getRequestIP } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const leadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(7).max(40),
  city: z.string().trim().min(2).max(120),
  subject: z.string().trim().min(2).max(120),
  study_level: z.enum(["Foundation", "Undergraduate", "Postgraduate"]),
  start_year: z.enum(["2025", "2026", "2027"]),
  reason: z.string().trim().max(200).optional().nullable(),
  source: z.string().trim().max(120).optional().nullable(),
  consent: z.literal(true),
  // Honeypot — must be empty. Bots fill every input.
  website: z.string().max(0).optional().or(z.literal("")),
  utm: z
    .object({
      source: z.string().max(120).optional(),
      medium: z.string().max(120).optional(),
      campaign: z.string().max(120).optional(),
      term: z.string().max(120).optional(),
      content: z.string().max(120).optional(),
    })
    .partial()
    .optional(),
});

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((input) => leadSchema.parse(input))
  .handler(async ({ data }) => {
    // Silently accept honeypot-trigger requests so bots don't learn the trap.
    if (data.website && data.website.length > 0) {
      return { ok: true as const };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ip = getRequestIP({ xForwardedFor: true }) ?? null;
    const userAgent = getRequestHeader("user-agent") ?? null;
    const normalizedEmail = data.email.trim().toLowerCase();

    // 24-hour duplicate guard: same email submitted recently is treated as success.
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: existing } = await supabaseAdmin
      .from("leads")
      .select("id")
      .ilike("email", normalizedEmail)
      .gte("created_at", since)
      .limit(1)
      .maybeSingle();
    if (existing) return { ok: true as const };

    const { error } = await supabaseAdmin.from("leads").insert({
      name: data.name,
      email: normalizedEmail,
      phone: data.phone,
      city: data.city,
      subject: data.subject,
      study_level: data.study_level,
      start_year: data.start_year,
      reason: data.reason ?? null,
      source: data.source ?? null,
      consent: data.consent,
      utm: (data.utm ?? null) as never,
      ip,
      user_agent: userAgent,
    });
    if (error) {
      console.error("submitLead insert failed", error);
      throw new Error("Could not submit your details. Please try again.");
    }
    return { ok: true as const };
  });

async function assertAdminViaService(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error("Could not verify your access.");
  if (!data) throw new Error("Forbidden");
}

export const listLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdminViaService(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw new Error(error.message);
    return { leads: data ?? [] };
  });

const updateLeadSchema = z.object({
  id: z.string().uuid(),
  status: z
    .enum(["new", "contacted", "qualified", "converted", "lost", "spam"])
    .optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  next_action_at: z.string().datetime().nullable().optional(),
  internal_notes: z.string().max(4000).nullable().optional(),
});

export const updateLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => updateLeadSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdminViaService(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { logAudit } = await import("@/lib/audit.server");

    const patch: Record<string, unknown> = {};
    if (data.status !== undefined) patch.status = data.status;
    if (data.assigned_to !== undefined) patch.assigned_to = data.assigned_to;
    if (data.next_action_at !== undefined)
      patch.next_action_at = data.next_action_at;
    if (data.internal_notes !== undefined)
      patch.internal_notes = data.internal_notes;

    const { data: row, error } = await supabaseAdmin
      .from("leads")
      .update(patch)
      .eq("id", data.id)
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);

    await logAudit({
      actorId: context.userId,
      actorEmail: context.claims?.email ?? null,
      action: "lead.update",
      targetType: "lead",
      targetId: data.id,
      payload: patch,
      ip: getRequestIP({ xForwardedFor: true }) ?? null,
    });

    return { lead: row };
  });
