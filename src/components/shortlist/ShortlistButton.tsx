import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import {
  addToShortlist,
  listMyShortlist,
  removeFromShortlist,
} from "@/lib/shortlists.functions";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

type Props = {
  courseId: string;
  courseName?: string;
  partner?: string;
  level?: string;
  className?: string;
};

export function ShortlistButton({
  courseId,
  courseName,
  partner,
  level,
  className,
}: Props) {
  const qc = useQueryClient();
  const list = useServerFn(listMyShortlist);
  const add = useServerFn(addToShortlist);
  const remove = useServerFn(removeFromShortlist);

  // Only fetch the shortlist when the user is signed in.
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => {
    let unsub: (() => void) | undefined;
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) =>
      setSignedIn(!!s),
    );
    unsub = () => data.subscription.unsubscribe();
    return unsub;
  }, []);

  const { data } = useQuery({
    queryKey: ["shortlist"],
    queryFn: () => list({}),
    enabled: signedIn === true,
  });

  const saved = !!data?.items.some((i) => i.course_id === courseId);

  const mutation = useMutation({
    mutationFn: async () => {
      if (saved) {
        return remove({ data: { course_id: courseId } });
      }
      return add({
        data: {
          course_id: courseId,
          course_name: courseName,
          partner,
          level,
        },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shortlist"] });
      toast.success(saved ? "Removed from shortlist" : "Saved to shortlist");
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Could not update"),
  });

  if (signedIn === false) {
    return (
      <a
        href="/login?redirect=/dashboard/shortlist"
        className={
          className ??
          "tap inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent transition"
        }
      >
        <Bookmark className="size-3.5" /> Sign in to save
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending || signedIn === null}
      aria-pressed={saved}
      className={
        className ??
        `tap inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${
          saved
            ? "border-gold/40 bg-gold/15 text-foreground"
            : "border-border bg-surface/60 text-muted-foreground hover:bg-accent"
        }`
      }
    >
      {saved ? (
        <BookmarkCheck className="size-3.5" />
      ) : (
        <Bookmark className="size-3.5" />
      )}
      {saved ? "Saved" : "Save"}
    </button>
  );
}
