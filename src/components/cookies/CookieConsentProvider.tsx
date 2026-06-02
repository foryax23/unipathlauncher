import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { writeConsentCookie, clearConsentCookie } from "@/lib/consent/cookie";
import { applyConsent, bootConsent } from "@/lib/consent/loadScripts";

export type CookieConsent = {
  necessary: true;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
  version: number;
};

const STORAGE_KEY = "bgc-cookie-consent-v2";
const LEGACY_KEY = "bgc-cookie-consent-v1";
const VERSION = 2;
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000; // 12 months

type Ctx = {
  consent: CookieConsent | null;
  ready: boolean;
  preferencesOpen: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  save: (partial: { preferences: boolean; analytics: boolean; marketing: boolean }) => void;
  openPreferences: () => void;
  closePreferences: () => void;
  reset: () => void;
};

const CookieCtx = createContext<Ctx | null>(null);

function read(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsent;
    if (parsed.version !== VERSION) return null;
    if (Date.now() - parsed.timestamp > MAX_AGE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function write(c: CookieConsent) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
    localStorage.removeItem(LEGACY_KEY);
    writeConsentCookie({
      preferences: c.preferences,
      analytics: c.analytics,
      marketing: c.marketing,
    });
    window.dispatchEvent(new CustomEvent("cookieconsentchange", { detail: c }));
  } catch {}
}

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [ready, setReady] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    // Boot Consent Mode v2 defaults (denied) as early as possible client-side.
    bootConsent();
    const existing = read();
    setConsent(existing);
    setReady(true);
    if (existing) {
      applyConsent({
        preferences: existing.preferences,
        analytics: existing.analytics,
        marketing: existing.marketing,
      });
    }
  }, []);

  const persist = useCallback(
    (preferences: boolean, analytics: boolean, marketing: boolean) => {
      const next: CookieConsent = {
        necessary: true,
        preferences,
        analytics,
        marketing,
        timestamp: Date.now(),
        version: VERSION,
      };
      write(next);
      setConsent(next);
      applyConsent({ preferences, analytics, marketing });
    },
    [],
  );

  const value = useMemo<Ctx>(
    () => ({
      consent,
      ready,
      preferencesOpen,
      acceptAll: () => persist(true, true, true),
      rejectAll: () => persist(false, false, false),
      save: ({ preferences, analytics, marketing }) => {
        persist(preferences, analytics, marketing);
        setPreferencesOpen(false);
      },
      openPreferences: () => setPreferencesOpen(true),
      closePreferences: () => setPreferencesOpen(false),
      reset: () => {
        try {
          localStorage.removeItem(STORAGE_KEY);
          clearConsentCookie();
        } catch {}
        setConsent(null);
      },
    }),
    [consent, ready, preferencesOpen, persist],
  );

  return <CookieCtx.Provider value={value}>{children}</CookieCtx.Provider>;
}

export function useCookieConsent() {
  const ctx = useContext(CookieCtx);
  if (!ctx) throw new Error("useCookieConsent must be used within CookieConsentProvider");
  return ctx;
}

export function useOptionalCookieConsent() {
  return useContext(CookieCtx);
}
