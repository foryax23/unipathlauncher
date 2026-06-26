import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listMyBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .or(`student_id.eq.${userId},adviser_id.eq.${userId}`)
      .order("starts_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { bookings: data ?? [] };
  });

const createSchema = z
  .object({
    starts_at: z.string().datetime(),
    ends_at: z.string().datetime(),
    channel: z.enum(["video", "phone", "in_person"]).default("video"),
    notes: z.string().trim().max(2000).optional(),
  })
  .refine((d) => new Date(d.ends_at) > new Date(d.starts_at), {
    message: "End time must be after start time",
    path: ["ends_at"],
  });

export const requestBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => createSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("bookings")
      .insert({
        student_id: userId,
        starts_at: data.starts_at,
        ends_at: data.ends_at,
        channel: data.channel,
        notes: data.notes ?? null,
        status: "requested",
      })
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);

    const { notifyStaff } = await import("@/lib/notifications.server");
    await notifyStaff({
      kind: "booking.requested",
      title: "New call request",
      body: `${new Date(data.starts_at).toLocaleString("en-GB")} · ${data.channel}`,
      link: "/admin/applications",
    });

    return { booking: row };
  });

export const cancelBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
