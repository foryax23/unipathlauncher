import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMyShortlist, removeFromShortlist } from "@/lib/shortlists.functions";
import { Logo } from "@/components/marketing/Logo";
import { Trash2, BookmarkCheck, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const shortlistQuery = queryOptions({
  queryKey: ["shortlist"],
  queryFn: () => listMyShortlist({}),
});

export const Route = createFileRoute("/_authenticated/dashboard/shortlist")({
  head: () => ({
    meta: [
      { title: "My shortlist · Bridge Gateway" },
      { name: "description", content: "Courses you've saved for later." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(shortlistQuery),
  component: ShortlistPage,
  errorComponent: ({ error }) => (
    <div className="hero-warm min-h-screen p-10 text-muted-foreground">
      Couldn't load your shortlist: {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="p-10">Not found.</div>,
});

function ShortlistPage() {
  const { data } = useSuspenseQuery(shortlistQuery);
  const remove = useServerFn(removeFromShortlist);
  const qc = useQueryClient();

  const removal = useMutation({
    mutationFn: (course_id: string) => remove({ data: { course_id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shortlist"] });
      toast.success("Removed");
    },
  });

  return (
    <div className="hero-warm min-h-screen safe-top">
      <header className="glass border-b border-border/50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/"><Logo /></Link>
          <Link
            to="/dashboard"
            className="tap rounded-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/40 transition"
          >
            Back to dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Saved courses
        </p>
        <h1 className="mt-2 font-serif text-display-md text-foreground">
          Your shortlist
        </h1>
        <p className="mt-2 text-muted-foreground">
          {data.items.length} {data.items.length === 1 ? "course" : "courses"} saved.
        </p>

        {data.items.length === 0 ? (
          <div className="glass-strong mt-8 rounded-3xl p-10 text-center">
            <BookmarkCheck className="mx-auto size-8 text-gold" />
            <p className="mt-3 font-serif text-2xl">Nothing saved yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Browse the catalogue and tap Save on any course you like.
            </p>
            <Link
              to="/courses"
              className="tap mt-5 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-gold-foreground hover:opacity-90 transition"
            >
              Browse courses <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <ul className="mt-6 grid gap-3 md:grid-cols-2">
            {data.items.map((it) => (
              <li
                key={it.id}
                className="glass rounded-3xl p-5 flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {it.level ?? "—"} · {it.partner ?? "—"}
                  </p>
                  <p className="mt-1 font-serif text-lg text-foreground truncate">
                    {it.course_name ?? it.course_id}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Saved {new Date(it.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removal.mutate(it.course_id)}
                  disabled={removal.isPending}
                  className="tap shrink-0 rounded-full p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                  aria-label="Remove from shortlist"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
