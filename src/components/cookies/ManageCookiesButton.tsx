import { useOptionalCookieConsent } from "./CookieConsentProvider";

export function ManageCookiesButton({ className = "" }: { className?: string }) {
  const cookieConsent = useOptionalCookieConsent();

  if (!cookieConsent) return null;

  return (
    <button
      type="button"
      onClick={cookieConsent.openPreferences}
      className={`hover:text-foreground ${className}`}
    >
      Manage cookies
    </button>
  );
}
