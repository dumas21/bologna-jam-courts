-- 1. Fix RLS policies for rate_limits table
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Remove overly permissive policies
DROP POLICY IF EXISTS "System can insert rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "System can update rate limits" ON public.rate_limits;

-- Keep the existing SELECT policy (already exists)
-- Users can only view their own rate limits

-- 2. Update check_rate_limit to use auth.uid() internally
-- This prevents users from manipulating the user_id parameter
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_action_type text,
  p_max_attempts integer,
  p_window_hours integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_count integer;
  v_blocked_until timestamptz;
BEGIN
  -- Reject unauthenticated users
  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if user is blocked
  SELECT blocked_until INTO v_blocked_until
  FROM public.rate_limits
  WHERE user_id = v_user_id
    AND action_type = p_action_type
    AND blocked_until > NOW()
  LIMIT 1;
  
  IF v_blocked_until IS NOT NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Count recent attempts
  SELECT COUNT(*) INTO v_count
  FROM public.rate_limits
  WHERE user_id = v_user_id
    AND action_type = p_action_type
    AND window_start > NOW() - (p_window_hours || ' hours')::interval;
  
  RETURN v_count < p_max_attempts;
END;
$$;

-- 3. Update record_rate_limit_attempt to use auth.uid() internally
CREATE OR REPLACE FUNCTION public.record_rate_limit_attempt(
  p_action_type text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  -- Do nothing for unauthenticated users
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.rate_limits (user_id, action_type, window_start, count)
  VALUES (v_user_id, p_action_type, NOW(), 1)
  ON CONFLICT (user_id, action_type, window_start)
  DO UPDATE SET count = rate_limits.count + 1;
END;
$$;

-- 4. Create global_config table for server-side configuration
CREATE TABLE IF NOT EXISTS public.global_config (
    key text PRIMARY KEY,
    value jsonb NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.global_config ENABLE ROW LEVEL SECURITY;

-- Only admins can manage global config
CREATE POLICY "Admins can manage global config"
ON public.global_config
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert admin emails configuration
INSERT INTO public.global_config (key, value)
VALUES ('admin_emails', '["playgroundjam21@gmail.com", "admin@playground.com", "bergami.matteo@gmail.com"]'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- 5. Update handle_new_user trigger to use global_config
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_emails_json jsonb;
  is_admin_email boolean := false;
BEGIN
  -- Create profile only if email is confirmed
  IF NEW.email_confirmed_at IS NOT NULL AND (OLD.email_confirmed_at IS NULL OR OLD IS NULL) THEN
    -- Create profile
    INSERT INTO public.profiles (id, nickname, email)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'username', 'User'),
      NEW.email
    )
    ON CONFLICT (id) DO UPDATE SET
      nickname = COALESCE(NEW.raw_user_meta_data->>'username', profiles.nickname),
      email = NEW.email,
      updated_at = NOW();
    
    -- Get admin emails from global_config
    SELECT value INTO admin_emails_json
    FROM public.global_config
    WHERE key = 'admin_emails';
    
    -- Check if email is in admin list using jsonb ? operator
    IF admin_emails_json ? NEW.email THEN
      is_admin_email := true;
    END IF;
    
    -- Assign role based on email (server-side check)
    IF is_admin_email THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'admin'::app_role)
      ON CONFLICT DO NOTHING;
    ELSE
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'user'::app_role)
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- Log security event
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