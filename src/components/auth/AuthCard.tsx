import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Logo } from "@/components/marketing/Logo";
import { toast } from "sonner";

type Mode = "login" | "signup";

export function AuthCard({ mode }: { mode: Mode }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/onboarding",
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
        navigate({ to: "/login" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/onboarding" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/onboarding",
      });
      if (result.error) {
        toast.error("Google sign-in failed. Please try email instead.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen aurora flex items-center justify-center px-4 py-12 safe-top safe-bottom">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link to="/"><Logo /></Link>
        </div>
        <div className="glass-strong rounded-3xl p-7 shadow-xl">
          <h1 className="text-display-md text-foreground">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signup"
              ? "Two minutes to a personalised UK course shortlist."
              : "Sign in to continue your application."}
          </p>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="tap mt-6 w-full inline-flex items-center justify-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground transition hover:bg-accent disabled:opacity-50"
          >
            <GoogleIcon /> Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleEmail} className="space-y-3">
            {mode === "signup" && (
              <input
                required minLength={2} maxLength={120}
                value={fullName} onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                className="tap w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            )}
            <input
              required type="email" maxLength={255}
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Email" autoComplete="email"
              className="tap w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              required type="password" minLength={6} maxLength={72}
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Password" autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="tap w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit" disabled={loading}
              className="tap w-full rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
            {mode === "login" ? (
              <>
                <Link to="/reset-password" className="underline-offset-4 hover:underline">Forgot password?</Link>
                <Link to="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">Create account</Link>
              </>
            ) : (
              <>
                <span>Already have an account?</span>
                <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">Sign in</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.4 26.8 36 24 36c-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.6 39.7 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C41.4 35.6 44 30.2 44 24c0-1.2-.1-2.3-.4-3.5z"/>
    </svg>
  );
}
