-- T33: collaborative multiplayer rooms.
-- MVP scope: any number of players join via a 6-character code, share
-- one canvas, see each other's strokes broadcast through Postgres
-- realtime. Game-flow (turns, voting, winner) is intentionally left
-- out of this migration and can be layered on top later by adding
-- columns to rooms (round_number, current_drawer, vote_count, …).

CREATE TABLE IF NOT EXISTS public.rooms (
  id            bigserial PRIMARY KEY,
  code          text UNIQUE NOT NULL,
  host_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  word          text,
  status        text NOT NULL DEFAULT 'open', -- open | closed
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rooms_code_idx ON public.rooms (code);

CREATE TABLE IF NOT EXISTS public.room_strokes (
  id            bigserial PRIMARY KEY,
  room_id       bigint NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  player_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  stroke        jsonb NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS room_strokes_room_idx ON public.room_strokes (room_id, created_at);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_strokes ENABLE ROW LEVEL SECURITY;

-- Rooms are publicly listable so /play/:code works for anyone.
-- Insertion / closing limited to the host.
DROP POLICY IF EXISTS "Rooms public read" ON public.rooms;
CREATE POLICY "Rooms public read"
  ON public.rooms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated create rooms" ON public.rooms;
CREATE POLICY "Authenticated create rooms"
  ON public.rooms FOR INSERT TO authenticated
  WITH CHECK (host_id = auth.uid());

DROP POLICY IF EXISTS "Host updates room" ON public.rooms;
CREATE POLICY "Host updates room"
  ON public.rooms FOR UPDATE TO authenticated
  USING (host_id = auth.uid()) WITH CHECK (host_id = auth.uid());

-- Strokes are public-read (everyone in the room sees them).
-- Authenticated users can insert their own.
DROP POLICY IF EXISTS "Strokes public read" ON public.room_strokes;
CREATE POLICY "Strokes public read"
  ON public.room_strokes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated stroke insert" ON public.room_strokes;
CREATE POLICY "Authenticated stroke insert"
  ON public.room_strokes FOR INSERT TO authenticated
  WITH CHECK (player_id = auth.uid());
