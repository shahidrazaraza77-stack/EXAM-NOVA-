-- Add columns for resume version management
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS target_company TEXT;
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT false;

-- Add section_scores, weak_sections, strong_sections to resume_analysis if not present
ALTER TABLE public.resume_analysis ADD COLUMN IF NOT EXISTS section_scores JSONB DEFAULT '{}';
ALTER TABLE public.resume_analysis ADD COLUMN IF NOT EXISTS weak_sections JSONB DEFAULT '[]';
ALTER TABLE public.resume_analysis ADD COLUMN IF NOT EXISTS strong_sections JSONB DEFAULT '[]';

-- Add same columns to resume_analysis_logs if not present
ALTER TABLE public.resume_analysis_logs ADD COLUMN IF NOT EXISTS section_scores JSONB DEFAULT '{}';
ALTER TABLE public.resume_analysis_logs ADD COLUMN IF NOT EXISTS weak_sections JSONB DEFAULT '[]';
ALTER TABLE public.resume_analysis_logs ADD COLUMN IF NOT EXISTS strong_sections JSONB DEFAULT '[]';
