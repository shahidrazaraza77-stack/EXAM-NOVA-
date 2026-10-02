-- 0. Drop old tables if they exist (Cascade drops foreign keys)
DROP TABLE IF EXISTS public.mock_placement_results CASCADE;
DROP TABLE IF EXISTS public.mock_placement_rounds CASCADE;
DROP TABLE IF EXISTS public.mock_placement_sessions CASCADE;

DROP TABLE IF EXISTS public.mock_results CASCADE;
DROP TABLE IF EXISTS public.mock_round_attempts CASCADE;
DROP TABLE IF EXISTS public.mock_rounds CASCADE;
DROP TABLE IF EXISTS public.mock_placements CASCADE;

-- 1. MOCK PLACEMENTS
CREATE TABLE public.mock_placements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ongoing', 'completed', 'failed', 'selected')),
  final_score INTEGER DEFAULT 0,
  result TEXT CHECK (result IN ('selected', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. MOCK ROUNDS
CREATE TABLE public.mock_rounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mock_id UUID REFERENCES public.mock_placements(id) ON DELETE CASCADE NOT NULL,
  round_type TEXT NOT NULL CHECK (round_type IN ('aptitude', 'coding', 'interview')),
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE (mock_id, round_type)
);

-- 3. MOCK ROUND ATTEMPTS (Attempts per round)
CREATE TABLE public.mock_round_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  round_id UUID REFERENCES public.mock_rounds(id) ON DELETE CASCADE NOT NULL,
  question_id TEXT NOT NULL,
  answer TEXT,
  is_correct BOOLEAN DEFAULT false,
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. MOCK RESULTS (Comprehensive Feedback / Selected probability)
CREATE TABLE public.mock_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mock_id UUID REFERENCES public.mock_placements(id) ON DELETE CASCADE NOT NULL UNIQUE,
  aptitude_score INTEGER DEFAULT 0 CHECK (aptitude_score >= 0 AND aptitude_score <= 100),
  coding_score INTEGER DEFAULT 0 CHECK (coding_score >= 0 AND coding_score <= 100),
  interview_score INTEGER DEFAULT 0 CHECK (interview_score >= 0 AND interview_score <= 100),
  final_score INTEGER DEFAULT 0 CHECK (final_score >= 0 AND final_score <= 100),
  feedback TEXT, -- AI compiled feedback report JSON string
  selected BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 5. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.mock_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_round_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_results ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES

-- Placements
CREATE POLICY "Users can view own placements" ON public.mock_placements
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own placements" ON public.mock_placements
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own placements" ON public.mock_placements
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own placements" ON public.mock_placements
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Rounds
CREATE POLICY "Users can view rounds of own placements" ON public.mock_rounds
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.mock_placements p WHERE p.id = mock_id AND p.user_id = auth.uid())
  );

CREATE POLICY "Users can insert rounds for own placements" ON public.mock_rounds
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.mock_placements p WHERE p.id = mock_id AND p.user_id = auth.uid())
  );

CREATE POLICY "Users can update rounds of own placements" ON public.mock_rounds
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.mock_placements p WHERE p.id = mock_id AND p.user_id = auth.uid())
  );

-- Attempts
CREATE POLICY "Users can view attempts of own rounds" ON public.mock_round_attempts
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.mock_rounds r 
      JOIN public.mock_placements p ON p.id = r.mock_id 
      WHERE r.id = round_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert attempts for own rounds" ON public.mock_round_attempts
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.mock_rounds r 
      JOIN public.mock_placements p ON p.id = r.mock_id 
      WHERE r.id = round_id AND p.user_id = auth.uid()
    )
  );

-- Results
CREATE POLICY "Users can view results of own placements" ON public.mock_results
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.mock_placements p WHERE p.id = mock_id AND p.user_id = auth.uid())
  );

CREATE POLICY "Users can insert results for own placements" ON public.mock_results
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.mock_placements p WHERE p.id = mock_id AND p.user_id = auth.uid())
  );

CREATE POLICY "Users can update results of own placements" ON public.mock_results
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.mock_placements p WHERE p.id = mock_id AND p.user_id = auth.uid())
  );

-- 7. INDEX OPTIMIZATIONS
CREATE INDEX IF NOT EXISTS mock_placements_user_id_idx ON public.mock_placements(user_id);
CREATE INDEX IF NOT EXISTS mock_rounds_mock_id_idx ON public.mock_rounds(mock_id);
CREATE INDEX IF NOT EXISTS mock_round_attempts_round_id_idx ON public.mock_round_attempts(round_id);
CREATE INDEX IF NOT EXISTS mock_results_mock_id_idx ON public.mock_results(mock_id);
