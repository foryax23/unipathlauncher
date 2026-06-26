
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS application_data jsonb NOT NULL DEFAULT '{}'::jsonb;

-- adviser_availability
CREATE TABLE public.adviser_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  adviser_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weekday smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  timezone text NOT NULL DEFAULT 'Europe/London',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_time > start_time)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.adviser_availability TO authenticated;
GRANT ALL ON public.adviser_availability TO service_role;
ALTER TABLE public.adviser_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read availability" ON public.adviser_availability
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Adviser manages own availability" ON public.adviser_availability
  FOR ALL TO authenticated
  USING (adviser_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (adviser_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_adviser_availability_updated BEFORE UPDATE ON public.adviser_availability
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- adviser_time_off
CREATE TABLE public.adviser_time_off (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  adviser_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.adviser_time_off TO authenticated;
GRANT ALL ON public.adviser_time_off TO service_role;
ALTER TABLE public.adviser_time_off ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read time off" ON public.adviser_time_off
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Adviser manages own time off" ON public.adviser_time_off
  FOR ALL TO authenticated
  USING (adviser_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (adviser_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner reads notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Owner marks notifications read" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX idx_notifications_user_unread ON public.notifications (user_id, read_at, created_at DESC);

ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
