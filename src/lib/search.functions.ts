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

const schema = z.object({
  q: z.string().trim().min(1).max(80),
  limit: z.number().int().min(1).max(20).optional(),
});

export type SearchHit =
  | { kind: "course"; id: string; slug: string; title: string; subtitle: string }
  | { kind: "university"; id: string; slug: string; title: string; subtitle: string };

export const searchCatalogue = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }): Promise<{ hits: SearchHit[] }> => {
    const supabase = publicClient();
    const limit = data.limit ?? 8;
    // websearch_to_tsquery is forgiving with user input
    const term = data.q;

    const [coursesRes, unisRes] = await Promise.all([
      supabase
        .from("courses")
        .select("id,slug,name,level,subject,universities!inner(name,city)")
        .eq("is_active", true)
        .textSearch("search_tsv", term, { type: "websearch", config: "english" })
        .limit(limit),
      supabase
        .from("universities")
        .select("id,slug,name,city,country")
        .textSearch("search_tsv", term, { type: "websearch", config: "english" })
        .limit(limit),
    ]);

    const hits: SearchHit[] = [];

    if (!coursesRes.error && coursesRes.data) {
      for (const c of coursesRes.data) {
        const uni = Array.isArray(c.universities) ? c.universities[0] : c.universities;
        hits.push({
          kind: "course",
          id: c.id,
          slug: c.slug,
          title: c.name,
          subtitle: [c.level, c.subject, uni?.name].filter(Boolean).join(" · "),
        });
      }
    }
    if (!unisRes.error && unisRes.data) {
      for (const u of unisRes.data) {
        hits.push({
          kind: "university",
          id: u.id,
          slug: u.slug,
          title: u.name,
          subtitle: [u.city, u.country].filter(Boolean).join(", "),
        });
      }
    }

    // Interleave: course, uni, course, uni…
    const courses = hits.filter((h) => h.kind === "course");
    const unis = hits.filter((h) => h.kind === "university");
    const interleaved: SearchHit[] = [];
    const max = Math.max(courses.length, unis.length);
    for (let i = 0; i < max; i++) {
      if (courses[i]) interleaved.push(courses[i]);
      if (unis[i]) interleaved.push(unis[i]);
    }
    return { hits: interleaved.slice(0, limit * 2) };
  });
