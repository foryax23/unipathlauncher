
DROP POLICY IF EXISTS "Owners read own documents" ON storage.objects;
CREATE POLICY "Owners read own documents" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'student-documents'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_staff(auth.uid()))
  );

DROP POLICY IF EXISTS "Owners upload own documents" ON storage.objects;
CREATE POLICY "Owners upload own documents" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'student-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Owners delete own documents" ON storage.objects;
CREATE POLICY "Owners delete own documents" ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'student-documents'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(),'admin'))
  );
