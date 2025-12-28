-- ============================================
-- SECURITY FIX: Migrazione per risolvere problemi RLS
-- ============================================

-- 1. RATE_LIMITS: Impedire manipolazione diretta
-- Gli utenti non devono poter inserire/modificare/eliminare rate limits
-- Queste operazioni devono avvenire SOLO via funzioni SECURITY DEFINER

-- Nessuna policy INSERT/UPDATE/DELETE per utenti normali (gestito via funzioni DB)

-- 2. USER_SESSIONS: Restringere le policy
-- Rimuovi la policy ALL troppo permissiva e crea policy specifiche
DROP POLICY IF EXISTS "Users can manage their own sessions" ON public.user_sessions;

-- Solo SELECT per vedere le proprie sessioni (già esiste)
-- CREATE POLICY "Users can view their own sessions" già esiste

-- INSERT solo per sessioni autenticate con user_id corretto
CREATE POLICY "Users can create their own sessions"
ON public.user_sessions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- UPDATE solo per le proprie sessioni, ma non può estendere expires_at oltre 24h
CREATE POLICY "Users can update their own sessions"
ON public.user_sessions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id AND expires_at <= (now() + interval '24 hours'));

-- DELETE solo per le proprie sessioni
CREATE POLICY "Users can delete their own sessions"
ON public.user_sessions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 3. SECURITY_LOGS: Impedire UPDATE e DELETE
-- I log di sicurezza non devono MAI essere modificati o eliminati
CREATE POLICY "No one can update security logs"
ON public.security_logs
FOR UPDATE
USING (false);

CREATE POLICY "No one can delete security logs"
ON public.security_logs
FOR DELETE
USING (false);

-- 4. NEWSLETTER_SUBSCRIBERS: Aggiungere validazione su INSERT
-- Limitare INSERT per prevenire abusi
DROP POLICY IF EXISTS "Allow public newsletter subscription" ON public.newsletter_subscribers;

CREATE POLICY "Allow newsletter subscription with email validation"
ON public.newsletter_subscribers
FOR INSERT
WITH CHECK (
  -- Email deve essere valida (controllo base)
  email ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
  -- Non permettere email duplicate (gestito da unique constraint)
);

-- Aggiungi unique constraint su email se non esiste
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'newsletter_subscribers_email_key'
  ) THEN
    ALTER TABLE public.newsletter_subscribers 
    ADD CONSTRAINT newsletter_subscribers_email_key UNIQUE (email);
  END IF;
END $$;