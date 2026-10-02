-- Migration: Phase 15 AI-First Content Engine

-- 1. APTITUDE QUESTION BANK
CREATE TABLE IF NOT EXISTS public.aptitude_question_bank (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL, -- 'A', 'B', 'C', 'D'
  explanation TEXT,
  difficulty TEXT NOT NULL,
  topic TEXT NOT NULL,
  subtopic TEXT,
  companies TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS
ALTER TABLE public.aptitude_question_bank ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anyone can view aptitude question bank" ON public.aptitude_question_bank;
CREATE POLICY "Anyone can view aptitude question bank" ON public.aptitude_question_bank
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage aptitude question bank" ON public.aptitude_question_bank;
CREATE POLICY "Admins can manage aptitude question bank" ON public.aptitude_question_bank
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- 2. CODING PROBLEM BANK
CREATE TABLE IF NOT EXISTS public.coding_problem_bank (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  constraints TEXT[] DEFAULT '{}'::text[],
  sample_input TEXT,
  sample_output TEXT,
  explanation TEXT,
  companies TEXT[] DEFAULT '{}'::text[],
  starter_code JSONB DEFAULT '{}'::jsonb,
  optimal_solutions JSONB DEFAULT '{}'::jsonb,
  complexity JSONB DEFAULT '{}'::jsonb,
  examples JSONB DEFAULT '[]'::jsonb,
  test_cases JSONB DEFAULT '[]'::jsonb, -- Hidden test cases
  acceptance_rate TEXT DEFAULT '50.0%',
  topic TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS
ALTER TABLE public.coding_problem_bank ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anyone can view coding problem bank" ON public.coding_problem_bank;
CREATE POLICY "Anyone can view coding problem bank" ON public.coding_problem_bank
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage coding problem bank" ON public.coding_problem_bank;
CREATE POLICY "Admins can manage coding problem bank" ON public.coding_problem_bank
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- 3. INTERVIEW QUESTION BANK
CREATE TABLE IF NOT EXISTS public.interview_question_bank (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  category TEXT NOT NULL, -- 'HR', 'Technical', 'Company-Specific'
  difficulty TEXT NOT NULL,
  company TEXT, -- Name of the company if company-specific
  expected_answer TEXT,
  topic TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS
ALTER TABLE public.interview_question_bank ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anyone can view interview question bank" ON public.interview_question_bank;
CREATE POLICY "Anyone can view interview question bank" ON public.interview_question_bank
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage interview question bank" ON public.interview_question_bank;
CREATE POLICY "Admins can manage interview question bank" ON public.interview_question_bank
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- 4. MOCK TEST TEMPLATES
CREATE TABLE IF NOT EXISTS public.mock_test_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  test_type TEXT NOT NULL, -- 'aptitude', 'coding', 'interview'
  difficulty TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 60 NOT NULL,
  questions JSONB DEFAULT '[]'::jsonb, -- Store list of questions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS
ALTER TABLE public.mock_test_templates ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anyone can view mock test templates" ON public.mock_test_templates;
CREATE POLICY "Anyone can view mock test templates" ON public.mock_test_templates
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage mock test templates" ON public.mock_test_templates;
CREATE POLICY "Admins can manage mock test templates" ON public.mock_test_templates
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- 5. STUDY PLANS
CREATE TABLE IF NOT EXISTS public.study_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  target_company TEXT,
  weak_areas TEXT[] DEFAULT '{}'::text[],
  daily_plan JSONB DEFAULT '[]'::jsonb,
  weekly_plan JSONB DEFAULT '[]'::jsonb,
  monthly_plan JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view own study plans" ON public.study_plans;
CREATE POLICY "Users can view own study plans" ON public.study_plans
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage study plans" ON public.study_plans;
CREATE POLICY "Admins can manage study plans" ON public.study_plans
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- 6. AI RECOMMENDATIONS
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recommendations JSONB DEFAULT '[]'::jsonb, -- List of recommendation items
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view own AI recommendations" ON public.ai_recommendations;
CREATE POLICY "Users can view own AI recommendations" ON public.ai_recommendations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage AI recommendations" ON public.ai_recommendations;
CREATE POLICY "Admins can manage AI recommendations" ON public.ai_recommendations
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- 7. INDEXES
CREATE INDEX IF NOT EXISTS aptitude_q_bank_topic_idx ON public.aptitude_question_bank(topic);
CREATE INDEX IF NOT EXISTS coding_p_bank_topic_idx ON public.coding_problem_bank(topic);
CREATE INDEX IF NOT EXISTS interview_q_bank_cat_idx ON public.interview_question_bank(category);
CREATE INDEX IF NOT EXISTS study_plans_user_id_idx ON public.study_plans(user_id);
CREATE INDEX IF NOT EXISTS ai_recs_user_id_idx ON public.ai_recommendations(user_id);
