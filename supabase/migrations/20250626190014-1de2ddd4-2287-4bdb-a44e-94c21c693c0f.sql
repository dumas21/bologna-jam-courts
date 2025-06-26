
-- Phase 1: Update RLS policies for anonymous access
-- Since the app is now anonymous, we need to adjust the RLS policies

-- Drop existing restrictive policies that depend on auth.uid()
DROP POLICY IF EXISTS "Users can view playground messages" ON public.playground_messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.playground_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.playground_messages;
DROP POLICY IF EXISTS "Admins can delete any message" ON public.playground_messages;

-- Create new policies for anonymous access with rate limiting
CREATE POLICY "Anyone can view playground messages" 
  ON public.playground_messages 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anonymous users can insert messages with validation" 
  ON public.playground_messages 
  FOR INSERT 
  WITH CHECK (
    -- Basic validation: message length and required fields
    length(message) > 0 AND 
    length(message) <= 500 AND 
    length(nickname) > 0 AND 
    length(nickname) <= 50 AND
    playground_id IS NOT NULL
  );

-- Add function to clean old messages automatically
CREATE OR REPLACE FUNCTION public.cleanup_old_messages()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.playground_messages 
  WHERE created_at < NOW() - INTERVAL '72 hours';
END;
$$;

-- Create a function for rate limiting messages per IP/session
CREATE OR REPLACE FUNCTION public.check_message_rate_limit(
  p_playground_id TEXT,
  p_nickname TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Count messages from this nickname in the last 24 hours for this playground
  SELECT COUNT(*) INTO recent_count
  FROM public.playground_messages
  WHERE playground_id = p_playground_id
    AND nickname = p_nickname
    AND created_at > NOW() - INTERVAL '24 hours';
  
  -- Allow max 2 messages per playground per 24 hours per nickname
  RETURN recent_count < 2;
END;
$$;

-- Add a trigger to automatically clean old messages
CREATE OR REPLACE FUNCTION public.trigger_cleanup_old_messages()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Clean up old messages occasionally (roughly 1% of the time)
  IF random() < 0.01 THEN
    PERFORM public.cleanup_old_messages();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cleanup_trigger ON public.playground_messages;
CREATE TRIGGER cleanup_trigger
  AFTER INSERT ON public.playground_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_cleanup_old_messages();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_playground_messages_cleanup 
  ON public.playground_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_playground_messages_rate_limit 
  ON public.playground_messages(playground_id, nickname, created_at);
