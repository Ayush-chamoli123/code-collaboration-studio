
-- Drop all existing RLS policies that use auth.uid() since we're moving to Clerk auth

-- rooms policies
DROP POLICY IF EXISTS "Auth users can create rooms" ON public.rooms;
DROP POLICY IF EXISTS "Auth users can find rooms by code" ON public.rooms;
DROP POLICY IF EXISTS "Host can delete room" ON public.rooms;
DROP POLICY IF EXISTS "Members can update room" ON public.rooms;
DROP POLICY IF EXISTS "Members can view rooms" ON public.rooms;

-- room_members policies
DROP POLICY IF EXISTS "Auth users can join rooms" ON public.room_members;
DROP POLICY IF EXISTS "Members can leave rooms" ON public.room_members;
DROP POLICY IF EXISTS "Members can update own status" ON public.room_members;
DROP POLICY IF EXISTS "Members can view room members" ON public.room_members;

-- chat_messages policies
DROP POLICY IF EXISTS "Members can send messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Members can view messages" ON public.chat_messages;

-- profiles policies
DROP POLICY IF EXISTS "Room members can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create permissive policies (Clerk handles auth on frontend, anon key used for DB)
CREATE POLICY "Allow all select on rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Allow all insert on rooms" ON public.rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on rooms" ON public.rooms FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on rooms" ON public.rooms FOR DELETE USING (true);

CREATE POLICY "Allow all select on room_members" ON public.room_members FOR SELECT USING (true);
CREATE POLICY "Allow all insert on room_members" ON public.room_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on room_members" ON public.room_members FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on room_members" ON public.room_members FOR DELETE USING (true);

CREATE POLICY "Allow all select on chat_messages" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Allow all insert on chat_messages" ON public.chat_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all select on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow all insert on profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on profiles" ON public.profiles FOR UPDATE USING (true);
