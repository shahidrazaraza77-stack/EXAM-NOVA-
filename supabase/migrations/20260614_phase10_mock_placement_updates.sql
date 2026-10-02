-- Migration to support Resume Screening in Mock Placement Simulator
-- 1. Add resume_id to public.mock_placements
ALTER TABLE public.mock_placements
ADD COLUMN IF NOT EXISTS resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL;

-- 2. Alter check constraints on mock_rounds to support 'resume', 'aptitude', 'coding', 'interview'
ALTER TABLE public.mock_rounds DROP CONSTRAINT IF EXISTS mock_rounds_round_type_check;
ALTER TABLE public.mock_rounds ADD CONSTRAINT mock_rounds_round_type_check CHECK (round_type IN ('resume', 'aptitude', 'coding', 'interview'));

-- 3. Add resume_score to public.mock_results
ALTER TABLE public.mock_results
ADD COLUMN IF NOT EXISTS resume_score INTEGER DEFAULT 0 CHECK (resume_score >= 0 AND resume_score <= 100);
