## Plan: make login + onboarding work reliably, then improve the next phase

### 1. Fix the actual auth/onboarding breakage
- Add an auth-ready gate so protected pages wait for the browser session to fully restore before calling protected server functions.
- Update `/login` and `/signup` to respect redirect-back paths and send users to `/onboarding` only after a valid session exists.
- Make Google sign-in use the correct callback flow and preserve the intended onboarding destination.
- Replace fragile onboarding profile updates with an upsert-style server function so onboarding still works even if the profile row was not created automatically.
- Improve visible error messages for common auth states, especially “email not confirmed”.

### 2. Repair the onboarding flow
- Add loading and error states before fetching the profile, instead of rendering steps while auth/server data is not ready.
- Prefill onboarding from saved hero choices (`sessionStorage`) and existing profile data.
- Make the location step resilient: search errors won’t block progress, device geolocation fallback stays optional, and selected location remains visible.
- Ensure finishing onboarding saves all required fields, marks `onboarding_complete`, and routes to `/dashboard`.

### 3. Improve mobile-first onboarding UX
- Tighten the current 6-step flow for phone screens: safer sticky CTA spacing, larger tap targets, better vertical rhythm, and less risk of content being hidden behind the fixed button.
- Add a review/final step feel without adding friction: users see their selected study level, subject, start intake, city, and phone before saving.
- Keep the existing Apple/2026 Geist aesthetic and warm UniEnrol-inspired visual system.

### 4. Continue the course indexing phase
- Normalize course levels so onboarding filters match all programmes, including HNC/HND/MBA/Top-up routes.
- Add stronger metadata to programme cards where already available in the current course index: provider, partner, location, mode, duration, and match reasons.
- Make the dashboard match output clearer: why each course matched, nearest campus, and next action.

### 5. Validation after implementation
- Test login page rendering on mobile.
- Test protected route redirect behavior.
- Test onboarding profile fetch/save path from authenticated state.
- Check console/network for 401s or failed server function calls.

## Technical notes
- No new database tables are needed.
- A small database migration may be needed only if the existing profile trigger is missing in the live backend, because current schema context shows the function exists but reports no active triggers.
- Existing Lovable Cloud auth and server functions will be kept; no Edge Functions will be added.