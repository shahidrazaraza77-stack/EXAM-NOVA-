-- Migration: Phase 15 Advanced AI Coding Generator

-- 1. ALTER CODING PROBLEM BANK TO INCLUDE DRAFTS/WORKFLOW FIELDS
ALTER TABLE public.coding_problem_bank ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'published'));
ALTER TABLE public.coding_problem_bank ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT true;
ALTER TABLE public.coding_problem_bank ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.coding_problem_bank ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.coding_problem_bank ADD COLUMN IF NOT EXISTS editorial JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.coding_problem_bank ADD COLUMN IF NOT EXISTS hidden_testcases JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.coding_problem_bank ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

-- 2. CREATE JUNCTION TABLE FOR CODING PROBLEM TOPICS (MULTI-TOPIC MAPPING)
CREATE TABLE IF NOT EXISTS public.coding_problem_topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  problem_id UUID REFERENCES public.coding_problem_bank(id) ON DELETE CASCADE NOT NULL,
  topic_id UUID REFERENCES public.coding_topics(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(problem_id, topic_id)
);

-- Enable RLS
ALTER TABLE public.coding_problem_topics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Anyone can read coding_problem_topics" ON public.coding_problem_topics;
CREATE POLICY "Anyone can read coding_problem_topics"
  ON public.coding_problem_topics FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage coding_problem_topics" ON public.coding_problem_topics;
CREATE POLICY "Admins can manage coding_problem_topics"
  ON public.coding_problem_topics FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- 3. CREATE JUNCTION TABLE FOR CODING PROBLEM COMPANIES (MULTI-COMPANY TAGGING)
CREATE TABLE IF NOT EXISTS public.coding_problem_companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  problem_id UUID REFERENCES public.coding_problem_bank(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(problem_id, company_id)
);

-- Enable RLS
ALTER TABLE public.coding_problem_companies ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Anyone can read coding_problem_companies" ON public.coding_problem_companies;
CREATE POLICY "Anyone can read coding_problem_companies"
  ON public.coding_problem_companies FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage coding_problem_companies" ON public.coding_problem_companies;
CREATE POLICY "Admins can manage coding_problem_companies"
  ON public.coding_problem_companies FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- 4. SEED CODING TOPICS (ALL 27 REQUIRED CODING TOPICS)
INSERT INTO public.coding_topics (name, description) VALUES
  ('Arrays', 'Practice arrays, subarrays, multidimensional grids, sorting, and array manipulations.'),
  ('Strings', 'Master string algorithms, substring searching, regex patterns, and conversions.'),
  ('Linked List', 'Manipulate single, double, circular linked lists, node loops, and node splits.'),
  ('Stack', 'Practice stack push/pop behaviors, bracket matching, monotonic stacks, and evaluations.'),
  ('Queue', 'Implement circular queues, deques, sliding window maximums, and rate limiters.'),
  ('Trees', 'Solve binary tree traversals, depth, diameters, paths, and tree serialization.'),
  ('Binary Trees', 'Understand structures, traversals, and algorithms related to binary trees.'),
  ('BST', 'Practice BST search, insertion, deletion, validations, and BST ranges.'),
  ('Heap', 'Practice priority queues, Kth largest values, heap-sorts, and stream medians.'),
  ('Graphs', 'Master BFS, DFS, Dijkstra, topological sorting, Kruskal, and cycle detections.'),
  ('Dynamic Programming', 'Analyze knapsacks, Fibonacci patterns, grid pathways, and optimal partitions.'),
  ('Recursion', 'Implement divide and conquer, recursive computations, and helper operations.'),
  ('Backtracking', 'Explore permutations, combinations, N-Queens, Sudoku solvers, and subset divisions.'),
  ('Greedy Algorithms', 'Solve scheduling, fraction knapsack, and interval optimization problems.'),
  ('Hashing', 'Apply hash maps, hash sets, collision handling, and frequency arrays.'),
  ('Binary Search', 'Optimize searching in sorted arrays, search spaces, and range boundaries.'),
  ('Sliding Window', 'Master contiguous subarray limits, fixed and variable size window bounds.'),
  ('Two Pointer', 'Utilize dual indices for partitioning, sorted sums, and string validations.'),
  ('Bit Manipulation', 'Optimize operations using logical bitwise shifts, masks, and XOR checks.'),
  ('Trie', 'Implement prefix trees for auto-completes, search checks, and binary XOR tries.'),
  ('Math', 'Practice primes, GCD/LCM, modular arithmetic, game theory, and combinatorics.'),
  ('SQL', 'Write advanced database query statements, joins, aggregations, and subqueries.'),
  ('OOP', 'Explore classes, interfaces, inheritance, polymorphism, and design patterns.'),
  ('Operating System', 'Verify CPU scheduling, concurrency, deadlocks, and virtual memory.'),
  ('DBMS', 'Verify normalization, index mechanics, transactions (ACID), and query optimizations.'),
  ('Computer Networks', 'Understand TCP/IP, UDP, HTTP protocols, DNS, and OSI layer mechanics.'),
  ('System Design', 'Design highly scalable, load-balanced, message-queued distributed systems.')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description;


-- 5. INDEXES FOR SPEEDY JUNCTION QUERYING
CREATE INDEX IF NOT EXISTS coding_p_topics_problem_id_idx ON public.coding_problem_topics(problem_id);
CREATE INDEX IF NOT EXISTS coding_p_topics_topic_id_idx ON public.coding_problem_topics(topic_id);
CREATE INDEX IF NOT EXISTS coding_p_companies_problem_id_idx ON public.coding_problem_companies(problem_id);
CREATE INDEX IF NOT EXISTS coding_p_companies_company_id_idx ON public.coding_problem_companies(company_id);
