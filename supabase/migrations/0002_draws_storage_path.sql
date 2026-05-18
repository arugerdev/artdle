-- T11/T12: store image as a Supabase Storage object instead of a base64
-- column on the draws row. New uploads go to the `draws` bucket; the
-- storage_path column points at the object. uridata stays for legacy
-- rows so the client can fall back to base64 when storage_path is null.

ALTER TABLE public.draws
  ADD COLUMN IF NOT EXISTS storage_path text;

-- Refresh draws_with_meta so it surfaces the new column.
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
