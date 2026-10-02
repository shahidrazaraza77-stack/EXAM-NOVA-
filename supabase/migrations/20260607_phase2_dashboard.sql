-- 1. DROP CONFLICTING TABLE IF EXISTS
DROP TABLE IF EXISTS public.user_analytics CASCADE;

-- 2. CREATE NEW USER_ANALYTICS TABLE
CREATE TABLE public.user_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  resume_score INTEGER DEFAULT 0,
  aptitude_score INTEGER DEFAULT 0,
  coding_score INTEGER DEFAULT 0,
  interview_score INTEGER DEFAULT 0,
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  overall_readiness INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS on user_analytics
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for user_analytics
DROP POLICY IF EXISTS "Users can view their own analytics" ON public.user_analytics;
CREATE POLICY "Users can view their own analytics" ON public.user_analytics
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own analytics" ON public.user_analytics;
CREATE POLICY "Users can update their own analytics" ON public.user_analytics
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own analytics" ON public.user_analytics;
CREATE POLICY "Users can insert their own analytics" ON public.user_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. CREATE USER_ACTIVITY TABLE
CREATE TABLE public.user_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS on user_activity
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for user_activity
DROP POLICY IF EXISTS "Users can view their own activity logs" ON public.user_activity;
CREATE POLICY "Users can view their own activity logs" ON public.user_activity
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own activity logs" ON public.user_activity;
CREATE POLICY "Users can insert their own activity logs" ON public.user_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. PROFILE TO ANALYTICS TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_profile_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_analytics (user_id, resume_score, aptitude_score, coding_score, interview_score, xp, streak, overall_readiness)
  VALUES (new.id, 0, 0, 0, 0, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run after a new profile is created
DROP TRIGGER IF EXISTS on_profile_created_analytics ON public.profiles;
CREATE TRIGGER on_profile_created_analytics
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_profile_analytics();

-- 5. RETROACTIVELY SEED EXISTING PROFILES
INSERT INTO public.user_analytics (user_id, resume_score, aptitude_score, coding_score, interview_score, xp, streak, overall_readiness)
SELECT id, 0, 0, 0, 0, 0, 0, 0 FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;
