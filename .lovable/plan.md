## Admin Lead Inbox

Upgrade `/admin` into a real adviser workspace: list of registered students (profiles + leads), search, filters, and a details panel showing everything captured in onboarding.

### 1. Auto-grant admin to fixed emails

- Migration: insert `user_roles(role='admin')` for any existing `auth.users` whose email is `rodrigesg@gmail.com` or `mihaidandea13@gmail.com`.
- Extend `handle_new_user` trigger so future signups with those emails are inserted into `user_roles` as admin automatically.
- Lower-case comparison so casing doesn't matter.

### 2. New server functions (`src/lib/admin.functions.ts`)

All gated by `requireSupabaseAuth` + admin role check (reuse pattern from `listLeads`), using `supabaseAdmin`:

- `listStudents({ search?, level?, year? })` → joined view of `profiles` + `auth.users.email` + latest matching `leads` row. Returns: id, user_id, full_name, email, phone, city, country, subject, study_level, start_year, onboarding_complete, created_at.
- `getStudent({ userId })` → full profile + all leads submitted with that email + computed fields (location lat/lng, reason, source).
- Keep existing `listLeads` for the anonymous-lead inbox tab.

### 3. UI rebuild (`src/routes/admin.tsx`)

Two tabs:
- **Students** (default) — registered users from `profiles`.
- **Leads** — existing anonymous lead form submissions.

Students tab:
- Toolbar: search input (name/email/city), filter selects for Subject, Study level (Foundation/Undergrad/Postgrad), Start year (2025/26/27), Onboarding status (complete/incomplete).
- Table: Name · Email · City · Subject · Level · Year · Status · Joined. Row click opens details panel.
- Right-hand slide-over panel (`Sheet` from shadcn) with sections:
  - Contact: name, email, phone
  - Location: city, country, lat/lng (mini static map link)
  - Study plan: subject, level, start year, reason
  - Onboarding: completion state + timestamps
  - Related leads: any rows from `leads` matching the email
  - CSV export of the single student
- Filters apply client-side once data loaded; server function handles `search` for scalability.

### 4. Access control

- `/admin` already checks session; add explicit admin check via new `getMyAdminStatus` server fn so non-admins see a clear "Not authorised" message instead of a failed fetch.
- All admin server fns double-check the role; never trust the client.

### Technical notes

```text
src/
├── lib/
│   ├── admin.functions.ts        # NEW: listStudents, getStudent, getMyAdminStatus
│   └── leads.functions.ts        # unchanged
├── routes/
│   └── admin.tsx                 # rewritten: tabs + students table + details sheet
└── components/admin/
    ├── StudentsTable.tsx         # NEW
    ├── StudentDetailsSheet.tsx   # NEW
    └── FiltersBar.tsx            # NEW
supabase/migrations/
└── <ts>_admin_emails.sql         # NEW: seed admin roles + extend trigger
```

Migration sketch:

```sql
-- seed existing
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users
WHERE lower(email) IN ('rodrigesg@gmail.com','mihaidandea13@gmail.com')
ON CONFLICT DO NOTHING;

-- extend trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() ...
  INSERT INTO public.profiles (user_id, full_name) VALUES (NEW.id, ...);
  IF lower(NEW.email) IN ('rodrigesg@gmail.com','mihaidandea13@gmail.com') THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
```

No schema changes to `profiles` or `leads` are required — all needed fields already exist.
