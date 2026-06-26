import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { getPost, getAdjacent, type Post, type PostMeta } from "@/lib/blog";
import { ArrowLeft, ArrowRight, Calendar, Clock } from "lucide-react";

const BASE = "https://bridgegatewayconsulting.com";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    const { prev, next } = getAdjacent(params.slug);
    return { post, prev, next };
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (!post) {
      return { meta: [{ title: "Post not found · Bridge Gateway blog" }] };
    }
    const url = `${BASE}/blog/${post.slug}`;
    const image = post.cover ? (post.cover.startsWith("http") ? post.cover : `${BASE}${post.cover}`) : undefined;
    return {
      meta: [
        { title: `${post.title} · Bridge Gateway` },
        { name: "description", content: post.description },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.description },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        ...(image ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: post.title },
        { name: "twitter:description", content: post.description },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.description,
            datePublished: post.published,
            dateModified: post.published,
            author: { "@type": "Organization", name: post.author ?? "Bridge Gateway Consulting" },
            publisher: {
              "@type": "Organization",
              name: "Bridge Gateway Consulting",
              logo: { "@type": "ImageObject", url: `${BASE}/icon-512.png` },
            },
            mainEntityOfPage: url,
            ...(image ? { image } : {}),
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <>
      <Header />
      <main className="hero-warm min-h-[60vh]">
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <h1 className="font-serif text-3xl">We couldn't find that article</h1>
          <p className="mt-2 text-muted-foreground">It may have moved or been retired.</p>
          <Link
            to="/blog"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-gold-foreground"
          >
            <ArrowLeft className="size-4" /> Back to the blog
          </Link>
        </div>
      </main>
      <Footer />
    </>
  ),
  errorComponent: () => (
    <>
      <Header />
      <main className="hero-warm min-h-[60vh]">
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <h1 className="font-serif text-3xl">Something went wrong loading this post</h1>
          <Link
            to="/blog"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-gold-foreground"
          >
            <ArrowLeft className="size-4" /> Back to the blog
          </Link>
        </div>
      </main>
      <Footer />
    </>
  ),
  component: PostPage,
});

function PostPage() {
  const { post, prev, next } = Route.useLoaderData() as {
    post: Post;
    prev?: PostMeta;
    next?: PostMeta;
  };

  return (
    <>
      <Header />
      <main className="hero-warm min-h-[calc(100vh-4rem)]">
        <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3" /> The Bridge Journal
          </Link>

          <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">{post.title}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{post.description}</p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs uppercase tracking-wider text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Calendar className="size-3" />
              {new Date(post.published).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span className="inline-flex items-center gap-1"><Clock className="size-3" /> {post.readingTime} min read</span>
            {post.author && <span>· {post.author}</span>}
          </div>

          {post.cover && (
            <div className="mt-8 overflow-hidden rounded-3xl">
              <img src={post.cover} alt="" className="h-auto w-full object-cover" />
            </div>
          )}

          <div
            className="prose-blog mt-10"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: post.html }}
          />

          <nav className="mt-16 grid gap-3 border-t border-border pt-8 sm:grid-cols-2">
            {prev ? (
              <Link
                to="/blog/$slug"
                params={{ slug: prev.slug }}
                className="group rounded-2xl border border-border bg-surface/60 p-4 transition hover:border-gold/40"
              >
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Previous</span>
                <p className="mt-1 font-serif text-lg group-hover:text-gold">{prev.title}</p>
              </Link>
            ) : <span />}
            {next ? (
              <Link
                to="/blog/$slug"
                params={{ slug: next.slug }}
                className="group rounded-2xl border border-border bg-surface/60 p-4 text-right transition hover:border-gold/40 sm:text-right"
              >
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Next</span>
                <p className="mt-1 font-serif text-lg group-hover:text-gold">{next.title}</p>
                <ArrowRight className="ml-auto mt-2 size-4 text-muted-foreground" />
              </Link>
            ) : <span />}
          </nav>
        </article>
      </main>
      <Footer />
    </>
  );
}
