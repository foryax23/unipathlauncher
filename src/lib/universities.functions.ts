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

export const listUniversities = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z
      .object({ partnersOnly: z.boolean().optional() })
      .optional()
      .parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const supabase = publicClient();
    let q = supabase
      .from("universities")
      .select("id,slug,name,city,region,country,logo_url,is_partner,ranking")
      .order("name");
    if (data?.partnersOnly) q = q.eq("is_partner", true);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { universities: rows ?? [] };
  });

export const getUniversityBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ slug: z.string().trim().min(1).max(120) }).parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: uni, error: ue } = await supabase
      .from("universities")
      .select("id,slug,name,city,region,country,logo_url,is_partner,ranking,website,description,created_at,updated_at")
      .eq("slug", data.slug)
      .maybeSingle();
    if (ue) throw new Error(ue.message);
    if (!uni) return { university: null, courses: [] as never[] };

    const { data: courses, error: ce } = await supabase
      .from("courses")
      .select("id,slug,name,level,subject,duration_months,fee_gbp")
      .eq("university_id", uni.id)
      .eq("is_active", true)
      .order("name");
    if (ce) throw new Error(ce.message);
    return { university: uni, courses: courses ?? [] };
  });
