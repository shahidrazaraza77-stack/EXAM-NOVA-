-- Migration: Fix protect_profile_role trigger and RLS to allow service_role and Content Manager master authority
-- Date: 2026-10-02

-- 1. Fix protect_profile_role trigger function
CREATE OR REPLACE FUNCTION public.protect_profile_role()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  claim_role text;
BEGIN
  IF (NEW.role IS DISTINCT FROM OLD.role) OR (NEW.suspended IS DISTINCT FROM OLD.suspended) THEN
    -- Check if called via service_role key (from server API endpoints)
    BEGIN
      claim_role := (current_setting('request.jwt.claims', true)::jsonb->>'role');
    EXCEPTION WHEN OTHERS THEN
      claim_role := NULL;
    END;

    -- If request is from service_role, allow it immediately
    IF claim_role = 'service_role' OR auth.role() = 'service_role' THEN
      RETURN NEW;
    END IF;

    -- If request is from an authenticated user, only admins or content_managers are allowed
    IF auth.uid() IS NOT NULL THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (role = 'admin' OR role = 'content_manager')
      ) THEN
        RAISE EXCEPTION 'Unauthorized: Only platform administrators and content managers can change user roles or account suspension status.';
      END IF;
    ELSE
      -- Neither service_role nor authenticated user
      RAISE EXCEPTION 'Unauthorized: Authentication required to change roles or suspension status.';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- 2. Add RLS policy for admins and content managers on profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins and content managers can update profiles'
  ) THEN
    CREATE POLICY "Admins and content managers can update profiles" ON public.profiles
    FOR UPDATE TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (role = 'admin' OR role = 'content_manager')
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (role = 'admin' OR role = 'content_manager')
      )
    );
  END IF;
END $$;
