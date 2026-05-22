## What's actually broken

Your URL right now is:

```
/login?redirect=%2Fadmin%3F__lovable_sha%3D591d1c36
```

So `redirect` decodes to `/admin?__lovable_sha=591d1c36` (a path **with a query string**). That value is then used in two places inside `src/components/auth/AuthCard.tsx`:

1. As the OAuth `redirect_uri`: `window.location.origin + dest` → `https://.../admin?__lovable_sha=591d1c36`. Google/Lovable broker doesn't treat that as a clean registered redirect target, so the round-trip can come back without setting a session, or come back to a URL the app then can't navigate to.
2. As the TanStack `navigate({ to: dest })` target. TanStack Router's `to` expects a **route id** (`/admin`), not a path with `?...`. Passing `"/admin?__lovable_sha=…"` silently doesn't match the `/admin` route → no navigation happens → user stays on `/login` and "nothing happens", exactly as reported.

The admin role itself is fine — your user `47e9a725…` is in `user_roles` with `role=admin`, and the auth logs show Google sign-in returning `200`. So the auth succeeds; only the post-auth redirect is broken.

A secondary issue: `src/routes/admin.tsx` only checks `supabase.auth.getUser()` in `beforeLoad` (presence of a session). It does not enforce the admin role server-side at the route boundary — the admin check happens client-side after render. That means non-admins still get the admin shell flash, and any RLS hiccup leaves them stuck on "Verifying access…".

## Plan

### 1. Sanitize the `redirect` param in `AuthCard` (src/components/auth/AuthCard.tsx)
- Parse `search.redirect` into `{ pathname, search }` using `URL` (with a dummy origin) so we cleanly separate path from query.
- Allow-list internal pathnames only (`/dashboard`, `/admin`, `/onboarding`). Anything else → fallback to `/dashboard`.
- Strip ephemeral params like `__lovable_sha` from the preserved search.
- Use the **clean pathname** for both:
  - `redirect_uri` (so OAuth lands on a clean URL).
  - `navigate({ to: pathname, search: <preserved> })` (so TanStack's type-safe matcher actually matches the route).

### 2. Make the admin route bounce non-admins immediately (src/routes/admin.tsx)
- In `beforeLoad`, after the `getUser()` check, call `getMyAdminStatus` server fn. If `!isAdmin`, `throw redirect({ to: "/dashboard" })`.
- Drop the inline "Verifying access…" client-side gate (it becomes redundant) and render `AdminWorkspace` directly. Keeps RLS as backstop.

### 3. Wire `onAuthStateChange` at the root (src/routes/__root.tsx)
- Add a single root-level listener that calls `router.invalidate()` + `queryClient.invalidateQueries()` on `SIGNED_IN` / `SIGNED_OUT` / `TOKEN_REFRESHED`.
- This is the canonical TanStack + Supabase pattern and ensures the admin route's `beforeLoad` re-runs the moment the Google callback hydrates the session, instead of relying on a manual `navigate` call from AuthCard.

### 4. Smoke test
- Visit `/admin` while signed out → bounced to `/login?redirect=%2Fadmin`.
- Sign in with Google → land on `/admin` with the adviser inbox visible.
- Sign in with a non-admin Google account → bounced to `/dashboard`, no admin shell flash.
- Visit `/login?redirect=/admin?__lovable_sha=abc` → sha is stripped, still lands on `/admin`.

## Files touched
- `src/components/auth/AuthCard.tsx` — sanitize `dest`, navigate with `{ to, search }`.
- `src/routes/admin.tsx` — server-side admin gate in `beforeLoad`; drop client `isAdmin` spinner.
- `src/routes/__root.tsx` — `onAuthStateChange` → `router.invalidate()` + query invalidation.

No DB changes. No new env vars.
