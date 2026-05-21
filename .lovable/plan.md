## Goals

1. **Visual redesign** of the `/admin` page — keep all current functionality (Students tab, Leads tab, filters, side sheet), just make it look more like the rest of the app (glass surfaces, rounded corners, better spacing, polished header/empty/loading states).
2. **Unified password recovery** that works for every account, including admins.
3. Keep the separate `/admin` sign-in form (as requested) — but make it reuse the same recovery flow.

---

## 1. Admin panel — visual redesign

Scope: presentation only. No changes to `listLeads`, `listStudents`, `getStudent`, or RLS.

Refresh in `src/routes/admin.tsx`:

- **Page shell**
  - Wrap main in the same warm/aurora background used elsewhere; add a small "Admin" eyebrow + serif title + subtitle row (kept), now sitting inside a glass card header with the signed-in email + a compact "Sign out" button on the right.
- **Tabs bar**
  - Convert the shadcn TabsList to a pill-style glass strip; add a live count badge next to each tab label (e.g. "Students · 142", "Leads · 38").
- **Filters row (Students)**
  - Group search + selects inside a rounded glass card with consistent height (`h-11`), proper labels (sr-only), and a right-aligned result chip (already exists, restyle).
  - Add a clear "Reset filters" ghost button that appears when any filter is active.
- **Students table**
  - Replace the flat table with a card-style table: rounded container, zebra rows, hover lift, status pill using semantic tokens (no raw `emerald-100`/`amber-100` — switch to tokens like `bg-success/10 text-success` and `bg-warning/10 text-warning`, adding them to `src/styles.css` if missing).
  - Sticky header row, truncation with tooltips for long names/cities.
  - Skeleton rows while loading instead of just "Loading…".
  - Better empty state (icon + message + "Clear filters" CTA).
- **Leads tab**
  - Same card/table treatment, with a "Copy email" and `mailto:` action per row.
- **Student side sheet**
  - Replace stacked Section/Row blocks with a 2-column grid for desktop, single column on mobile; add an avatar circle with initials, copy-to-clipboard on email/phone, and a "Send password reset" button (calls `supabase.auth.resetPasswordForEmail` for that student — uses the same unified flow).
- **Sign-in card (when logged out)**
  - Restyle to match the marketing `AuthCard` look (glass-strong, rounded-3xl, same input styles).
  - Add a "Forgot password?" link under the Password field → routes to `/reset-password`.

---

## 2. Unified password recovery

The infrastructure already exists (`src/routes/reset-password.tsx` handles both request + update via `?type=recovery` hash). We extend it so it cleanly serves admins too.

Changes:

- **`/reset-password` route**
  - After a successful update, redirect based on role: if the user has the `admin` role → `/admin`, otherwise `/dashboard`. Today it hardcodes `/onboarding`.
  - On the "request" mode, set `redirectTo` to `${origin}/reset-password` (unchanged) — same link works for everyone.
  - Add subtle copy: "Works for student and adviser accounts."
- **Admin sign-in form (`SignIn` in `admin.tsx`)**
  - Add "Forgot password?" link under the password input → `/reset-password`.
- **Marketing `AuthCard`**
  - Already links to `/reset-password` — no change.
- **Student sheet → "Send password reset" button**
  - New small server function `sendPasswordReset({ email })` in `src/lib/admin.functions.ts`, guarded by `assertAdmin`, which calls `supabaseAdmin.auth.admin.generateLink({ type: 'recovery', email, options: { redirectTo: <origin>/reset-password } })`. This lets an admin trigger a reset email for any student without needing their password.

No new tables, no new RLS, no auth-config changes required (email auth + auto-confirm already on, recovery emails are sent by Supabase Auth by default).

---

## 3. Files touched

- `src/routes/admin.tsx` — visual redesign of all sub-components, add "Forgot password?" link in `SignIn`, add "Send password reset" button in `StudentSheet`.
- `src/routes/reset-password.tsx` — post-update role-based redirect, small copy tweak.
- `src/lib/admin.functions.ts` — add `sendPasswordReset` server fn (admin-only).
- `src/styles.css` — add `--success` / `--warning` tokens if not already present (used by the new status pills).

No DB migration, no auth config change, no edge functions.

---

## 4. Out of scope

- Branded auth emails (sender domain setup) — user picked the unified flow without branded email.
- Inviting/removing admins from the UI.
- Metrics/overview tab.
- CSV export.
