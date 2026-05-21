import { createFileRoute } from "@tanstack/react-router";
import { AuthCard } from "@/components/auth/AuthCard";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in · Bridge Gateway" },
      { name: "description", content: "Sign in to your Bridge Gateway account to continue your UK university application." },
    ],
  }),
  component: () => <AuthCard mode="login" />,
});
