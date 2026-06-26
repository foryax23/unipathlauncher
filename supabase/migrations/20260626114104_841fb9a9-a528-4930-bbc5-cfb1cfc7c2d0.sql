
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS referral_credit integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referred_by uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  university_id uuid NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  course_id uuid NULL REFERENCES public.courses(id) ON DELETE SET NULL,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text NULL,
  body text NOT NULL CHECK (char_length(body) BETWEEN 10 AND 4000),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','published','rejected')),
  staff_reply text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS reviews_uni_status_idx ON public.reviews(university_id, status);
CREATE INDEX IF NOT EXISTS reviews_course_status_idx ON public.reviews(course_id, status);
CREATE INDEX IF NOT EXISTS reviews_student_idx ON public.reviews(student_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT SELECT ON public.reviews TO anon;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_public_read_published" ON public.reviews FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "reviews_owner_read" ON public.reviews FOR SELECT TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "reviews_owner_insert" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);
CREATE POLICY "reviews_owner_update" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = student_id AND status = 'pending') WITH CHECK (auth.uid() = student_id);
CREATE POLICY "reviews_staff_read_all" ON public.reviews FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "reviews_staff_moderate" ON public.reviews FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER reviews_set_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  referred_user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','signed_up','converted','rewarded','void')),
  reward_pence integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  converted_at timestamptz NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS referrals_referrer_idx ON public.referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS referrals_referred_idx ON public.referrals(referred_user_id);
GRANT SELECT, INSERT, UPDATE ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referrals_owner_read" ON public.referrals FOR SELECT TO authenticated USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);
CREATE POLICY "referrals_owner_insert" ON public.referrals FOR INSERT TO authenticated WITH CHECK (auth.uid() = referrer_user_id);
CREATE POLICY "referrals_staff_read_all" ON public.referrals FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "referrals_staff_update" ON public.referrals FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER referrals_set_updated_at BEFORE UPDATE ON public.referrals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.app_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL, message text NOT NULL, stack text NULL, route text NULL,
  user_id uuid NULL, context jsonb NOT NULL DEFAULT '{}'::jsonb,
  acknowledged_at timestamptz NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS app_errors_created_idx ON public.app_errors(created_at DESC);
CREATE INDEX IF NOT EXISTS app_errors_kind_idx ON public.app_errors(kind);
GRANT SELECT, UPDATE ON public.app_errors TO authenticated;
GRANT ALL ON public.app_errors TO service_role;
ALTER TABLE public.app_errors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "app_errors_staff_read" ON public.app_errors FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "app_errors_staff_ack" ON public.app_errors FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE IF NOT EXISTS public.request_logs (
  id bigserial PRIMARY KEY,
  route text NOT NULL, method text NOT NULL, status integer NOT NULL,
  duration_ms integer NOT NULL, user_id uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS request_logs_created_idx ON public.request_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS request_logs_route_idx ON public.request_logs(route);
GRANT SELECT ON public.request_logs TO authenticated;
GRANT ALL ON public.request_logs TO service_role;
ALTER TABLE public.request_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "request_logs_staff_read" ON public.request_logs FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS search_tsv tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name,'')), 'A') ||
    setweight(to_tsvector('english', coalesce(subject,'')), 'B') ||
    setweight(to_tsvector('english', coalesce(description,'')), 'C')
  ) STORED;
CREATE INDEX IF NOT EXISTS courses_search_idx ON public.courses USING GIN (search_tsv);

ALTER TABLE public.universities
  ADD COLUMN IF NOT EXISTS search_tsv tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name,'')), 'A') ||
    setweight(to_tsvector('english', coalesce(city,'')), 'B')
  ) STORED;
CREATE INDEX IF NOT EXISTS universities_search_idx ON public.universities USING GIN (search_tsv);

CREATE OR REPLACE VIEW public.v_lead_funnel WITH (security_invoker = true) AS
SELECT date_trunc('day', created_at)::date AS day, status::text AS status, count(*)::bigint AS n
FROM public.leads GROUP BY 1, 2;

CREATE OR REPLACE VIEW public.v_application_funnel WITH (security_invoker = true) AS
SELECT date_trunc('day', created_at)::date AS day, status::text AS status, count(*)::bigint AS n
FROM public.applications GROUP BY 1, 2;

CREATE OR REPLACE VIEW public.v_adviser_workload WITH (security_invoker = true) AS
SELECT
  ur.user_id AS adviser_id,
  (SELECT count(*) FROM public.leads l
     WHERE l.assigned_to = ur.user_id AND l.status::text NOT IN ('converted','lost','spam'))::bigint AS open_leads,
  (SELECT count(*) FROM public.applications a
     WHERE a.adviser_id = ur.user_id AND a.status::text NOT IN ('enrolled','rejected','withdrawn'))::bigint AS open_applications,
  (SELECT count(*) FROM public.bookings b
     WHERE b.adviser_id = ur.user_id AND b.starts_at >= now() AND b.status::text = 'confirmed')::bigint AS upcoming_bookings
FROM public.user_roles ur
WHERE ur.role IN ('admin','adviser');

GRANT SELECT ON public.v_lead_funnel TO authenticated;
GRANT SELECT ON public.v_application_funnel TO authenticated;
GRANT SELECT ON public.v_adviser_workload TO authenticated;
