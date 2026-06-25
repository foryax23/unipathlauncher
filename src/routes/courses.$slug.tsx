import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getCourseBySlug } from "@/lib/courses.functions";
import { createApplicationBySlug } from "@/lib/applications.functions";
import { ShortlistButton } from "@/components/shortlist/ShortlistButton";
import { Logo } from "@/components/marketing/Logo";
import { Footer } from "@/components/marketing/Footer";
import { MapPin, Clock, GraduationCap, ArrowRight, Calendar, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const courseQuery = (slug: string) =>
  queryOptions({
    queryKey: ["course", slug],
    queryFn: () => getCourseBySlug({ data: { slug } }),
  });

export const Route = createFileRoute("/courses/$slug")({
  loader: async ({ context, params }) => {
    const res = await context.queryClient.ensureQueryData(courseQuery(params.slug));
    if (!res.course) throw notFound();
    return res;
  },
  head: ({ loaderData }) => {
    const c = loaderData?.course;
    if (!c) return { meta: [{ title: "Course · Bridge Gateway" }] };
    const uni = c.universities as { name?: string; city?: string } | null;
    const title = `${c.name} at ${uni?.name ?? "UK University"} · Bridge Gateway`;
    const description = `${c.level ?? "Undergraduate"} ${c.subject ?? ""} at ${uni?.name ?? "the UK"}. Apply with Bridge Gateway Consulting.`;
    const url = `https://bridgegatewayconsulting.com/courses/${c.slug}`;
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Course",
      name: c.name,
      description,
      provider: {
        "@type": "CollegeOrUniversity",
        name: uni?.name,
        address: uni?.city,
      },
      url,
    };
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(jsonLd),
        },
      ],
    };
  },
  component: CoursePage,
  notFoundComponent: () => (
    <div className="hero-warm min-h-screen flex flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="font-serif text-display-md">Course not found</h1>
      <Link to="/courses" className="text-gold underline">Back to all courses</Link>
    </div>
  ),
});

function CoursePage() {
  const params = Route.useParams();
  const { data } = useSuspenseQuery(courseQuery(params.slug));
  const course = data.course!;
  const uni = course.universities as {
    id: string;
    slug: string;
    name: string;
    city: string | null;
    description: string | null;
    website: string | null;
    logo_url: string | null;
  };
  const intakes = (course.course_intakes ?? []) as Array<{
    id: string;
    intake_date: string;
    deadline_date: string | null;
    seats_left: number | null;
  }>;

  const start = useServerFn(createApplicationBySlug);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useState(() => {
    supabase.auth.getSession().then(({ data: s }) => setSignedIn(!!s.session));
  });

  const apply = useMutation({
    mutationFn: () => start({ data: { slug: course.slug } }),
    onSuccess: (res) => {
      toast.success("Application started");
      if (res.application?.id) {
        window.location.href = `/dashboard/applications/${res.application.id}`;
      }
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not start"),
  });

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
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
          <Link to="/courses" className="hover:text-foreground">Courses</Link>
          <span>·</span>
          <Link
            to="/universities/$slug"
            params={{ slug: uni.slug }}
            className="hover:text-foreground"
          >
            {uni.name}
          </Link>
        </div>

        <h1 className="mt-3 font-serif text-display-lg text-foreground">{course.name}</h1>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {course.level && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs">
              <GraduationCap className="size-3.5" /> {course.level}
            </span>
          )}
          {course.subject && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs">
              {course.subject}
            </span>
          )}
          {uni.city && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs">
              <MapPin className="size-3.5" /> {uni.city}
            </span>
          )}
          {course.duration_months && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs">
              <Clock className="size-3.5" /> {course.duration_months} months
            </span>
          )}
          {course.fee_gbp && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs">
              £{Number(course.fee_gbp).toLocaleString()} / yr
            </span>
          )}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <article className="glass-strong rounded-3xl p-6">
            <h2 className="font-serif text-2xl">About this course</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              {course.description ??
                `${course.name} at ${uni.name} offers a rigorous pathway into ${course.subject ?? "your field"}. Our team will walk you through entry requirements, intake timing, and your personal statement before you submit.`}
            </p>

            {intakes.length > 0 && (
              <>
                <h3 className="mt-8 font-serif text-xl">Upcoming intakes</h3>
                <ul className="mt-3 space-y-2">
                  {intakes.map((it) => (
                    <li
                      key={it.id}
                      className="flex items-center justify-between rounded-2xl border border-border bg-surface/60 px-4 py-3 text-sm"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Calendar className="size-4 text-gold" />
                        {new Date(it.intake_date).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                      </span>
                      {it.deadline_date && (
                        <span className="text-xs text-muted-foreground">
                          Deadline {new Date(it.deadline_date).toLocaleDateString()}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </article>

          <aside className="space-y-4">
            <div className="glass rounded-3xl p-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">University</p>
              <p className="mt-2 font-serif text-xl">{uni.name}</p>
              {uni.description && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-4">
                  {uni.description}
                </p>
              )}
              <div className="mt-4 flex items-center gap-2">
                <Link
                  to="/universities/$slug"
                  params={{ slug: uni.slug }}
                  className="tap inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-accent transition"
                >
                  University profile <ArrowRight className="size-3" />
                </Link>
                {uni.website && (
                  <a
                    href={uni.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tap inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-accent transition"
                  >
                    Visit <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="glass-strong rounded-3xl p-5 space-y-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Next step</p>
              {signedIn === false ? (
                <a
                  href={`/login?redirect=/courses/${course.slug}`}
                  className="tap inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-medium text-gold-foreground hover:opacity-90 transition"
                >
                  Sign in to apply <ArrowRight className="size-4" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => apply.mutate()}
                  disabled={apply.isPending}
                  className="tap inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-medium text-gold-foreground hover:opacity-90 transition disabled:opacity-60"
                >
                  {apply.isPending ? "Starting…" : "Start application"} <ArrowRight className="size-4" />
                </button>
              )}
              <ShortlistButton
                courseId={course.slug}
                courseName={course.name}
                partner={uni.name}
                level={course.level ?? undefined}
                className="tap inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-surface/60 px-5 py-2.5 text-sm hover:bg-accent transition"
              />
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
