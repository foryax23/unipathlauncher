
-- =========================================================
-- 1. SHORTLISTS
-- =========================================================
CREATE TABLE public.shortlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id text NOT NULL,
  course_name text,
  partner text,
  level text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

CREATE INDEX shortlists_user_id_idx ON public.shortlists(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.shortlists TO authenticated;
GRANT ALL ON public.shortlists TO service_role;

ALTER TABLE public.shortlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own shortlists"
  ON public.shortlists FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own shortlists"
  ON public.shortlists FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own shortlists"
  ON public.shortlists FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own shortlists"
  ON public.shortlists FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all shortlists"
  ON public.shortlists FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- =========================================================
-- 2. LEAD LIFECYCLE
-- =========================================================
DO $$ BEGIN
  CREATE TYPE public.lead_status AS ENUM
    ('new', 'contacted', 'qualified', 'converted', 'lost', 'spam');
EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS status public.lead_status NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS next_action_at timestamptz,
  ADD COLUMN IF NOT EXISTS internal_notes text,
  ADD COLUMN IF NOT EXISTS utm jsonb,
  ADD COLUMN IF NOT EXISTS ip text,
  ADD COLUMN IF NOT EXISTS user_agent text;

CREATE INDEX IF NOT EXISTS leads_status_idx ON public.leads(status);
CREATE INDEX IF NOT EXISTS leads_assigned_to_idx ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS leads_email_idx ON public.leads(lower(email));

-- Admins can now update leads (status, assignment, notes)
DROP POLICY IF EXISTS "Admins can update leads" ON public.leads;
CREATE POLICY "Admins can update leads"
  ON public.leads FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- =========================================================
-- 3. ADMIN AUDIT LOG
-- =========================================================
CREATE TABLE public.admin_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email text,
  action text NOT NULL,
  target_type text,
  target_id text,
  payload jsonb,
  ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX admin_audit_created_at_idx ON public.admin_audit(created_at DESC);
CREATE INDEX admin_audit_actor_idx ON public.admin_audit(actor_id);
CREATE INDEX admin_audit_target_idx ON public.admin_audit(target_type, target_id);

GRANT SELECT ON public.admin_audit TO authenticated;
GRANT ALL ON public.admin_audit TO service_role;

ALTER TABLE public.admin_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view audit log"
  ON public.admin_audit FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
-- No INSERT/UPDATE/DELETE policies: writes go through service_role only.

-- =========================================================
-- 4. PROFILE UPDATE POLICY FOR ADMINS
-- =========================================================
DROP POLICY IF EXISTS "Admins update all profiles" ON public.profiles;
CREATE POLICY "Admins update all profiles"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
