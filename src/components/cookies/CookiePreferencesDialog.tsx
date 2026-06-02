import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useCookieConsent } from "./CookieConsentProvider";

type Category = {
  id: "necessary" | "analytics" | "marketing";
  title: string;
  description: string;
  cookies: { name: string; provider: string; purpose: string; duration: string }[];
  required?: boolean;
};

const CATEGORIES: Category[] = [
  {
    id: "necessary",
    title: "Strictly necessary",
    description:
      "Required for the site to function: authentication, session security, and remembering your cookie choices. Always on.",
    required: true,
    cookies: [
      { name: "sb-*", provider: "Bridge Gateway (auth)", purpose: "Keeps you signed in", duration: "Session / 7 days" },
      { name: "bgc-cookie-consent-v1", provider: "Bridge Gateway", purpose: "Stores your cookie preferences", duration: "12 months" },
    ],
  },
  {
    id: "analytics",
    title: "Analytics",
    description:
      "Help us understand which pages are useful and where students get stuck, so we can improve the journey. Aggregated, never sold.",
    cookies: [
      { name: "_ga / _ga_*", provider: "Google Analytics (if enabled)", purpose: "Anonymised usage metrics", duration: "Up to 24 months" },
    ],
  },
  {
    id: "marketing",
    title: "Marketing",
    description:
      "Used to measure the performance of our campaigns and show relevant ads on third-party platforms.",
    cookies: [
      { name: "_fbp", provider: "Meta (if enabled)", purpose: "Campaign attribution", duration: "3 months" },
      { name: "_gcl_*", provider: "Google Ads (if enabled)", purpose: "Conversion tracking", duration: "Up to 90 days" },
    ],
  },
];

export function CookiePreferencesDialog() {
  const { preferencesOpen, closePreferences, save, rejectAll, consent } = useCookieConsent();
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (preferencesOpen) {
      setAnalytics(consent?.analytics ?? false);
      setMarketing(consent?.marketing ?? false);
    }
  }, [preferencesOpen, consent]);

  return (
    <Dialog open={preferencesOpen} onOpenChange={(o) => !o && closePreferences()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cookie preferences</DialogTitle>
          <DialogDescription>
            Choose which cookies you allow. You can change this at any time from the footer.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          {CATEGORIES.map((cat) => {
            const enabled =
              cat.id === "necessary" ? true : cat.id === "analytics" ? analytics : marketing;
            const onChange = (v: boolean) => {
              if (cat.id === "analytics") setAnalytics(v);
              if (cat.id === "marketing") setMarketing(v);
            };
            return (
              <div key={cat.id} className="rounded-xl border border-border/60 bg-card/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-foreground">{cat.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{cat.description}</p>
                  </div>
                  <Switch
                    checked={enabled}
                    disabled={cat.required}
                    onCheckedChange={onChange}
                    aria-label={`Toggle ${cat.title}`}
                  />
                </div>
                <details className="mt-3 group">
                  <summary className="cursor-pointer text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground">
                    Cookies in this category ({cat.cookies.length})
                  </summary>
                  <div className="mt-2 overflow-hidden rounded-lg border border-border/50">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/40 text-muted-foreground">
                        <tr>
                          <th className="px-2 py-1.5 text-left font-medium">Name</th>
                          <th className="px-2 py-1.5 text-left font-medium">Provider</th>
                          <th className="px-2 py-1.5 text-left font-medium">Purpose</th>
                          <th className="px-2 py-1.5 text-left font-medium">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cat.cookies.map((c) => (
                          <tr key={c.name} className="border-t border-border/50">
                            <td className="px-2 py-1.5 font-mono">{c.name}</td>
                            <td className="px-2 py-1.5">{c.provider}</td>
                            <td className="px-2 py-1.5">{c.purpose}</td>
                            <td className="px-2 py-1.5">{c.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              </div>
            );
          })}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={rejectAll}>
            Reject all
          </Button>
          <Button variant="outline" onClick={() => save({ analytics, marketing })}>
            Save preferences
          </Button>
          <Button
            onClick={() => save({ analytics: true, marketing: true })}
            className="bg-gold text-gold-foreground hover:bg-gold/90"
          >
            Accept all
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
