-- T31: web-push subscription storage.
-- T34: admin gating.

----------------------------------------------------------------------
-- T31 — push subscriptions
----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id            bigserial PRIMARY KEY,
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint      text NOT NULL,
  keys_p256dh   text NOT NULL,
  keys_auth     text NOT NULL,
  user_agent    text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (endpoint)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users insert their own subscription" ON public.push_subscriptions;
CREATE POLICY "Users insert their own subscription"
  ON public.push_subscriptions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users see their own subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users see their own subscriptions"
  ON public.push_subscriptions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users delete their own subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users delete their own subscriptions"
  ON public.push_subscriptions FOR DELETE TO authenticated
  USING (user_id = auth.uid());

----------------------------------------------------------------------
-- T34 — admins
----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admins (
  user_id   uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  added_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- A user can find out whether they themselves are an admin, but can't
-- enumerate other admins. New admins are seeded via the service role.
DROP POLICY IF EXISTS "Read own admin row" ON public.admins;
CREATE POLICY "Read own admin row"
  ON public.admins FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Helper used by other policies / app code.
CREATE OR REPLACE FUNCTION public.is_admin (uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admins WHERE user_id = uid);
$$;
REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

-- Admins can read every report and delete any draw / comment / report.
DROP POLICY IF EXISTS "Admins read reports" ON public.reports;
CREATE POLICY "Admins read reports"
  ON public.reports FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins delete reports" ON public.reports;
CREATE POLICY "Admins delete reports"
  ON public.reports FOR DELETE TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins delete draws" ON public.draws;
CREATE POLICY "Admins delete draws"
  ON public.draws FOR DELETE TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins delete comments" ON public.comments;
CREATE POLICY "Admins delete comments"
  ON public.comments FOR DELETE TO authenticated
  USING (public.is_admin() OR author = auth.uid());
