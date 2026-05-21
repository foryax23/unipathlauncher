## UniPath v2 — Auth, Interactive Onboarding, Mobile-First Polish

### 1. Typography refresh (2026 / Apple feel)
Swap `Instrument Serif` + `Work Sans` for a modern Apple-adjacent stack:
- **Display**: `Instrument Serif` → **`Geist` (or `Inter Display`)** for headings, tightened tracking (`-0.04em`), large optical sizing.
- **Body**: `Work Sans` → **`Geist` / `Inter`** with `font-feature-settings: "cv11","ss01","ss03"` for SF-like glyphs.
- **Mono accents**: `Geist Mono` for stats / form helpers.
- Keep gold + navy palette but soften with frosted-glass surfaces (`backdrop-blur`, `oklch` translucency) — very visionOS / iOS 18.
- Add fluid type scale via `clamp()` and tighter line-heights on headings.

### 2. Full course indexing
Re-parse the PDF and expand `src/components/marketing/data/courses.ts` from 8 categories → **all programmes** with: title, level (Foundation/UG/PG/Top-up), partner institution, intake months, mode, city. Add a searchable `/courses` route with filters (subject, level, city, intake). Power the LeadForm subject dropdown from the same source of truth.

### 3. Authentication
- Email/password **+ Google** (via Lovable broker `lovable.auth.signInWithOAuth("google")`), enabled with `configure_social_auth`.
- Auto-confirm OFF (email verification required).
- New routes:
  - `/login` (sign-in + Google)
  - `/signup` (kicks into onboarding)
  - `/reset-password`
  - `_authenticated/` layout for gated pages
- `profiles` table (id → auth.users, name, phone, city, country, lat, lng, subject, study_level, start_year, reason, avatar_url, onboarding_complete) with RLS (user sees/edits own). Trigger to auto-create profile on signup.

### 4. Interactive onboarding (mobile-first)
Route: `/_authenticated/onboarding` — full-screen, swipeable, step-indicator at top, large tap targets (≥56px), thumb-zone CTAs at bottom, haptic-style micro animations.

Steps:
1. **Welcome** — name + animated greeting.
2. **Study level** — visual card picker (Foundation / Undergrad / Postgrad / Top-up) with iconography.
3. **Subject interest** — chip grid sourced from indexed courses, multi-select with spring animation.
4. **Start date** — horizontal scroll month picker (May 2026 / Sept 2026 / Jan 2027).
5. **Location (interactive)** — this is the centerpiece:
   - Browser geolocation prompt → reverse geocode (free Nominatim/OSM API via server fn, cached).
   - Fallback: searchable UK city autocomplete (server fn against a static UK cities list).
   - **Interactive map preview** using **Leaflet + OpenStreetMap tiles** (no API key, free, lightweight ~40KB) showing the user's pin + nearest 3 partner campuses with distance.
6. **Contact** — phone (UK format validation) + GDPR consent.
7. **Summary** — animated review card → "Find my courses" CTA → personalised `/dashboard` with matched programmes.

Mobile optimisations: `vh` safe-area insets, momentum scroll, prefers-reduced-motion respect, single-column always, sticky progress bar, swipe-back gesture, optimistic step transitions.

### 5. Personalised dashboard (`_authenticated/dashboard`)
After onboarding: matched courses ranked by subject + location proximity, "Talk to an advisor" CTA, profile completeness ring, ability to edit preferences.

### 6. Admin upgrades
- `/admin` already exists; add: onboarding-completion funnel stats, source breakdown, map of lead locations (Leaflet cluster).

### 7. New files / changes
- DB migration: `profiles` table + trigger + RLS; extend `leads` link to `user_id` (nullable).
- `supabase--configure_social_auth` → google.
- `bun add leaflet react-leaflet` (Worker-safe, no native deps).
- Add Geist via Google Fonts / Fontsource.
- Routes: `login.tsx`, `signup.tsx`, `reset-password.tsx`, `_authenticated.tsx`, `_authenticated/onboarding.tsx`, `_authenticated/dashboard.tsx`, `courses.tsx`.
- Components: `onboarding/Step*.tsx`, `onboarding/ProgressBar.tsx`, `onboarding/LocationStep.tsx` (with Leaflet), `auth/AuthCard.tsx`, `auth/GoogleButton.tsx`.
- Server fns: `geocode.functions.ts` (reverse + forward via Nominatim with UA header + caching), `profile.functions.ts` (get/update), `match-courses.functions.ts`.
- Tokens: rework `src/styles.css` with Geist fonts, frosted-glass surface tokens, fluid type, larger radii (`--radius: 1.25rem`).

### Technical notes
- Lovable Cloud already enabled.
- Email/password + Google (Lovable broker). Disable other providers we don't use.
- All geocoding lives in server fns (avoids CORS, lets us add UA header / cache).
- Leaflet is SSR-unsafe → render inside a `<ClientOnly>` wrapper / dynamic import guard.
- Auth-gated server fns rely on existing `requireSupabaseAuth` + `attachSupabaseAuth` (already wired).

### Open question
Existing `LeadForm` on the landing page — keep it as a **quick lead capture** (no account needed, writes to `leads`), and the onboarding becomes the deeper authenticated flow? Or replace landing form with a "Get started" button that routes straight to signup → onboarding? Default if you don't say: **keep both** (quick form for cold visitors, signup+onboarding for committed ones).
