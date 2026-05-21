import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
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
});

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((input) => leadSchema.parse(input))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("leads").insert({
      name: data.name,
      email: data.email,
      phone: data.phone,
      city: data.city,
      subject: data.subject,
      study_level: data.study_level,
      start_year: data.start_year,
      reason: data.reason ?? null,
      source: data.source ?? null,
      consent: data.consent,
    });
    if (error) {
      console.error("submitLead insert failed", error);
      throw new Error("Could not submit your details. Please try again.");
    }
    return { ok: true as const };
  });

export const listLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { data: isAdminData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (roleError) throw new Error("Could not verify your access.");
    if (!isAdminData) throw new Error("Forbidden");

    const { data, error } = await supabaseAdmin
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw new Error(error.message);
    return { leads: data ?? [] };
  });
