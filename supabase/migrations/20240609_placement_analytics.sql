-- Migration: Placement Analytics tables
-- Replaces user_analytics with new aggregated schema, adds skill_gap_reports and recommendations

-- 1. Drop old user_analytics (time-series schema replaced by aggregated schema)
DROP TABLE IF EXISTS public.user_analytics CASCADE;

-- 2. USER ANALYTICS (aggregated per-user)
CREATE TABLE public.user_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  resume_score INTEGER DEFAULT 0,
  aptitude_score INTEGER DEFAULT 0,
  coding_score INTEGER DEFAULT 0,
  interview_score INTEGER DEFAULT 0,
  overall_readiness INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analytics"
  ON public.user_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics"
  ON public.user_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics"
  ON public.user_analytics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics"
  ON public.user_analytics FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 3. SKILL GAP REPORTS
CREATE TABLE public.skill_gap_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  weakest_skill TEXT NOT NULL,
  strongest_skill TEXT NOT NULL,
  report JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.skill_gap_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own skill gap reports"
  ON public.skill_gap_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own skill gap reports"
  ON public.skill_gap_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all skill gap reports"
  ON public.skill_gap_reports FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4. RECOMMENDATIONS
CREATE TABLE public.recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recommendations"
  ON public.recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recommendations"
  ON public.recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recommendations"
  ON public.recommendations FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all recommendations"
  ON public.recommendations FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 5. INDEXES
CREATE INDEX IF NOT EXISTS skill_gap_reports_user_id_idx ON public.skill_gap_reports(user_id);
CREATE INDEX IF NOT EXISTS recommendations_user_id_idx ON public.recommendations(user_id);
