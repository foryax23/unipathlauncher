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

// Public-ish (signed-in students): compute free 30-min slots over a date window.
const slotSchema = z.object({
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slot_minutes: z.number().int().min(15).max(120).default(30),
});

type Slot = { adviser_id: string; starts_at: string; ends_at: string };

export const listAvailableSlots = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => slotSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const start = new Date(`${data.date_from}T00:00:00.000Z`);
    const end = new Date(`${data.date_to}T23:59:59.999Z`);

    const [avRes, offRes, bkRes] = await Promise.all([
      supabase.from("adviser_availability").select("adviser_id,weekday,start_time,end_time"),
      supabase.from("adviser_time_off").select("adviser_id,starts_at,ends_at")
        .lte("starts_at", end.toISOString()).gte("ends_at", start.toISOString()),
      supabase.from("bookings").select("adviser_id,starts_at,ends_at")
        .not("adviser_id", "is", null)
        .neq("status", "cancelled")
        .gte("starts_at", start.toISOString()).lte("starts_at", end.toISOString()),
    ]);
    if (avRes.error) throw new Error(avRes.error.message);
    const availability = (avRes.data ?? []) as Array<{ adviser_id: string; weekday: number; start_time: string; end_time: string }>;
    const timeOff = (offRes.data ?? []) as Array<{ adviser_id: string; starts_at: string; ends_at: string }>;
    const bookings = (bkRes.data ?? []) as Array<{ adviser_id: string; starts_at: string; ends_at: string }>;

    const slots: Slot[] = [];
    const stepMs = data.slot_minutes * 60_000;
    const now = Date.now();

    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
      const weekday = d.getUTCDay();
      const dayStr = d.toISOString().slice(0, 10);
      for (const av of availability.filter((a) => a.weekday === weekday)) {
        const dayStart = new Date(`${dayStr}T${av.start_time.slice(0, 5)}:00Z`).getTime();
        const dayEnd = new Date(`${dayStr}T${av.end_time.slice(0, 5)}:00Z`).getTime();
        for (let t = dayStart; t + stepMs <= dayEnd; t += stepMs) {
          if (t < now) continue;
          const s = new Date(t);
          const e = new Date(t + stepMs);
          // skip if any booking or time-off overlaps for this adviser
          const conflict =
            bookings.some(
              (b) =>
                b.adviser_id === av.adviser_id &&
                new Date(b.starts_at).getTime() < e.getTime() &&
                new Date(b.ends_at).getTime() > s.getTime(),
            ) ||
            timeOff.some(
              (o) =>
                o.adviser_id === av.adviser_id &&
                new Date(o.starts_at).getTime() < e.getTime() &&
                new Date(o.ends_at).getTime() > s.getTime(),
            );
          if (conflict) continue;
          slots.push({ adviser_id: av.adviser_id, starts_at: s.toISOString(), ends_at: e.toISOString() });
        }
      }
    }
    slots.sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    return { slots };
  });
