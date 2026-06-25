# Phase 1 — Foundation

Goal: turn the app from "form + marketing site" into a real consulting platform. Everything here is schema, server-side plumbing, and protection. UI work for the new tables comes in Phase 2 (small admin/student surfaces will be added now only where they're required to USE the new data).

Sprint 1 already shipped: `shortlists`, `admin_audit`, `leads.status/assigned_to/internal_notes/utm/ip/ua`, honeypot + 24h dedupe on `submitLead`, `/dashboard/shortlist`, `updateLead` + audit log.

## What this phase delivers

### 1. Database — the missing domain
New tables (all with GRANTs + RLS + indexes + `updated_at` triggers):

- `universities` — id, slug, name, city, region, country, ucas_code, is_partner, logo_url, ranking, website
- `courses` — id, slug, university_id, name, level, subject, duration_months, fee_gbp, intake_months[], entry_requirements jsonb, ucas_points, is_active
- `course_intakes` — course_id, intake_date, deadline_date, seats_left
- `applications` — id, user_id, course_id, intake_id, status enum (`draft|submitted|interview|offer|accepted|rejected|withdrawn|enrolled`), submitted_at, decision_at, decision, adviser_id, notes
- `application_events` — application_id, type, payload jsonb, actor_id (timeline)
- `documents` — id, user_id, type enum (`passport|transcript|english_test|personal_statement|reference|other`), storage_path, original_name, size_bytes, verified_by, verified_at
- `threads` — id, student_id, adviser_id, subject, last_message_at
- `messages` — id, thread_id, sender_id, body, read_at
- `bookings` — id, student_id, adviser_id, starts_at, ends_at, channel, status, notes
- Extend `profiles`: nationality, date_of_birth, predicted_grades jsonb, achieved_grades jsonb, english_test jsonb (`type/score/date`), visa_status, marketing_consent_email/sms
- Storage bucket `student-documents` (private, owner+admin RLS)
- Admin `UPDATE` policy on `profiles` (gated by `has_role`)
- Extend `app_role` enum with `adviser`

RLS pattern: student owns their rows by `auth.uid()`; admins/advisers via `has_role`. Adviser sees only their assigned students (`applications.adviser_id`, `threads.adviser_id`, `bookings.adviser_id`).

### 2. Seed the catalogue
One-time migration seeds `universities` + `courses` from current `src/components/marketing/data/courses.ts` so the dashboard match feature stops being fiction. Marketing pages keep reading the TS file until Phase 2 swaps them to DB-backed routes.

### 3. Abuse protection on `submitLead`
- **Cloudflare Turnstile** widget on the lead form + server-side token verify in handler. Requires `TURNSTILE_SITE_KEY` (public, in `.env`) + `TURNSTILE_SECRET_KEY` (server secret — will be requested via `add_secret`).
- **Per-IP rate limit** — `lead_rate_limits(ip, window_start, count)` table checked in handler (5/min/IP, sliding window). Cheaper than Cloudflare WAF and stays inside the app.
- Honeypot + 24h email dedupe already shipped.

### 4. Transactional email (Resend connector)
- Connect Resend via the standard connector (prompted in chat).
- `from`: `Bridge Gateway <hello@bridgegatewayconsulting.com>` (uses verified domain; falls back to `onboarding@resend.dev` until DNS is in).
- Templates (inline HTML in `src/lib/email/templates.ts`):
  - `lead-received` → student, fired from `submitLead`.
  - `adviser-assigned` → student, fired from `updateLead` when `assigned_to` changes.
  - `application-status-changed` → student, fired from `updateApplication`.
  - `new-lead-assigned` → adviser, fired from `updateLead`.
- Wrapper `src/lib/email/send.server.ts` calls Resend through the Lovable connector gateway; idempotency-key per event id.

### 5. Audit log everywhere
Audit middleware helper `withAudit(action)` used on every admin/adviser-only server fn — wraps the handler and writes to `admin_audit` with actor, target, payload, IP. Replaces the inline `logAudit` calls.

### 6. Server functions added this phase
`src/lib/` (one file per domain, all `.functions.ts`):
- `universities.functions.ts` — list/get
- `courses.functions.ts` — list (paginated, server-side filter), getBySlug
- `applications.functions.ts` — listMine, create (from shortlist), get, addEvent; admin: list, assign, updateStatus
- `documents.functions.ts` — listMine, getUploadUrl, confirm, delete; admin: verify
- `threads.functions.ts` + `messages.functions.ts` — listMyThreads, getThread, postMessage, markRead
- `bookings.functions.ts` — listMine, create, cancel; admin: listAll
- `profiles.functions.ts` — extend `updateMyProfile` with new fields; add admin `updateProfile`

All admin fns go through new `assertAdmin(context.userId)` shared helper (`src/lib/auth/assert.server.ts`) — refactor `listLeads` to use it.

## Out of scope for Phase 1 (these are Phase 2/3)
- UI for applications wizard, documents vault, messaging, bookings → Phase 2
- Admin Kanban, adviser inbox, student profile workspace → Phase 3
- `/courses/$slug`, `/universities/$slug` SSR pages + dynamic sitemap → Phase 2
- Onboarding per-step autosave → Phase 2
- Analytics, GDPR self-serve, PWA, i18n, Sentry → Phase 4

## Execution order (single chat turn each)

1. **Migration 1**: universities, courses, course_intakes, applications, application_events, documents, threads, messages, bookings, `lead_rate_limits`, profile column additions, `adviser` role, admin `UPDATE` policy on profiles, storage bucket, all GRANTs + RLS + indexes.
2. **Migration 2**: seed universities + courses from current TS data.
3. Server fns + shared `assertAdmin` helper + `withAudit` middleware.
4. Resend connector + email send wrapper + 4 templates + wire into `submitLead` / `updateLead`.
5. Turnstile site key in `.env` + secret via `add_secret` + widget on `LeadForm` + handler verify + rate limit check.

## What I need from you before kicking off step 4 & 5

- **Resend**: I'll trigger the connector flow — you click connect.
- **Turnstile**: site key + secret from your Cloudflare dashboard (Cloudflare → Turnstile → add site for `bridgegatewayconsulting.com`). Paste the secret when prompted.

Everything else needs no input — I can start on step 1 immediately on approval.
