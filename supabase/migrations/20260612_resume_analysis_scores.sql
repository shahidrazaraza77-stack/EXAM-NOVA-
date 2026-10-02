-- Migration: Add section_scores, weak_sections, and strong_sections to resume_analysis and resume_analysis_logs
ALTER TABLE public.resume_analysis
  ADD COLUMN IF NOT EXISTS section_scores JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS weak_sections JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS strong_sections JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.resume_analysis_logs
  ADD COLUMN IF NOT EXISTS section_scores JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS weak_sections JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS strong_sections JSONB DEFAULT '[]'::jsonb;
