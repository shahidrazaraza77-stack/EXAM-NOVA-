-- 0. ALTER public.companies TO ENSURE CORE COLUMNS EXIST AND ARE UNIQUE
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard', 'Expert'));
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS package_range TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS hiring_process JSONB DEFAULT '[]'::jsonb;

-- Ensure slug is unique
ALTER TABLE public.companies DROP CONSTRAINT IF EXISTS companies_slug_key;
ALTER TABLE public.companies ADD CONSTRAINT companies_slug_key UNIQUE (slug);

-- Seed/update core companies
INSERT INTO public.companies (name, slug, difficulty, package_range, hiring_process) VALUES
('TCS', 'tcs', 'Easy', '3.36 - 7.0 LPA', '[{"round": 1, "title": "Aptitude Test", "description": "TCS NQT: Quantitative aptitude, logical reasoning, verbal ability. 60 minutes, 50 questions."}, {"round": 2, "title": "Coding Assessment", "description": "Solve 2-3 coding problems on platform like HackerRank."}, {"round": 3, "title": "Technical Interview", "description": "Assessment of programming skills, core subjects, and project work. Usually 30-45 minutes."}, {"round": 4, "title": "HR Interview", "description": "Behavioral questions, communication skills, and cultural fit assessment."}]'::jsonb),
('Infosys', 'infosys', 'Easy', '3.6 - 8.0 LPA', '[{"round": 1, "title": "InfyTQ certification test", "description": "Aptitude and technical assessment."}, {"round": 2, "title": "Technical interview round", "description": "Coding and database concepts."}, {"round": 3, "title": "HR interview round", "description": "Common behavioral questions."}]'::jsonb),
('Wipro', 'wipro', 'Easy', '3.5 - 6.5 LPA', '[{"round": 1, "title": "Wipro NLTH Aptitude Test", "description": "Aptitude and coding assessment."}, {"round": 2, "title": "Technical Interview", "description": "Basic DSA and programming questions."}, {"round": 3, "title": "HR Interview", "description": "Culture fit."}]'::jsonb),
('Cognizant', 'cognizant', 'Easy', '4.0 - 6.7 LPA', '[{"round": 1, "title": "Cognizant Aptitude", "description": "Aptitude and English test."}, {"round": 2, "title": "Technical Interview", "description": "DBMS, OS, OOP, DSA basics."}, {"round": 3, "title": "HR Interview", "description": "HR questions."}]'::jsonb),
('Accenture', 'accenture', 'Medium', '4.5 - 9.0 LPA', '[{"round": 1, "title": "Cognitive and technical assessment", "description": "Accenture cognitive and technical assessment."}, {"round": 2, "title": "Coding assessment", "description": "Coding test."}, {"round": 3, "title": "Technical interview", "description": "Interview."}, {"round": 4, "title": "HR interview", "description": "HR assessment."}]'::jsonb),
('Capgemini', 'capgemini', 'Easy', '3.8 - 7.5 LPA', '[{"round": 1, "title": "Aptitude and reasoning test", "description": "Aptitude test."}, {"round": 2, "title": "Technical assessment", "description": "Technical MCQ."}, {"round": 3, "title": "Technical interview", "description": "Technical coding interview."}, {"round": 4, "title": "HR interview", "description": "HR round."}]'::jsonb),
('Amazon', 'amazon', 'Hard', '12 - 45 LPA', '[{"round": 1, "title": "Online Coding Assessment", "description": "2-3 medium to hard coding problems on Amazon\'s platform. Focus on DSA. 90 minutes."}, {"round": 2, "title": "Technical Interview 1", "description": "Data structures and algorithms. Problem-solving and coding on shared editor."}, {"round": 3, "title": "Technical Interview 2", "description": "Advanced DSA and leadership principles."}, {"round": 4, "title": "Bar Raiser Round", "description": "Leadership principles assessment. Behavioral questions with STAR method."}, {"round": 5, "title": "HR Interview", "description": "Compensation discussion, role alignment, and cultural fit."}]'::jsonb),
('Microsoft', 'microsoft', 'Hard', '15 - 50 LPA', '[{"round": 1, "title": "Online Coding Assessment", "description": "2-3 coding problems on shared platform."}, {"round": 2, "title": "Technical Interview 1", "description": "DSA, OS, system design."}, {"round": 3, "title": "Technical Interview 2", "description": "Advanced DSA."}, {"round": 4, "title": "ASK Round", "description": "Aptitude, Skills, Knowledge assessment."}, {"round": 5, "title": "HR Interview", "description": "Culture fit."}]'::jsonb),
('Google', 'google', 'Expert', '18 - 60 LPA', '[{"round": 1, "title": "Online Coding Assessment", "description": "2 medium-hard algorithm problems on Google\'s coding platform. 60-90 minutes."}, {"round": 2, "title": "Technical Phone Screen", "description": "1-2 coding problems over phone/video call with a Google engineer."}, {"round": 3, "title": "On-site Coding Round 1", "description": "Advanced algorithms and data structures. Focus on optimization."}, {"round": 4, "title": "On-site Coding Round 2", "description": "More algorithm problems. Clean code and testing mindset."}, {"round": 5, "title": "System Design", "description": "Design a scalable system."}, {"round": 6, "title": "Googleyness & Leadership", "description": "Cultural fit, leadership, and ethical decision-making assessment."}]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  difficulty = EXCLUDED.difficulty,
  package_range = EXCLUDED.package_range,
  hiring_process = EXCLUDED.hiring_process;

-- 1. DROP OLD company_roadmaps IF EXISTS (CASCADE)
DROP TABLE IF EXISTS public.company_roadmaps CASCADE;

-- 2. CREATE RE-STRUCTURED company_roadmaps TABLE
CREATE TABLE public.company_roadmaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  week_number INTEGER NOT NULL,
  topics TEXT[] NOT NULL DEFAULT '{}',
  coding_tasks TEXT[] NOT NULL DEFAULT '{}',
  aptitude_tasks TEXT[] NOT NULL DEFAULT '{}',
  interview_tasks TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(company_id, week_number)
);

-- Enable RLS
ALTER TABLE public.company_roadmaps ENABLE ROW LEVEL SECURITY;

-- Select policy
DROP POLICY IF EXISTS "Anyone can view roadmaps" ON public.company_roadmaps;
CREATE POLICY "Anyone can view roadmaps" ON public.company_roadmaps FOR SELECT USING (true);

-- Admin policy
DROP POLICY IF EXISTS "Admins manage roadmaps" ON public.company_roadmaps;
CREATE POLICY "Admins manage roadmaps" ON public.company_roadmaps FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- 3. CREATE user_company_progress TABLE
CREATE TABLE public.user_company_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  readiness_score INTEGER DEFAULT 0 CHECK (readiness_score >= 0 AND readiness_score <= 100),
  aptitude_progress INTEGER DEFAULT 0 CHECK (aptitude_progress >= 0 AND aptitude_progress <= 100),
  coding_progress INTEGER DEFAULT 0 CHECK (coding_progress >= 0 AND coding_progress <= 100),
  interview_progress INTEGER DEFAULT 0 CHECK (interview_progress >= 0 AND interview_progress <= 100),
  completed_tasks JSONB DEFAULT '[]'::jsonb, -- Array of completed task strings
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id, company_id)
);

-- Enable RLS
ALTER TABLE public.user_company_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for user progress
DROP POLICY IF EXISTS "Users can view own company progress" ON public.user_company_progress;
CREATE POLICY "Users can view own company progress" ON public.user_company_progress 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own company progress" ON public.user_company_progress;
CREATE POLICY "Users can insert own company progress" ON public.user_company_progress 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own company progress" ON public.user_company_progress;
CREATE POLICY "Users can update own company progress" ON public.user_company_progress 
  FOR UPDATE USING (auth.uid() = user_id);


-- 4. SEED ROADMAPS FOR CORE COMPANIES
-- TCS (Easy)
-- Amazon (Hard)
-- Google (Expert)
-- Microsoft (Hard)
-- Accenture (Medium)

-- Helper to seed roadmaps
DO $$
DECLARE
  tcs_id UUID;
  amazon_id UUID;
  google_id UUID;
  microsoft_id UUID;
  accenture_id UUID;
BEGIN
  -- Get company UUIDs
  SELECT id INTO tcs_id FROM public.companies WHERE slug = 'tcs';
  SELECT id INTO amazon_id FROM public.companies WHERE slug = 'amazon';
  SELECT id INTO google_id FROM public.companies WHERE slug = 'google';
  SELECT id INTO microsoft_id FROM public.companies WHERE slug = 'microsoft';
  SELECT id INTO accenture_id FROM public.companies WHERE slug = 'accenture';

  -- Seed TCS Roadmaps
  IF tcs_id IS NOT NULL THEN
    INSERT INTO public.company_roadmaps (company_id, week_number, topics, aptitude_tasks, coding_tasks, interview_tasks) VALUES
    (tcs_id, 1, ARRAY['Quantitative Aptitude', 'C Basics'], 
     ARRAY['Solve 30 Percentages & Averages questions', 'Review TCS NQT Aptitude syllabus'],
     ARRAY['Review basic variables & syntax', 'Write 5 basic loop-based programs'],
     ARRAY['Draft an introductory summary', 'Review basic behavioral HR questions']),
    (tcs_id, 2, ARRAY['Logical Reasoning', 'Array Programming'], 
     ARRAY['Solve 20 Coding-Decoding questions', 'Solve 15 Blood Relations puzzles'],
     ARRAY['Solve 10 basic array filtering challenges', 'Solve 5 string reversal problems'],
     ARRAY['Practice speaking about your projects', 'Explain a past team conflict scenario']),
    (tcs_id, 3, ARRAY['Basic DBMS & SQL', 'Verbal Ability'], 
     ARRAY['Complete 15 Reading Comprehension questions', 'Study synonyms & antonyms list'],
     ARRAY['Practice basic SELECT queries', 'Practice SQL joins & aggregate queries'],
     ARRAY['Draft answers for: Why TCS?', 'Prepare core technical definitions (DBMS/OOP)']),
    (tcs_id, 4, ARRAY['Full Mock Drives', 'HR Prep'], 
     ARRAY['Attempt 2 full-length TCS NQT mock assessments'],
     ARRAY['Solve 3 previous year TCS coding questions'],
     ARRAY['Complete a mock technical interview', 'Deliver a mock HR interview walkthrough'])
    ON CONFLICT (company_id, week_number) DO NOTHING;
  END IF;

  -- Seed Amazon Roadmaps
  IF amazon_id IS NOT NULL THEN
    INSERT INTO public.company_roadmaps (company_id, week_number, topics, aptitude_tasks, coding_tasks, interview_tasks) VALUES
    (amazon_id, 1, ARRAY['Data Structures Basics', 'Amazon Leadership Principles'], 
     ARRAY['Solve 25 Quant puzzles & Probability questions', 'Review Amazon LP customer obsession stories'],
     ARRAY['Solve 15 LeetCode Easy/Medium Array challenges', 'Implement standard Stack & Queue routines'],
     ARRAY['Prepare 2 examples of Customer Obsession', 'Refine past SDE technical project bullet points']),
    (amazon_id, 2, ARRAY['Trees & Graphs', 'STAR Method Behavioral'], 
     ARRAY['Solve 20 logical puzzle challenges', 'Review Amazon LP Ownership stories'],
     ARRAY['Solve 15 Binary Tree traversal problems', 'Implement BFS & DFS graph search algorithms'],
     ARRAY['Prepare STAR stories for Ownership and Bias for Action', 'Practice whiteboard SDE system coding']),
    (amazon_id, 3, ARRAY['Dynamic Programming', 'System Design Intro'], 
     ARRAY['Solve 15 probability & statistics questions', 'Review Amazon LP Dive Deep principles'],
     ARRAY['Solve 12 DP problems (Knapsack, LIS, LCS)', 'Study scalability concepts (load balancing, caching)'],
     ARRAY['Prepare STAR stories for Dive Deep', 'Design a scalable URL shortener architecture']),
    (amazon_id, 4, ARRAY['Advanced Algorithms', 'Bar Raiser Prep'], 
     ARRAY['Complete 2 full-length Amazon SDE mock online assessments'],
     ARRAY['Solve 10 advanced Heap & Graph problems', 'Implement custom Trie structure'],
     ARRAY['Do a full mock technical panel loop', 'Conduct a mock Bar Raiser LP interview'])
    ON CONFLICT (company_id, week_number) DO NOTHING;
  END IF;

  -- Seed Google Roadmaps
  IF google_id IS NOT NULL THEN
    INSERT INTO public.company_roadmaps (company_id, week_number, topics, aptitude_tasks, coding_tasks, interview_tasks) VALUES
    (google_id, 1, ARRAY['Advanced Data Structures', 'Algorithmic Thinking'], 
     ARRAY['Solve 20 advanced combinations & permutations', 'Solve 15 probability challenges'],
     ARRAY['Solve 15 LeetCode Medium/Hard Tree challenges', 'Implement Red-Black tree or Segment tree'],
     ARRAY['Review Googleyness and Leadership traits', 'Practice explaining code complexity on the fly']),
    (google_id, 2, ARRAY['Advanced Graphs & DP', 'Google System Architecture'], 
     ARRAY['Solve 15 game theory puzzles', 'Review Google engineering blog architecture'],
     ARRAY['Solve 15 dynamic programming challenges', 'Implement Dijkstra, Kruskal, and Prim algorithms'],
     ARRAY['Design a global distributed cache system', 'Review trade-offs between consistency and availability']),
    (google_id, 3, ARRAY['Concurrency & OS Internals', 'Googleyness Round'], 
     ARRAY['Solve 20 logical reasoning problems', 'Study Google LP / culture pillars'],
     ARRAY['Solve 10 concurrency & multi-threading challenges', 'Implement thread-safe custom queues'],
     ARRAY['Prepare STAR stories on Googleyness', 'Conduct mock system design interview']),
    (google_id, 4, ARRAY['Google Mock Loop', 'Whiteboard Clean Coding'], 
     ARRAY['Attempt 2 full Google SDE Mock online assessments'],
     ARRAY['Solve 12 previous Google coding questions (Medium/Hard)', 'Write highly optimized, tested clean code'],
     ARRAY['Do a full mock Google technical panel loop', 'Practice answering ambiguous technical questions'])
    ON CONFLICT (company_id, week_number) DO NOTHING;
  END IF;

  -- Seed Microsoft Roadmaps
  IF microsoft_id IS NOT NULL THEN
    INSERT INTO public.company_roadmaps (company_id, week_number, topics, aptitude_tasks, coding_tasks, interview_tasks) VALUES
    (microsoft_id, 1, ARRAY['DSA Basics', 'Microsoft Culture'], 
     ARRAY['Solve 20 Quant aptitude questions', 'Review Microsoft culture of growth mindset'],
     ARRAY['Solve 15 Tree problems (traversals, depth)', 'Implement LinkedList manipulation functions'],
     ARRAY['Prepare behavioral stories on Growth Mindset', 'Review past technical project architectures']),
    (microsoft_id, 2, ARRAY['Graphs & Backtracking', 'Design Patterns'], 
     ARRAY['Solve 15 logical puzzle tasks', 'Review common software engineering design patterns'],
     ARRAY['Solve 12 Graph coloring & cycle detection problems', 'Solve 10 backtracking challenges (n-queens)'],
     ARRAY['Explain Singleton, Factory, and Strategy patterns', 'Practice coding live in front of interviewer']),
    (microsoft_id, 3, ARRAY['System Design', 'OS & Memory Management'], 
     ARRAY['Solve 15 database scaling puzzles', 'Review OS memory allocation, virtual memory, paging'],
     ARRAY['Design a distributed file storage system', 'Implement custom memory allocator mockup'],
     ARRAY['Prepare answers on architectural trade-offs', 'Conduct mock system design review']),
    (microsoft_id, 4, ARRAY['Microsoft Mock Assessment', 'HR ASK Round'], 
     ARRAY['Complete 2 full Microsoft mock assessments'],
     ARRAY['Solve 10 LeetCode Hard DSA questions', 'Review core system parameters'],
     ARRAY['Do a full mock technical panel loop', 'Deliver mock behavioral ASK loop answers'])
    ON CONFLICT (company_id, week_number) DO NOTHING;
  END IF;

  -- Seed Accenture Roadmaps
  IF accenture_id IS NOT NULL THEN
    INSERT INTO public.company_roadmaps (company_id, week_number, topics, aptitude_tasks, coding_tasks, interview_tasks) VALUES
    (accenture_id, 1, ARRAY['Cognitive Skills', 'Programming Fundamentals'], 
     ARRAY['Solve 25 logical reasoning problems', 'Solve 20 cognitive ability tasks'],
     ARRAY['Solve 10 LeetCode Easy array problems', 'Review basic language data types'],
     ARRAY['Prepare a professional self-introduction', 'Review basic tech concepts']),
    (accenture_id, 2, ARRAY['Quantitative Aptitude', 'Intermediate Coding'], 
     ARRAY['Solve 30 Percentages, Ratios, and Work questions', 'Solve 15 logical syllogisms'],
     ARRAY['Solve 10 medium string manipulation problems', 'Implement basic sorting algorithms'],
     ARRAY['Explain your active technical projects', 'Practice mock verbal communication rounds']),
    (accenture_id, 3, ARRAY['Technical Assessment Prep', 'DBMS/OS Basics'], 
     ARRAY['Practice 20 DBMS normalization questions', 'Solve 15 OS scheduling problems'],
     ARRAY['Practice SQL select, join, and update queries', 'Solve 5 programming problems using recursion'],
     ARRAY['Prepare STAR stories on team collaboration', 'Explain how you resolve project bottlenecks']),
    (accenture_id, 4, ARRAY['Accenture Mock Test', 'HR Panel Prep'], 
     ARRAY['Attempt 2 full Accenture mock assessments'],
     ARRAY['Solve 5 previous year Accenture coding questions', 'Practice basic SQL schemas'],
     ARRAY['Do a full mock interview with accenture focus', 'Review common behavioral questions'])
    ON CONFLICT (company_id, week_number) DO NOTHING;
  END IF;
END $$;
