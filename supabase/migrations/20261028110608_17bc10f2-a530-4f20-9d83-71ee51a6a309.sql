ALTER TABLE public.playground_suggestions
  ADD COLUMN IF NOT EXISTS has_water boolean,
  ADD COLUMN IF NOT EXISTS has_parking boolean,
  ADD COLUMN IF NOT EXISTS has_bike_parking boolean;

CREATE OR REPLACE FUNCTION public.get_approved_amenities()
RETURNS TABLE(playground_id text, has_lighting boolean, has_water boolean, has_parking boolean, has_bike_parking boolean, avg_stars numeric, stars_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  WITH a AS (SELECT * FROM public.playground_suggestions WHERE status = 'approved')
  SELECT p.pid,
    (SELECT x.has_lighting FROM a x WHERE x.playground_id = p.pid AND x.has_lighting IS NOT NULL ORDER BY x.reviewed_at DESC NULLS LAST LIMIT 1),
    (SELECT x.has_water FROM a x WHERE x.playground_id = p.pid AND x.has_water IS NOT NULL ORDER BY x.reviewed_at DESC NULLS LAST LIMIT 1),
    (SELECT x.has_parking FROM a x WHERE x.playground_id = p.pid AND x.has_parking IS NOT NULL ORDER BY x.reviewed_at DESC NULLS LAST LIMIT 1),
    (SELECT x.has_bike_parking FROM a x WHERE x.playground_id = p.pid AND x.has_bike_parking IS NOT NULL ORDER BY x.reviewed_at DESC NULLS LAST LIMIT 1),
    (SELECT round(avg(x.stars)::numeric, 1) FROM a x WHERE x.playground_id = p.pid AND x.stars IS NOT NULL),
    (SELECT count(*) FROM a x WHERE x.playground_id = p.pid AND x.stars IS NOT NULL)
  FROM (SELECT DISTINCT a.playground_id AS pid FROM a) p;
$$;

GRANT EXECUTE ON FUNCTION public.get_approved_amenities() TO anon, authenticated;