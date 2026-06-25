import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listMyApplications } from "@/lib/applications.functions";
import { DashShell } from "@/components/dashboard/DashShell";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { ArrowRight, Plus } from "lucide-react";

const appsQuery = queryOptions({
  queryKey: ["applications"],
  queryFn: () => listMyApplications({}),
});

export const Route = createFileRoute("/_authenticated/dashboard/applications")({
  head: () => ({
    meta: [
      { title: "Applications · Bridge Gateway" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(appsQuery),
  component: ApplicationsPage,
});

function ApplicationsPage() {
  const { data } = useSuspenseQuery(appsQuery);
  return (
    <DashShell eyebrow="Pipeline" title="Your applications">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {data.applications.length} application{data.applications.length === 1 ? "" : "s"}
        </p>
        <Link
          to="/courses"
          className="tap inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-medium text-gold-foreground hover:opacity-90 transition"
        >
          <Plus className="size-4" /> Start a new one
        </Link>
      </div>

      {data.applications.length === 0 ? (
        <div className="glass-strong rounded-3xl p-10 text-center">
          <p className="font-serif text-2xl">No applications yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse the catalogue and tap “Start application”.
          </p>
          <Link
            to="/courses"
            className="tap mt-5 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-gold-foreground hover:opacity-90 transition"
          >
            Browse courses <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {data.applications.map((a) => {
            const c = (a as { courses?: { name?: string; level?: string; subject?: string; universities?: { name?: string; city?: string } } }).courses;
            const uni = c?.universities;
            return (
              <li key={a.id} className="glass rounded-3xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      {c?.level ?? "—"} · {uni?.name ?? "Course"}
                    </p>
                    <p className="mt-1 font-serif text-lg text-foreground truncate">
                      {c?.name ?? "Application"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Created {new Date(a.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusPill status={a.status} />
                </div>
                <Link
                  to="/dashboard/applications/$id"
                  params={{ id: a.id }}
                  className="tap mt-4 inline-flex items-center gap-1 text-sm text-gold hover:underline"
                >
                  View timeline <ArrowRight className="size-3.5" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </DashShell>
  );
}
