
-- Drop all existing RESTRICTIVE policies and recreate as PERMISSIVE

-- room_members policies
DROP POLICY IF EXISTS "Members can view room members" ON public.room_members;
DROP POLICY IF EXISTS "Auth users can join rooms" ON public.room_members;
DROP POLICY IF EXISTS "Members can update own status" ON public.room_members;
DROP POLICY IF EXISTS "Members can leave rooms" ON public.room_members;

CREATE POLICY "Members can view room members" ON public.room_members FOR SELECT TO authenticated USING (is_room_member(room_id));
CREATE POLICY "Auth users can join rooms" ON public.room_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members can update own status" ON public.room_members FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Members can leave rooms" ON public.room_members FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- rooms policies
DROP POLICY IF EXISTS "Auth users can find rooms by code" ON public.rooms;
DROP POLICY IF EXISTS "Auth users can create rooms" ON public.rooms;
DROP POLICY IF EXISTS "Members can update room" ON public.rooms;
DROP POLICY IF EXISTS "Host can delete room" ON public.rooms;

CREATE POLICY "Auth users can find rooms by code" ON public.rooms FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can create rooms" ON public.rooms FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Members can update room" ON public.rooms FOR UPDATE TO authenticated USING (is_room_member(id));
CREATE POLICY "Host can delete room" ON public.rooms FOR DELETE TO authenticated USING (auth.uid() = host_id);

-- chat_messages policies
DROP POLICY IF EXISTS "Members can view messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Members can send messages" ON public.chat_messages;

CREATE POLICY "Members can view messages" ON public.chat_messages FOR SELECT TO authenticated USING (is_room_member(room_id));
CREATE POLICY "Members can send messages" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (is_room_member(room_id) AND (auth.uid() = user_id));

-- profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Room members can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Room members can view profiles" ON public.profiles FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM room_members rm1 JOIN room_members rm2 ON rm1.room_id = rm2.room_id WHERE rm1.user_id = auth.uid() AND rm2.user_id = profiles.user_id));
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Create whiteboard_actions table for real-time sync
CREATE TABLE IF NOT EXISTS public.whiteboard_actions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  action_type text NOT NULL,
  action_data jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.whiteboard_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view whiteboard actions" ON public.whiteboard_actions FOR SELECT TO authenticated USING (is_room_member(room_id));
CREATE POLICY "Members can add whiteboard actions" ON public.whiteboard_actions FOR INSERT TO authenticated WITH CHECK (is_room_member(room_id) AND auth.uid() = user_id);
CREATE POLICY "Members can delete whiteboard actions" ON public.whiteboard_actions FOR DELETE TO authenticated USING (is_room_member(room_id));

-- Enable realtime only for new table
ALTER PUBLICATION supabase_realtime ADD TABLE public.whiteboard_actions;

-- Index for performance
CREATE INDEX idx_whiteboard_actions_room ON public.whiteboard_actions(room_id);
CREATE INDEX idx_whiteboard_actions_created ON public.whiteboard_actions(room_id, created_at);
