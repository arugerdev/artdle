-- T17/T18/T19: tighten RLS, allow nullable uridata for storage rows,
-- enforce one-draw-per-user-per-day via UNIQUE, validate row size on insert.

----------------------------------------------------------------------
-- (Fix from T11) — uridata was NOT NULL, but storage-backed rows store
-- their image as storage_path with uridata=null. Make it nullable and
-- add a CHECK that at least one of the two is populated.
----------------------------------------------------------------------
ALTER TABLE public.draws ALTER COLUMN uridata DROP NOT NULL;

ALTER TABLE public.draws
  DROP CONSTRAINT IF EXISTS draws_has_image;
ALTER TABLE public.draws
  ADD CONSTRAINT draws_has_image
    CHECK (uridata IS NOT NULL OR storage_path IS NOT NULL);

----------------------------------------------------------------------
-- T17: RLS — every INSERT must claim its own user_id.
----------------------------------------------------------------------
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.draws;
CREATE POLICY "Enable insert for authenticated users only"
  ON public.draws FOR INSERT TO authenticated
  WITH CHECK (creator = auth.uid());

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.likes;
CREATE POLICY "Enable insert for authenticated users only"
  ON public.likes FOR INSERT TO authenticated
  WITH CHECK (liked_by = auth.uid());

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.reports;
CREATE POLICY "Enable insert for authenticated users only"
  ON public.reports FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

----------------------------------------------------------------------
-- T18: one draw per user per day. UNIQUE constraint is the cheapest
-- enforcement; the client already prevents this UI-side but the DB
-- needs to be authoritative.
----------------------------------------------------------------------
-- No-op if it already exists (would happen on re-run).
ALTER TABLE public.draws
  DROP CONSTRAINT IF EXISTS draws_one_per_user_per_day;
ALTER TABLE public.draws
  ADD CONSTRAINT draws_one_per_user_per_day UNIQUE (creator, day);

----------------------------------------------------------------------
-- T19: validate row size. Mostly relevant for legacy uridata rows,
-- since storage_path rows are tiny. 600 KB cap on uridata matches the
-- canvas + WebP worst-case (~500 KB). draw name limited to a sane
-- length so we don't get screen-eating titles.
----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validate_draw_row()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF char_length(NEW.name) < 1 OR char_length(NEW.name) > 80 THEN
    RAISE EXCEPTION 'name must be between 1 and 80 characters' USING ERRCODE = '23514';
  END IF;
  IF NEW.uridata IS NOT NULL AND octet_length(NEW.uridata) > 700000 THEN
    RAISE EXCEPTION 'uridata exceeds 700 KB' USING ERRCODE = '23514';
  END IF;
  IF NEW.storage_path IS NOT NULL AND char_length(NEW.storage_path) > 512 THEN
    RAISE EXCEPTION 'storage_path too long' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_draw_row_trigger ON public.draws;
CREATE TRIGGER validate_draw_row_trigger
  BEFORE INSERT OR UPDATE ON public.draws
  FOR EACH ROW EXECUTE FUNCTION public.validate_draw_row();

----------------------------------------------------------------------
-- Reports: similar size guard, no XSS-y huge text.
----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validate_report_row()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF char_length(coalesce(NEW.report_text, '')) < 1 OR char_length(NEW.report_text) > 2000 THEN
    RAISE EXCEPTION 'report_text must be between 1 and 2000 characters' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_report_row_trigger ON public.reports;
CREATE TRIGGER validate_report_row_trigger
  BEFORE INSERT OR UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.validate_report_row();
