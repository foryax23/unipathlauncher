import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CookieConsent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
  version: number;
};

const STORAGE_KEY = "bgc-cookie-consent-v1";
const VERSION = 1;

type Ctx = {
  consent: CookieConsent | null;
  ready: boolean;
  preferencesOpen: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  save: (partial: { analytics: boolean; marketing: boolean }) => void;
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
    return parsed;
  } catch {
    return null;
  }
}

function write(c: CookieConsent) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
    window.dispatchEvent(new CustomEvent("cookieconsentchange", { detail: c }));
  } catch {}
}

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [ready, setReady] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    setConsent(read());
    setReady(true);
  }, []);

  const persist = useCallback((analytics: boolean, marketing: boolean) => {
    const next: CookieConsent = {
      necessary: true,
      analytics,
      marketing,
      timestamp: Date.now(),
      version: VERSION,
    };
    write(next);
    setConsent(next);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      consent,
      ready,
      preferencesOpen,
      acceptAll: () => persist(true, true),
      rejectAll: () => persist(false, false),
      save: ({ analytics, marketing }) => {
        persist(analytics, marketing);
        setPreferencesOpen(false);
      },
      openPreferences: () => setPreferencesOpen(true),
      closePreferences: () => setPreferencesOpen(false),
      reset: () => {
        try {
          localStorage.removeItem(STORAGE_KEY);
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
