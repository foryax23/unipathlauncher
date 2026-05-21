import { Instagram, Linkedin, Music2 } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Logo />
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            Free, impartial, GDPR-compliant guidance for UK students.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-foreground">Terms</a></li>
            <li><a href="#" className="hover:text-foreground">Contact</a></li>
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          {[
            { href: "#", label: "Instagram", Icon: Instagram },
            { href: "#", label: "TikTok", Icon: Music2 },
            { href: "#", label: "LinkedIn", Icon: Linkedin },
          ].map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto w-full max-w-6xl px-4 py-5 text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} UniPath. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
