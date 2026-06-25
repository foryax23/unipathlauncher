
# Phase 2 — Student Workspace + Public Catalogue

Phase 1 shipped the schema and server-functions. Phase 2 makes them visible and usable: students get a real workspace, public visitors get SSR-indexable course/university pages, and the marketing site stops lying about a "match" feature that has no backing data.

## What ships

### 1. Public catalogue (SSR + SEO)
- `/courses/$slug` — server-loaded `getCourseBySlug`, full course detail, intakes list, "Save to shortlist", "Start application" CTA (auth-gated). Per-route `head()` with title/description/og from course + university. JSON-LD `Course` schema.
- `/universities/$slug` — `getUniversityBySlug`, hero with logo + city + ranking, partner badge, list of that uni's courses with shortlist buttons. JSON-LD `EducationalOrganization`.
- `/courses` page swapped from static TS list to `listCourses` (paginated, filterable by level/subject/search). URL-driven filters via `validateSearch` + `loaderDeps`.
- Dynamic `sitemap.xml` — extend the existing sitemap route to include every active course + every university slug.

### 2. Student workspace (under `/_authenticated/dashboard/*`)
All routes use the `_authenticated` gate already in the project.

- `/dashboard/applications` — list of my applications, status pill, university logo, course, last-updated. Empty state CTAs to `/courses`.
- `/dashboard/applications/$id` — detail view: course header, status timeline from `application_events`, notes editor (autosave), withdraw button. Read-only fields managed by adviser.
- `/dashboard/documents` — vault. Drag-drop upload (calls `requestUploadUrl` → PUT to signed URL → `confirmDocument`). Type picker (passport / transcript / english_test / personal_statement / reference / other), file list with size, verified badge, signed-download, delete.
- `/dashboard/messages` — split layout: thread list left, conversation right. Realtime via Supabase channel subscription on `messages` filtered by `thread_id`. "New message" composer creates thread + initial message via `startThread`. Read-receipts via `markThreadRead` on focus.
- `/dashboard/bookings` — upcoming/past tabs. "Request a call" dialog with date/time + channel (video/phone/in-person) + notes. Cancel button on requested/confirmed bookings.
- Dashboard home gains tiles: Applications count, Unread messages, Documents missing, Next booking.

### 3. Start-application flow
- "Start application" button on `/courses/$slug` and on the shortlist row.
- Calls `createApplication({ course_id, intake_id? })`, then `router.navigate({ to: "/dashboard/applications/$id" })`.
- If unauthenticated, redirect to `/login?redirect=/courses/<slug>?action=apply`; on return, auto-trigger the apply mutation.

### 4. Onboarding per-step autosave
- `onboarding.tsx` already collects 6 steps in local state. Add `useEffect` per step calling `updateMyProfile` with the partial. Debounced 600ms. Shows a small "Saved" pill in the corner. Survives refresh — initial values hydrated from `getMyProfile`.

### 5. Plumbing
- `useRealtimeMessages(threadId)` hook — Supabase `channel().on("postgres_changes", …)` subscription.
- `useUpload()` hook — fetch signed URL, PUT file, confirm; exposes progress.
- `StatusPill` shared component for application status (color-coded against design tokens, no hardcoded hex).
- All new server-fn calls use the canonical TanStack Query loader pattern (`ensureQueryData` + `useSuspenseQuery`).

## Out of scope (Phase 3)
- Admin Kanban board, adviser inbox, student profile workspace for staff
- Application wizard (multi-step submission form with document attach + review)
- Booking calendar with adviser availability windows
- Notifications center / in-app bell

## Technical notes
- Public catalogue routes use the existing publishable-key publicClient pattern — no auth bearer required, RLS allows `anon` SELECT on `universities` / `courses` (already in Phase 1 migration).
- All `_authenticated/dashboard/*` loaders are safe to call protected server fns — the managed gate runs `beforeLoad` first.
- Realtime requires the `messages` table in the `supabase_realtime` publication — one-line migration to add it.
- No new external connectors needed. Resend/Turnstile from Phase 1 remain optional.

## Execution order (one chat turn each)
1. Tiny migration: add `messages` to realtime publication.
2. Public catalogue: `/courses` rewrite + `/courses/$slug` + `/universities/$slug` + sitemap extension.
3. Student applications routes (list + detail) + Start-application flow.
4. Documents vault route + `useUpload` hook.
5. Messages route + realtime hook.
6. Bookings route + request dialog.
7. Onboarding autosave + dashboard tiles.
