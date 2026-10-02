-- Migration: Coding Contests, Daily Challenges & XP History
-- Phase 16: Contests & Gamification Layer

-- =============================================
-- 1. CODING CONTESTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.coding_contests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  rules TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'ended')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  max_participants INTEGER DEFAULT NULL,
  is_rated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- =============================================
-- 2. CONTEST PROBLEMS JUNCTION TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.contest_problems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contest_id UUID REFERENCES public.coding_contests(id) ON DELETE CASCADE NOT NULL,
  problem_id UUID REFERENCES public.coding_questions(id) ON DELETE CASCADE NOT NULL,
  points INTEGER DEFAULT 100,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(contest_id, problem_id)
);

-- =============================================
-- 3. CONTEST PARTICIPANTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.contest_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contest_id UUID REFERENCES public.coding_contests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  total_score INTEGER DEFAULT 0,
  problems_solved INTEGER DEFAULT 0,
  last_submission_at TIMESTAMP WITH TIME ZONE,
  rank INTEGER,
  UNIQUE(contest_id, user_id)
);

-- =============================================
-- 4. CONTEST SUBMISSIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.contest_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contest_id UUID REFERENCES public.coding_contests(id) ON DELETE CASCADE NOT NULL,
  problem_id UUID REFERENCES public.coding_questions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  submission_id UUID REFERENCES public.coding_submissions(id) ON DELETE CASCADE,
  code TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT 'python',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'wrong_answer', 'time_limit_exceeded', 'runtime_error')),
  score INTEGER DEFAULT 0,
  execution_time FLOAT DEFAULT 0,
  memory_used FLOAT DEFAULT 0,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- =============================================
-- 5. XP HISTORY TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.xp_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  xp_amount INTEGER NOT NULL DEFAULT 0,
  reason TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'coding' CHECK (source IN ('coding', 'contest', 'daily_challenge', 'streak', 'achievement', 'aptitude', 'interview')),
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- =============================================
-- 6. DAILY CHALLENGES TABLE (if not exists)
-- =============================================
CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  problem_id UUID REFERENCES public.coding_questions(id) ON DELETE CASCADE NOT NULL,
  challenge_date DATE NOT NULL UNIQUE,
  xp_reward INTEGER DEFAULT 50,
  bonus_xp INTEGER DEFAULT 25,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- =============================================
-- 7. DAILY CHALLENGE COMPLETIONS
-- =============================================
CREATE TABLE IF NOT EXISTS public.daily_challenge_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  daily_challenge_id UUID REFERENCES public.daily_challenges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  submission_id UUID REFERENCES public.coding_submissions(id) ON DELETE SET NULL,
  xp_earned INTEGER DEFAULT 0,
  UNIQUE(daily_challenge_id, user_id)
);

-- =============================================
-- 8. ENABLE ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.coding_contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenge_completions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 9. RLS POLICIES - CODING CONTESTS
-- =============================================
DROP POLICY IF EXISTS "Anyone can read coding_contests" ON public.coding_contests;
CREATE POLICY "Anyone can read coding_contests"
  ON public.coding_contests FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage coding_contests" ON public.coding_contests;
CREATE POLICY "Admins can manage coding_contests"
  ON public.coding_contests FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- =============================================
-- 10. RLS POLICIES - CONTEST PROBLEMS
-- =============================================
DROP POLICY IF EXISTS "Anyone can read contest_problems" ON public.contest_problems;
CREATE POLICY "Anyone can read contest_problems"
  ON public.contest_problems FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage contest_problems" ON public.contest_problems;
CREATE POLICY "Admins can manage contest_problems"
  ON public.contest_problems FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- =============================================
-- 11. RLS POLICIES - CONTEST PARTICIPANTS
-- =============================================
DROP POLICY IF EXISTS "Anyone can read contest_participants" ON public.contest_participants;
CREATE POLICY "Anyone can read contest_participants"
  ON public.contest_participants FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert own participant record" ON public.contest_participants;
CREATE POLICY "Users can insert own participant record"
  ON public.contest_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own participant record" ON public.contest_participants;
CREATE POLICY "Users can update own participant record"
  ON public.contest_participants FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage contest_participants" ON public.contest_participants;
CREATE POLICY "Admins can manage contest_participants"
  ON public.contest_participants FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- =============================================
-- 12. RLS POLICIES - CONTEST SUBMISSIONS
-- =============================================
DROP POLICY IF EXISTS "Anyone can read contest_submissions" ON public.contest_submissions;
CREATE POLICY "Anyone can read contest_submissions"
  ON public.contest_submissions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert own contest_submissions" ON public.contest_submissions;
CREATE POLICY "Users can insert own contest_submissions"
  ON public.contest_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage contest_submissions" ON public.contest_submissions;
CREATE POLICY "Admins can manage contest_submissions"
  ON public.contest_submissions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- =============================================
-- 13. RLS POLICIES - XP HISTORY
-- =============================================
DROP POLICY IF EXISTS "Users can read own xp_history" ON public.xp_history;
CREATE POLICY "Users can read own xp_history"
  ON public.xp_history FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can read all xp_history" ON public.xp_history;
CREATE POLICY "Admins can read all xp_history"
  ON public.xp_history FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "System can insert xp_history" ON public.xp_history;
CREATE POLICY "System can insert xp_history"
  ON public.xp_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 14. RLS POLICIES - DAILY CHALLENGES
-- =============================================
DROP POLICY IF EXISTS "Anyone can read daily_challenges" ON public.daily_challenges;
CREATE POLICY "Anyone can read daily_challenges"
  ON public.daily_challenges FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage daily_challenges" ON public.daily_challenges;
CREATE POLICY "Admins can manage daily_challenges"
  ON public.daily_challenges FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- =============================================
-- 15. RLS POLICIES - DAILY CHALLENGE COMPLETIONS
-- =============================================
DROP POLICY IF EXISTS "Users can read own daily_challenge_completions" ON public.daily_challenge_completions;
CREATE POLICY "Users can read own daily_challenge_completions"
  ON public.daily_challenge_completions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can read all daily_challenge_completions" ON public.daily_challenge_completions;
CREATE POLICY "Admins can read all daily_challenge_completions"
  ON public.daily_challenge_completions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Users can insert own daily_challenge_completions" ON public.daily_challenge_completions;
CREATE POLICY "Users can insert own daily_challenge_completions"
  ON public.daily_challenge_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 16. PERFORMANCE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS coding_contests_status_idx ON public.coding_contests(status);
CREATE INDEX IF NOT EXISTS coding_contests_start_time_idx ON public.coding_contests(start_time);
CREATE INDEX IF NOT EXISTS contest_problems_contest_id_idx ON public.contest_problems(contest_id);
CREATE INDEX IF NOT EXISTS contest_problems_problem_id_idx ON public.contest_problems(problem_id);
CREATE INDEX IF NOT EXISTS contest_participants_contest_id_idx ON public.contest_participants(contest_id);
CREATE INDEX IF NOT EXISTS contest_participants_user_id_idx ON public.contest_participants(user_id);
CREATE INDEX IF NOT EXISTS contest_submissions_contest_id_idx ON public.contest_submissions(contest_id);
CREATE INDEX IF NOT EXISTS contest_submissions_user_id_idx ON public.contest_submissions(user_id);
CREATE INDEX IF NOT EXISTS xp_history_user_id_idx ON public.xp_history(user_id);
CREATE INDEX IF NOT EXISTS xp_history_created_at_idx ON public.xp_history(created_at);
CREATE INDEX IF NOT EXISTS daily_challenges_date_idx ON public.daily_challenges(challenge_date);
CREATE INDEX IF NOT EXISTS daily_challenge_completions_user_id_idx ON public.daily_challenge_completions(user_id);

-- =============================================
-- 17. AUTO-UPDATE CONTEST STATUS FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.update_contest_status()
RETURNS void AS $$
BEGIN
  -- Set active for contests that have started
  UPDATE public.coding_contests
  SET status = 'active', updated_at = NOW()
  WHERE status = 'upcoming' AND start_time <= NOW() AND end_time > NOW();

  -- Set ended for contests that have ended
  UPDATE public.coding_contests
  SET status = 'ended', updated_at = NOW()
  WHERE status IN ('upcoming', 'active') AND end_time <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
