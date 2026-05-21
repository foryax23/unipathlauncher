import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Logo } from "@/components/marketing/Logo";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password · Bridge Gateway" },
      { name: "description", content: "Reset your Bridge Gateway account password." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [mode, setMode] = useState<"request" | "update">("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash.includes("type=recovery")) setMode("update");
  }, []);

  const request = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password",
      });
      if (error) throw error;
      toast.success("Check your inbox for a reset link.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  const update = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated. You're signed in.");
      // Role-based redirect: admins → /admin, everyone else → /dashboard.
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      let dest = "/dashboard";
      if (uid) {
        const { data: role } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", uid)
          .eq("role", "admin")
          .maybeSingle();
        if (role) dest = "/admin";
      }
      window.location.href = dest;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen aurora flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Link to="/"><Logo /></Link></div>
        <div className="glass-strong rounded-3xl p-7">
          <h1 className="text-display-md">{mode === "request" ? "Reset password" : "Set new password"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Works for student and adviser accounts.</p>
          <form onSubmit={mode === "request" ? request : update} className="mt-6 space-y-3">
            {mode === "request" ? (
              <input
                required type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="tap w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            ) : (
              <input
                required type="password" minLength={6} value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                className="tap w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            )}
            <button
              type="submit" disabled={loading}
              className="tap w-full rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Please wait…" : mode === "request" ? "Send reset link" : "Update password"}
            </button>
          </form>
          <div className="mt-5 text-center text-xs text-muted-foreground">
            <Link to="/login" className="underline-offset-4 hover:underline">Back to sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
