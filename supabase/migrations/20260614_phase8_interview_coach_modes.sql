-- Migrate database constraints to support new interview coach modes: 'company' and 'resume'

-- 1. Modify public.interview_sessions mode check constraint
ALTER TABLE public.interview_sessions DROP CONSTRAINT IF EXISTS interview_sessions_mode_check;
ALTER TABLE public.interview_sessions ADD CONSTRAINT interview_sessions_mode_check CHECK (mode IN ('hr', 'technical', 'mixed', 'company', 'resume'));

-- 2. Modify public.interview_questions mode check constraint
ALTER TABLE public.interview_questions DROP CONSTRAINT IF EXISTS interview_questions_mode_check;
ALTER TABLE public.interview_questions ADD CONSTRAINT interview_questions_mode_check CHECK (mode IN ('hr', 'technical', 'mixed', 'company', 'resume'));
