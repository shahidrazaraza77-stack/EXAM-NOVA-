-- 0. Drop old tables if they exist (Cascade drops foreign keys)
DROP TABLE IF EXISTS public.interview_feedback CASCADE;
DROP TABLE IF EXISTS public.interview_answers CASCADE;
DROP TABLE IF EXISTS public.interview_questions CASCADE;
DROP TABLE IF EXISTS public.interview_sessions CASCADE;
DROP TABLE IF EXISTS public.user_interview_progress CASCADE;

-- 1. INTERVIEW QUESTIONS (Question Bank)
CREATE TABLE public.interview_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mode TEXT NOT NULL CHECK (mode IN ('hr', 'technical', 'mixed')),
  question TEXT NOT NULL,
  expected_answer TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  topic TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. INTERVIEW SESSIONS
CREATE TABLE public.interview_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('hr', 'technical', 'mixed')),
  score INTEGER DEFAULT 0,
  communication_score INTEGER DEFAULT 0,
  technical_score INTEGER DEFAULT 0,
  confidence_score INTEGER DEFAULT 0,
  duration INTEGER DEFAULT 0, -- in seconds
  role TEXT DEFAULT 'Software Engineer',
  difficulty TEXT DEFAULT 'medium',
  company TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. INTERVIEW ANSWERS
CREATE TABLE public.interview_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.interview_sessions(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.interview_questions(id) ON DELETE CASCADE NOT NULL,
  user_answer TEXT NOT NULL,
  ai_feedback TEXT,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. USER INTERVIEW PROGRESS
CREATE TABLE public.user_interview_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  avg_score INTEGER DEFAULT 0,
  weak_areas TEXT[] DEFAULT '{}',
  improvement_notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 5. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interview_progress ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES

-- Questions
CREATE POLICY "Anyone authenticated can view questions" ON public.interview_questions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anyone authenticated can insert questions" ON public.interview_questions
  FOR INSERT TO authenticated WITH CHECK (true);

-- Sessions
CREATE POLICY "Users can view own sessions" ON public.interview_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON public.interview_sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.interview_sessions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON public.interview_sessions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Answers
CREATE POLICY "Users can view answers of own sessions" ON public.interview_answers
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.interview_sessions s WHERE s.id = session_id AND s.user_id = auth.uid())
  );

CREATE POLICY "Users can insert answers for own sessions" ON public.interview_answers
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.interview_sessions s WHERE s.id = session_id AND s.user_id = auth.uid())
  );

CREATE POLICY "Users can update answers for own sessions" ON public.interview_answers
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.interview_sessions s WHERE s.id = session_id AND s.user_id = auth.uid())
  );

-- Progress
CREATE POLICY "Users can view own progress" ON public.user_interview_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.user_interview_progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.user_interview_progress
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. SEED STARTER QUESTIONS
INSERT INTO public.interview_questions (mode, question, expected_answer, difficulty, topic) VALUES
-- HR / Behavioral Questions
('hr', 'Tell me about yourself.', 'Structure: Present (current role/student), Past (experience/projects), Future (career aspirations/why this company). Keep under 2 minutes.', 'easy', 'Introduction'),
('hr', 'Why should we hire you?', 'Highlight unique skills, match them to the job description, and show enthusiasm for contributing to the company.', 'easy', 'Cultural Fit'),
('hr', 'What are your greatest strengths and weaknesses?', 'Strength: Real professional skill with an example. Weakness: A genuine minor area of improvement and the active steps you are taking to fix it.', 'easy', 'Self Awareness'),
('hr', 'Describe a challenging situation and how you handled it.', 'STAR method: Situation, Task, Action, Result. Highlight collaboration, problem-solving, and positive outcome.', 'medium', 'Conflict Resolution'),
('hr', 'Why do you want to work for our company?', 'Align your personal values with the company mission, mention positive company news/tech stack, and show you did your research.', 'easy', 'Company Knowledge'),
('hr', 'Tell me about a time you failed and what you learned from it.', 'Be honest about a mistake, take full responsibility, describe the corrective actions, and emphasize the learning experience.', 'medium', 'Resilience'),

-- Technical Questions (DSA / System Design / CS Fundamentals)
('technical', 'Explain OOP concepts with real-world examples.', 'Detail: Encapsulation (capsule hiding data), Inheritance (parent-child class), Polymorphism (method overriding), Abstraction (hiding details behind simple interface).', 'medium', 'OOP'),
('technical', 'What is the difference between SQL and NoSQL databases?', 'SQL: Relational, table structure, schemas, ACID compliance, vertical scaling. NoSQL: Non-relational, document/key-value structure, dynamic schemas, horizontal scaling.', 'medium', 'DBMS'),
('technical', 'Explain the event loop in JavaScript.', 'Single-threaded environment processing: Call Stack, Web APIs, Callback Queue, Microtask Queue (Promises), and Event Loop pushing callbacks from queue to stack when empty.', 'hard', 'JavaScript'),
('technical', 'What are closures in JavaScript and how do they work?', 'A closure is the combination of a function bundled together with references to its surrounding state (lexical environment), allowing it to access variables outside its block.', 'medium', 'JavaScript'),
('technical', 'How would you design a URL shortener like bit.ly?', 'Use a key generation service (KGS) or base62 encoding on unique IDs, cache hot URLs, load balance servers, redirect via HTTP 301/302, and use NoSQL for quick lookups.', 'hard', 'System Design'),
('technical', 'What is JWT and how does authentication work?', 'JSON Web Token: Header (algorithm), Payload (claims like user id), and Signature. Used for stateless session management: client stores it, sends it in Authorization header.', 'medium', 'Web Security'),
('technical', 'What is the difference between TCP and UDP?', 'TCP: Connection-oriented, reliable, guarantees order, error checking, slower. UDP: Connectionless, unreliable, no order guarantee, very fast (used for video/gaming).', 'easy', 'Computer Networks'),

-- Mixed questions (Duplicate modes to make it easy to query under mixed mode)
('mixed', 'Tell me about yourself.', 'Structure: Present, Past, Future. Keep under 2 minutes.', 'easy', 'Introduction'),
('mixed', 'Explain OOP concepts with real-world examples.', 'Detail: Encapsulation, Inheritance, Polymorphism, Abstraction.', 'medium', 'OOP'),
('mixed', 'Why should we hire you?', 'Highlight unique skills, match them to the job description, and show enthusiasm.', 'easy', 'Cultural Fit'),
('mixed', 'What is the difference between SQL and NoSQL databases?', 'SQL: Relational, structured schemas. NoSQL: Non-relational, dynamic schemas.', 'medium', 'DBMS'),
('mixed', 'Describe a challenging situation and how you handled it.', 'STAR method: Situation, Task, Action, Result.', 'medium', 'Conflict Resolution'),
('mixed', 'Explain the event loop in JavaScript.', 'JavaScript event loop manages executing callbacks, Promises, and tasks.', 'hard', 'JavaScript');
