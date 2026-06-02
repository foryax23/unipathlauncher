import { Link } from "@tanstack/react-router";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCookieConsent } from "./CookieConsentProvider";
import { CookiePreferencesDialog } from "./CookiePreferencesDialog";

export function CookieBanner() {
  const { consent, ready, acceptAll, rejectAll, openPreferences } = useCookieConsent();

  if (!ready || consent) return <CookiePreferencesDialog />;

  return (
    <>
      <div
        role="dialog"
        aria-label="Cookie consent"
        className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-3 sm:px-5 sm:pb-5"
      >
        <div className="mx-auto max-w-5xl glass-strong rounded-2xl border border-border/60 p-4 shadow-2xl sm:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                <Cookie className="h-4 w-4" />
              </span>
              <div className="text-sm text-foreground/90">
                <p className="font-medium">We value your privacy</p>
                <p className="mt-1 text-muted-foreground">
                  We use cookies to run this site, analyse traffic, and personalise your
                  experience. You can accept all, reject non-essential, or customise your
                  choices. Read our{" "}
                  <Link to="/cookies" className="underline underline-offset-2 hover:text-foreground">
                    Cookie Policy
                  </Link>
                  .
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={rejectAll}>
                Reject all
              </Button>
              <Button variant="outline" size="sm" onClick={openPreferences}>
                Customise
              </Button>
              <Button
                size="sm"
                onClick={acceptAll}
                className="bg-gold text-gold-foreground hover:bg-gold/90"
              >
                Accept all
              </Button>
            </div>
          </div>
        </div>
      </div>
      <CookiePreferencesDialog />
    </>
  );
}
