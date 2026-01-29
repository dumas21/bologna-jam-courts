-- =============================================
-- SECURITY HARDENING MIGRATION
-- =============================================

-- 1. FIX PROFILES TABLE: Add explicit auth requirement for SELECT
-- Drop existing policies and recreate with explicit auth checks
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Recreate with explicit auth.uid() IS NOT NULL check
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- 2. FIX NEWSLETTER_SUBSCRIBERS TABLE: Strengthen RLS policies
-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.newsletter_subscribers;

-- Create stricter SELECT policy requiring authentication
CREATE POLICY "Authenticated users can view their own subscription" 
ON public.newsletter_subscribers 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND (auth.jwt() ->> 'email')::text = email::text);

-- Create admin-only policy for viewing all subscriptions
CREATE POLICY "Admins can view all newsletter subscriptions" 
ON public.newsletter_subscribers 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- Add UPDATE policy for users to manage their own subscription
CREATE POLICY "Users can update their own subscription" 
ON public.newsletter_subscribers 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND (auth.jwt() ->> 'email')::text = email::text)
WITH CHECK (auth.uid() IS NOT NULL AND (auth.jwt() ->> 'email')::text = email::text);

-- Add DELETE policy for users to remove their subscription (GDPR compliance)
CREATE POLICY "Users can delete their own subscription" 
ON public.newsletter_subscribers 
FOR DELETE 
USING (auth.uid() IS NOT NULL AND (auth.jwt() ->> 'email')::text = email::text);

-- Admin can also manage all subscriptions
CREATE POLICY "Admins can update all subscriptions" 
ON public.newsletter_subscribers 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete subscriptions" 
ON public.newsletter_subscribers 
FOR DELETE 
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- 3. FIX RATE_LIMITS TABLE: Add proper INSERT/UPDATE/DELETE policies
-- Only system functions should manage rate limits (via SECURITY DEFINER)
-- Users should NOT be able to manipulate their own rate limits

-- Add explicit denial policies for rate_limits manipulation
CREATE POLICY "No direct INSERT on rate_limits" 
ON public.rate_limits 
FOR INSERT 
WITH CHECK (false);

CREATE POLICY "No direct UPDATE on rate_limits" 
ON public.rate_limits 
FOR UPDATE 
USING (false);

CREATE POLICY "No direct DELETE on rate_limits" 
ON public.rate_limits 
FOR DELETE 
USING (false);

-- 4. Add IP-based rate limiting for newsletter (anonymous users)
-- Create a function for IP-based rate limiting for newsletter
CREATE OR REPLACE FUNCTION public.check_newsletter_rate_limit(p_ip_address inet)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Count subscriptions from this IP in the last hour
  SELECT COUNT(*) INTO recent_count
  FROM public.newsletter_subscribers
  WHERE ip_address = p_ip_address
    AND created_at > NOW() - INTERVAL '1 hour';
  
  -- Allow max 3 subscriptions per IP per hour
  RETURN recent_count < 3;
END;
$$;

-- 5. Grant execute permission on the new function
GRANT EXECUTE ON FUNCTION public.check_newsletter_rate_limit(inet) TO anon, authenticated;