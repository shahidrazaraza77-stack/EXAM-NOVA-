-- 15. MOCK PLACEMENT PROCESS TABLES
CREATE TABLE IF NOT EXISTS public.mock_placement_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('started', 'in_progress', 'completed', 'failed')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.mock_placement_rounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.mock_placement_sessions(id) ON DELETE CASCADE NOT NULL,
  round_name TEXT NOT NULL CHECK (round_name IN ('Aptitude', 'Coding', 'Technical', 'HR')),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE (session_id, round_name)
);

CREATE TABLE IF NOT EXISTS public.mock_placement_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.mock_placement_sessions(id) ON DELETE CASCADE NOT NULL UNIQUE,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  result TEXT NOT NULL CHECK (result IN ('Selected', 'Borderline', 'Not Selected')),
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  feedback JSONB DEFAULT '{}'::jsonb, -- detailed AI analysis, improvement areas, preparation strategy
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.mock_placement_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_placement_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_placement_results ENABLE ROW LEVEL SECURITY;

-- mock_placement_sessions policies
DROP POLICY IF EXISTS "Users can view own placement sessions" ON public.mock_placement_sessions;
CREATE POLICY "Users can view own placement sessions" ON public.mock_placement_sessions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own placement sessions" ON public.mock_placement_sessions;
CREATE POLICY "Users can create own placement sessions" ON public.mock_placement_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own placement sessions" ON public.mock_placement_sessions;
CREATE POLICY "Users can update own placement sessions" ON public.mock_placement_sessions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all placement sessions" ON public.mock_placement_sessions;
CREATE POLICY "Admins can view all placement sessions" ON public.mock_placement_sessions
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- mock_placement_rounds policies
DROP POLICY IF EXISTS "Users can view own placement rounds" ON public.mock_placement_rounds;
CREATE POLICY "Users can view own placement rounds" ON public.mock_placement_rounds
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.mock_placement_sessions 
    WHERE id = session_id AND user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can manage own placement rounds" ON public.mock_placement_rounds;
CREATE POLICY "Users can manage own placement rounds" ON public.mock_placement_rounds
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.mock_placement_sessions 
    WHERE id = session_id AND user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Admins can manage all placement rounds" ON public.mock_placement_rounds;
CREATE POLICY "Admins can manage all placement rounds" ON public.mock_placement_rounds
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- mock_placement_results policies
DROP POLICY IF EXISTS "Users can view own placement results" ON public.mock_placement_results;
CREATE POLICY "Users can view own placement results" ON public.mock_placement_results
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.mock_placement_sessions 
    WHERE id = session_id AND user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can manage own placement results" ON public.mock_placement_results;
CREATE POLICY "Users can manage own placement results" ON public.mock_placement_results
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.mock_placement_sessions 
    WHERE id = session_id AND user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Admins can manage all placement results" ON public.mock_placement_results;
CREATE POLICY "Admins can manage all placement results" ON public.mock_placement_results
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Index optimizations
CREATE INDEX IF NOT EXISTS mock_placement_sessions_user_id_idx ON public.mock_placement_sessions(user_id);
CREATE INDEX IF NOT EXISTS mock_placement_rounds_session_id_idx ON public.mock_placement_rounds(session_id);
CREATE INDEX IF NOT EXISTS mock_placement_results_session_id_idx ON public.mock_placement_results(session_id);
