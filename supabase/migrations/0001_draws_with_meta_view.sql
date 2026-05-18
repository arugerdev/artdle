-- T07: View that joins draws with creator profile, likes count and daily word.
-- Used by DrawList / DrawCard / LikeButton to collapse the previous N+1 fetch
-- into a single query.
--
-- security_invoker = on so RLS of the underlying tables is enforced for the
-- caller, not for the view owner. Underlying tables already have public-read
-- policies (draws, profiles, likes, daily_word), so this view exposes no new
-- data — it just lets clients fetch it in one round-trip.

DROP VIEW IF EXISTS public.draws_with_meta CASCADE;

CREATE VIEW public.draws_with_meta
WITH (security_invoker = on) AS
SELECT
  d.id,
  d.created_at,
  d.day,
  d.name,
  d.uridata,
  d.creator,
  p.username        AS creator_username,
  p.full_name       AS creator_full_name,
  p.avatar_url      AS creator_avatar_url,
  COALESCE(l.likes_count, 0)::int AS likes_count,
  dw.word           AS daily_word
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
