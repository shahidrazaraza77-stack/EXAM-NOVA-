-- Migration: Fix admin RLS policies for coding questions and problem bank
-- Date: 2026-06-21

-- 1. Create ALL policy for coding_questions (currently completely missing)
DROP POLICY IF EXISTS "Admins can manage coding questions" ON public.coding_questions;
CREATE POLICY "Admins can manage coding questions" ON public.coding_questions
FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'content_manager')))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'content_manager')));

-- 2. Update ALL policy for coding_problem_bank to include WITH CHECK and content_manager
DROP POLICY IF EXISTS "Admins can manage coding problem bank" ON public.coding_problem_bank;
CREATE POLICY "Admins can manage coding problem bank" ON public.coding_problem_bank
FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'content_manager')))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'content_manager')));

-- 3. Update ALL policy for coding_daily_challenges to include content_manager
DROP POLICY IF EXISTS "Admins can manage coding_daily_challenges" ON public.coding_daily_challenges;
CREATE POLICY "Admins can manage coding_daily_challenges" ON public.coding_daily_challenges
FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'content_manager')))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'content_manager')));

-- 4. Add insert policy for authenticated users on coding_daily_challenges
DROP POLICY IF EXISTS "Authenticated users can insert daily challenge" ON public.coding_daily_challenges;
CREATE POLICY "Authenticated users can insert daily challenge" ON public.coding_daily_challenges
FOR INSERT TO authenticated 
WITH CHECK (true);
