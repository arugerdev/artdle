-- T20: Replay/Timelapse — store the original stroke sequence so the
-- drawing can be re-played in order. One row per draw (PRIMARY KEY on
-- draw_id) so cardinality stays simple.

CREATE TABLE IF NOT EXISTS public.draw_strokes (
  draw_id    bigint PRIMARY KEY REFERENCES public.draws(id) ON DELETE CASCADE,
  strokes    jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.draw_strokes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Strokes are publicly readable" ON public.draw_strokes;
CREATE POLICY "Strokes are publicly readable"
  ON public.draw_strokes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only the draw owner can insert strokes" ON public.draw_strokes;
CREATE POLICY "Only the draw owner can insert strokes"
  ON public.draw_strokes FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.draws d
      WHERE d.id = draw_strokes.draw_id
        AND d.creator = auth.uid()
    )
  );

-- Size guard: cap strokes JSON to ~500 KB. A typical drawing fits in
-- 20-80 KB; this leaves headroom while preventing payload abuse.
CREATE OR REPLACE FUNCTION public.validate_draw_strokes_row()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF octet_length(NEW.strokes::text) > 500000 THEN
    RAISE EXCEPTION 'strokes payload exceeds 500 KB' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_draw_strokes_row_trigger ON public.draw_strokes;
CREATE TRIGGER validate_draw_strokes_row_trigger
  BEFORE INSERT OR UPDATE ON public.draw_strokes
  FOR EACH ROW EXECUTE FUNCTION public.validate_draw_strokes_row();
