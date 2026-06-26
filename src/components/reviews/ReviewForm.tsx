import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { submitReview } from "@/lib/reviews.functions";
import { toast } from "sonner";
import { Star, Send } from "lucide-react";

export function ReviewForm({
  universityId,
  universityName,
  courseId,
  onSuccess,
}: {
  universityId: string;
  universityName: string;
  courseId?: string | null;
  onSuccess?: () => void;
}) {
  const submit = useServerFn(submitReview);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const m = useMutation({
    mutationFn: () =>
      submit({
        data: {
          universityId,
          courseId: courseId ?? null,
          rating,
          title: title.trim() || undefined,
          body: body.trim(),
        },
      }),
    onSuccess: () => {
      toast.success("Thanks! Your review is pending moderation.");
      setRating(0); setTitle(""); setBody("");
      onSuccess?.();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not submit"),
  });

  const valid = rating >= 1 && body.trim().length >= 10;

  return (
    <div className="glass-strong rounded-3xl p-5">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">Review</p>
      <p className="mt-1 font-serif text-lg">Share your experience at {universityName}</p>
      <div className="mt-3 inline-flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const n = i + 1;
          const active = (hover || rating) >= n;
          return (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(n)}
              className="tap p-1"
              aria-label={`${n} star${n === 1 ? "" : "s"}`}
            >
              <Star className={`size-7 transition ${active ? "fill-gold text-gold" : "text-muted-foreground/40"}`} />
            </button>
          );
        })}
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Headline (optional)"
        maxLength={140}
        className="mt-3 h-11 w-full rounded-full border border-border bg-background/60 px-4 text-sm"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What worked? What could have been better? (min 10 chars)"
        rows={4}
        maxLength={4000}
        className="mt-2 w-full rounded-2xl border border-border bg-background/60 p-3 text-sm"
      />
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{body.trim().length}/4000</p>
        <button
          type="button"
          onClick={() => m.mutate()}
          disabled={!valid || m.isPending}
          className="tap inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-medium text-gold-foreground disabled:opacity-50"
        >
          <Send className="size-4" /> {m.isPending ? "Submitting…" : "Submit review"}
        </button>
      </div>
    </div>
  );
}
