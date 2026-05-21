import { createFileRoute } from "@tanstack/react-router";
import { AuthCard } from "@/components/auth/AuthCard";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — UniPath" },
      { name: "description", content: "Sign in to your UniPath account to continue your UK university application." },
    ],
  }),
  component: () => <AuthCard mode="login" />,
});
