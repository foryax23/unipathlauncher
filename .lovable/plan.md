
# Plan: Next-Gen Cookies, Consent & Cache Layer

The site already has a basic banner + provider + preferences dialog (necessary / analytics / marketing). This plan upgrades it into the kind of consent + caching system you see on major platforms (GDPR/ePrivacy-compliant, granular, persisted per device, and wired into real loading behavior).

## Goals

1. First-visit blocking banner with clear Accept / Reject / Customize actions.
2. Granular categories saved per device, versioned, and re-prompted when policy changes.
3. Scripts/integrations only load **after** matching consent (Google Consent Mode v2 ready).
4. App data caching (TanStack Query) tuned so the site feels instant on repeat visits.
5. Service worker + HTTP-cache friendly static asset strategy for offline-friendly reloads.

## 1. Consent model (extend current provider)

Categories:
- `necessary` (always on) — session, auth, CSRF, consent record itself.
- `preferences` — language, theme, dismissed banners.
- `analytics` — GA4 / Plausible / Vercel Analytics.
- `marketing` — Meta Pixel, LinkedIn Insight, Google Ads.

Storage:
- Keep `localStorage` key `bgc-cookie-consent-v1`, add `version` bump → `v2` with new fields.
- Mirror a minimal record into a first-party cookie (`bgc_consent`, 180 days, `SameSite=Lax`, `Secure`) so SSR can read it.
- Auto re-prompt when `version` changes or record is >12 months old.

## 2. Banner & preferences UX (next-gen)

- Bottom-anchored, mobile-first card (sheet on mobile, floating card on desktop).
- Three primary actions on first view: **Accept all**, **Reject all**, **Customize** (equal visual weight — required by EU law).
- Customize opens the existing dialog with per-category toggles + plain-language descriptions + a "What we store" expandable list per category.
- Persistent floating "Cookie settings" button (already have `ManageCookiesButton`) in the footer to re-open preferences anytime.
- Link to `/cookies`, `/privacy`, `/terms` from the banner.

## 3. Consent-gated script loader

New `src/lib/consent/loadScripts.ts` that subscribes to `cookieconsentchange` and:
- Pushes Google Consent Mode v2 defaults on app boot (`ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization` = `denied`).
- On consent update calls `gtag('consent','update', …)` with the resolved values.
- Lazy-injects analytics/marketing tags only when their category is granted; removes them and clears their cookies on revoke.

Integrations are stubbed behind env vars so nothing loads until IDs are configured:
- `VITE_GA_MEASUREMENT_ID`
- `VITE_META_PIXEL_ID`
- `VITE_LINKEDIN_PARTNER_ID`

## 4. App data caching (TanStack Query)

In `src/router.tsx` `getRouter` per-request `QueryClient`:
- `defaultOptions.queries`: `staleTime: 60_000`, `gcTime: 5 * 60_000`, `refetchOnWindowFocus: false`, `retry: 1`.
- Add `@tanstack/query-sync-storage-persister` + `persistQueryClient` on the client only, gated on `preferences` consent, key `bgc-rq-cache-v1`, max age 24h. This is the "site feels instant on repeat visits" piece.

## 5. Static asset & SSR caching

- Add long-lived `Cache-Control: public, max-age=31536000, immutable` for hashed Vite assets via the worker's response headers (in `src/server.ts` after the normalizer).
- HTML responses: `Cache-Control: public, max-age=0, must-revalidate` so updates are picked up immediately.
- Add a tiny service worker (`public/sw.js`) using a stale-while-revalidate strategy for `/_build/assets/*` and fonts. Registered only after `preferences` consent.

## 6. Footer / legal touch-ups

- Footer already lists `/cookies`, `/privacy`, `/terms` and the company block. Add a "Manage cookies" link next to them that calls `openPreferences()`.
- `/cookies` page gets a generated table of all cookies we set, sourced from a single `src/lib/consent/registry.ts` (id, purpose, category, duration, provider) so legal copy and runtime gating never drift apart.

## 7. Files

New:
- `src/lib/consent/registry.ts` — single source of truth for cookies/scripts.
- `src/lib/consent/loadScripts.ts` — Consent Mode v2 + lazy tag injection.
- `src/lib/consent/cookie.ts` — read/write first-party `bgc_consent` cookie.
- `src/lib/cache/persistQueryClient.ts` — RQ persistence wiring.
- `public/sw.js` + `src/lib/cache/registerSW.ts`.

Edited:
- `src/components/cookies/CookieConsentProvider.tsx` — v2 schema, cookie mirror, expiry check, `preferences` category.
- `src/components/cookies/CookieBanner.tsx` — equal-weight three buttons, mobile sheet.
- `src/components/cookies/CookiePreferencesDialog.tsx` — add `preferences` toggle + per-category cookie tables.
- `src/components/marketing/Footer.tsx` — "Manage cookies" link.
- `src/router.tsx` — Query defaults.
- `src/routes/__root.tsx` — boot Consent Mode defaults + script loader + SW register.
- `src/routes/cookies.tsx` — render registry table.
- `src/server.ts` — asset/HTML cache headers.

## Out of scope (ask before adding)

- Actually wiring real GA4 / Meta / LinkedIn IDs (need the IDs from you).
- Server-side consent log in the database for audit trail.
- Geo-gating (only show banner in EU/UK).

Confirm and I'll implement.
