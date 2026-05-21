import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/courses", label: "Courses" },
  { href: "/#how", label: "How it works" },
  { href: "/#destinations", label: "Destinations" },
  { href: "/#stories", label: "Stories" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 glass border-b border-border">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center" aria-label="UniPath home">
          <Logo />
        </Link>
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-7">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/login"
            className="hidden h-10 items-center rounded-full border border-border px-4 text-sm font-medium text-foreground hover:bg-accent sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="tap inline-flex h-11 items-center justify-center rounded-full bg-gradient-warm px-5 text-sm font-semibold text-white shadow-md shadow-coral/30 transition-transform hover:-translate-y-0.5"
          >
            Get matched
          </Link>
        </div>
      </div>
    </header>
  );
}
