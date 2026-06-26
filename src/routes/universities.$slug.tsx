import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getUniversityBySlug } from "@/lib/universities.functions";
import { listPublishedReviews } from "@/lib/reviews.functions";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { Logo } from "@/components/marketing/Logo";
import { Footer } from "@/components/marketing/Footer";
import { ArrowRight, MapPin, ExternalLink } from "lucide-react";

const uniQuery = (slug: string) =>
  queryOptions({
    queryKey: ["university", slug],
    queryFn: () => getUniversityBySlug({ data: { slug } }),
  });

const reviewsQuery = (universityId: string) =>
  queryOptions({
    queryKey: ["reviews", "uni", universityId],
    queryFn: () => listPublishedReviews({ data: { universityId, limit: 20 } }),
  });

export const Route = createFileRoute("/universities/$slug")({
  loader: async ({ context, params }) => {
    const res = await context.queryClient.ensureQueryData(uniQuery(params.slug));
    if (!res.university) throw notFound();
    const rev = await context.queryClient.ensureQueryData(reviewsQuery(res.university.id));
    return { ...res, reviewSummary: { avgRating: rev.avgRating, count: rev.count } };
  },
  head: ({ loaderData }) => {
    const u = loaderData?.university;
    if (!u) return { meta: [{ title: "University · Bridge Gateway" }] };
    const title = `${u.name} · Apply with Bridge Gateway`;
    const description = u.description ?? `Explore ${u.name} courses and apply with Bridge Gateway Consulting.`;
    const url = `https://bridgegatewayconsulting.com/universities/${u.slug}`;
    const summary = loaderData?.reviewSummary;
    const jsonLd: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "CollegeOrUniversity",
      name: u.name,
      url,
      address: u.city,
    };
    if (summary && summary.count > 0 && summary.avgRating != null) {
      jsonLd.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: summary.avgRating,
        reviewCount: summary.count,
        bestRating: 5,
        worstRating: 1,
      };
    }
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }],
    };
  },
  component: UniversityPage,
  notFoundComponent: () => (
    <div className="hero-warm min-h-screen flex flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="font-serif text-display-md">University not found</h1>
      <Link to="/courses" className="text-gold underline">Browse courses</Link>
    </div>
  ),
});

function UniversityPage() {
  const params = Route.useParams();
  const { data } = useSuspenseQuery(uniQuery(params.slug));
  const u = data.university!;
  const { data: rev } = useSuspenseQuery(reviewsQuery(u.id));
  return (
    <div className="min-h-screen hero-warm">
      <header className="glass border-b border-border/50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/"><Logo /></Link>
          <Link to="/courses" className="text-sm text-muted-foreground hover:text-foreground">
            All courses
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">University</p>
        <h1 className="mt-2 font-serif text-display-lg text-foreground">{u.name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {u.city && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs">
              <MapPin className="size-3.5" /> {u.city}
            </span>
          )}
          {u.ranking && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/15 px-3 py-1 text-xs">
              UK rank #{u.ranking}
            </span>
          )}
          {u.is_partner && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/15 px-3 py-1 text-xs">
              Bridge Gateway partner
            </span>
          )}
        </div>

        {u.description && (
          <p className="mt-6 max-w-3xl text-muted-foreground leading-relaxed">{u.description}</p>
        )}

        {u.website && (
          <a
            href={u.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-gold hover:underline"
          >
            Official website <ExternalLink className="size-3.5" />
          </a>
        )}

        <h2 className="mt-12 font-serif text-2xl">Courses ({data.courses.length})</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {data.courses.map((c) => (
            <li key={c.id} className="glass rounded-3xl p-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {c.level ?? "—"}{c.subject ? ` · ${c.subject}` : ""}
              </p>
              <p className="mt-1 font-serif text-lg">{c.name}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {c.duration_months ? `${c.duration_months} mo` : ""}
                  {c.fee_gbp ? ` · £${Number(c.fee_gbp).toLocaleString()}` : ""}
                </span>
                <Link
                  to="/courses/$slug"
                  params={{ slug: c.slug }}
                  className="tap inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 hover:bg-accent transition"
                >
                  View <ArrowRight className="size-3" />
                </Link>
              </div>
            </li>
          ))}
          {data.courses.length === 0 && (
            <li className="text-sm text-muted-foreground">No live courses listed yet.</li>
          )}
        </ul>
      </main>
      <Footer />
    </div>
  );
}
