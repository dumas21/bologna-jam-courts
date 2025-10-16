-- Add fixed search_path to all SECURITY DEFINER functions
-- This prevents search_path manipulation attacks

-- Fix is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = user_id),
    FALSE
  );
$$;

-- Fix check_message_rate_limit function
CREATE OR REPLACE FUNCTION public.check_message_rate_limit(p_playground_id text, p_nickname text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Fix cleanup_old_messages function
CREATE OR REPLACE FUNCTION public.cleanup_old_messages()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.playground_messages 
  WHERE created_at < NOW() - INTERVAL '72 hours';
END;
$$;

-- Fix log_security_event function
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id uuid,
  p_event_type text,
  p_event_data jsonb DEFAULT NULL::jsonb,
  p_ip_address inet DEFAULT NULL::inet,
  p_user_agent text DEFAULT NULL::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.security_logs (user_id, event_type, event_data, ip_address, user_agent)
  VALUES (p_user_id, p_event_type, p_event_data, p_ip_address, p_user_agent)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Fix unsubscribe_newsletter function
CREATE OR REPLACE FUNCTION public.unsubscribe_newsletter(subscriber_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE newsletter_subscribers 
  SET is_active = false, 
      unsubscribed_at = NOW(),
      updated_at = NOW()
  WHERE email = subscriber_email AND is_active = true;
  
  RETURN FOUND;
END;
$$;