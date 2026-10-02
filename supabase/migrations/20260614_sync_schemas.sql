-- 1. Sync public.coding_questions table schema (fixes missing columns on hosted instance)
ALTER TABLE public.coding_questions ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES public.coding_topics(id) ON DELETE CASCADE;
ALTER TABLE public.coding_questions ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.coding_questions ADD COLUMN IF NOT EXISTS sample_input TEXT;
ALTER TABLE public.coding_questions ADD COLUMN IF NOT EXISTS sample_output TEXT;
ALTER TABLE public.coding_questions ADD COLUMN IF NOT EXISTS explanation TEXT;
ALTER TABLE public.coding_questions ADD COLUMN IF NOT EXISTS companies TEXT[] DEFAULT '{}'::text[];
ALTER TABLE public.coding_questions ADD COLUMN IF NOT EXISTS optimal_solutions JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.coding_questions ADD COLUMN IF NOT EXISTS complexity JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.coding_questions ADD COLUMN IF NOT EXISTS examples JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.coding_questions ADD COLUMN IF NOT EXISTS acceptance_rate TEXT DEFAULT '50.0%';

-- Ensure slug constraint is unique if not already set
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'coding_questions_slug_key'
    ) THEN
        ALTER TABLE public.coding_questions ADD CONSTRAINT coding_questions_slug_key UNIQUE (slug);
    END IF;
END $$;

-- 2. Modify public.interview_sessions check constraint to support 'company' and 'resume' modes
ALTER TABLE public.interview_sessions DROP CONSTRAINT IF EXISTS interview_sessions_mode_check;
ALTER TABLE public.interview_sessions ADD CONSTRAINT interview_sessions_mode_check CHECK (mode IN ('hr', 'technical', 'mixed', 'company', 'resume'));

-- 3. Modify public.interview_questions check constraint to support 'company' and 'resume' modes
ALTER TABLE public.interview_questions DROP CONSTRAINT IF EXISTS interview_questions_mode_check;
ALTER TABLE public.interview_questions ADD CONSTRAINT interview_questions_mode_check CHECK (mode IN ('hr', 'technical', 'mixed', 'company', 'resume'));
