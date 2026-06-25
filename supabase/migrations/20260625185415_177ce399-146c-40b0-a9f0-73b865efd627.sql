
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin'::app_role,'adviser'::app_role)
  )
$$;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM anon, authenticated;

-- UNIVERSITIES
CREATE TABLE public.universities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  city text,
  region text,
  country text NOT NULL DEFAULT 'United Kingdom',
  ucas_code text,
  is_partner boolean NOT NULL DEFAULT false,
  logo_url text,
  ranking int,
  website text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.universities TO anon, authenticated;
GRANT ALL ON public.universities TO service_role;
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Universities are public" ON public.universities FOR SELECT USING (true);
CREATE POLICY "Admins manage universities" ON public.universities FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_universities_updated BEFORE UPDATE ON public.universities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_universities_partner ON public.universities (is_partner) WHERE is_partner;
CREATE INDEX idx_universities_city ON public.universities (city);

-- COURSES
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  university_id uuid NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  name text NOT NULL,
  level text NOT NULL,
  subject text NOT NULL,
  duration_months int,
  fee_gbp int,
  intake_months int[] DEFAULT '{}',
  entry_requirements jsonb NOT NULL DEFAULT '{}'::jsonb,
  ucas_points int,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.courses TO anon, authenticated;
GRANT ALL ON public.courses TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active courses are public" ON public.courses FOR SELECT
  USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage courses" ON public.courses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_courses_updated BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_courses_university ON public.courses (university_id);
CREATE INDEX idx_courses_level ON public.courses (level);
CREATE INDEX idx_courses_subject ON public.courses (subject);
CREATE INDEX idx_courses_search ON public.courses USING gin (to_tsvector('english', name || ' ' || subject));

-- COURSE INTAKES
CREATE TABLE public.course_intakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  intake_date date NOT NULL,
  deadline_date date,
  seats_left int,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, intake_date)
);
GRANT SELECT ON public.course_intakes TO anon, authenticated;
GRANT ALL ON public.course_intakes TO service_role;
ALTER TABLE public.course_intakes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Intakes are public" ON public.course_intakes FOR SELECT USING (true);
CREATE POLICY "Admins manage intakes" ON public.course_intakes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_intakes_updated BEFORE UPDATE ON public.course_intakes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_intakes_course ON public.course_intakes (course_id, intake_date);

-- APPLICATIONS
CREATE TYPE public.application_status AS ENUM (
  'draft','submitted','interview','offer','accepted','rejected','withdrawn','enrolled'
);

CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
  intake_id uuid REFERENCES public.course_intakes(id) ON DELETE SET NULL,
  status public.application_status NOT NULL DEFAULT 'draft',
  submitted_at timestamptz,
  decision_at timestamptz,
  decision text,
  adviser_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id, intake_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students see own applications" ON public.applications FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin') OR adviser_id = auth.uid());
CREATE POLICY "Students create own applications" ON public.applications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Students update own draft applications" ON public.applications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND status = 'draft') WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff update applications" ON public.applications FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR adviser_id = auth.uid())
  WITH CHECK (public.has_role(auth.uid(),'admin') OR adviser_id = auth.uid());
CREATE POLICY "Admins delete applications" ON public.applications FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_applications_updated BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_applications_user ON public.applications (user_id, status);
CREATE INDEX idx_applications_adviser ON public.applications (adviser_id) WHERE adviser_id IS NOT NULL;
CREATE INDEX idx_applications_course ON public.applications (course_id);

-- APPLICATION EVENTS
CREATE TABLE public.application_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.application_events TO authenticated;
GRANT ALL ON public.application_events TO service_role;
ALTER TABLE public.application_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View own application events" ON public.application_events FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.id = application_id
        AND (a.user_id = auth.uid() OR a.adviser_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
    )
  );
CREATE POLICY "Insert own application events" ON public.application_events FOR INSERT TO authenticated
  WITH CHECK (
    actor_id = auth.uid() AND EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.id = application_id
        AND (a.user_id = auth.uid() OR a.adviser_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
    )
  );
CREATE INDEX idx_app_events_app ON public.application_events (application_id, created_at desc);

-- DOCUMENTS
CREATE TYPE public.document_type AS ENUM (
  'passport','transcript','english_test','personal_statement','reference','other'
);

CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.document_type NOT NULL,
  storage_path text NOT NULL,
  original_name text NOT NULL,
  size_bytes bigint,
  mime_type text,
  verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners see documents" ON public.documents FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_staff(auth.uid()));
CREATE POLICY "Owners insert documents" ON public.documents FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners delete documents" ON public.documents FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Staff verify documents" ON public.documents FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_documents_updated BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_documents_user ON public.documents (user_id, type);

-- THREADS + MESSAGES
CREATE TABLE public.threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  adviser_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  subject text,
  last_message_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.threads TO authenticated;
GRANT ALL ON public.threads TO service_role;
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View own threads" ON public.threads FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR adviser_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Students start threads" ON public.threads FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());
CREATE POLICY "Participants update threads" ON public.threads FOR UPDATE TO authenticated
  USING (student_id = auth.uid() OR adviser_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (student_id = auth.uid() OR adviser_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_threads_updated BEFORE UPDATE ON public.threads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_threads_student ON public.threads (student_id, last_message_at desc);
CREATE INDEX idx_threads_adviser ON public.threads (adviser_id, last_message_at desc) WHERE adviser_id IS NOT NULL;

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.threads(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants read messages" ON public.messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.threads t
      WHERE t.id = thread_id
        AND (t.student_id = auth.uid() OR t.adviser_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
    )
  );
CREATE POLICY "Participants post messages" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND EXISTS (
      SELECT 1 FROM public.threads t
      WHERE t.id = thread_id
        AND (t.student_id = auth.uid() OR t.adviser_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
    )
  );
CREATE POLICY "Recipients mark read" ON public.messages FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.threads t
      WHERE t.id = thread_id
        AND (t.student_id = auth.uid() OR t.adviser_id = auth.uid())
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.threads t
      WHERE t.id = thread_id
        AND (t.student_id = auth.uid() OR t.adviser_id = auth.uid())
    )
  );
CREATE INDEX idx_messages_thread ON public.messages (thread_id, created_at);

-- BOOKINGS
CREATE TYPE public.booking_status AS ENUM ('requested','confirmed','cancelled','completed','no_show');

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  adviser_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  channel text NOT NULL DEFAULT 'video',
  status public.booking_status NOT NULL DEFAULT 'requested',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View own bookings" ON public.bookings FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR adviser_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Students book" ON public.bookings FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());
CREATE POLICY "Participants update bookings" ON public.bookings FOR UPDATE TO authenticated
  USING (student_id = auth.uid() OR adviser_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (student_id = auth.uid() OR adviser_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_bookings_updated BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_bookings_student ON public.bookings (student_id, starts_at desc);
CREATE INDEX idx_bookings_adviser ON public.bookings (adviser_id, starts_at desc) WHERE adviser_id IS NOT NULL;

-- LEAD RATE LIMITS (service-role only)
CREATE TABLE public.lead_rate_limits (
  ip text PRIMARY KEY,
  window_start timestamptz NOT NULL DEFAULT now(),
  count int NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.lead_rate_limits TO service_role;
ALTER TABLE public.lead_rate_limits ENABLE ROW LEVEL SECURITY;

-- PROFILES: extra fields + staff update policy
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS nationality text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS predicted_grades jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS achieved_grades jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS english_test jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS visa_status text,
  ADD COLUMN IF NOT EXISTS marketing_consent_email boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_consent_sms boolean NOT NULL DEFAULT false;

DROP POLICY IF EXISTS "Staff can update profiles" ON public.profiles;
CREATE POLICY "Staff can update profiles" ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
