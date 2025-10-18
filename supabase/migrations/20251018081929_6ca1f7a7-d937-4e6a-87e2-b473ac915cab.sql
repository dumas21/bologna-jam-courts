-- Aggiungi colonna data_consent_accepted alla tabella profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS data_consent_accepted BOOLEAN DEFAULT FALSE;

-- Aggiorna il trigger handle_new_user per impostare automaticamente il consenso a TRUE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_emails_json jsonb;
  is_admin_email boolean := false;
BEGIN
  -- Create profile only if email is confirmed
  IF NEW.email_confirmed_at IS NOT NULL AND (OLD.email_confirmed_at IS NULL OR OLD IS NULL) THEN
    -- Create profile with data_consent_accepted = TRUE (user accepted during registration)
    INSERT INTO public.profiles (id, nickname, email, data_consent_accepted)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'username', 'User'),
      NEW.email,
      TRUE
    )
    ON CONFLICT (id) DO UPDATE SET
      nickname = COALESCE(NEW.raw_user_meta_data->>'username', profiles.nickname),
      email = NEW.email,
      data_consent_accepted = TRUE,
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
      jsonb_build_object('email', NEW.email, 'confirmed_at', NEW.email_confirmed_at, 'data_consent_accepted', TRUE)
    );
  END IF;
  
  RETURN NEW;
END;
$$;