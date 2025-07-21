-- Fix security warnings by adding search_path to all functions
-- This prevents search path manipulation attacks

-- Update the function with proper security settings
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, auth
AS $$
BEGIN
  -- Crea il profilo solo se non esiste già e l'email è stata confermata
  IF NEW.email_confirmed_at IS NOT NULL AND (OLD.email_confirmed_at IS NULL OR OLD IS NULL) THEN
    INSERT INTO public.profiles (id, nickname, email, is_admin)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'username', 'User'),
      NEW.email,
      CASE 
        WHEN NEW.email IN ('playgroundjam21@gmail.com', 'admin@playground.com', 'bergami.matteo@gmail.com') THEN TRUE
        ELSE FALSE
      END
    )
    ON CONFLICT (id) DO UPDATE SET
      nickname = COALESCE(NEW.raw_user_meta_data->>'username', profiles.nickname),
      email = NEW.email,
      updated_at = NOW();
    
    -- Log la creazione del nuovo utente
    INSERT INTO public.security_logs (user_id, event_type, event_data)
    VALUES (
      NEW.id,
      'user_email_confirmed',
      jsonb_build_object('email', NEW.email, 'confirmed_at', NEW.email_confirmed_at)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_user();

-- Update other functions with proper search_path
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

CREATE OR REPLACE FUNCTION public.log_security_event(p_user_id uuid, p_event_type text, p_event_data jsonb DEFAULT NULL::jsonb, p_ip_address inet DEFAULT NULL::inet, p_user_agent text DEFAULT NULL::text)
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