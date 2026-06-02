import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useCookieConsent } from "./CookieConsentProvider";
import { CATEGORY_META, cookiesFor, type ConsentCategory } from "@/lib/consent/registry";

export function CookiePreferencesDialog() {
  const { preferencesOpen, closePreferences, save, rejectAll, consent } = useCookieConsent();
  const [preferences, setPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (preferencesOpen) {
      setPreferences(consent?.preferences ?? false);
      setAnalytics(consent?.analytics ?? false);
      setMarketing(consent?.marketing ?? false);
    }
  }, [preferencesOpen, consent]);

  const setters: Record<ConsentCategory, (v: boolean) => void> = {
    necessary: () => {},
    preferences: setPreferences,
    analytics: setAnalytics,
    marketing: setMarketing,
  };
  const values: Record<ConsentCategory, boolean> = {
    necessary: true,
    preferences,
    analytics,
    marketing,
  };

  return (
    <Dialog open={preferencesOpen} onOpenChange={(o) => !o && closePreferences()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cookie preferences</DialogTitle>
          <DialogDescription>
            Choose which cookies you allow. You can change this any time from the footer.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          {CATEGORY_META.map((cat) => {
            const cookies = cookiesFor(cat.id);
            return (
              <div key={cat.id} className="rounded-xl border border-border/60 bg-card/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-foreground">{cat.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{cat.description}</p>
                  </div>
                  <Switch
                    checked={values[cat.id]}
                    disabled={cat.required}
                    onCheckedChange={setters[cat.id]}
                    aria-label={`Toggle ${cat.title}`}
                  />
                </div>
                {cookies.length > 0 && (
                  <details className="mt-3 group">
                    <summary className="cursor-pointer text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground">
                      Cookies in this category ({cookies.length})
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
                          {cookies.map((c) => (
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
                )}
              </div>
            );
          })}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={rejectAll}>
            Reject all
          </Button>
          <Button
            variant="outline"
            onClick={() => save({ preferences, analytics, marketing })}
          >
            Save preferences
          </Button>
          <Button
            onClick={() => save({ preferences: true, analytics: true, marketing: true })}
            className="bg-gold text-gold-foreground hover:bg-gold/90"
          >
            Accept all
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
