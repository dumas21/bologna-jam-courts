DROP POLICY IF EXISTS "Anyone can view ratings" ON public.playground_ratings;
CREATE POLICY "Users can view own ratings" ON public.playground_ratings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all ratings" ON public.playground_ratings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.get_playground_rating_summary()
RETURNS TABLE(playground_id text, rating_count bigint, avg_court_condition numeric, avg_hoops_quality numeric, avg_cleanliness numeric, avg_atmosphere numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT playground_id, count(*), avg(court_condition), avg(hoops_quality), avg(cleanliness), avg(atmosphere)
  FROM public.playground_ratings GROUP BY playground_id
$$;
GRANT EXECUTE ON FUNCTION public.get_playground_rating_summary() TO anon, authenticated;