-- Verifica e crea il trigger per la creazione automatica del profilo utente
-- Questo trigger è necessario per permettere il login dopo la conferma email

-- Elimina il trigger esistente se presente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Elimina la funzione esistente se presente  
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Ricrea la funzione per gestire i nuovi utenti
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Crea il profilo solo se non esiste già
  INSERT INTO public.profiles (id, nickname, email, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'User'),
    NEW.email,
    CASE 
      WHEN NEW.email IN ('playgroundjam21@gmail.com', 'admin@playground.com') THEN TRUE
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
    'user_created',
    jsonb_build_object('email', NEW.email, 'created_at', NEW.created_at)
  );
  
  RETURN NEW;
END;
$function$;

-- Ricrea il trigger che si attiva quando un utente conferma l'email
CREATE TRIGGER on_auth_user_created
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_user();