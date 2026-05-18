-- T21: public profile page → no new table needed (profiles already exists),
-- but make username unique-but-nullable so we can route by it cleanly.
-- T22: comments table.

----------------------------------------------------------------------
-- T21
----------------------------------------------------------------------
-- Ensure username uniqueness (case-insensitive) so /u/:username is
-- deterministic. Existing nulls are allowed.
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_idx
  ON public.profiles (LOWER(username))
  WHERE username IS NOT NULL;

----------------------------------------------------------------------
-- T22 — comments
----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.comments (
  id          bigserial PRIMARY KEY,
  draw_id     bigint NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
  author      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS comments_draw_id_idx ON public.comments (draw_id, created_at DESC);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Comments are publicly readable" ON public.comments;
CREATE POLICY "Comments are publicly readable"
  ON public.comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users post their own comments" ON public.comments;
CREATE POLICY "Authenticated users post their own comments"
  ON public.comments FOR INSERT TO authenticated
  WITH CHECK (author = auth.uid());

DROP POLICY IF EXISTS "Authors can delete their own comments" ON public.comments;
CREATE POLICY "Authors can delete their own comments"
  ON public.comments FOR DELETE TO authenticated
  USING (author = auth.uid());

-- 1..280 chars enforced server-side so the client can't bypass.
CREATE OR REPLACE FUNCTION public.validate_comment_row()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF char_length(coalesce(NEW.text, '')) < 1 OR char_length(NEW.text) > 280 THEN
    RAISE EXCEPTION 'comment text must be 1-280 characters' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_comment_row_trigger ON public.comments;
CREATE TRIGGER validate_comment_row_trigger
  BEFORE INSERT OR UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.validate_comment_row();
