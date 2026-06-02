import { Instagram, Linkedin, Mail, MapPin, Music2, Phone } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { COMPANY, phoneHref } from "./data/company";
import { ManageCookiesButton } from "@/components/cookies/ManageCookiesButton";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-12">
        {/* Brand + registered details */}
        <div className="md:col-span-4">
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Your gateway to UK education. Expert advisers, personalised pathways, free guidance.
          </p>
          <div className="mt-5 flex items-start gap-2.5 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            <address className="not-italic leading-relaxed">
              {COMPANY.address.line1}
              <br />
              {COMPANY.address.line2}, {COMPANY.address.city} {COMPANY.address.postcode}
              <br />
              {COMPANY.address.country}
            </address>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Company No. <span className="font-medium text-foreground">{COMPANY.companyNumber}</span>
          </p>
        </div>

        {/* Contact */}
        <div className="md:col-span-4">
          <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-foreground">
            Contact
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <a
                href={`mailto:${COMPANY.email}`}
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Mail className="h-4 w-4 text-gold" />
                {COMPANY.email}
              </a>
            </li>
            {COMPANY.phones.map((p) => (
              <li key={p}>
                <a
                  href={phoneHref(p)}
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Phone className="h-4 w-4 text-gold" />
                  {p}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal + social */}
        <div className="md:col-span-4">
          <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-foreground">
            Legal
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-foreground">Terms of Service</Link></li>
            <li><Link to="/cookies" className="hover:text-foreground">Cookie Policy</Link></li>
            <li><ManageCookiesButton /></li>
          </ul>
          <div className="mt-6 flex items-center gap-2">
            {[
              { href: "#", label: "Instagram", Icon: Instagram },
              { href: "#", label: "TikTok", Icon: Music2 },
              { href: "#", label: "LinkedIn", Icon: Linkedin },
            ].map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <p className="mx-auto w-full max-w-6xl px-4 py-5 text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} {COMPANY.legalName}. Registered in England &amp; Wales,
          company number {COMPANY.companyNumber}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
