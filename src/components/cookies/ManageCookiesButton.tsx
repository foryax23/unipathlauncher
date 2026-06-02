import { useCookieConsent } from "./CookieConsentProvider";

export function ManageCookiesButton({ className = "" }: { className?: string }) {
  const { openPreferences } = useCookieConsent();
  return (
    <button
      type="button"
      onClick={openPreferences}
      className={`hover:text-foreground ${className}`}
    >
      Manage cookies
    </button>
  );
}
