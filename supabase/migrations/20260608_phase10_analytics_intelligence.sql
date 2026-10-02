-- 1. ALTER user_analytics TO MATCH PHASE 10 REQUIREMENTS
ALTER TABLE public.user_analytics ADD COLUMN IF NOT EXISTS placement_readiness INTEGER DEFAULT 0 CHECK (placement_readiness >= 0 AND placement_readiness <= 100);
ALTER TABLE public.user_analytics ADD COLUMN IF NOT EXISTS consistency_score INTEGER DEFAULT 0 CHECK (consistency_score >= 0 AND consistency_score <= 100);
ALTER TABLE public.user_analytics ADD COLUMN IF NOT EXISTS engagement_score INTEGER DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100);

-- Make sure user_id references profiles and is unique (if not already unique)
ALTER TABLE public.user_analytics DROP CONSTRAINT IF EXISTS user_analytics_user_id_key;
ALTER TABLE public.user_analytics ADD CONSTRAINT user_analytics_user_id_key UNIQUE (user_id);

-- 2. CREATE company_readiness TABLE
CREATE TABLE IF NOT EXISTS public.company_readiness (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  readiness_score INTEGER DEFAULT 0 CHECK (readiness_score >= 0 AND readiness_score <= 100),
  selection_probability INTEGER DEFAULT 0 CHECK (selection_probability >= 0 AND selection_probability <= 100),
  weak_areas TEXT[] DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id, company_id)
);

-- Enable RLS on company_readiness
ALTER TABLE public.company_readiness ENABLE ROW LEVEL SECURITY;

-- company_readiness policies
DROP POLICY IF EXISTS "Users can view own company readiness" ON public.company_readiness;
CREATE POLICY "Users can view own company readiness" ON public.company_readiness
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own company readiness" ON public.company_readiness;
CREATE POLICY "Users can insert own company readiness" ON public.company_readiness
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own company readiness" ON public.company_readiness;
CREATE POLICY "Users can update own company readiness" ON public.company_readiness
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all company readiness" ON public.company_readiness;
CREATE POLICY "Admins can view all company readiness" ON public.company_readiness
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 3. CREATE ai_recommendations TABLE
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS on ai_recommendations
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;

-- ai_recommendations policies
DROP POLICY IF EXISTS "Users can view own recommendations" ON public.ai_recommendations;
CREATE POLICY "Users can view own recommendations" ON public.ai_recommendations
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own recommendations" ON public.ai_recommendations;
CREATE POLICY "Users can insert own recommendations" ON public.ai_recommendations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own recommendations" ON public.ai_recommendations;
CREATE POLICY "Users can update own recommendations" ON public.ai_recommendations
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own recommendations" ON public.ai_recommendations;
CREATE POLICY "Users can delete own recommendations" ON public.ai_recommendations
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all recommendations" ON public.ai_recommendations;
CREATE POLICY "Admins can view all recommendations" ON public.ai_recommendations
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4. INDEX OPTIMIZATIONS
CREATE INDEX IF NOT EXISTS company_readiness_user_id_idx ON public.company_readiness(user_id);
CREATE INDEX IF NOT EXISTS company_readiness_company_id_idx ON public.company_readiness(company_id);
CREATE INDEX IF NOT EXISTS ai_recommendations_user_id_idx ON public.ai_recommendations(user_id);
