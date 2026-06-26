import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { getOrCreateMyReferral, claimReferralCode } from "@/lib/referrals.functions";
import { Gift, Copy, Users, Share2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/referrals")({
  head: () => ({
    meta: [
      { title: "Referrals · Bridge Gateway" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ReferralsPage,
});

type Primary = { id: string; code: string; status: string; created_at: string };

function ReferralsPage() {
  const getMine = useServerFn(getOrCreateMyReferral);
  const claim = useServerFn(claimReferralCode);
  const [primary, setPrimary] = useState<Primary | null>(null);
  const [conversions, setConversions] = useState(0);
  const [totalReward, setTotalReward] = useState(0);
  const [claimCode, setClaimCode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getMine({ data: {} })
      .then((r) => {
        setPrimary(r.primary as Primary);
        setConversions(r.conversions);
        setTotalReward(r.totalRewardPence);
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed"));
  }, [getMine]);

  const shareUrl = primary
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/?ref=${primary.code}`
    : "";

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Earn rewards</p>
        <h1 className="mt-2 font-serif text-4xl">Refer a friend</h1>
        <p className="mt-2 text-muted-foreground">
          Share your code. When friends enrol through Bridge Gateway, you both unlock a £25 voucher.
        </p>
      </header>

      <section className="glass-strong rounded-3xl p-7 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gold/15 text-gold">
            <Gift className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Your code</p>
            <div className="mt-2 flex items-center gap-3">
              <code className="rounded-xl border border-border bg-background px-3 py-2 text-lg font-semibold tracking-wide">
                {primary?.code ?? "—"}
              </code>
              <button
                type="button"
                onClick={() => {
                  if (!shareUrl) return;
                  navigator.clipboard.writeText(shareUrl);
                  toast.success("Share link copied");
                }}
                className="tap inline-flex h-10 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm hover:bg-muted"
              >
                <Copy className="h-4 w-4" /> Copy link
              </button>
              {typeof navigator !== "undefined" && "share" in navigator && (
                <button
                  type="button"
                  onClick={() => {
                    if (!shareUrl) return;
                    navigator.share({ title: "Bridge Gateway", url: shareUrl }).catch(() => {});
                  }}
                  className="tap inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm text-primary-foreground"
                >
                  <Share2 className="h-4 w-4" /> Share
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Friends enrolled</p>
            <p className="mt-1 flex items-baseline gap-2 font-serif text-3xl">
              <Users className="h-5 w-5 text-muted-foreground" /> {conversions}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Total earned</p>
            <p className="mt-1 font-serif text-3xl">£{(totalReward / 100).toFixed(2)}</p>
          </div>
        </div>
      </section>

      <section className="glass mt-6 rounded-3xl p-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Got a code?</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter a friend's referral code to link your accounts.
        </p>
        <form
          className="mt-4 flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!claimCode.trim()) return;
            setBusy(true);
            try {
              await claim({ data: { code: claimCode.trim() } });
              toast.success("Code applied");
              setClaimCode("");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Failed");
            } finally {
              setBusy(false);
            }
          }}
        >
          <input
            value={claimCode}
            onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
            placeholder="BG-XXXXXX"
            className="tap flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-sm"
          />
          <button
            type="submit"
            disabled={busy}
            className="tap rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-gold-foreground disabled:opacity-50"
          >
            Apply
          </button>
        </form>
      </section>
    </main>
  );
}
