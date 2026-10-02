-- 1. UPDATE profiles ROLE CHECK CONSTRAINT TO ALLOW RECRUITERS
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'recruiter', 'admin', 'content_manager'));

-- 2. CREATE recruiters TABLE
CREATE TABLE IF NOT EXISTS public.recruiters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  designation TEXT NOT NULL,
  verified BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS on recruiters
ALTER TABLE public.recruiters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view recruiters" ON public.recruiters;
CREATE POLICY "Public can view recruiters" ON public.recruiters
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Recruiters can insert own profile" ON public.recruiters;
CREATE POLICY "Recruiters can insert own profile" ON public.recruiters
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Recruiters can update own profile" ON public.recruiters;
CREATE POLICY "Recruiters can update own profile" ON public.recruiters
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- 3. CREATE job_listings TABLE
CREATE TABLE IF NOT EXISTS public.job_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recruiter_id UUID REFERENCES public.recruiters(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  employment_type TEXT NOT NULL CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'remote')),
  package_range TEXT NOT NULL,
  skills_required TEXT[] DEFAULT '{}' NOT NULL,
  application_deadline DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS on job_listings
ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view job listings" ON public.job_listings;
CREATE POLICY "Anyone can view job listings" ON public.job_listings
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Recruiters can insert job listings" ON public.job_listings;
CREATE POLICY "Recruiters can insert job listings" ON public.job_listings
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.recruiters r WHERE r.id = recruiter_id AND r.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Recruiters can update own job listings" ON public.job_listings;
CREATE POLICY "Recruiters can update own job listings" ON public.job_listings
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.recruiters r WHERE r.id = recruiter_id AND r.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Recruiters can delete own job listings" ON public.job_listings;
CREATE POLICY "Recruiters can delete own job listings" ON public.job_listings
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.recruiters r WHERE r.id = recruiter_id AND r.user_id = auth.uid())
  );


-- 4. CREATE internship_listings TABLE
CREATE TABLE IF NOT EXISTS public.internship_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recruiter_id UUID REFERENCES public.recruiters(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT 'remote',
  stipend TEXT NOT NULL,
  duration TEXT NOT NULL,
  skills_required TEXT[] DEFAULT '{}' NOT NULL,
  application_deadline DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS on internship_listings
ALTER TABLE public.internship_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view internship listings" ON public.internship_listings;
CREATE POLICY "Anyone can view internship listings" ON public.internship_listings
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Recruiters can insert internship listings" ON public.internship_listings;
CREATE POLICY "Recruiters can insert internship listings" ON public.internship_listings
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.recruiters r WHERE r.id = recruiter_id AND r.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Recruiters can update own internship listings" ON public.internship_listings;
CREATE POLICY "Recruiters can update own internship listings" ON public.internship_listings
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.recruiters r WHERE r.id = recruiter_id AND r.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Recruiters can delete own internship listings" ON public.internship_listings;
CREATE POLICY "Recruiters can delete own internship listings" ON public.internship_listings
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.recruiters r WHERE r.id = recruiter_id AND r.user_id = auth.uid())
  );


-- 5. CREATE applications TABLE
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID NOT NULL,
  listing_type TEXT NOT NULL CHECK (listing_type IN ('job', 'internship')),
  resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'applied' NOT NULL CHECK (status IN ('applied', 'under review', 'shortlisted', 'interview scheduled', 'rejected', 'selected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE (user_id, listing_id)
);

-- Enable RLS on applications
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view own applications" ON public.applications;
CREATE POLICY "Students can view own applications" ON public.applications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can submit own applications" ON public.applications;
CREATE POLICY "Students can submit own applications" ON public.applications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Recruiters can view applications for their listings" ON public.applications;
CREATE POLICY "Recruiters can view applications for their listings" ON public.applications
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.recruiters r
      WHERE r.user_id = auth.uid() AND (
        EXISTS (SELECT 1 FROM public.job_listings jl WHERE jl.id = listing_id AND jl.recruiter_id = r.id) OR
        EXISTS (SELECT 1 FROM public.internship_listings il WHERE il.id = listing_id AND il.recruiter_id = r.id)
      )
    )
  );

DROP POLICY IF EXISTS "Recruiters can update application status for their listings" ON public.applications;
CREATE POLICY "Recruiters can update application status for their listings" ON public.applications
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.recruiters r
      WHERE r.user_id = auth.uid() AND (
        EXISTS (SELECT 1 FROM public.job_listings jl WHERE jl.id = listing_id AND jl.recruiter_id = r.id) OR
        EXISTS (SELECT 1 FROM public.internship_listings il WHERE il.id = listing_id AND il.recruiter_id = r.id)
      )
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.recruiters r
      WHERE r.user_id = auth.uid() AND (
        EXISTS (SELECT 1 FROM public.job_listings jl WHERE jl.id = listing_id AND jl.recruiter_id = r.id) OR
        EXISTS (SELECT 1 FROM public.internship_listings il WHERE il.id = listing_id AND il.recruiter_id = r.id)
      )
    )
  );


-- 6. CREATE saved_jobs TABLE
CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID NOT NULL,
  listing_type TEXT NOT NULL CHECK (listing_type IN ('job', 'internship')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE (user_id, listing_id)
);

-- Enable RLS on saved_jobs
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their saved jobs" ON public.saved_jobs;
CREATE POLICY "Users can manage their saved jobs" ON public.saved_jobs
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- 7. CREATE campus_drives TABLE
CREATE TABLE IF NOT EXISTS public.campus_drives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recruiter_id UUID REFERENCES public.recruiters(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  college_name TEXT NOT NULL,
  drive_date DATE NOT NULL,
  eligibility TEXT NOT NULL,
  roles TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS on campus_drives
ALTER TABLE public.campus_drives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view campus drives" ON public.campus_drives;
CREATE POLICY "Anyone can view campus drives" ON public.campus_drives
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Recruiters can insert campus drives" ON public.campus_drives;
CREATE POLICY "Recruiters can insert campus drives" ON public.campus_drives
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.recruiters r WHERE r.id = recruiter_id AND r.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Recruiters can manage own campus drives" ON public.campus_drives;
CREATE POLICY "Recruiters can manage own campus drives" ON public.campus_drives
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.recruiters r WHERE r.id = recruiter_id AND r.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Recruiters can delete own campus drives" ON public.campus_drives;
CREATE POLICY "Recruiters can delete own campus drives" ON public.campus_drives
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.recruiters r WHERE r.id = recruiter_id AND r.user_id = auth.uid())
  );


-- 8. CREATE campus_drive_registrations TABLE
CREATE TABLE IF NOT EXISTS public.campus_drive_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  drive_id UUID REFERENCES public.campus_drives(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE (user_id, drive_id)
);

-- Enable RLS on campus_drive_registrations
ALTER TABLE public.campus_drive_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can manage own registrations" ON public.campus_drive_registrations;
CREATE POLICY "Students can manage own registrations" ON public.campus_drive_registrations
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Recruiters can view registrations for their drives" ON public.campus_drive_registrations;
CREATE POLICY "Recruiters can view registrations for their drives" ON public.campus_drive_registrations
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.campus_drives cd
      JOIN public.recruiters r ON r.id = cd.recruiter_id
      WHERE cd.id = drive_id AND r.user_id = auth.uid()
    )
  );


-- 9. CREATE AUTOMATIC PROFILE TO RECRUITER INITIALIZATION TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_profile_recruiter()
RETURNS TRIGGER AS $$
BEGIN
  IF new.role = 'recruiter' THEN
    INSERT INTO public.recruiters (user_id, company_name, designation, verified)
    VALUES (new.id, 'My Company', 'Hiring Manager', false)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created_recruiter ON public.profiles;
CREATE TRIGGER on_profile_created_recruiter
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_profile_recruiter();


-- 10. INDEX OPTIMIZATIONS
CREATE INDEX IF NOT EXISTS recruiters_user_id_idx ON public.recruiters(user_id);
CREATE INDEX IF NOT EXISTS job_listings_recruiter_id_idx ON public.job_listings(recruiter_id);
CREATE INDEX IF NOT EXISTS internship_listings_recruiter_id_idx ON public.internship_listings(recruiter_id);
CREATE INDEX IF NOT EXISTS applications_user_id_idx ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS applications_listing_id_idx ON public.applications(listing_id);
CREATE INDEX IF NOT EXISTS saved_jobs_user_id_idx ON public.saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS campus_drives_recruiter_id_idx ON public.campus_drives(recruiter_id);
CREATE INDEX IF NOT EXISTS campus_drive_registrations_user_id_idx ON public.campus_drive_registrations(user_id);
CREATE INDEX IF NOT EXISTS campus_drive_registrations_drive_id_idx ON public.campus_drive_registrations(drive_id);
