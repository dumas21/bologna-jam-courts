-- Apply user's corrected functions
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = user_id),
    FALSE
  )
  WHERE user_id IS NOT NULL;
$$;

-- Updated check_message_rate_limit using user_id instead of nickname
CREATE OR REPLACE FUNCTION public.check_message_rate_limit(p_playground_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
  current_user_id uuid := auth.uid();
BEGIN
  -- Se l'utente non è autenticato, non consentiamo l'invio del messaggio
  IF current_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Count messages from this user_id in the last 24 hours for this playground
  SELECT COUNT(*) INTO recent_count
  FROM public.playground_messages
  WHERE playground_id = p_playground_id
    AND user_id = current_user_id
    AND created_at > NOW() - INTERVAL '24 hours';
  
  -- Allow max 2 messages per playground per 24 hours per user
  RETURN recent_count < 2;
END;
$$;

-- Add INSERT policy for playground_messages (authenticated users with rate limit)
CREATE POLICY "Authenticated users can post messages with rate limit"
ON public.playground_messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND check_message_rate_limit(playground_id)
);

-- Add UPDATE policy (users can edit their own messages)
CREATE POLICY "Users can update their own messages"
ON public.playground_messages
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add DELETE policy (users can delete their own messages)
CREATE POLICY "Users can delete their own messages"
ON public.playground_messages
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);