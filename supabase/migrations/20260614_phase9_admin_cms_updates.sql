-- Migration to support Admin CMS & Gemini enhancements
-- 1. Extend profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended BOOLEAN DEFAULT false;

-- 2. Extend aptitude_tests table
ALTER TABLE public.aptitude_tests ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('Aptitude', 'Coding', 'Company')) DEFAULT 'Aptitude';
ALTER TABLE public.aptitude_tests ADD COLUMN IF NOT EXISTS target_company TEXT;

-- Recreate difficulty check constraint on aptitude_tests
ALTER TABLE public.aptitude_tests DROP CONSTRAINT IF EXISTS aptitude_tests_difficulty_check;
ALTER TABLE public.aptitude_tests ADD CONSTRAINT aptitude_tests_difficulty_check CHECK (difficulty IN ('Easy', 'Medium', 'Hard', 'Expert'));

-- 3. Create announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_audience TEXT NOT NULL CHECK (target_audience IN ('All', 'Students', 'Admins', 'Premium')) DEFAULT 'All',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Active', 'Scheduled', 'Expired')) DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for announcements
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active announcements" ON public.announcements;
CREATE POLICY "Anyone can view active announcements" ON public.announcements
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;
CREATE POLICY "Admins can manage announcements" ON public.announcements
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4. Create content_library table
CREATE TABLE IF NOT EXISTS public.content_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Articles', 'Preparation Guides', 'Interview Tips', 'Company Insights')),
  author TEXT NOT NULL,
  read_time TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Published', 'Draft')) DEFAULT 'Published',
  content TEXT,
  last_updated DATE DEFAULT current_date,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for content_library
ALTER TABLE public.content_library ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read published content" ON public.content_library;
CREATE POLICY "Anyone can read published content" ON public.content_library
  FOR SELECT TO authenticated USING (status = 'Published' OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can manage content" ON public.content_library;
CREATE POLICY "Admins can manage content" ON public.content_library
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 5. Create job_matches table
CREATE TABLE IF NOT EXISTS public.job_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE,
  job_description TEXT NOT NULL,
  match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  matching_skills TEXT[] DEFAULT '{}',
  missing_skills TEXT[] DEFAULT '{}',
  improvement_suggestions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for job_matches
ALTER TABLE public.job_matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own job matches" ON public.job_matches;
CREATE POLICY "Users can manage own job matches" ON public.job_matches
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. Create company_bookmarks table
CREATE TABLE IF NOT EXISTS public.company_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- Enable RLS for company_bookmarks
ALTER TABLE public.company_bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own company bookmarks" ON public.company_bookmarks;
CREATE POLICY "Users can manage own company bookmarks" ON public.company_bookmarks
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
