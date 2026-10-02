-- 1. DROP CONFLICTING TABLES IF THEY EXIST
DROP TABLE IF EXISTS public.user_challenges CASCADE;
DROP TABLE IF EXISTS public.daily_challenges CASCADE;
DROP TABLE IF EXISTS public.user_badges CASCADE;
DROP TABLE IF EXISTS public.badges CASCADE;
DROP TABLE IF EXISTS public.user_gamification CASCADE;

-- 2. CREATE user_gamification TABLE
CREATE TABLE public.user_gamification (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  xp INTEGER DEFAULT 0 CHECK (xp >= 0),
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  streak_days INTEGER DEFAULT 0 CHECK (streak_days >= 0),
  coding_streak INTEGER DEFAULT 0 CHECK (coding_streak >= 0),
  aptitude_streak INTEGER DEFAULT 0 CHECK (aptitude_streak >= 0),
  interview_streak INTEGER DEFAULT 0 CHECK (interview_streak >= 0),
  last_active_date DATE,
  last_coding_date DATE,
  last_aptitude_date DATE,
  last_interview_date DATE,
  rank_position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS on user_gamification
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for user_gamification
DROP POLICY IF EXISTS "Anyone can view gamification details" ON public.user_gamification;
CREATE POLICY "Anyone can view gamification details" ON public.user_gamification
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can insert own gamification details" ON public.user_gamification;
CREATE POLICY "Users can insert own gamification details" ON public.user_gamification
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own gamification details" ON public.user_gamification;
CREATE POLICY "Users can update own gamification details" ON public.user_gamification
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. CREATE badges TABLE
CREATE TABLE public.badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  xp_required INTEGER DEFAULT 0 CHECK (xp_required >= 0)
);

-- Enable RLS on badges
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view badges" ON public.badges;
CREATE POLICY "Anyone can view badges" ON public.badges
  FOR SELECT TO authenticated USING (true);

-- 4. CREATE user_badges TABLE
CREATE TABLE public.user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS on user_badges
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own badges" ON public.user_badges;
CREATE POLICY "Users can view own badges" ON public.user_badges
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlock badges" ON public.user_badges;
CREATE POLICY "Users can unlock badges" ON public.user_badges
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 5. CREATE daily_challenges TABLE
CREATE TABLE public.daily_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  xp_reward INTEGER DEFAULT 0 CHECK (xp_reward >= 0),
  type TEXT NOT NULL CHECK (type IN ('aptitude', 'coding', 'interview', 'login')),
  target INTEGER DEFAULT 1 CHECK (target >= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS on daily_challenges
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view daily challenges" ON public.daily_challenges;
CREATE POLICY "Anyone can view daily challenges" ON public.daily_challenges
  FOR SELECT TO authenticated USING (true);

-- 6. CREATE user_challenges TABLE
CREATE TABLE public.user_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES public.daily_challenges(id) ON DELETE CASCADE NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0),
  completed BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id, challenge_id)
);

-- Enable RLS on user_challenges
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own challenges" ON public.user_challenges;
CREATE POLICY "Users can view own challenges" ON public.user_challenges
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own challenge progress" ON public.user_challenges;
CREATE POLICY "Users can insert own challenge progress" ON public.user_challenges
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own challenge progress" ON public.user_challenges;
CREATE POLICY "Users can update own challenge progress" ON public.user_challenges
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. CREATE INDEXES
CREATE INDEX IF NOT EXISTS user_gamification_user_id_idx ON public.user_gamification(user_id);
CREATE INDEX IF NOT EXISTS user_badges_user_id_idx ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS user_challenges_user_id_idx ON public.user_challenges(user_id);
CREATE INDEX IF NOT EXISTS daily_challenges_created_at_idx ON public.daily_challenges(created_at);

-- 8. SEED DATA FOR BADGES
INSERT INTO public.badges (code, name, description, icon, xp_required) VALUES
  ('first_login', 'First Steps', 'Log in to ExamNova for the first time', '🎯', 0),
  ('first_aptitude', 'Aptitude Initiate', 'Solve your first quantitative aptitude question', '🧠', 0),
  ('first_coding', 'Hello World', 'Solve your first coding problem', '👨‍💻', 0),
  ('streak_7', '7-Day Warrior', 'Maintain a 7-day practice streak', '🔥', 0),
  ('streak_30', '30-Day Legend', 'Maintain a 30-day practice streak', '👑', 0),
  ('coding_100', 'Century Club', 'Solve 100 coding problems', '💯', 0),
  ('interview_expert', 'Interview Expert', 'Complete 10 mock interviews', '🎤', 0),
  ('placement_champion', 'Placement Champion', 'Complete a full mock placement successfully', '🏆', 0)
ON CONFLICT (code) DO NOTHING;

-- 9. SEED DATA FOR DAILY CHALLENGES
INSERT INTO public.daily_challenges (title, description, xp_reward, type, target) VALUES
  ('Solve 5 Aptitude Questions', 'Practice quantitative and logical reasoning', 50, 'aptitude', 5),
  ('Complete 1 Coding Problem', 'Sharpen your DSA skills', 30, 'coding', 1),
  ('Attempt 1 Interview Question', 'Practice your interview responses', 25, 'interview', 1)
ON CONFLICT DO NOTHING;

-- 10. CREATE AUTOMATIC PROFILE TO GAMIFICATION TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_profile_gamification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_gamification (user_id, xp, level, streak_days, last_active_date)
  VALUES (new.id, 0, 1, 0, CURRENT_DATE)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_gamification ON public.profiles;
CREATE TRIGGER on_auth_user_created_gamification
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile_gamification();
