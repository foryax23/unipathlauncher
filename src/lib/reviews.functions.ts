import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
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
    z
      .object({
        universityId: z.string().uuid().optional(),
        courseId: z.string().uuid().optional(),
        limit: z.number().int().min(1).max(50).optional(),
      })
      .refine((v) => v.universityId || v.courseId, "universityId or courseId required")
      .parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = publicClient();
    let q = supabase
      .from("reviews")
      .select("id,rating,title,body,staff_reply,created_at,course_id,university_id")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 20);
    if (data.universityId) q = q.eq("university_id", data.universityId);
    if (data.courseId) q = q.eq("course_id", data.courseId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    const list = rows ?? [];
    const avg = list.length
      ? Math.round((list.reduce((a, r) => a + r.rating, 0) / list.length) * 10) / 10
      : null;
    return { reviews: list, avgRating: avg, count: list.length };
  });

export const listMyReviewableTargets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: apps, error } = await supabase
      .from("applications")
      .select(
        "id,status,course_id,courses!inner(id,slug,name,university_id,universities!inner(id,slug,name))",
      )
      .eq("user_id", userId)
      .in("status", ["accepted", "enrolled"]);
    if (error) throw new Error(error.message);

    const { data: mine } = await supabase
      .from("reviews")
      .select("course_id,university_id")
      .eq("student_id", userId);
    const reviewed = new Set((mine ?? []).map((r) => `${r.university_id}:${r.course_id ?? ""}`));

    const targets = (apps ?? [])
      .map((a) => {
        const c = Array.isArray(a.courses) ? a.courses[0] : a.courses;
        const uni = c && (Array.isArray(c.universities) ? c.universities[0] : c.universities);
        if (!c || !uni) return null;
        const key = `${uni.id}:${c.id}`;
        if (reviewed.has(key)) return null;
        return {
          applicationId: a.id,
          courseId: c.id,
          courseName: c.name,
          courseSlug: c.slug,
          universityId: uni.id,
          universityName: uni.name,
          universitySlug: uni.slug,
        };
      })
      .filter((x): x is NonNullable<typeof x> => !!x);
    return { targets };
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
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

export const listPendingReviews = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ status: z.enum(["pending", "published", "rejected", "all"]).optional() })
      .optional()
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: role } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .in("role", ["admin", "adviser"])
      .maybeSingle();
    if (!role) throw new Error("Forbidden");

    const status = data?.status ?? "pending";
    let q = supabaseAdmin
      .from("reviews")
      .select(
        "id,rating,title,body,staff_reply,status,created_at,student_id,course_id,university_id,universities(name,slug),courses(name,slug)",
      )
      .order("created_at", { ascending: false })
      .limit(100);
    if (status !== "all") q = q.eq("status", status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { reviews: rows ?? [] };
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
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
