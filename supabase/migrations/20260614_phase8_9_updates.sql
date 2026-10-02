-- Migration to support Resume-based Interviews in AI Interview Coach
-- 1. Add resume_id column to public.interview_sessions
ALTER TABLE public.interview_sessions 
ADD COLUMN IF NOT EXISTS resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL;

-- 2. Modify check constraints to support all five modes: 'hr', 'technical', 'mixed', 'company', 'resume'
ALTER TABLE public.interview_sessions DROP CONSTRAINT IF EXISTS interview_sessions_mode_check;
ALTER TABLE public.interview_sessions ADD CONSTRAINT interview_sessions_mode_check CHECK (mode IN ('hr', 'technical', 'mixed', 'company', 'resume'));

ALTER TABLE public.interview_questions DROP CONSTRAINT IF EXISTS interview_questions_mode_check;
ALTER TABLE public.interview_questions ADD CONSTRAINT interview_questions_mode_check CHECK (mode IN ('hr', 'technical', 'mixed', 'company', 'resume'));
