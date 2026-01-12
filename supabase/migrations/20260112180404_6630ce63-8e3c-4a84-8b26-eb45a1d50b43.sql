-- Fix RLS policies con WITH CHECK (true) eccessivamente permissive
-- 1. Profili: Limitare INSERT a utenti autenticati che creano il proprio profilo
DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;
CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- 2. Security logs: Limitare INSERT solo a utenti autenticati (per logging eventi di sicurezza)
DROP POLICY IF EXISTS "System can insert security logs" ON public.security_logs;
CREATE POLICY "Authenticated users can log security events" 
ON public.security_logs 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 3. Aggiungi policy per gestione rate_limits via funzioni DB (con SECURITY DEFINER)
-- Non necessario cambiare RLS dato che l'accesso avviene via funzioni SECURITY DEFINER