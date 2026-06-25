import { Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/marketing/Logo";
import { supabase } from "@/integrations/supabase/client";
import {
  BookOpen,
  FileText,
  FolderOpen,
  MessageSquare,
  CalendarClock,
  LayoutDashboard,
  LogOut,
} from "lucide-react";

const NAV: Array<{ to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }> = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/applications", label: "Applications", icon: FileText },
  { to: "/dashboard/shortlist", label: "Shortlist", icon: BookOpen },
  { to: "/dashboard/documents", label: "Documents", icon: FolderOpen },
  { to: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { to: "/dashboard/bookings", label: "Bookings", icon: CalendarClock },
];

export function DashShell({
  children,
  eyebrow,
  title,
}: {
  children: React.ReactNode;
  eyebrow?: string;
  title?: string;
}) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen hero-warm safe-top">
      <header className="glass border-b border-border/50 sticky top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="shrink-0"><Logo /></Link>
          <nav className="hidden md:flex items-center gap-1 overflow-x-auto">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.exact }}
                activeProps={{ className: "bg-gold/20 text-foreground" }}
                inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-accent/40" }}
                className="tap inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm transition"
              >
                <n.icon className="size-4" /> {n.label}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/" });
            }}
            className="tap inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/40 transition"
          >
            <LogOut className="size-4" /> <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
        <nav className="md:hidden flex items-center gap-1 overflow-x-auto px-3 pb-2 -mt-1">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.exact }}
              activeProps={{ className: "bg-gold/20 text-foreground" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-accent/40" }}
              className="tap inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition"
            >
              <n.icon className="size-3.5" /> {n.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 pb-24">
        {(eyebrow || title) && (
          <div className="mb-6">
            {eyebrow && (
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                {eyebrow}
              </p>
            )}
            {title && (
              <h1 className="mt-2 font-serif text-display-md text-foreground">
                {title}
              </h1>
            )}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
