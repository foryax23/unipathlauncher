
## 1. Company information

Add Bridge Gateway Consulting LTD details across the site.

**`src/components/marketing/Footer.tsx`** — restructure into a 4-column layout:
- **Brand column**: Logo, tagline, "Company No. 15707621", registered address (167-169 Great Portland Street, 5th Floor, London, W1W 5PF, UK).
- **Contact column**: email `info@bridgegatewayconsulting.com` (mailto), all four phone numbers as `tel:` links:
  - +44 7448 921 873
  - +44 7593 855 452
  - +44 7448 426 168
  - +359 886 499 368
- **Legal column**: links to `/privacy`, `/terms`, `/cookies`, "Manage cookies" button (re-opens consent modal).
- **Social column**: existing IG/TikTok/LinkedIn icons.
- Bottom strip: copyright + "Bridge Gateway Consulting Ltd is registered in England & Wales, company number 15707621."

**Update `src/components/marketing/data/`** — add a `company.ts` exporting a single source of truth (name, number, address, email, phones) so Footer, Contact page, and JSON-LD all share it. Update root `Organization` JSON-LD in `src/routes/__root.tsx` to include `address`, `email`, `telephone`, `legalName`.

## 2. Legal pages

Create three new routes with proper `head()` meta + canonical:
- **`src/routes/privacy.tsx`** — Privacy Policy (GDPR/UK DPA 2018: data we collect, lawful basis, retention, rights, contact for DPO requests).
- **`src/routes/terms.tsx`** — Terms of Service.
- **`src/routes/cookies.tsx`** — Cookie Policy listing each cookie/category (Necessary, Analytics, Marketing) with purpose, provider, duration; plus a "Manage cookie preferences" button that re-opens the consent modal.

All three reuse `Header` + `Footer` and a shared `<LegalShell>` wrapper for prose styling.

## 3. Cookie consent system (Cookiebot/OneTrust-style)

### Components (`src/components/cookies/`)
- **`CookieConsentProvider.tsx`** — React context that:
  - Reads/writes consent to `localStorage` key `bgc-cookie-consent-v1` (JSON: `{ necessary: true, analytics: bool, marketing: bool, timestamp, version }`).
  - Versioned — bumping version re-prompts everyone (required when policy changes).
  - Exposes `useCookieConsent()` → `{ consent, accept, reject, save, openPreferences }`.
  - Fires a `window` event `cookieconsentchange` so analytics/marketing scripts can react.
- **`CookieBanner.tsx`** — bottom-anchored slide-up banner (glass style matching site):
  - Short copy: "We use cookies to improve your experience, analyse traffic, and personalise content. Read our [Cookie Policy]."
  - Buttons: **Reject all**, **Customise**, **Accept all** (primary gold).
  - Hidden once a consent decision exists.
- **`CookiePreferencesDialog.tsx`** — modal (shadcn `Dialog`) with four toggle rows:
  - **Strictly necessary** — always on, disabled toggle (session, CSRF, consent state).
  - **Analytics** — optional (e.g. plausible/GA placeholders).
  - **Marketing** — optional.
  - Each row: name, description, list of cookies/providers, expandable details.
  - Footer: **Reject all**, **Save preferences**, **Accept all**.
- **`ManageCookiesButton.tsx`** — small text button used in Footer + Cookie Policy page to re-open the dialog.

### Wiring
- Wrap app in `__root.tsx` `RootComponent` with `<CookieConsentProvider>`, render `<CookieBanner />` once at the root so it appears on every page.
- Gate any future analytics/marketing scripts on `consent.analytics === true` / `consent.marketing === true` via the `cookieconsentchange` event — for now we ship the framework with no third-party scripts loaded, but the hook points are ready.
- Respect Do-Not-Track / GPC: if `navigator.globalPrivacyControl === true`, default analytics + marketing to `false` and still show the banner.
- Accessibility: focus-trapped dialog, ESC closes preferences (but not the banner), labelled toggles, banner has `role="dialog" aria-label="Cookie consent"`.

## Files touched

- created: `src/components/marketing/data/company.ts`
- created: `src/components/cookies/CookieConsentProvider.tsx`
- created: `src/components/cookies/CookieBanner.tsx`
- created: `src/components/cookies/CookiePreferencesDialog.tsx`
- created: `src/components/cookies/ManageCookiesButton.tsx`
- created: `src/routes/privacy.tsx`
- created: `src/routes/terms.tsx`
- created: `src/routes/cookies.tsx`
- edited: `src/components/marketing/Footer.tsx`
- edited: `src/routes/__root.tsx` (provider + banner + updated Organization JSON-LD)

No backend, schema, or auth changes — purely frontend + static content.
