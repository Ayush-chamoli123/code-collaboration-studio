
-- Allow any authenticated user to find a room by code (needed for joining)
CREATE POLICY "Auth users can find rooms by code"
ON public.rooms
FOR SELECT
USING (auth.uid() IS NOT NULL);
