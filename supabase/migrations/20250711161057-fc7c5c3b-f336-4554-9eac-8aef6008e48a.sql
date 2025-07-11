-- Aggiorna il trigger per gestire meglio la conferma email
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Crea una nuova funzione per gestire sia la creazione che la conferma email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Crea il profilo solo se non esiste già e l'email è stata confermata
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crea il trigger che si attiva quando email_confirmed_at cambia da NULL a un valore
CREATE TRIGGER on_auth_user_created
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_user();