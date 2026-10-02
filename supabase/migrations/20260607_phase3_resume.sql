-- 1. CREATE OR ALTER resumes TABLE FOR PHASE 3
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  file_path TEXT,
  file_name TEXT,
  file_size INTEGER,
  score INTEGER DEFAULT 0,
  feedback TEXT,
  parsed_content TEXT,
  content JSONB,
  ats_score INTEGER DEFAULT 0,
  improved_content TEXT,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Ensure all columns are present if table existed
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS content JSONB;
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS ats_score INTEGER DEFAULT 0;
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS improved_content TEXT;
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS file_path TEXT;
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;

-- Enable RLS
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies for resumes
DROP POLICY IF EXISTS "Users can view their own resumes" ON public.resumes;
CREATE POLICY "Users can view their own resumes" ON public.resumes FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own resumes" ON public.resumes;
CREATE POLICY "Users can insert their own resumes" ON public.resumes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own resumes" ON public.resumes;
CREATE POLICY "Users can update their own resumes" ON public.resumes FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own resumes" ON public.resumes;
CREATE POLICY "Users can delete their own resumes" ON public.resumes FOR DELETE USING (auth.uid() = user_id);

-- 2. CREATE resume_analysis_logs TABLE
CREATE TABLE IF NOT EXISTS public.resume_analysis_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL,
  strengths TEXT NOT NULL,
  weaknesses TEXT NOT NULL,
  suggestions TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS
ALTER TABLE public.resume_analysis_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for logs
DROP POLICY IF EXISTS "Users can view their own analysis logs" ON public.resume_analysis_logs;
CREATE POLICY "Users can view their own analysis logs" ON public.resume_analysis_logs FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own analysis logs" ON public.resume_analysis_logs;
CREATE POLICY "Users can insert their own analysis logs" ON public.resume_analysis_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
