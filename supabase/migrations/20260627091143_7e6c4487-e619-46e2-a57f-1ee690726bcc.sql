CREATE TABLE public.email_nudges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, kind)
);
CREATE INDEX email_nudges_user_idx ON public.email_nudges(user_id);
GRANT ALL ON public.email_nudges TO service_role;
ALTER TABLE public.email_nudges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service only" ON public.email_nudges FOR ALL USING (false) WITH CHECK (false);