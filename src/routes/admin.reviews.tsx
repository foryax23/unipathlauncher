import { createFileRoute, redirect } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StarRating } from "@/components/reviews/ReviewsSection";
import { listPendingReviews, moderateReview } from "@/lib/reviews.functions";
import { getMyAdminStatus } from "@/lib/admin.functions";
import { Check, X, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const queryFor = (status: "pending" | "published" | "rejected" | "all") =>
  queryOptions({
    queryKey: ["admin-reviews", status],
    queryFn: () => listPendingReviews({ data: { status } }),
  });

export const Route = createFileRoute("/admin/reviews")({
  beforeLoad: async () => {
    const r = await getMyAdminStatus();
    if (!r.isStaff) throw redirect({ to: "/dashboard" });
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(queryFor("pending")),
  head: () => ({ meta: [{ title: "Reviews · Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminReviews,
});

function AdminReviews() {
  const [status, setStatus] = useState<"pending" | "published" | "rejected" | "all">("pending");
  const { data } = useSuspenseQuery(queryFor(status));
  const qc = useQueryClient();
  const moderate = useServerFn(moderateReview);

  const act = useMutation({
    mutationFn: (v: { reviewId: string; action: "publish" | "reject"; staffReply?: string }) =>
      moderate({ data: v }),
    onSuccess: () => {
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <AdminShell eyebrow="Moderation" title="Reviews">
      <div className="mb-5 flex flex-wrap gap-2">
        {(["pending", "published", "rejected", "all"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`tap rounded-full px-3 py-1.5 text-xs capitalize transition ${
              status === s ? "bg-gold text-gold-foreground" : "border border-border hover:bg-accent/40"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      {data.reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews in this bucket.</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {data.reviews.map((r) => (
            <ReviewCard key={r.id} r={r} onAct={act.mutate} pending={act.isPending} />
          ))}
        </ul>
      )}
    </AdminShell>
  );
}

type Row = Awaited<ReturnType<typeof listPendingReviews>>["reviews"][number];

function ReviewCard({
  r,
  onAct,
  pending,
}: {
  r: Row;
  onAct: (v: { reviewId: string; action: "publish" | "reject"; staffReply?: string }) => void;
  pending: boolean;
}) {
  const [reply, setReply] = useState(r.staff_reply ?? "");
  const [showReply, setShowReply] = useState(!!r.staff_reply);
  const uni = Array.isArray(r.universities) ? r.universities[0] : r.universities;
  const course = Array.isArray(r.courses) ? r.courses[0] : r.courses;
  return (
    <li className="glass-strong rounded-3xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {uni?.name ?? "—"}{course?.name ? ` · ${course.name}` : ""}
          </p>
          {r.title && <p className="mt-1 font-serif text-lg">{r.title}</p>}
          <div className="mt-1"><StarRating value={r.rating} /></div>
        </div>
        <span className="rounded-full border border-border bg-surface/60 px-2 py-0.5 text-xs capitalize">{r.status}</span>
      </div>
      <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">{r.body}</p>
      <p className="mt-2 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p>

      {showReply && (
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Staff reply (optional, public)"
          className="mt-3 w-full rounded-2xl border border-border bg-background/60 p-3 text-sm"
        />
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => onAct({ reviewId: r.id, action: "publish", staffReply: reply.trim() || undefined })}
          className="tap inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1.5 text-xs font-medium text-gold-foreground disabled:opacity-50"
        >
          <Check className="size-3.5" /> Publish
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => onAct({ reviewId: r.id, action: "reject" })}
          className="tap inline-flex items-center gap-1.5 rounded-full border border-destructive/40 px-3 py-1.5 text-xs text-destructive disabled:opacity-50"
        >
          <X className="size-3.5" /> Reject
        </button>
        <button
          type="button"
          onClick={() => setShowReply((s) => !s)}
          className="tap inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-accent/40"
        >
          <MessageSquare className="size-3.5" /> {showReply ? "Hide reply" : "Add reply"}
        </button>
      </div>
    </li>
  );
}
