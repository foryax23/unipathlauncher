import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { CommandPalette } from "@/components/search/CommandPalette";

const NAV = [
  { href: "/courses", label: "Courses" },
  { href: "/#how", label: "How it works" },
  { href: "/#destinations", label: "Destinations" },
  { href: "/#stories", label: "Stories" },
];

export function Header() {
  return (
    <header className="sticky top-3 z-40 px-3 sm:top-4 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <div
          className="relative flex h-14 items-center justify-between rounded-full border border-white/15 bg-background/50 pl-4 pr-2 shadow-[0_8px_32px_-12px_rgba(15,43,91,0.25)] backdrop-blur-xl backdrop-saturate-150 sm:pl-6 dark:border-white/10 dark:bg-background/40"
        >
          {/* subtle inner highlight for glass feel */}
          <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent dark:from-white/5" />

          <Link to="/" className="relative flex items-center" aria-label="Bridge Gateway Consulting home">
            <Logo />
          </Link>

          <nav aria-label="Primary" className="relative hidden md:block">
            <ul className="flex items-center gap-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="relative flex items-center gap-1.5">
            <ThemeToggle />
            <Link
              to="/login"
              className="hidden h-9 items-center rounded-full px-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="tap inline-flex h-10 items-center justify-center rounded-full bg-gradient-warm px-4 text-sm font-semibold text-white shadow-md shadow-coral/30 transition-transform hover:-translate-y-0.5"
            >
              Get matched
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
