### Pre-auth onboarding → auto-create account → dashboard

Today users must sign up BEFORE the 6-step onboarding form. We will flip this: onboarding runs publicly (no login), state is saved on-device, and the account is created automatically in the last step. Users land in the dashboard immediately with a verify-email reminder.

#### Flow change

```text
BEFORE: Hero CTA → /signup → /onboarding (6 steps) → /dashboard
AFTER:  Hero CTA → /onboarding (6 steps + account step) → /dashboard
```

#### What we will build

1. **Make onboarding public**
   - Create a new top-level public route: `src/routes/onboarding.tsx` (no auth gate).
   - Delete `src/routes/_authenticated/onboarding.tsx` (its protected version). Edit-preferences from the dashboard will reuse the same public route — it stays usable for signed-in users too.

2. **On-device persistence (cookies-like)**
   - Persist the entire onboarding state in `localStorage` under the key `unipath:onboarding` (JSON blob with all fields).
   - Auto-save on every field change. Auto-restore on mount, so refreshing, closing the tab, or returning later picks up exactly where the user left off — on the same device.
   - Also remember the last visited step (`unipath:onboarding:step`).
   - Already signed-in users who return: prefill from their saved profile and skip to the dashboard if onboarding is already complete.

3. **Add a final "Create your account" step**
   - 7th step at the end of the wizard: email + password fields and a "Continue with Google" button.
   - On Google: opens the Lovable OAuth broker, with `redirect_uri` back to `/onboarding`. After the redirect the wizard auto-detects the session, saves the profile, clears localStorage, and navigates to `/dashboard`.
   - On email/password: calls `supabase.auth.signUp({ email, password })`. With email auto-confirm enabled, a session is returned immediately → save profile → clear local state → `/dashboard`.
   - If the email is already registered, we transparently fall back to `signInWithPassword` (so a returning user who re-onboards just gets logged in).

4. **Enable email auto-confirm**
   - Use `supabase--configure_auth` with `auto_confirm_email: true` so the new account becomes an active session instantly. This is what unlocks "straight to dashboard".
   - We keep `password_hibp_enabled: true` for safety.

5. **"Confirm your email" reminder on the dashboard**
   - Add a new profile column `email_verified_at timestamptz` (separate from Supabase's `email_confirmed_at` so we can model an explicit user click even with auto-confirm on).
   - On the dashboard, show a soft yellow banner: "Verify your email to secure your account" with a "Send verification link" button.
   - The button calls `supabase.auth.resend({ type: 'signup', email })` which sends an auth confirmation email (we already have auth email templates infra). When the user clicks the link, a public `/verify-email` route reads the recovery hash, marks `email_verified_at = now()`, and redirects to the dashboard.
   - Banner hides once `email_verified_at` is set OR once the user dismisses it (dismissal stored in `localStorage`).

6. **Hero CTA wiring**
   - `HeroMatchCard` → `navigate({ to: "/onboarding" })` instead of `/signup`. The selected study level is already passed via `sessionStorage` and the onboarding wizard already reads it — we just move the key to `localStorage` so it survives a full browser restart.

7. **Existing `/signup` and `/login` stay**
   - `/login` keeps working for returning users (lands on `/dashboard`).
   - `/signup` becomes a thin wrapper that redirects to `/onboarding` (so any external links still work).

#### Technical details

- **New file:** `src/routes/onboarding.tsx` (public). Built from the existing protected onboarding, plus a 7th "account" step and a `useEffect` localStorage sync.
- **Deleted:** `src/routes/_authenticated/onboarding.tsx`.
- **Edited:**
  - `src/components/marketing/HeroMatchCard.tsx` — redirect target.
  - `src/routes/signup.tsx` — redirect to `/onboarding`.
  - `src/routes/_authenticated/dashboard.tsx` — add VerifyEmailBanner, remove the "redirect to onboarding if incomplete" loop (incomplete profiles only happen for accounts created via `/login` without finishing onboarding; we'll handle by redirecting unfinished users to `/onboarding`, which now works without auth too).
- **New file:** `src/components/dashboard/VerifyEmailBanner.tsx`.
- **New file:** `src/routes/verify-email.tsx` — public route that marks `email_verified_at` and bounces to dashboard.
- **DB migration:** add `email_verified_at timestamptz` column to `profiles`. RLS already covers user-scoped reads/updates.
- **Server fn:** add `markEmailVerified()` in `src/lib/profile.functions.ts` (uses `requireSupabaseAuth`, sets `email_verified_at = now()`).
- **Auth config:** call `supabase--configure_auth` with `auto_confirm_email: true`, `password_hibp_enabled: true`, `disable_signup: false`, `external_anonymous_users_enabled: false`.

#### Edge cases handled

- Returning visitor on same device: onboarding fields restored from localStorage.
- Returning visitor on a new device: must log in; profile data already in the DB is loaded by the wizard / dashboard.
- User abandons mid-wizard: state stays in localStorage; next visit resumes at the same step.
- User completes onboarding without registering, then closes the tab: data is safe in localStorage and replays on next visit.
- Google sign-in path: after OAuth redirect, the wizard detects the session, persists the profile, and forwards to the dashboard.
- Duplicate email at the account step: transparent fallback to sign-in.

#### Out of scope

- Real email verification with a dedicated link is included via `supabase.auth.resend`. We do NOT change the auth email templates beyond what's already scaffolded.
- No password strength meter UI changes.
- No changes to admin or courses routes.