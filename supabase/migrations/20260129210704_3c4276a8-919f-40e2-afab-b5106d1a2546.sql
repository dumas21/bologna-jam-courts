-- =============================================
-- FIX PLAYGROUND_MESSAGES PUBLIC ACCESS
-- =============================================

-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view playground messages" ON public.playground_messages;

-- Create a new policy that requires authentication to view messages
CREATE POLICY "Authenticated users can view playground messages" 
ON public.playground_messages 
FOR SELECT 
USING (auth.uid() IS NOT NULL);