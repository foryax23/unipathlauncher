import { useEffect, useState } from "react";
import { Mail, X, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DISMISS_KEY = "unipath:verify-banner-dismissed";

export function VerifyEmailBanner({
  email, verifiedAt,
}: { email: string; verifiedAt: string | null }) {
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    } catch { /* noop */ }
  }, []);

  if (verifiedAt || dismissed) return null;

  const send = async () => {
    setSending(true);
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) throw error;
      setSent(true);
      toast.success("Verification email sent. Check your inbox.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send email");
    } finally {
      setSending(false);
    }
  };

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, "1"); } catch { /* noop */ }
    setDismissed(true);
  };

  return (
    <div className="relative mb-6 flex items-start gap-3 rounded-2xl border border-amber/40 bg-gradient-to-r from-amber/15 to-coral/10 p-4 pr-12 sm:items-center">
      <div className="grid size-9 shrink-0 place-items-center rounded-full bg-amber/30 text-foreground">
        {sent ? <CheckCircle2 className="size-4" /> : <Mail className="size-4" />}
      </div>
      <div className="flex-1 text-sm">
        <p className="font-medium text-foreground">
          {sent ? "Check your inbox" : "Verify your email to secure your account"}
        </p>
        <p className="mt-0.5 text-muted-foreground">
          {sent
            ? `We sent a confirmation link to ${email}.`
            : `We'll send a one-tap confirmation link to ${email}.`}
        </p>
      </div>
      {!sent && (
        <button
          type="button"
          onClick={send}
          disabled={sending}
          className="tap shrink-0 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background transition hover:opacity-90 disabled:opacity-50"
        >
          {sending ? "Sending…" : "Send link"}
        </button>
      )}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
