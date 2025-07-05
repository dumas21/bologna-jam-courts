
-- Aggiorna la tabella profiles per supportare username univoci
ALTER TABLE public.profiles 
ADD COLUMN username text UNIQUE;

-- Aggiorna la constraint per username
ALTER TABLE public.profiles 
ADD CONSTRAINT username_length_check 
CHECK (char_length(username) BETWEEN 3 AND 20);

-- Crea tabella per newsletter subscribers GDPR-compliant
CREATE TABLE public.newsletter_subscribers (
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  consented boolean NOT NULL DEFAULT false,
  consented_at timestamptz,
  consent_ip inet,
  privacy_version text,
  unsubscribe_token text PRIMARY KEY DEFAULT encode(gen_random_bytes(16), 'hex')
);

-- Abilita RLS per newsletter_subscribers
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Policy per gestire propri dati newsletter
CREATE POLICY "User manages own newsletter subscription"
  ON public.newsletter_subscribers 
  FOR SELECT, UPDATE
  USING (auth.uid() = user_id);

-- Policy per inserimento newsletter (durante registrazione)
CREATE POLICY "Users can insert own newsletter subscription"
  ON public.newsletter_subscribers 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Funzione per login con username
CREATE OR REPLACE FUNCTION public.get_user_by_username(username_input text)
RETURNS TABLE(user_id uuid, email text)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT p.id, p.email
  FROM public.profiles p
  WHERE p.username = username_input;
$$;
