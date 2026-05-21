import { createFileRoute } from "@tanstack/react-router";
import { AuthCard } from "@/components/auth/AuthCard";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account · UniPath" },
      { name: "description", content: "Create a UniPath account and get a personalised UK university shortlist." },
    ],
  }),
  component: () => <AuthCard mode="signup" />,
});
