import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { listPosts, listTags, type PostMeta } from "@/lib/blog";
import { Calendar, Clock, Tag } from "lucide-react";

const BASE = "https://bridgegatewayconsulting.com";

export const Route = createFileRoute("/blog")({
  loader: (): { posts: PostMeta[]; tags: string[] } => ({ posts: listPosts(), tags: listTags() }),
  head: () => ({
    meta: [
      { title: "Insights & guides · Bridge Gateway blog" },
      {
        name: "description",
        content:
          "Practical guides on UK university applications, personal statements, English tests and student life — written by our adviser team.",
      },
      { property: "og:title", content: "Insights & guides · Bridge Gateway blog" },
      {
        property: "og:description",
        content:
          "Practical guides on UK university applications, personal statements, English tests and student life.",
      },
      { property: "og:url", content: `${BASE}/blog` },
    ],
    links: [{ rel: "canonical", href: `${BASE}/blog` }],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const { posts, tags } = Route.useLoaderData() as { posts: PostMeta[]; tags: string[] };

  return (
    <>
      <Header />
      <main className="hero-warm min-h-[calc(100vh-4rem)]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <header className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">The Bridge Journal</p>
            <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Insights, guides & honest advice</h1>
            <p className="mt-3 text-muted-foreground">
              Written by the adviser team — practical, specific, and free of cliché.
            </p>
          </header>

          {tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted-foreground"
                >
                  <Tag className="size-3" /> {t}
                </span>
              ))}
            </div>
          )}

          <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link
                key={p.slug}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="group glass-strong flex flex-col overflow-hidden rounded-3xl border border-border transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                {p.cover && (
                  <div className="aspect-[16/9] overflow-hidden bg-muted">
                    <img
                      src={p.cover}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Calendar className="size-3" />
                      {new Date(p.published).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <span className="inline-flex items-center gap-1"><Clock className="size-3" /> {p.readingTime} min</span>
                  </div>
                  <h2 className="mt-2 font-serif text-xl text-foreground">{p.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.description}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {p.tags.slice(0, 3).map((t) => (
                      <span key={t} className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-medium text-gold">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </section>

          {posts.length === 0 && (
            <p className="mt-10 rounded-2xl border border-border bg-surface p-8 text-center text-sm text-muted-foreground">
              No posts yet — check back soon.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
