## Goals

1. Fix the Google sign-in bounce: after a successful Google login the user briefly sees the dashboard, then ends up back on `/login`.
2. Redesign the dashboard so it matches the warm, glassy, onboarding aesthetic (hero-warm gradient, glass cards, gold accents, Caveat/Instrument Serif type, photo-rich tone).

---

## 1. Fix the Google login redirect loop

### Root cause

After `lovable.auth.signInWithOAuth("google", ...)` the browser is redirected to Google and back to `redirect_uri = origin + "/dashboard"`. The Supabase client needs a tick to finish processing the returned session before `supabase.auth.getUser()` resolves with the user.

Today:
- `_authenticated.tsx` `beforeLoad` calls `supabase.auth.getUser()` immediately. On the very first paint after the OAuth redirect this can resolve to `null`, so the guard `throw redirect({ to: "/login" })`.
- `AuthCard` (the `/login` page) does **not** react to a session arriving afterwards, so the user is stuck on the login screen even though they are signed in.
- The "1 second of dashboard" the user sees is the brief render where the cached session is present, before the guard re-runs as the route invalidates and finds `getUser()` still racing.

### Fix

**A. Make `/login` self-correct when a session is already (or becomes) available.**

In `src/components/auth/AuthCard.tsx`, add a `useEffect` that:
1. Calls `supabase.auth.getUser()` on mount. If a user is returned, `navigate({ to: dest, replace: true })`.
2. Subscribes to `supabase.auth.onAuthStateChange`; on `SIGNED_IN` or `TOKEN_REFRESHED`, navigate to `dest`.
3. Cleans up the subscription on unmount.

This guarantees that after the OAuth round-trip, the moment the Supabase client finishes hydrating the session, the user is bounced from `/login` to `/dashboard` (or wherever `?redirect=` points).

**B. Make the `_authenticated` guard tolerant of the OAuth landing race.**

In `src/routes/_authenticated.tsx` `beforeLoad`:
1. First call `supabase.auth.getSession()` (storage/URL-hydration read, no network). If it returns a session, allow through.
2. Otherwise fall back to `supabase.auth.getUser()`. If still no user, redirect to `/login?redirect=...`.

`getSession()` resolves after `detectSessionInUrl` has processed the hash returned by the lovable broker, so we no longer redirect away during the brief window where the session is being written.

**C. No changes to** `src/integrations/lovable/index.ts`, `src/integrations/supabase/client.ts`, or `src/start.ts` — those are generated/managed.

### Why this is enough

- The root `onAuthStateChange` listener already calls `router.invalidate()` on `SIGNED_IN`, which combined with (A) makes the login → dashboard transition deterministic.
- (B) prevents the initial flash-then-bounce when the user lands directly on `/dashboard` after the OAuth callback.

---

## 2. Redesign the dashboard to match onboarding

Target: `src/routes/_authenticated/dashboard.tsx`. Keep all data logic (`getMyProfile`, `rankMatches`, sign-out, verify-email banner) unchanged. Rework only the presentation layer so it feels like a continuation of the onboarding flow.

### Visual system (reused from onboarding)

- Background: `hero-warm` gradient on the full page (same class onboarding uses).
- Surfaces: `glass-strong rounded-3xl` cards with soft inner border, gold accent (`text-gold`, `bg-gold/15`).
- Typography: page title in `font-display` (Instrument Serif) + a `font-chalk` greeting accent for the user's first name, matching step 1 of onboarding.
- Spacing: generous, mobile-first, `safe-top` / `safe-bottom`, max-width 5xl.

### Sections

1. **Top bar**: keep current logo + sign-out, switch to translucent `glass` with bottom hairline.
2. **Verify-email banner**: keep as-is, just constrain to the new container.
3. **Hero card** (replaces the current aurora block):
   - Small uppercase eyebrow: "Your personalised shortlist".
   - Large display: `Hi <FirstName>` in Instrument Serif, with the first name rendered in `font-chalk text-gold/90` (same trick used in onboarding step 1) and a subtle SVG scribble underline beneath it.
   - One-line subtitle summarising subject + level + city.
   - Two pill buttons: "Edit preferences" (ghost) and "Browse full catalogue" (gold primary).
4. **Profile snapshot strip**: three small glass chips under the hero — Subject, Level, Nearest city — each with a small lucide icon in gold. Pure presentational, sourced from the existing `profile` object. Helps the page feel personal without new data.
5. **Top matches**:
   - Section header in `font-display` with a small "Top matches" eyebrow.
   - Cards become `glass rounded-3xl` with:
     - Gold pill badge `xx% match` top-right.
     - Title in `font-display`.
     - Meta row with `MapPin`, `GraduationCap`, modes, distance — same data, restyled with `text-muted-foreground` and gold dividers.
     - Subtle hover lift (`hover:-translate-y-0.5 hover:shadow-xl`).
6. **Adviser card**: keep the existing "Talk to an adviser" block but restyle to `glass-strong` with a gold `Sparkles` icon plate and a "We'll call within 24 hours" line. Add a secondary subtle "Reply to your adviser" affordance (non-functional link to `mailto:` from config or just informational text — no new backend).

### Out of scope

- No changes to data shape, server functions, RLS, or routes other than `_authenticated.tsx`, `AuthCard.tsx`, and `dashboard.tsx`.
- No new images.
- No changes to onboarding.

---

## Files touched

- `src/components/auth/AuthCard.tsx` — add session-listener `useEffect` that redirects when authenticated.
- `src/routes/_authenticated.tsx` — guard uses `getSession()` first, `getUser()` as fallback.
- `src/routes/_authenticated/dashboard.tsx` — full visual redesign (presentation only).
