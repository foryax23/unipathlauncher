# Functionality Audit & Upgrade Plan — Bridge Gateway

Scope: everything except visual design. Findings come from reading the routes, server functions, schema, and data layer. Severity: **P0 blocker / P1 high / P2 polish**.

---

## 1. What the app does today

- Marketing homepage + courses/about/legal pages
- 3-step lead form (public insert into `leads`)
- Email/password + Google auth, email verification, password reset
- 6-step onboarding writing to `profiles`
- Student dashboard showing matches ranked from **static TS data** (`PROGRAMMES`, `COURSES`, `CAMPUSES`)
- Admin workspace: lists students + leads, sends password resets

DB: `profiles`, `leads`, `user_roles` only. **No tables for courses, universities, applications, documents, messages, bookings, notes, or audit.**

---

## 2. Findings (functional, ranked)

### P0 — must fix
1. **Courses & universities are hardcoded TS files.** No CMS, no per-course SEO route, no real search at scale, no admin editing, no live offer/deadline data. The whole "match" feature is fiction over static arrays.
2. **No application pipeline.** A lead-gen + consulting app with no `applications` table, no status (interested → applied → offer → accepted → enrolled), no deadlines, no per-student timeline. This is the actual product.
3. **No saved shortlist / favourites.** Student sees "matches" but can't save, compare, or revisit them.
4. **No documents vault.** Transcripts, passport, English test, personal statement — currently nowhere to live. Advisers work in email instead of the app.
5. **No adviser ↔ student messaging or notes.** Admin can view a student but cannot record a call, leave a note, or message them. Every consultancy needs this.
6. **Lead form has zero abuse protection.** Public unauthenticated `submitLead` server fn — no rate limit, no honeypot, no Turnstile/captcha, no dedupe. One bot run = thousands of junk rows + cost.
7. **No transactional emails.** No "we received your enquiry", no adviser-assignment, no follow-up cadence. Conversion bleeds out silently.

### P1 — high impact
8. **Admin doesn't scale.** `listStudents` loads up to 500 profiles + calls `auth.admin.listUsers({ perPage: 1000 })` on every keystroke-driven refresh. No pagination, no server-side email search, N+1-style email join in memory.
9. **No lead lifecycle in admin.** Leads have no `status`, `assigned_to`, `notes`, `next_action_at`, `outcome`. No export to CSV. No bulk actions.
10. **No audit log.** Admin can reset passwords, view PII, (eventually) edit profiles — none of it is recorded. Compliance + safety risk.
11. **Data-loading pattern is wrong everywhere.** Dashboard, admin, profile reads use `useEffect` + `useState` instead of the stack's canonical TanStack Query + loader pattern. No SSR data, no cache, no Suspense, no skeletons, refetch storms.
12. **Onboarding is a 712-line monolith with no autosave per step.** Drop-off mid-flow = total loss. Should persist each step server-side and resume.
13. **Profile schema is too thin to be useful.** No nationality, date of birth, predicted/achieved grades, qualifications history, English test (IELTS/TOEFL), visa status, agent/referrer, marketing consent granularity.
14. **No appointment booking.** Consultancies live on calls. Today: zero in-app way to book one. Should integrate Cal.com or roll a `bookings` table.
15. **No analytics / event tracking.** No funnel (visit → onboarding step n → submit → application → enrolment), no drop-off attribution. Impossible to improve what you don't measure.
16. **No notifications.** In-app inbox + email digest for "new offer", "deadline in 7 days", "adviser replied".
17. **Search/filter on `/courses` is purely client-side over a static array** — fine now, breaks the moment courses move to DB. Needs server-paginated, indexed search.
18. **SEO holes for the core product.** No `/courses/$slug`, no `/universities/$slug`, no `/scholarships`, no city/subject landing pages, sitemap doesn't include any of these.
19. **Profiles `UPDATE` is user-only.** Advisers can't correct a student's data. Need an admin update path + RLS via `has_role`.
20. **OAuth signup creates auth.users but only a thin profile.** No nudge into onboarding from `/dashboard` beyond a redirect — no progress recovery, no "skip for now".

### P2 — polish & growth
21. **No referral / share program.** Easy growth lever for the audience.
22. **No scholarship matcher, fees calculator, visa eligibility checker.** Each is a high-intent SEO + lead magnet.
23. **No i18n** despite explicit international-student targeting.
24. **No A/B testing infra** for hero copy / CTA / form length.
25. **No GDPR self-serve** (data export + delete) — only manual.
26. **No PWA manifest / installable / push.**
27. **No observability beyond `error-capture.ts`** — wire Sentry or equivalent.
28. **No soft-delete** on leads or profiles; admin "delete" is permanent.

---

## 3. Proposed roadmap (4 phases)

Each phase is independently shippable. Phase 1 is the foundation; later phases assume it.

### Phase 1 — Foundation (P0 schema + protection)
Goal: turn the app from "form on a website" into a real consulting platform.

**Database (new tables, all with RLS + GRANTs):**
- `universities` (id, slug, name, city, country, ucas_code, is_partner, logo_url, ranking, …)
- `courses` (id, slug, university_id, name, level, subject, duration_months, fee_gbp, intake_months[], entry_requirements jsonb, ucas_points, is_active)
- `course_intakes` (course_id, intake_date, deadline_date, seats_left)
- `shortlists` (user_id, course_id, added_at, note) — unique(user_id, course_id)
- `applications` (id, user_id, course_id, intake_id, status enum, submitted_at, decision_at, decision, adviser_id, notes)
- `application_events` (application_id, type, payload jsonb, created_at, actor_id) — timeline
- `documents` (id, user_id, type enum, storage_path, original_name, size_bytes, uploaded_at, verified_by)
- `messages` (id, thread_id, sender_id, body, created_at, read_at)
- `threads` (id, student_id, adviser_id, subject, last_message_at)
- `bookings` (id, student_id, adviser_id, starts_at, ends_at, channel, status, notes)
- `admin_audit` (id, actor_id, action, target_type, target_id, payload jsonb, created_at, ip)
- `lead_status` columns on `leads`: `status enum`, `assigned_to uuid`, `next_action_at`, `notes`, `utm jsonb`, `ip`, `user_agent`

Migrate `PROGRAMMES`/`COURSES`/`CAMPUSES` from TS into `courses`/`universities` via a one-time seed migration. Keep the TS file as a build-time export for the marketing pages until phase 2.

**Abuse protection on `submitLead`:**
- Cloudflare Turnstile token check inside the handler.
- Honeypot field on the form.
- Rate limit by IP (e.g., 5/min/IP) using a small KV-style table or Cloudflare WAF rule.
- Email + phone normalisation, dedupe within 24h window.

**Transactional email (Resend, via `LOVABLE_API_KEY` Gateway or direct):**
- Student: lead-received, adviser-assigned, application-status-changed.
- Adviser: new-lead-assigned, new-message.
- All from `bridgegatewayconsulting.com` once domain verified.

**Audit log** middleware on every admin-only server fn writes to `admin_audit`.

### Phase 2 — Student product (the actual platform)
- `/courses/$slug` and `/universities/$slug` SSR pages with JSON-LD `Course` / `EducationalOrganization` schema; dynamic sitemap.
- Server-paginated course search backed by `courses` table + Postgres `tsvector` on `name + subject + city`.
- "Save to shortlist" on every course card; `/dashboard/shortlist` page.
- "Apply" CTA creates a row in `applications` with status `draft`, then funnels into a 3-step apply wizard (review profile → confirm documents → submit).
- Document upload (Supabase Storage bucket `student-documents`, signed URLs, RLS: owner + admin).
- Student timeline on dashboard: combined feed from `application_events` + `messages`.
- Rewrite all reads using **TanStack Query + route loaders** per the stack guide. Add Suspense skeletons.
- Persist onboarding per step (`updateMyProfile` after each step) so users can resume.

### Phase 3 — Adviser/admin tooling
- Lead board (Kanban: new → contacted → qualified → converted → lost) with drag-and-drop and `assigned_to`.
- Server-paginated student list with full-text search across name/email/city/subject (Postgres `ilike` with trigram index, or `tsvector`).
- Student profile page: timeline, notes, documents, applications, message thread, "send password reset", "book call", "log call".
- Bulk CSV export of leads with date range filter.
- Adviser inbox (unified message threads).
- Admin profile edit (new RLS `UPDATE` policy gated by `has_role(uid,'admin')`).
- Booking calendar (Cal.com embed or `bookings` table + adviser availability).
- Roles: extend `app_role` enum with `adviser`, gate adviser-only views.

### Phase 4 — Growth & ops
- Analytics: PostHog (or self-hosted Plausible) — funnel events from lead form, onboarding steps, apply wizard. Surface drop-off dashboard for admins.
- Scholarship matcher, fees calculator, visa eligibility checker as standalone SEO pages backed by data tables.
- Referral codes on `profiles`; share link tracks attribution into `leads.source` + `leads.utm`.
- Web push (VAPID) + in-app inbox for notifications.
- Sentry for client + server-fn error capture; replace ad-hoc `error-capture.ts`.
- GDPR self-serve: "Export my data" + "Delete my account" buttons calling new server fns; audit-logged.
- i18n scaffolding (English + one more, e.g., Arabic or Mandarin given international focus) via `@tanstack/react-router` localised routes or `i18next`.
- A/B testing via PostHog feature flags on hero copy + lead-form length.
- PWA manifest + offline shell for the dashboard.

---

## 4. Cross-cutting technical fixes (do alongside Phase 1)

- Replace every `useEffect` data fetch (dashboard, admin, onboarding load) with `ensureQueryData` in loader + `useSuspenseQuery` in component.
- Add `errorComponent` + `notFoundComponent` to every route with a loader (currently only the root has them).
- Move admin `listStudents` to paginated cursor query; stop calling `auth.admin.listUsers({ perPage: 1000 })` per request — store `email` denormalised on `profiles` via trigger.
- Add `UPDATE` policy on `profiles` for admins; today there is none, blocking adviser fixes.
- Index hot columns: `leads(created_at desc)`, `leads(email)`, `profiles(user_id)`, `applications(user_id, status)`, `messages(thread_id, created_at)`, plus trigram indexes on `profiles.full_name` / `profiles.city`.
- Centralise all server fns in `src/lib/*.functions.ts` per file (already partly done), and ensure every admin fn calls `assertAdmin(context.userId)` — `listLeads` currently inlines the check; refactor to shared helper.

---

## 5. Suggested first sprint (concrete, 1–2 days)

If you want to start immediately, the highest ROI single sprint is:

1. **Turnstile + honeypot + rate-limit on `submitLead`** (kills spam tomorrow).
2. **`shortlists` table + "Save" button on `/courses` + `/dashboard/shortlist`** (gives the dashboard a real reason to exist).
3. **`leads.status` + `leads.assigned_to` + `admin_audit`** (gives admin a real reason to exist).
4. **Resend transactional email** for lead-received and adviser-assigned.
5. **Convert dashboard + admin reads to TanStack Query loaders.**

That alone takes the app from "marketing site with a form" to "minimum viable consulting platform".

---

Tell me which phase or which item to start with and I'll write the implementation plan for that slice (DB migration, server fns, UI, all in one).
