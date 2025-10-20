-- Clean up messages with NULL user_id (old/test data)
DELETE FROM public.playground_messages WHERE user_id IS NULL;

-- Now make user_id NOT NULL to ensure data integrity
ALTER TABLE public.playground_messages 
ALTER COLUMN user_id SET NOT NULL;

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Authenticated users can post messages with rate limit" ON public.playground_messages;

-- Create improved INSERT policy with explicit NULL check
CREATE POLICY "Authenticated users can post messages with rate limit"
ON public.playground_messages
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id 
  AND check_message_rate_limit(playground_id)
);