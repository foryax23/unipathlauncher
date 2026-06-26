import { Star } from "lucide-react";

export function StarRating({ value, max = 5, size = 16, className = "" }: { value: number; max?: number; size?: number; className?: string }) {
  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${value} out of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          width={size}
          height={size}
          className={i < Math.round(value) ? "fill-gold text-gold" : "text-muted-foreground/40"}
        />
      ))}
    </div>
  );
}

type Review = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  staff_reply: string | null;
  created_at: string;
};

export function ReviewsSection({
  reviews,
  avgRating,
  count,
  heading = "Student reviews",
}: {
  reviews: Review[];
  avgRating: number | null;
  count: number;
  heading?: string;
}) {
  if (count === 0) return null;
  return (
    <section className="mt-12">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-serif text-2xl">{heading}</h2>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <StarRating value={avgRating ?? 0} />
            <span className="font-medium text-foreground">{avgRating?.toFixed(1) ?? "—"}</span>
            <span>· {count} review{count === 1 ? "" : "s"}</span>
          </div>
        </div>
      </div>
      <ul className="mt-5 grid gap-4 md:grid-cols-2">
        {reviews.map((r) => (
          <li key={r.id} className="glass rounded-3xl p-5">
            <StarRating value={r.rating} />
            {r.title && <p className="mt-2 font-serif text-lg">{r.title}</p>}
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{r.body}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              {new Date(r.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </p>
            {r.staff_reply && (
              <div className="mt-3 rounded-2xl border border-gold/30 bg-gold/5 p-3 text-sm">
                <p className="text-xs uppercase tracking-widest text-gold mb-1">Bridge Gateway reply</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{r.staff_reply}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
