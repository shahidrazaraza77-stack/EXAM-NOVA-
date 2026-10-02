-- Migration: Interview Coach tables
-- Recreates interview_sessions with new schema, adds interview_questions, interview_answers, interview_feedback

-- 1. Drop old interview_sessions table (schema changed)
DROP TABLE IF EXISTS public.interview_sessions CASCADE;

-- 2. INTERVIEW SESSIONS (recreated)
CREATE TABLE public.interview_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  interview_type TEXT NOT NULL,
  role TEXT NOT NULL,
  overall_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own interview sessions"
  ON public.interview_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interview sessions"
  ON public.interview_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interview sessions"
  ON public.interview_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interview sessions"
  ON public.interview_sessions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all interview sessions"
  ON public.interview_sessions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 3. INTERVIEW QUESTIONS
CREATE TABLE public.interview_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.interview_sessions(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  question_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own interview questions"
  ON public.interview_questions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.interview_sessions WHERE id = session_id AND user_id = auth.uid()));

CREATE POLICY "Users can create interview questions"
  ON public.interview_questions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.interview_sessions WHERE id = session_id AND user_id = auth.uid()));

-- 4. INTERVIEW ANSWERS
CREATE TABLE public.interview_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.interview_sessions(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.interview_questions(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.interview_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own interview answers"
  ON public.interview_answers FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.interview_sessions WHERE id = session_id AND user_id = auth.uid()));

CREATE POLICY "Users can create interview answers"
  ON public.interview_answers FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.interview_sessions WHERE id = session_id AND user_id = auth.uid()));

-- 5. INTERVIEW FEEDBACK
CREATE TABLE public.interview_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.interview_sessions(id) ON DELETE CASCADE NOT NULL,
  answer_id UUID REFERENCES public.interview_answers(id) ON DELETE CASCADE,
  communication_score INTEGER,
  confidence_score INTEGER,
  technical_score INTEGER,
  clarity_score INTEGER,
  strengths JSONB DEFAULT '[]'::jsonb,
  weaknesses JSONB DEFAULT '[]'::jsonb,
  suggestions JSONB DEFAULT '[]'::jsonb,
  overall_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.interview_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own interview feedback"
  ON public.interview_feedback FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.interview_sessions WHERE id = session_id AND user_id = auth.uid()));

CREATE POLICY "Users can create interview feedback"
  ON public.interview_feedback FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.interview_sessions WHERE id = session_id AND user_id = auth.uid()));

-- 6. INDEXES
CREATE INDEX IF NOT EXISTS interview_sessions_user_id_idx ON public.interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS interview_questions_session_id_idx ON public.interview_questions(session_id);
CREATE INDEX IF NOT EXISTS interview_answers_session_id_idx ON public.interview_answers(session_id);
CREATE INDEX IF NOT EXISTS interview_feedback_session_id_idx ON public.interview_feedback(session_id);
