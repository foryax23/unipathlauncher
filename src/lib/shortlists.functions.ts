import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const addSchema = z.object({
  course_id: z.string().trim().min(1).max(120),
  course_name: z.string().trim().max(200).optional(),
  partner: z.string().trim().max(120).optional(),
  level: z.string().trim().max(60).optional(),
  note: z.string().trim().max(500).optional(),
});

export const listMyShortlist = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("shortlists")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { items: data ?? [] };
  });

export const addToShortlist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => addSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("shortlists")
      .upsert(
        {
          user_id: userId,
          course_id: data.course_id,
          course_name: data.course_name ?? null,
          partner: data.partner ?? null,
          level: data.level ?? null,
          note: data.note ?? null,
        },
        { onConflict: "user_id,course_id" },
      )
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { item: row };
  });

export const removeFromShortlist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ course_id: z.string().trim().min(1).max(120) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("shortlists")
      .delete()
      .eq("user_id", userId)
      .eq("course_id", data.course_id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
