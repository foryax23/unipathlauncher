import { Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/marketing/Logo";
import { supabase } from "@/integrations/supabase/client";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import {
  LayoutDashboard,
  Users,
  Inbox,
  FileText,
  ShieldCheck,
  CalendarClock,
  LogOut,
} from "lucide-react";

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/applications", label: "Applications", icon: FileText },
  { to: "/admin/leads", label: "Leads", icon: Inbox },
  { to: "/admin/availability", label: "Availability", icon: CalendarClock },
  { to: "/admin/audit", label: "Audit", icon: ShieldCheck },
] as const;

export function AdminShell({
  children,
  eyebrow = "Staff workspace",
  title,
  signedInEmail,
}: {
  children: React.ReactNode;
  eyebrow?: string;
  title?: string;
  signedInEmail?: string | null;
}) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen hero-warm safe-top">
      <header className="glass border-b border-border/50 sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="shrink-0"><Logo /></Link>
          <nav className="hidden md:flex items-center gap-1">
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
          <div className="flex items-center gap-1">
            <NotificationBell />
            <button
              type="button"
              onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }}
              className="tap inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/40"
              aria-label="Sign out"
            >
              <LogOut className="size-4" /><span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
        <nav className="md:hidden flex items-center gap-1 overflow-x-auto px-3 pb-2 -mt-1">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.exact }}
              activeProps={{ className: "bg-gold/20 text-foreground" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-accent/40" }}
              className="tap inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs"
            >
              <n.icon className="size-3.5" /> {n.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 pb-24">
        {(eyebrow || title) && (
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{eyebrow}</p>
            {title && (
              <h1 className="mt-2 font-serif text-display-md text-foreground">{title}</h1>
            )}
            {signedInEmail && (
              <p className="mt-1 text-xs text-muted-foreground">Signed in as <span className="text-foreground">{signedInEmail}</span></p>
            )}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
