# Phase 4 — Analytics, engagement & growth

Phases 1–3 stood up the catalogue, student workspace, staff workspace, application wizard, scheduling, and notifications. Phase 4 turns the platform from "functional" into "compounding": staff get visibility into pipeline health, students get nudges and recommendations that lift conversion, and marketing gets the loops (referrals, reviews, content) that fill the top of the funnel.

Phase 4 is deliberately scoped without payments — paid services / commission tracking is its own phase once we lock pricing.

## 1. Staff analytics dashboard (`/admin`)

The current `/admin` is a thin shell. Replace it with a real overview powered by SQL views.

- KPI strip: new leads (7d / 30d), conversion lead→application, applications submitted, offers, accepted, time-to-first-response.
- Pipeline funnel chart (Recharts) — counts at each `application_status` over the selected range.
- Lead source breakdown (donut) using `leads.utm_source` and `leads.referrer`.
- Adviser workload table — open leads, open applications, avg response time per adviser.
- Date-range picker (7/30/90 days, custom) drives every widget.
- Backed by `admin_metrics.functions.ts` calling SQL views (`v_lead_funnel`, `v_application_funnel`, `v_adviser_workload`) so heavy aggregation lives in Postgres, not the worker.

## 2. Student engagement loop

Move students from "signed up" to "submitted" with structured nudges.

- **Profile completion meter** on `/dashboard` — checklist (contact, academic history, English test, documents, first shortlist, first booking). Drives the next-best-action card.
- **Smart shortlist suggestions** — recommend 3 courses based on onboarding answers (level, subjects, locations, start date). New `recommendCourses` server fn querying `courses` joined with `universities`, scored on subject/location/level match.
- **Activity feed** card — last 5 events from `application_events` + `notifications` summarised.
- **Email nudges** (Resend templates, throttled): 24h after signup without onboarding, 48h after onboarding without shortlist, 72h after shortlist without application, abandoned-wizard reminder if `application_data` is non-empty but status still `draft` after 3 days. Driven by a daily cron route `/api/public/cron/engagement` (verified by header secret).
- Each nudge respects an `email_preferences` jsonb on `profiles` with per-channel opt-outs and a one-click unsubscribe link.

## 3. Reviews & social proof

- New table `reviews` (student_id, university_id, course_id?, rating 1–5, body, status). RLS: students write own, public read `status = 'published'`.
- Students prompted to review after application reaches `accepted`/`enrolled`.
- Aggregate rating shown on `/universities/$slug` and `/courses/$slug`. JSON-LD `AggregateRating` for SEO.
- Staff moderation queue at `/admin/reviews` — approve, reject, reply.

## 4. Referrals

- New table `referrals` (referrer_user_id, code unique, referred_user_id?, status, created_at, converted_at).
- `/dashboard/refer` page: personal code + share links (WhatsApp, copy). Tracking via `?ref=` on landing → cookie → attribution at signup.
- Reward ledger column on `profiles.referral_credit` (int, GBP pence) — incremented when referred user reaches `accepted`. Redemption is manual for now (staff action via `/admin/students/$id`).

## 5. Content & SEO surface

- `/blog` powered by Markdown files in `src/content/blog/*.md` parsed at build (no DB). Each post has frontmatter (title, description, slug, cover, tags, published).
- Per-post route with proper `head()` (title, meta description, OG, canonical, `Article` JSON-LD, `datePublished`).
- `/blog` index + tag pages.
- Auto-generated `/sitemap.xml` extended with blog posts, course slugs, university slugs from DB at build/request.
- Reading-time + "next post" recirculation.

## 6. Search

- Postgres `tsvector` index on `courses(title, subject_area, description)` and `universities(name, city)`.
- New `searchCatalogue({ q, limit })` server fn returning interleaved courses + universities.
- Global header search (cmd-K palette using `cmdk`, already in shadcn): jumps to course/university/blog post. Available on marketing + dashboard shells.

## 7. Observability & quality

- Server-side error capture: extend `src/lib/error-capture.ts` to POST sampled errors to `app_errors` table (kind, message, stack, route, user_id?, created_at). RLS: staff read.
- `/admin/errors` simple list, last 200, ack button.
- Lightweight per-route hit logging (route, status, ms, user_id?) sampled at 10%, written via a request middleware to `request_logs` (partitioned by day, retention 14d via cron).

## 8. Plumbing

- New components: `KpiCard`, `FunnelChart`, `DateRangePicker`, `ProfileCompletion`, `RecommendationCard`, `ReviewForm`, `ReferralCard`, `CommandPalette`, `BlogCard`.
- New server fns: `admin_metrics.functions.ts`, `recommendations.functions.ts`, `reviews.functions.ts`, `referrals.functions.ts`, `search.functions.ts`, `blog.functions.ts` (build-time helper).
- Cron entry: `src/routes/api/public/cron.engagement.ts` (HMAC header check, idempotent per user/day).

## Migrations (single batch, requires approval)

```text
- reviews             (table + RLS: owner write, public read published, staff moderate)
- referrals           (table + RLS: owner read own, staff read all)
- app_errors          (table + RLS: staff read, service insert)
- request_logs        (table + service insert; daily cleanup)
- profiles.email_preferences jsonb default '{}'
- profiles.referral_credit int default 0
- profiles.referred_by uuid nullable
- tsvector indexes on courses + universities + triggers to maintain
- SQL views: v_lead_funnel, v_application_funnel, v_adviser_workload
- GRANTs for every new table; realtime publication unchanged
```

## Execution order (one turn each)

1. Migrations + types regen.
2. SQL views + `admin_metrics.functions.ts` + new `/admin` overview with KPI strip, funnel, source breakdown, workload table.
3. Reviews: table, student form on accepted apps, public render on uni/course pages with JSON-LD, `/admin/reviews` moderation.
4. Recommendations + profile completion + activity feed on `/dashboard`.
5. Referrals (page, attribution cookie, signup capture, admin column).
6. Search: tsvector + `searchCatalogue` + command palette in both shells.
7. Blog: markdown loader, `/blog` + post route, sitemap extension.
8. Engagement cron + email templates + opt-out + unsubscribe route.
9. Error capture + `/admin/errors` + request log sampling + retention cron.

## Out of scope (future)

- Stripe payments + commission tracking + invoicing.
- Web push notifications.
- AI essay/personal-statement assistant (separate dedicated phase).
- A/B testing infrastructure.
- Multi-language i18n.
