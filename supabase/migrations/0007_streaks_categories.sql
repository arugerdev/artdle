-- T23: user_stats with auto-updating streak tracking.
-- T24: category column on daily_word.

----------------------------------------------------------------------
-- T23 — user_stats + trigger
----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_draws     int NOT NULL DEFAULT 0,
  current_streak  int NOT NULL DEFAULT 0,
  longest_streak  int NOT NULL DEFAULT 0,
  last_draw_day   date,
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Stats are publicly readable" ON public.user_stats;
CREATE POLICY "Stats are publicly readable"
  ON public.user_stats FOR SELECT USING (true);

-- Backfill from existing draws so existing users have correct totals.
INSERT INTO public.user_stats (user_id, total_draws, last_draw_day)
SELECT creator, COUNT(*), MAX(day)
FROM public.draws
GROUP BY creator
ON CONFLICT (user_id) DO UPDATE SET
  total_draws = EXCLUDED.total_draws,
  last_draw_day = EXCLUDED.last_draw_day;

-- Streak recomputation for existing users — calculate longest streak
-- of consecutive days based on their draw history.
WITH per_user AS (
  SELECT creator, day,
    day - (ROW_NUMBER() OVER (PARTITION BY creator ORDER BY day))::int AS grp
  FROM (SELECT DISTINCT creator, day FROM public.draws) d
),
streaks AS (
  SELECT creator, grp,
         COUNT(*) AS streak_len,
         MAX(day) AS streak_end
  FROM per_user
  GROUP BY creator, grp
),
agg AS (
  SELECT creator,
         MAX(streak_len) AS longest,
         MAX(streak_len) FILTER (WHERE streak_end = (SELECT MAX(day) FROM public.draws WHERE creator = s.creator)) AS current
  FROM streaks s
  GROUP BY creator
)
UPDATE public.user_stats us
SET longest_streak = COALESCE(agg.longest, 0),
    current_streak = COALESCE(agg.current, 0)
FROM agg
WHERE us.user_id = agg.creator;

-- Trigger maintains stats on every new draw.
CREATE OR REPLACE FUNCTION public.update_user_stats_on_draw()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  existing public.user_stats%ROWTYPE;
  next_streak int;
BEGIN
  SELECT * INTO existing FROM public.user_stats WHERE user_id = NEW.creator;
  IF NOT FOUND THEN
    INSERT INTO public.user_stats (user_id, total_draws, current_streak, longest_streak, last_draw_day, updated_at)
    VALUES (NEW.creator, 1, 1, 1, NEW.day, now());
    RETURN NEW;
  END IF;

  IF existing.last_draw_day = NEW.day THEN
    next_streak := existing.current_streak;
  ELSIF existing.last_draw_day = NEW.day - 1 THEN
    next_streak := existing.current_streak + 1;
  ELSE
    next_streak := 1;
  END IF;

  UPDATE public.user_stats SET
    total_draws    = existing.total_draws + 1,
    current_streak = next_streak,
    longest_streak = GREATEST(existing.longest_streak, next_streak),
    last_draw_day  = NEW.day,
    updated_at     = now()
  WHERE user_id = NEW.creator;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_user_stats_on_draw_trigger ON public.draws;
CREATE TRIGGER update_user_stats_on_draw_trigger
  AFTER INSERT ON public.draws
  FOR EACH ROW EXECUTE FUNCTION public.update_user_stats_on_draw();

----------------------------------------------------------------------
-- T24 — categories
----------------------------------------------------------------------
ALTER TABLE public.daily_word
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'general';

CREATE INDEX IF NOT EXISTS daily_word_category_idx ON public.daily_word (category);

-- Refresh the joined view so the column flows through to the client.
DROP VIEW IF EXISTS public.draws_with_meta CASCADE;
CREATE VIEW public.draws_with_meta
WITH (security_invoker = on) AS
SELECT
  d.id,
  d.created_at,
  d.day,
  d.name,
  d.uridata,
  d.storage_path,
  d.creator,
  p.username        AS creator_username,
  p.full_name       AS creator_full_name,
  p.avatar_url      AS creator_avatar_url,
  COALESCE(l.likes_count, 0)::int AS likes_count,
  dw.word           AS daily_word,
  dw.category       AS daily_category
FROM public.draws d
LEFT JOIN public.profiles p
  ON p.id = d.creator
LEFT JOIN (
  SELECT liked_to, COUNT(*)::int AS likes_count
  FROM public.likes
  GROUP BY liked_to
) l ON l.liked_to = d.id
LEFT JOIN public.daily_word dw
  ON dw.day = d.day;

GRANT SELECT ON public.draws_with_meta TO anon, authenticated;
