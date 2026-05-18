-- T11/T12: storage policies for the `draws` bucket.
-- The bucket is public, so SELECT is implicit. Authenticated users can
-- INSERT new objects in their own folder ({user_id}/...) and DELETE
-- objects they own.

DROP POLICY IF EXISTS "Authenticated users can upload drawings" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update own drawings" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete own drawings" ON storage.objects;

CREATE POLICY "Authenticated users can upload drawings"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'draws'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Authenticated users can update own drawings"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'draws'
    AND owner = auth.uid()
  );

CREATE POLICY "Authenticated users can delete own drawings"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'draws'
    AND owner = auth.uid()
  );
