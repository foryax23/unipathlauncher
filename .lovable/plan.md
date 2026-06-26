# Phase 3 — Staff workspace, applications & operations

Phase 2 gave students a workspace and the public a real catalogue. Phase 3 turns the back-office on: advisers and admins get the tools to actually run the pipeline, students get a guided submission flow, and both sides get a shared notification surface.

## 1. Admin & adviser workspace (`/admin/*`)

A dedicated staff shell, gated by `assertStaff` in `beforeLoad` (admins + advisers) — separate from the student `/dashboard`.

- `/admin` — overview: counts by application status, new leads (24h), unread staff threads, today's bookings.
- `/admin/leads` — table of `leads`: filter by status/source/assignee, full-text on name/email, bulk assign, status transitions (new → contacted → qualified → applying → enrolled / lost), convert-to-application action, internal notes. Writes go through `updateLead` with audit logging.
- `/admin/applications` — Kanban board across statuses (draft, submitted, interview, offer, accepted, rejected, withdrawn, enrolled). Drag-to-move via `@dnd-kit` calls `updateApplicationStatus` which writes an `application_events` row. Card shows student, course, university, days-in-status. Column virtualisation for >50 cards.
- `/admin/applications/$id` — full detail with timeline, status changer, staff-only notes, attached documents (read via signed URL), student profile snapshot, message-student button (creates/opens thread).
- `/admin/students/$userId` — staff view of a student: profile, shortlist, applications, documents, bookings, message history. Adviser assignment dropdown.
- `/admin/inbox` — every thread the staff member owns or is assigned to. Same realtime hook as `/dashboard/messages`, plus a "claim" button on unassigned threads.
- `/admin/bookings` — calendar week view of all bookings, filterable by adviser, confirm/decline/reschedule actions.
- `/admin/audit` (admin only) — paginated `admin_audit` log with actor + entity + before/after diff.

Permissions: admins see everything; advisers see only rows where they are `assignee_id` (leads) or the application's `assignee_id`, plus unassigned. Enforced in the new `*.functions.ts` via RLS-checked queries, not client filters.

## 2. Application wizard (student side)

Replaces the bare "Start application" mutation with a guided submission:

- `/dashboard/applications/$id/submit` — 4 steps:
  1. Personal & contact (prefilled from profile)
  2. Academic history (prior qualifications, grades, English proficiency)
  3. Document attach (multi-select from vault, or upload inline via `useUpload`)
  4. Review & submit (read-only diff, confirms `status: submitted`, writes `status.submitted` event, fires admin-notification email)
- Per-step autosave to `applications.application_data` (jsonb) via a new `updateMyApplicationData` server fn. Resume-where-you-left-off.
- Validation with Zod schemas shared between client and server fn.

## 3. Adviser availability + booking calendar

Today bookings are free-form datetimes. Phase 3 adds real scheduling:

- New table `adviser_availability` (adviser_id, weekday, start_time, end_time, timezone).
- New table `adviser_time_off` (adviser_id, starts_at, ends_at, reason).
- `listAvailableSlots({ adviser_id?, date_from, date_to })` server fn computes free 30-min slots = availability − existing bookings − time-off.
- Student `/dashboard/bookings` request flow becomes a slot picker (date strip → available times) instead of arbitrary datetime input. Optional adviser preference dropdown.
- Adviser availability editor at `/admin/availability` — weekly grid + time-off list.

## 4. Notifications

Server-driven, surfaced in both shells.

- New table `notifications` (user_id, kind, title, body, link, read_at, created_at). RLS scoped to `auth.uid()`.
- Emit on: application status change, new message, new booking, booking confirmed/cancelled, new lead (staff), new document uploaded (staff).
- `NotificationBell` in header (student + admin shells): unread count badge, dropdown list, "mark all read", links navigate to the entity.
- Realtime via Supabase channel on `notifications` filtered by `user_id`.
- Optional email digest (uses Phase 1 Resend gateway) — opt-in in profile settings, daily summary of unread.

## 5. Plumbing & shared

- `src/components/admin/AdminShell.tsx` — sidebar nav, staff identity chip, role badge.
- `src/lib/admin/leads.functions.ts` and `src/lib/admin/applications.functions.ts` — all staff endpoints behind `assertStaff` / `assertAdmin`, every mutation writes to `admin_audit`.
- `src/hooks/use-notifications.ts` — realtime + query integration.
- `@dnd-kit/core` + `@dnd-kit/sortable` for the Kanban board.
- Shared `<KanbanCard>`, `<StaffTable>`, `<SlotPicker>` components.

## Migrations (single batch, requires approval)

```text
- adviser_availability  (table + RLS: staff read self/all, admin write)
- adviser_time_off      (table + RLS: staff read self, write self)
- notifications         (table + RLS: owner read/update, service insert)
- applications.application_data jsonb  (column add)
- leads.assignee_id, leads.internal_notes  (column add if missing)
- realtime publication: add notifications
- GRANTs for every new table
```

## Out of scope (Phase 4)

- Payments / commission tracking
- Adviser performance reports & analytics dashboards
- Public university adviser-marketplace listings
- Mobile push notifications (web push)
- Bulk email campaigns

## Execution order (one turn each)

1. Migrations + types regen.
2. Staff shell + `/admin` overview + `/admin/leads`.
3. `/admin/applications` Kanban + detail + audit page.
4. `/admin/students/$userId` + `/admin/inbox`.
5. Adviser availability tables, editor, slot-picker rewrite of student bookings, `/admin/bookings` calendar.
6. Application wizard (4 steps, autosave, submit transition).
7. Notifications: table, emitters in existing server fns, bell component, realtime hook, optional email digest.

This is large. I'll execute it phase-step by phase-step across turns — you approve this overall plan and we go.