import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const timeRe = /^\d{2}:\d{2}(:\d{2})?$/;

export const listMyAvailability = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("adviser_availability")
      .select("*")
      .eq("adviser_id", userId)
      .order("weekday")
      .order("start_time");
    if (error) throw new Error(error.message);
    return { slots: data ?? [] };
  });

export const upsertAvailability = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        weekday: z.number().int().min(0).max(6),
        start_time: z.string().regex(timeRe),
        end_time: z.string().regex(timeRe),
        timezone: z.string().trim().max(60).default("Europe/London"),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const row = { ...data, adviser_id: userId };
    const { error } = data.id
      ? await supabase.from("adviser_availability").update(row).eq("id", data.id).eq("adviser_id", userId)
      : await supabase.from("adviser_availability").insert(row);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteAvailability = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("adviser_availability")
      .delete()
      .eq("id", data.id)
      .eq("adviser_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
