-- Migration to fix relationship between admin_logs/ai_generation_logs and profiles
-- 1. Fix public.admin_logs foreign key reference
ALTER TABLE public.admin_logs
  DROP CONSTRAINT IF EXISTS admin_logs_admin_id_fkey;

ALTER TABLE public.admin_logs
  ADD CONSTRAINT admin_logs_admin_id_fkey
  FOREIGN KEY (admin_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;

-- 2. Fix public.ai_generation_logs foreign key reference
ALTER TABLE public.ai_generation_logs
  DROP CONSTRAINT IF EXISTS ai_generation_logs_admin_id_fkey;

ALTER TABLE public.ai_generation_logs
  ADD CONSTRAINT ai_generation_logs_admin_id_fkey
  FOREIGN KEY (admin_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;
