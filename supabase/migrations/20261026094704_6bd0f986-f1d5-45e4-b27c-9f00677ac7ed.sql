CREATE TABLE public.playground_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  playground_id text NOT NULL,
  stars smallint,
  has_lighting boolean,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.playground_suggestions TO authenticated;
GRANT ALL ON public.playground_suggestions TO service_role;
ALTER TABLE public.playground_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own pending suggestions" ON public.playground_suggestions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Users view own suggestions" ON public.playground_suggestions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all suggestions" ON public.playground_suggestions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update suggestions" ON public.playground_suggestions
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete suggestions" ON public.playground_suggestions
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.validate_playground_suggestion()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.stars IS NOT NULL AND (NEW.stars < 1 OR NEW.stars > 5) THEN RAISE EXCEPTION 'stars must be 1-5'; END IF;
  IF NEW.status NOT IN ('pending','approved','rejected') THEN RAISE EXCEPTION 'invalid status'; END IF;
  IF NEW.notes IS NOT NULL AND length(NEW.notes) > 500 THEN RAISE EXCEPTION 'notes too long'; END IF;
  IF NEW.stars IS NULL AND NEW.has_lighting IS NULL AND coalesce(trim(NEW.notes),'') = '' THEN RAISE EXCEPTION 'empty suggestion'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER validate_playground_suggestion BEFORE INSERT OR UPDATE ON public.playground_suggestions
  FOR EACH ROW EXECUTE FUNCTION public.validate_playground_suggestion();
CREATE TRIGGER update_playground_suggestions_updated_at BEFORE UPDATE ON public.playground_suggestions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.get_approved_lighting()
RETURNS TABLE(playground_id text, has_lighting boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT DISTINCT ON (s.playground_id) s.playground_id, s.has_lighting
  FROM public.playground_suggestions s
  WHERE s.status = 'approved' AND s.has_lighting IS NOT NULL
  ORDER BY s.playground_id, s.reviewed_at DESC NULLS LAST
$$;
GRANT EXECUTE ON FUNCTION public.get_approved_lighting() TO anon, authenticated;