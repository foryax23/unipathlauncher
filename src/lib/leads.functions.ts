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
  // Optional Cloudflare Turnstile token from the widget.
  turnstile_token: z.string().trim().max(4000).optional(),
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

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

async function verifyTurnstile(token: string | undefined, ip: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // Not configured: skip verification gracefully.
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.append("remoteip", ip);
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body },
    );
    const json = (await res.json()) as { success?: boolean };
    return !!json.success;
  } catch (err) {
    console.error("turnstile verify failed", err);
    return false;
  }
}

async function checkRateLimit(ip: string | null): Promise<boolean> {
  if (!ip) return true;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const now = new Date();
  const { data: existing } = await supabaseAdmin
    .from("lead_rate_limits")
    .select("ip,window_start,count")
    .eq("ip", ip)
    .maybeSingle();

  if (!existing) {
    await supabaseAdmin
      .from("lead_rate_limits")
      .insert({ ip, window_start: now.toISOString(), count: 1 });
    return true;
  }

  const windowAge = now.getTime() - new Date(existing.window_start).getTime();
  if (windowAge > RATE_LIMIT_WINDOW_MS) {
    await supabaseAdmin
      .from("lead_rate_limits")
      .update({ window_start: now.toISOString(), count: 1, updated_at: now.toISOString() })
      .eq("ip", ip);
    return true;
  }
  if (existing.count >= RATE_LIMIT_MAX) return false;
  await supabaseAdmin
    .from("lead_rate_limits")
    .update({ count: existing.count + 1, updated_at: now.toISOString() })
    .eq("ip", ip);
  return true;
}

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((input) => leadSchema.parse(input))
  .handler(async ({ data }) => {
    // Silently accept honeypot-trigger requests so bots don't learn the trap.
    if (data.website && data.website.length > 0) {
      return { ok: true as const };
    }

    const ip = getRequestIP({ xForwardedFor: true }) ?? null;
    const userAgent = getRequestHeader("user-agent") ?? null;

    // 1. Rate limit per IP
    const allowed = await checkRateLimit(ip);
    if (!allowed) {
      throw new Error("Too many requests. Please try again in a minute.");
    }

    // 2. Turnstile (only enforced when secret is configured)
    const verified = await verifyTurnstile(data.turnstile_token, ip);
    if (!verified) {
      throw new Error("Could not verify your request. Please try again.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const normalizedEmail = data.email.trim().toLowerCase();

    // 3. 24-hour duplicate guard
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

    // Fire-and-forget emails (won't block the response if the connector isn't linked)
    try {
      const { sendEmail } = await import("@/lib/email/send.server");
      const { leadWelcomeEmail, leadAdminAlertEmail } = await import(
        "@/lib/email/templates"
      );
      const fields = {
        name: data.name,
        email: normalizedEmail,
        phone: data.phone,
        city: data.city,
        subject: data.subject,
        study_level: data.study_level,
        start_year: data.start_year,
      };
      const welcome = leadWelcomeEmail(fields);
      await sendEmail({ to: normalizedEmail, subject: welcome.subject, html: welcome.html });
      const adminTo = process.env.LEAD_NOTIFICATIONS_TO;
      if (adminTo) {
        const alert = leadAdminAlertEmail(fields);
        await sendEmail({ to: adminTo, subject: alert.subject, html: alert.html });
      }
    } catch (err) {
      console.error("lead email send failed (non-fatal)", err);
    }
    return { ok: true as const };
  });

export const listLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("@/lib/auth/assert.server");
    await assertAdmin(context.userId);
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
    const { assertAdmin } = await import("@/lib/auth/assert.server");
    await assertAdmin(context.userId);
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
      .update(patch as never)
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
