import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

const listSchema = z
  .object({
    search: z.string().trim().max(120).optional(),
    level: z.string().trim().max(40).optional(),
    subject: z.string().trim().max(60).optional(),
    universityId: z.string().uuid().optional(),
    page: z.number().int().min(1).max(200).optional(),
    pageSize: z.number().int().min(1).max(60).optional(),
  })
  .optional();

export const listCourses = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => listSchema.parse(input ?? {}))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const page = data?.page ?? 1;
    const size = data?.pageSize ?? 24;
    const from = (page - 1) * size;
    const to = from + size - 1;

    let q = supabase
      .from("courses")
      .select(
        "id,slug,name,level,subject,duration_months,fee_gbp,intake_months,university_id,universities!inner(id,slug,name,city,is_partner,logo_url)",
        { count: "exact" },
      )
      .eq("is_active", true)
      .order("name")
      .range(from, to);

    if (data?.level) q = q.eq("level", data.level);
    if (data?.subject) q = q.eq("subject", data.subject);
    if (data?.universityId) q = q.eq("university_id", data.universityId);
    if (data?.search) {
      const safe = data.search.replace(/[,()*\\"'\n\r]/g, " ").trim();
      if (safe) q = q.ilike("name", `%${safe}%`);
    }

    const { data: rows, error, count } = await q;
    if (error) throw new Error(error.message);
    return { courses: rows ?? [], total: count ?? 0, page, pageSize: size };
  });

export const getCourseBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ slug: z.string().trim().min(1).max(120) }).parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: course, error } = await supabase
      .from("courses")
      .select(
        "id,slug,name,level,subject,description,duration_months,fee_gbp,intake_months,entry_requirements,university_id,is_active,created_at,updated_at,universities!inner(id,slug,name,city,region,country,logo_url,is_partner,ranking,website,description),course_intakes(id,intake_date,deadline_date,seats_left)",
      )
      .eq("slug", data.slug)
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { course };
  });
