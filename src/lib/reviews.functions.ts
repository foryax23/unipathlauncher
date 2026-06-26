import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export const listPublishedReviews = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ universityId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: rows, error } = await supabase
      .from("reviews")
      .select("id,rating,title,body,staff_reply,created_at,course_id")
      .eq("status", "published")
      .eq("university_id", data.universityId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    const avg =
      rows && rows.length
        ? Math.round((rows.reduce((a, r) => a + r.rating, 0) / rows.length) * 10) / 10
        : null;
    return { reviews: rows ?? [], avgRating: avg, count: rows?.length ?? 0 };
  });

export const submitReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        universityId: z.string().uuid(),
        courseId: z.string().uuid().nullable().optional(),
        rating: z.number().int().min(1).max(5),
        title: z.string().trim().max(140).optional(),
        body: z.string().trim().min(10).max(4000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await supabaseAdmin.from("reviews").insert({
      student_id: context.userId,
      university_id: data.universityId,
      course_id: data.courseId ?? null,
      rating: data.rating,
      title: data.title ?? null,
      body: data.body,
      status: "pending",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const moderateReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        reviewId: z.string().uuid(),
        action: z.enum(["publish", "reject"]),
        staffReply: z.string().trim().max(2000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: role } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .in("role", ["admin", "adviser"])
      .maybeSingle();
    if (!role) throw new Error("Forbidden");

    const { error } = await supabaseAdmin
      .from("reviews")
      .update({
        status: data.action === "publish" ? "published" : "rejected",
        staff_reply: data.staffReply ?? null,
      })
      .eq("id", data.reviewId);
    if (error) throw new Error(error.message);

    const { logAudit } = await import("@/lib/audit.server");
    await logAudit({
      actorId: context.userId,
      action: `review.${data.action}`,
      targetType: "review",
      targetId: data.reviewId,
    });
    return { ok: true };
  });
