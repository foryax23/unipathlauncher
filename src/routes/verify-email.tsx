import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { markEmailVerified } from "@/lib/profile.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/verify-email")({
  head: () => ({ meta: [{ title: "Verifying… · Bridge Gateway" }] }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const navigate = useNavigate();
  const mark = useServerFn(markEmailVerified);

  useEffect(() => {
    (async () => {
      // Auth callback hash is parsed automatically by supabase-js.
      // Wait a tick for the session to settle.
      await supabase.auth.getSession();
      try {
        await mark({});
        toast.success("Email verified — thank you!");
      } catch (err) {
        console.error(err);
      }
      navigate({ to: "/dashboard" });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Verifying your email…</p>
    </div>
  );
}
