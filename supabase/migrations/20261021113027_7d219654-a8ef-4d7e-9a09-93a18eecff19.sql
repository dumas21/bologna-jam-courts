DROP POLICY IF EXISTS "Anyone can view active check-ins" ON public.field_check_ins;
CREATE POLICY "Users can view own check-ins" ON public.field_check_ins FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all check-ins" ON public.field_check_ins FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.get_active_check_in_counts()
RETURNS TABLE(playground_id text, active_players bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT playground_id, count(*) FROM public.field_check_ins WHERE is_active = true GROUP BY playground_id
$$;
GRANT EXECUTE ON FUNCTION public.get_active_check_in_counts() TO anon, authenticated;