// Minimal first-party cookie helpers so the server side can read the consent
// snapshot without relying on localStorage.

export const CONSENT_COOKIE = "bgc_consent";
export const CONSENT_COOKIE_MAX_AGE_DAYS = 180;

export type ConsentSnapshot = {
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
};

export function encodeConsent(s: ConsentSnapshot): string {
  // Compact, URL-safe encoding: p1a0m1
  return `p${s.preferences ? 1 : 0}a${s.analytics ? 1 : 0}m${s.marketing ? 1 : 0}`;
}

export function decodeConsent(raw: string | undefined | null): ConsentSnapshot | null {
  if (!raw) return null;
  const m = /^p([01])a([01])m([01])$/.exec(raw);
  if (!m) return null;
  return {
    preferences: m[1] === "1",
    analytics: m[2] === "1",
    marketing: m[3] === "1",
  };
}

export function writeConsentCookie(s: ConsentSnapshot) {
  if (typeof document === "undefined") return;
  const value = encodeConsent(s);
  const maxAge = CONSENT_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
}

export function clearConsentCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${CONSENT_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
}
