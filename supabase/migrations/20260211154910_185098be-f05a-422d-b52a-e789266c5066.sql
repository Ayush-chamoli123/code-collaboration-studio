
-- Drop permissive Clerk policies
DROP POLICY IF EXISTS "Allow all select on rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow all insert on rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow all update on rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow all delete on rooms" ON public.rooms;

DROP POLICY IF EXISTS "Allow all select on room_members" ON public.room_members;
DROP POLICY IF EXISTS "Allow all insert on room_members" ON public.room_members;
DROP POLICY IF EXISTS "Allow all update on room_members" ON public.room_members;
DROP POLICY IF EXISTS "Allow all delete on room_members" ON public.room_members;

DROP POLICY IF EXISTS "Allow all select on chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow all insert on chat_messages" ON public.chat_messages;

DROP POLICY IF EXISTS "Allow all select on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all insert on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all update on profiles" ON public.profiles;

-- Restore original secure RLS policies

-- rooms
CREATE POLICY "Auth users can find rooms by code" ON public.rooms FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can create rooms" ON public.rooms FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Members can update room" ON public.rooms FOR UPDATE USING (is_room_member(id));
CREATE POLICY "Host can delete room" ON public.rooms FOR DELETE USING (auth.uid() = host_id);

-- room_members
CREATE POLICY "Members can view room members" ON public.room_members FOR SELECT USING (is_room_member(room_id));
CREATE POLICY "Auth users can join rooms" ON public.room_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members can update own status" ON public.room_members FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Members can leave rooms" ON public.room_members FOR DELETE USING (auth.uid() = user_id);

-- chat_messages
CREATE POLICY "Members can view messages" ON public.chat_messages FOR SELECT USING (is_room_member(room_id));
CREATE POLICY "Members can send messages" ON public.chat_messages FOR INSERT WITH CHECK (is_room_member(room_id) AND auth.uid() = user_id);

-- profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Room members can view profiles" ON public.profiles FOR SELECT USING (EXISTS (SELECT 1 FROM room_members rm1 JOIN room_members rm2 ON rm1.room_id = rm2.room_id WHERE rm1.user_id = auth.uid() AND rm2.user_id = profiles.user_id));
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
