-- Fix function search_path security issue
-- Update trigger_cleanup_old_messages to set search_path
CREATE OR REPLACE FUNCTION public.trigger_cleanup_old_messages()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Clean up old messages occasionally (roughly 1% of the time)
  IF random() < 0.01 THEN
    PERFORM public.cleanup_old_messages();
  END IF;
  RETURN NEW;
END;
$$;

-- Update update_updated_at_column to set search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;