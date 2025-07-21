-- Crea la tabella per gli iscritti alla newsletter
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  source VARCHAR(100) DEFAULT 'website',
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active ON newsletter_subscribers(is_active);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_subscribed_at ON newsletter_subscribers(subscribed_at);

-- RLS (Row Level Security)
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Policy per permettere inserimenti pubblici (per il form di iscrizione)
CREATE POLICY "Allow public newsletter subscription" ON newsletter_subscribers
  FOR INSERT TO anon
  WITH CHECK (true);

-- Policy per permettere agli utenti autenticati di vedere i propri dati
CREATE POLICY "Users can view their own subscription" ON newsletter_subscribers
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'email' = email);

-- Trigger per aggiornare updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_newsletter_subscribers_updated_at
  BEFORE UPDATE ON newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Funzione per disiscrizione sicura
CREATE OR REPLACE FUNCTION unsubscribe_newsletter(subscriber_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE newsletter_subscribers 
  SET is_active = false, 
      unsubscribed_at = NOW(),
      updated_at = NOW()
  WHERE email = subscriber_email AND is_active = true;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';