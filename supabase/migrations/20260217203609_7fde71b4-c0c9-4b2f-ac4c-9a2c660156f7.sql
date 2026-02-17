
-- ============================================
-- TABLE: field_check_ins (check-in real-time)
-- ============================================
CREATE TABLE public.field_check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  playground_id text NOT NULL,
  checked_in_at timestamptz NOT NULL DEFAULT now(),
  checked_out_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.field_check_ins ENABLE ROW LEVEL SECURITY;

-- Everyone can see active check-ins (for player counts)
CREATE POLICY "Anyone can view active check-ins"
  ON public.field_check_ins FOR SELECT
  USING (true);

-- Auth users can check in
CREATE POLICY "Auth users can check in"
  ON public.field_check_ins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update (check out) their own check-ins
CREATE POLICY "Users can update own check-ins"
  ON public.field_check_ins FOR UPDATE
  USING (auth.uid() = user_id);

-- No deletes
CREATE POLICY "No deletes on check-ins"
  ON public.field_check_ins FOR DELETE
  USING (false);

-- Auto-expire check-ins after 2 hours
CREATE OR REPLACE FUNCTION public.expire_old_check_ins()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.field_check_ins
  SET is_active = false, checked_out_at = now()
  WHERE is_active = true
    AND checked_in_at < now() - INTERVAL '2 hours';
END;
$$;

-- Index for fast active check-in queries
CREATE INDEX idx_check_ins_active ON public.field_check_ins (playground_id, is_active) WHERE is_active = true;
CREATE INDEX idx_check_ins_user ON public.field_check_ins (user_id, is_active) WHERE is_active = true;

-- ============================================
-- TABLE: playground_ratings (post-visit rating)
-- ============================================
CREATE TABLE public.playground_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  playground_id text NOT NULL,
  court_condition smallint NOT NULL CHECK (court_condition BETWEEN 1 AND 5),
  hoops_quality smallint NOT NULL CHECK (hoops_quality BETWEEN 1 AND 5),
  cleanliness smallint NOT NULL CHECK (cleanliness BETWEEN 1 AND 5),
  atmosphere smallint NOT NULL CHECK (atmosphere BETWEEN 1 AND 5),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.playground_ratings ENABLE ROW LEVEL SECURITY;

-- Everyone can view ratings
CREATE POLICY "Anyone can view ratings"
  ON public.playground_ratings FOR SELECT
  USING (true);

-- Auth users can insert ratings
CREATE POLICY "Auth users can rate"
  ON public.playground_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own ratings
CREATE POLICY "Users can update own ratings"
  ON public.playground_ratings FOR UPDATE
  USING (auth.uid() = user_id);

-- No deletes except admin
CREATE POLICY "Only admins can delete ratings"
  ON public.playground_ratings FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_ratings_playground ON public.playground_ratings (playground_id);
CREATE INDEX idx_ratings_user ON public.playground_ratings (user_id);

-- ============================================
-- TABLE: user_favorites
-- ============================================
CREATE TABLE public.user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  playground_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, playground_id)
);

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON public.user_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON public.user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites"
  ON public.user_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Enable Realtime on check-ins
ALTER PUBLICATION supabase_realtime ADD TABLE public.field_check_ins;
