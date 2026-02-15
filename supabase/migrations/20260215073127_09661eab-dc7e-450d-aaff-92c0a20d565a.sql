
-- Fix all RLS policies: change from RESTRICTIVE to PERMISSIVE

-- 1. room_members policies
DROP POLICY IF EXISTS "Members can view room members" ON public.room_members;
DROP POLICY IF EXISTS "Auth users can join rooms" ON public.room_members;
DROP POLICY IF EXISTS "Members can update own status" ON public.room_members;
DROP POLICY IF EXISTS "Members can leave rooms" ON public.room_members;

CREATE POLICY "Members can view room members" ON public.room_members FOR SELECT TO authenticated USING (is_room_member(room_id));
CREATE POLICY "Auth users can join rooms" ON public.room_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members can update own membership" ON public.room_members FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Members can leave rooms" ON public.room_members FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 2. rooms policies
DROP POLICY IF EXISTS "Auth users can find rooms by code" ON public.rooms;
DROP POLICY IF EXISTS "Auth users can create rooms" ON public.rooms;
DROP POLICY IF EXISTS "Members can update room" ON public.rooms;
DROP POLICY IF EXISTS "Host can delete room" ON public.rooms;

CREATE POLICY "Auth users can find rooms by code" ON public.rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can create rooms" ON public.rooms FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Members can update room" ON public.rooms FOR UPDATE TO authenticated USING (is_room_member(id));
CREATE POLICY "Host can delete room" ON public.rooms FOR DELETE TO authenticated USING (auth.uid() = host_id);

-- 3. chat_messages policies
DROP POLICY IF EXISTS "Members can view messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Members can send messages" ON public.chat_messages;

CREATE POLICY "Members can view messages" ON public.chat_messages FOR SELECT TO authenticated USING (is_room_member(room_id));
CREATE POLICY "Members can send messages" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (is_room_member(room_id) AND auth.uid() = user_id);

-- 4. profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Room members can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Room members can view profiles" ON public.profiles FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM room_members rm1
    JOIN room_members rm2 ON rm1.room_id = rm2.room_id
    WHERE rm1.user_id = auth.uid() AND rm2.user_id = profiles.user_id
  )
);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- 5. whiteboard_actions policies
DROP POLICY IF EXISTS "Members can view whiteboard actions" ON public.whiteboard_actions;
DROP POLICY IF EXISTS "Members can add whiteboard actions" ON public.whiteboard_actions;
DROP POLICY IF EXISTS "Members can delete whiteboard actions" ON public.whiteboard_actions;

CREATE POLICY "Members can view whiteboard actions" ON public.whiteboard_actions FOR SELECT TO authenticated USING (is_room_member(room_id));
CREATE POLICY "Members can add whiteboard actions" ON public.whiteboard_actions FOR INSERT TO authenticated WITH CHECK (is_room_member(room_id) AND auth.uid() = user_id);
CREATE POLICY "Members can delete whiteboard actions" ON public.whiteboard_actions FOR DELETE TO authenticated USING (is_room_member(room_id));
