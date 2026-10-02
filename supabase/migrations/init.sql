-- 1. PROFILES TABLE (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin', 'content_manager')),
  target_role TEXT,
  target_company TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Trigger to automatically sync profiles on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', SPLIT_PART(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. RESUMES TABLE
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  score INTEGER,
  feedback JSONB,
  parsed_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own resumes" ON public.resumes;
CREATE POLICY "Users can view their own resumes"
  ON public.resumes FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own resumes" ON public.resumes;
CREATE POLICY "Users can insert their own resumes"
  ON public.resumes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own resumes" ON public.resumes;
CREATE POLICY "Users can update their own resumes"
  ON public.resumes FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own resumes" ON public.resumes;
CREATE POLICY "Users can delete their own resumes"
  ON public.resumes FOR DELETE
  USING (auth.uid() = user_id);

-- 4. APTITUDE TOPICS
CREATE TABLE IF NOT EXISTS public.aptitude_topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL, -- 'quantitative', 'logical', 'verbal', 'data-interpretation'
  icon TEXT, -- Lucide icon component name
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.aptitude_topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read aptitude topics" ON public.aptitude_topics;
CREATE POLICY "Anyone can read aptitude topics"
  ON public.aptitude_topics FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage topics" ON public.aptitude_topics;
CREATE POLICY "Admins can manage topics"
  ON public.aptitude_topics FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 5. APTITUDE QUESTIONS BANK
CREATE TABLE IF NOT EXISTS public.aptitude_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES public.aptitude_topics(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  explanation TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  companies TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.aptitude_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read aptitude questions" ON public.aptitude_questions;
CREATE POLICY "Anyone can read aptitude questions"
  ON public.aptitude_questions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage questions" ON public.aptitude_questions;
CREATE POLICY "Admins can manage questions"
  ON public.aptitude_questions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 5b. APTITUDE ATTEMPTS (For individual questions practice)
CREATE TABLE IF NOT EXISTS public.aptitude_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.aptitude_questions(id) ON DELETE CASCADE NOT NULL,
  selected_answer TEXT NOT NULL CHECK (selected_answer IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN NOT NULL,
  time_taken INTEGER NOT NULL, -- in seconds
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.aptitude_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own attempts" ON public.aptitude_attempts;
CREATE POLICY "Users can view their own attempts"
  ON public.aptitude_attempts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can record their own attempts" ON public.aptitude_attempts;
CREATE POLICY "Users can record their own attempts"
  ON public.aptitude_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5c. APTITUDE BOOKMARKS
CREATE TABLE IF NOT EXISTS public.aptitude_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.aptitude_questions(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE (user_id, question_id)
);

ALTER TABLE public.aptitude_bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.aptitude_bookmarks;
CREATE POLICY "Users can view their own bookmarks"
  ON public.aptitude_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own bookmarks" ON public.aptitude_bookmarks;
CREATE POLICY "Users can manage their own bookmarks"
  ON public.aptitude_bookmarks FOR ALL
  USING (auth.uid() = user_id);

-- 5d. APTITUDE TESTS (Timed / Mock tests)
CREATE TABLE IF NOT EXISTS public.aptitude_tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.aptitude_tests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view tests" ON public.aptitude_tests;
CREATE POLICY "Anyone can view tests"
  ON public.aptitude_tests FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage tests" ON public.aptitude_tests;
CREATE POLICY "Admins can manage tests"
  ON public.aptitude_tests FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 5e. TEST QUESTIONS MAP
CREATE TABLE IF NOT EXISTS public.test_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES public.aptitude_tests(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.aptitude_questions(id) ON DELETE CASCADE NOT NULL,
  UNIQUE (test_id, question_id)
);

ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view test question map" ON public.test_questions;
CREATE POLICY "Anyone can view test question map"
  ON public.test_questions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage test question map" ON public.test_questions;
CREATE POLICY "Admins can manage test question map"
  ON public.test_questions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 5f. TEST ATTEMPTS (Mock test completion records)
CREATE TABLE IF NOT EXISTS public.test_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  test_id UUID REFERENCES public.aptitude_tests(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  answers JSONB, -- detailed responses
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own test attempts" ON public.test_attempts;
CREATE POLICY "Users can view their own test attempts"
  ON public.test_attempts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can record their own test attempts" ON public.test_attempts;
CREATE POLICY "Users can record their own test attempts"
  ON public.test_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP TABLE IF EXISTS public.coding_drafts CASCADE;
DROP TABLE IF EXISTS public.coding_bookmarks CASCADE;
DROP TABLE IF EXISTS public.coding_submissions CASCADE;
DROP TABLE IF EXISTS public.coding_questions CASCADE;
DROP TABLE IF EXISTS public.coding_topics CASCADE;

-- 6. CODING TOPICS
CREATE TABLE IF NOT EXISTS public.coding_topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.coding_topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read coding topics" ON public.coding_topics;
CREATE POLICY "Anyone can read coding topics"
  ON public.coding_topics FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage coding topics" ON public.coding_topics;
CREATE POLICY "Admins can manage coding topics"
  ON public.coding_topics FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 6b. CODING QUESTIONS
CREATE TABLE IF NOT EXISTS public.coding_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES public.coding_topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  constraints TEXT[] DEFAULT '{}',
  sample_input TEXT,
  sample_output TEXT,
  explanation TEXT,
  companies TEXT[] DEFAULT '{}',
  starter_code JSONB DEFAULT '{}'::jsonb,
  optimal_solutions JSONB DEFAULT '{}'::jsonb,
  complexity JSONB DEFAULT '{}'::jsonb,
  examples JSONB DEFAULT '[]'::jsonb,
  acceptance_rate TEXT DEFAULT '50.0%',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.coding_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read coding questions" ON public.coding_questions;
CREATE POLICY "Anyone can read coding questions"
  ON public.coding_questions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage coding questions" ON public.coding_questions;
CREATE POLICY "Admins can manage coding questions"
  ON public.coding_questions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 7. CODING SUBMISSIONS
CREATE TABLE IF NOT EXISTS public.coding_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.coding_questions(id) ON DELETE CASCADE NOT NULL,
  language TEXT NOT NULL,
  code TEXT NOT NULL,
  status TEXT NOT NULL, -- Accepted, Wrong Answer, etc.
  execution_time INTEGER DEFAULT 0, -- in ms
  memory_used INTEGER DEFAULT 0, -- in KB
  test_cases_passed INTEGER DEFAULT 0,
  total_test_cases INTEGER DEFAULT 0,
  error_message TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.coding_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own submissions" ON public.coding_submissions;
CREATE POLICY "Users can view their own submissions"
  ON public.coding_submissions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can record their own submissions" ON public.coding_submissions;
CREATE POLICY "Users can record their own submissions"
  ON public.coding_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 7b. CODING BOOKMARKS
CREATE TABLE IF NOT EXISTS public.coding_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.coding_questions(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE (user_id, question_id)
);

ALTER TABLE public.coding_bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own coding bookmarks" ON public.coding_bookmarks;
CREATE POLICY "Users can view their own coding bookmarks"
  ON public.coding_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own coding bookmarks" ON public.coding_bookmarks;
CREATE POLICY "Users can manage their own coding bookmarks"
  ON public.coding_bookmarks FOR ALL
  USING (auth.uid() = user_id);

-- 7c. CODING DRAFTS
CREATE TABLE IF NOT EXISTS public.coding_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.coding_questions(id) ON DELETE CASCADE NOT NULL,
  language TEXT NOT NULL,
  code TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE (user_id, question_id, language)
);

ALTER TABLE public.coding_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own coding drafts" ON public.coding_drafts;
CREATE POLICY "Users can view their own coding drafts"
  ON public.coding_drafts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own coding drafts" ON public.coding_drafts;
CREATE POLICY "Users can manage their own coding drafts"
  ON public.coding_drafts FOR ALL
  USING (auth.uid() = user_id);

-- 8. COMPANIES HUB
-- 8. COMPANIES HUB (REFINED)
DROP TABLE IF EXISTS public.company_readiness CASCADE;
DROP TABLE IF EXISTS public.company_topics CASCADE;
DROP TABLE IF EXISTS public.company_roadmaps CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;

CREATE TABLE public.companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard', 'Expert')),
  package_range TEXT,
  hiring_process JSONB DEFAULT '[]'::jsonb, -- Array of steps: [{round: 1, title: "...", description: "..."}]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 8b. COMPANY ROADMAPS
CREATE TABLE public.company_roadmaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE UNIQUE,
  overview TEXT,
  preparation_tips TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 8c. COMPANY TOPICS (The "Mapping" Table)
CREATE TABLE public.company_topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  topic_type TEXT NOT NULL CHECK (topic_type IN ('aptitude', 'coding', 'technical', 'hr')),
  reference_id UUID NOT NULL, -- UUID of the Topic or Question from existing tables
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(company_id, topic_type, reference_id)
);

-- 8d. COMPANY READINESS
CREATE TABLE public.company_readiness (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  readiness_score NUMERIC DEFAULT 0 CHECK (readiness_score >= 0 AND readiness_score <= 100),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id, company_id)
);

-- RLS POLICIES
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_readiness ENABLE ROW LEVEL SECURITY;

-- Global Read Access
CREATE POLICY "Anyone can view companies" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Anyone can view roadmaps" ON public.company_roadmaps FOR SELECT USING (true);
CREATE POLICY "Anyone can view company topics" ON public.company_topics FOR SELECT USING (true);

-- User Specific Readiness Access
CREATE POLICY "Users can view own readiness" ON public.company_readiness 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own readiness" ON public.company_readiness 
  FOR ALL USING (auth.uid() = user_id);

-- Admin Management
CREATE POLICY "Admins manage companies" ON public.companies 
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins manage roadmaps" ON public.company_roadmaps 
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins manage topics" ON public.company_topics 
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Seed Initial Companies
INSERT INTO public.companies (name, slug, difficulty, package_range) VALUES
('TCS', 'tcs', 'Easy', '3.36 - 7.0 LPA'),
('Infosys', 'infosys', 'Easy', '3.6 - 8.0 LPA'),
('Wipro', 'wipro', 'Easy', '3.5 - 6.5 LPA'),
('Cognizant', 'cognizant', 'Easy', '4.0 - 6.7 LPA'),
('Accenture', 'accenture', 'Medium', '4.5 - 9.0 LPA'),
('Capgemini', 'capgemini', 'Easy', '3.8 - 7.5 LPA'),
('Amazon', 'amazon', 'Hard', '12 - 45 LPA'),
('Microsoft', 'microsoft', 'Hard', '15 - 50 LPA'),
('Google', 'google', 'Expert', '18 - 60 LPA')
ON CONFLICT (slug) DO NOTHING;

-- 9. INTERVIEW SESSIONS
CREATE TABLE IF NOT EXISTS public.interview_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  status TEXT NOT NULL, -- scheduled, in_progress, completed
  feedback JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own sessions" ON public.interview_sessions;
CREATE POLICY "Users can view their own sessions"
  ON public.interview_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own sessions" ON public.interview_sessions;
CREATE POLICY "Users can manage their own sessions"
  ON public.interview_sessions FOR ALL
  USING (auth.uid() = user_id);

-- 10. SPEAKWISE SESSIONS
CREATE TABLE IF NOT EXISTS public.speakwise_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  topic TEXT,
  recording_url TEXT,
  transcript TEXT,
  feedback JSONB,
  score INTEGER,
  duration INTEGER, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.speakwise_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own speakwise logs" ON public.speakwise_sessions;
CREATE POLICY "Users can view their own speakwise logs"
  ON public.speakwise_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own speakwise logs" ON public.speakwise_sessions;
CREATE POLICY "Users can create their own speakwise logs"
  ON public.speakwise_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 11. USER ANALYTICS METRICS
CREATE TABLE IF NOT EXISTS public.user_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL, -- 'aptitude', 'coding', 'communication', 'overall'
  metric_name TEXT NOT NULL, -- 'score', 'completion_rate', etc.
  metric_value NUMERIC NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own analytics" ON public.user_analytics;
CREATE POLICY "Users can view their own analytics"
  ON public.user_analytics FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can record analytics" ON public.user_analytics;
CREATE POLICY "Users can record analytics"
  ON public.user_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 12. STORAGE BUCKETS SETUP
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('resumes', 'resumes', false),
  ('avatars', 'avatars', true),
  ('certificates', 'certificates', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for files storage on storage.objects
DROP POLICY IF EXISTS "Users can upload resumes" ON storage.objects;
CREATE POLICY "Users can upload resumes" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can view their own resumes" ON storage.objects;
CREATE POLICY "Users can view their own resumes" ON storage.objects 
  FOR SELECT USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can upload avatars" ON storage.objects;
CREATE POLICY "Users can upload avatars" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Anyone can read avatars" ON storage.objects;
CREATE POLICY "Anyone can read avatars" ON storage.objects 
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload certificates" ON storage.objects;
CREATE POLICY "Users can upload certificates" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can view certificates" ON storage.objects;
CREATE POLICY "Users can view certificates" ON storage.objects 
  FOR SELECT USING (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 13. INDEX OPTIMIZATIONS
CREATE INDEX IF NOT EXISTS resumes_user_id_idx ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS aptitude_attempts_user_id_idx ON public.aptitude_attempts(user_id);
CREATE INDEX IF NOT EXISTS coding_submissions_user_id_idx ON public.coding_submissions(user_id);
CREATE INDEX IF NOT EXISTS coding_bookmarks_user_id_idx ON public.coding_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS coding_drafts_user_id_idx ON public.coding_drafts(user_id);
CREATE INDEX IF NOT EXISTS interview_sessions_user_id_idx ON public.interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS speakwise_sessions_user_id_idx ON public.speakwise_sessions(user_id);
CREATE INDEX IF NOT EXISTS user_analytics_user_id_idx ON public.user_analytics(user_id);

-- 14. ACCOUNT SELF-DELETION SECURE FUNCTION
CREATE OR REPLACE FUNCTION public.delete_own_user()
RETURNS void AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.delete_own_user() TO authenticated;

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

