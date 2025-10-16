-- 1. CREATE ROLE ENUM
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. CREATE USER_ROLES TABLE
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. MIGRATE EXISTING ADMIN DATA
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM public.profiles
WHERE is_admin = true;

-- 4. CREATE SECURE has_role FUNCTION
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 5. CREATE RATE LIMITS TABLE FOR SERVER-SIDE RATE LIMITING
CREATE TABLE public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  count integer DEFAULT 1,
  window_start timestamptz DEFAULT now(),
  blocked_until timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, action_type, window_start)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- 6. CREATE SERVER-SIDE RATE LIMIT CHECK FUNCTION
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id uuid,
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
  v_count integer;
  v_blocked_until timestamptz;
BEGIN
  -- Check if user is blocked
  SELECT blocked_until INTO v_blocked_until
  FROM public.rate_limits
  WHERE user_id = p_user_id 
    AND action_type = p_action_type
    AND blocked_until > NOW()
  LIMIT 1;
  
  IF v_blocked_until IS NOT NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Count recent attempts
  SELECT COUNT(*) INTO v_count
  FROM public.rate_limits
  WHERE user_id = p_user_id
    AND action_type = p_action_type
    AND window_start > NOW() - (p_window_hours || ' hours')::interval;
  
  RETURN v_count < p_max_attempts;
END;
$$;

-- 7. CREATE FUNCTION TO RECORD RATE LIMIT ATTEMPT
CREATE OR REPLACE FUNCTION public.record_rate_limit_attempt(
  p_user_id uuid,
  p_action_type text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.rate_limits (user_id, action_type, window_start, count)
  VALUES (p_user_id, p_action_type, NOW(), 1)
  ON CONFLICT (user_id, action_type, window_start)
  DO UPDATE SET count = rate_limits.count + 1;
END;
$$;

-- 8. UPDATE RLS POLICIES TO USE has_role

-- Drop old is_admin based policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view security logs" ON public.security_logs;

-- Create new role-based policies
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view security logs"
ON public.security_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add policies for rate_limits table
CREATE POLICY "Users can view their own rate limits"
ON public.rate_limits
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "System can insert rate limits"
ON public.rate_limits
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update rate limits"
ON public.rate_limits
FOR UPDATE
USING (true);

-- 9. UPDATE handle_new_user TRIGGER TO ASSIGN DEFAULT ROLE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_emails text[] := ARRAY['playgroundjam21@gmail.com', 'admin@playground.com', 'bergami.matteo@gmail.com'];
BEGIN
  -- Crea il profilo solo se non esiste già e l'email è stata confermata
  IF NEW.email_confirmed_at IS NOT NULL AND (OLD.email_confirmed_at IS NULL OR OLD IS NULL) THEN
    -- Create profile WITHOUT is_admin
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
    
    -- Assign role based on email (server-side check)
    IF NEW.email = ANY(admin_emails) THEN
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

-- 10. REMOVE is_admin COLUMN FROM profiles (after data migration)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS is_admin;

-- 11. DROP OLD is_admin FUNCTION
DROP FUNCTION IF EXISTS public.is_admin(uuid);