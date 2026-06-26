import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { listPosts } from "@/lib/blog";

const BASE_URL = "https://bridgegatewayconsulting.com";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  lastmod?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/courses", changefreq: "weekly", priority: "0.9" },
          { path: "/blog", changefreq: "weekly", priority: "0.8" },
          { path: "/onboarding", changefreq: "monthly", priority: "0.7" },
          { path: "/login", changefreq: "yearly", priority: "0.3" },
          { path: "/privacy", changefreq: "yearly", priority: "0.3" },
          { path: "/terms", changefreq: "yearly", priority: "0.3" },
          { path: "/cookies", changefreq: "yearly", priority: "0.3" },
        ];

        for (const p of listPosts()) {
          entries.push({
            path: `/blog/${p.slug}`,
            changefreq: "monthly",
            priority: "0.7",
            lastmod: p.published,
          });
        }


        // Pull dynamic slugs from the catalogue
        try {
          const supabase = createClient<Database>(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_PUBLISHABLE_KEY!,
            { auth: { persistSession: false, autoRefreshToken: false } },
          );
          const [{ data: courses }, { data: unis }] = await Promise.all([
            supabase
              .from("courses")
              .select("slug,updated_at")
              .eq("is_active", true)
              .order("name")
              .limit(1000),
            supabase
              .from("universities")
              .select("slug,updated_at")
              .order("name")
              .limit(500),
          ]);
          for (const c of courses ?? []) {
            entries.push({
              path: `/courses/${c.slug}`,
              changefreq: "weekly",
              priority: "0.8",
              lastmod: c.updated_at ?? undefined,
            });
          }
          for (const u of unis ?? []) {
            entries.push({
              path: `/universities/${u.slug}`,
              changefreq: "monthly",
              priority: "0.7",
              lastmod: u.updated_at ?? undefined,
            });
          }
        } catch {
          // fall back to static entries
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${new Date(e.lastmod).toISOString()}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=1800",
          },
        });
      },
    },
  },
});
