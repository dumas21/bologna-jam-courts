-- =====================================================================
-- SUPABASE · Trigger e funzione per creare/aggiornare automaticamente
--            la riga su public.profiles quando l'utente conferma l'email
-- Versione stabile · 2025‑07‑07
-- =====================================================================

-- 1️⃣  Rimuovi vecchie versioni (se esistono) ---------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2️⃣  Funzione: public.handle_new_user() -------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
BEGIN
  -- Crea o aggiorna il profilo
  INSERT INTO public.profiles (id, nickname, email, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.email IN ('playgroundjam21@gmail.com', 'admin@playground.com')
  )
  ON CONFLICT (id) DO UPDATE SET
    nickname   = EXCLUDED.nickname,
    email      = EXCLUDED.email,
    is_admin   = EXCLUDED.is_admin,
    updated_at = NOW();

  -- Log (opzionale) nella tabella security_logs se esiste
  INSERT INTO public.security_logs (user_id, event_type, event_data)
  VALUES (
    NEW.id,
    'user_created',
    jsonb_build_object('email', NEW.email, 'created_at', NEW.created_at)
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$func$;

-- 3️⃣  Trigger: dopo conferma email ------------------------------------
CREATE TRIGGER on_auth_user_created
AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW
WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
-- ✅  Salva/rilancia.  Dopo questa operazione:
-- • Quando l'utente clicca il link di conferma e `email_confirmed_at` cambia
--   il trigger inserisce/aggiorna la riga in `public.profiles`.
-- • Login trova il profilo e prosegue senza errori.
-- =====================================================================