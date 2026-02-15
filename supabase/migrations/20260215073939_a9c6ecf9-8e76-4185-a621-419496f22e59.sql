-- Fix chicken-and-egg: users need to SELECT their own row for upsert to work
-- Add policy so users can always see their own membership row
CREATE POLICY "Users can view own membership"
ON public.room_members FOR SELECT TO authenticated
USING (auth.uid() = user_id);