-- Migration: Add resume_analysis table for AI-powered resume analysis results
-- Also adds admin access policies for both resumes and resume_analysis

-- 1. RESUME ANALYSIS TABLE
CREATE TABLE IF NOT EXISTS public.resume_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
  ats_score INTEGER,
  strengths JSONB DEFAULT '[]'::jsonb,
  weaknesses JSONB DEFAULT '[]'::jsonb,
  missing_keywords JSONB DEFAULT '[]'::jsonb,
  suggestions JSONB DEFAULT '[]'::jsonb,
  overall_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.resume_analysis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own resume analysis" ON public.resume_analysis;
CREATE POLICY "Users can view their own resume analysis"
  ON public.resume_analysis FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.resumes WHERE id = resume_id AND user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert resume analysis" ON public.resume_analysis;
CREATE POLICY "Users can insert resume analysis"
  ON public.resume_analysis FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.resumes WHERE id = resume_id AND user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update their own resume analysis" ON public.resume_analysis;
CREATE POLICY "Users can update their own resume analysis"
  ON public.resume_analysis FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.resumes WHERE id = resume_id AND user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete their own resume analysis" ON public.resume_analysis;
CREATE POLICY "Users can delete their own resume analysis"
  ON public.resume_analysis FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.resumes WHERE id = resume_id AND user_id = auth.uid()
  ));

-- 2. Admin access policies for both tables
DROP POLICY IF EXISTS "Admins can view all resumes" ON public.resumes;
CREATE POLICY "Admins can view all resumes"
  ON public.resumes FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can view all resume analysis" ON public.resume_analysis;
CREATE POLICY "Admins can view all resume analysis"
  ON public.resume_analysis FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 3. Index for faster lookups
CREATE INDEX IF NOT EXISTS resume_analysis_resume_id_idx ON public.resume_analysis(resume_id);
