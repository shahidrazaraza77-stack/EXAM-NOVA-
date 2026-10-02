-- Seed script for ExamNova Aptitude Module
-- Run this script in your Supabase SQL Editor to populate topics, questions, mock tests, and mock test question maps.

-- 1. Insert Aptitude Topics
INSERT INTO public.aptitude_topics (id, name, description, category, icon)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Percentage', 'Solve problems related to fractions, decimal values, and percentages.', 'quantitative', 'Percent'),
  ('22222222-2222-2222-2222-222222222222', 'Profit & Loss', 'Solve cost price, selling price, discounts, marked price, and margins.', 'quantitative', 'TrendingUp'),
  ('33333333-3333-3333-3333-333333333333', 'Time & Work', 'Analyze efficiency, pipeline rates, group efforts, and timelines.', 'quantitative', 'Briefcase'),
  ('44444444-4444-4444-4444-444444444444', 'Ratio', 'Understand proportions, ratios, partnership divisions, and sharing ratios.', 'quantitative', 'Scale'),
  ('55555555-5555-5555-5555-555555555555', 'Number System', 'Explore prime factors, divisibility tests, remainders, and digit patterns.', 'quantitative', 'Hash'),
  ('66666666-6666-6666-6666-666666666666', 'Probability', 'Find likelihoods, events, dependent outcomes, and dice/cards probabilities.', 'quantitative', 'Dice'),
  ('77777777-7777-7777-7777-777777777777', 'Permutation & Combination', 'Understand arrangements, selections, factorials, and combinations.', 'quantitative', 'Layers'),
  ('88888888-8888-8888-8888-888888888888', 'Logical Reasoning', 'Verify patterns, syllogisms, blood relations, seating arrangements, and puzzles.', 'logical', 'Brain'),
  ('99999999-9999-9999-9999-999999999999', 'Verbal Ability', 'Test reading comprehension, error spotting, vocabulary, and grammar.', 'verbal', 'MessageSquare'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Data Interpretation', 'Read tables, charts, graphs, and calculate analytical insights.', 'data-interpretation', 'PieChart')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon;

-- 2. Insert Aptitude Questions
-- We will use static UUIDs to prevent duplicates and enable referencing them in mock tests
INSERT INTO public.aptitude_questions (id, topic_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, companies)
VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'What is 15% of 80% of 450?',
    '45', '54', '60', '36',
    'B',
    'First, find 80% of 450: 0.8 * 450 = 360. Next, find 15% of 360: 0.15 * 360 = 54.',
    'Easy',
    ARRAY['tcs', 'infosys', 'wipro', 'cognizant', 'accenture', 'capgemini', 'hcl', 'tech-mahindra']
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'A retailer buys an article at 20% discount on the printed price and sells it at 10% discount on the printed price. What is his percentage profit?',
    '10%', '12.5%', '15%', '11.11%',
    'B',
    'Let the printed price be $100. CP = 100 - 20% = $80. SP = 100 - 10% = $90. Profit = $10. Profit % = (10 / 80) * 100 = 12.5%.',
    'Medium',
    ARRAY['tcs', 'infosys', 'wipro', 'cognizant', 'accenture', 'capgemini', 'hcl', 'tech-mahindra']
  ),
  (
    'a3333333-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    'A can do a piece of work in 10 days and B can do it in 15 days. They work together for 4 days. What fraction of the work is left?',
    '1/3', '1/2', '1/6', '2/3',
    'A',
    'Work done by A in 1 day = 1/10. Work done by B in 1 day = 1/15. Work done by (A + B) in 1 day = 1/6. Work done in 4 days = 2/3. Remaining = 1 - 2/3 = 1/3.',
    'Medium',
    ARRAY['tcs', 'infosys', 'wipro', 'cognizant', 'accenture', 'capgemini', 'hcl', 'tech-mahindra']
  ),
  (
    'a4444444-4444-4444-4444-444444444444',
    '44444444-4444-4444-4444-444444444444',
    'If A : B = 2 : 3, B : C = 4 : 5 and C : D = 6 : 7, what is A : D?',
    '16 : 35', '8 : 15', '12 : 35', '4 : 7',
    'A',
    'A/D = (2/3) * (4/5) * (6/7) = 48/105 = 16/35. Thus, A : D = 16 : 35.',
    'Medium',
    ARRAY['tcs', 'infosys', 'wipro', 'cognizant', 'accenture', 'capgemini', 'hcl', 'tech-mahindra', 'amazon', 'google', 'microsoft', 'adobe']
  ),
  (
    'a5555555-5555-5555-5555-555555555555',
    '88888888-8888-8888-8888-888888888888',
    'Pointing to a photograph, Vipul said, "She is the daughter of my grandfather''s only son." How is the girl in the photograph related to Vipul?',
    'Mother', 'Sister', 'Cousin', 'Aunt',
    'B',
    'Vipul''s grandfather''s only son is Vipul''s father. The daughter of Vipul''s father is Vipul''s sister.',
    'Easy',
    ARRAY['tcs', 'infosys', 'wipro', 'cognizant', 'accenture', 'capgemini', 'hcl', 'tech-mahindra']
  ),
  (
    'a6666666-6666-6666-6666-666666666666',
    '88888888-8888-8888-8888-888888888888',
    'Statements: All bags are pockets. All pockets are pouches. Conclusions: I. All bags are pouches. II. Some pouches are pockets.',
    'Only conclusion I follows', 'Only conclusion II follows', 'Both conclusions I and II follow', 'Neither follows',
    'C',
    'Since all bags are pockets and all pockets are pouches, all bags are pouches (I follows). Some pouches are pockets (II follows).',
    'Medium',
    ARRAY['tcs', 'infosys', 'wipro', 'cognizant', 'accenture', 'capgemini', 'hcl', 'tech-mahindra', 'amazon', 'google', 'microsoft', 'adobe']
  ),
  (
    'a7777777-7777-7777-7777-777777777777',
    '88888888-8888-8888-8888-888888888888',
    'Five people A, B, C, D, and E are sitting in a row facing North. A is next to B but not next to C. D is next to C who is on the extreme left. E is not next to B. Who is sitting in the middle?',
    'A', 'B', 'D', 'E',
    'A',
    'The correct arrangement is C, D, A, B, E. A sits in the middle (position 3).',
    'Hard',
    ARRAY['tcs', 'infosys', 'wipro', 'cognizant', 'accenture', 'capgemini', 'hcl', 'tech-mahindra', 'amazon', 'google', 'microsoft', 'adobe']
  ),
  (
    'a8888888-8888-8888-8888-888888888888',
    '99999999-9999-9999-9999-999999999999',
    'Read the snippet: "The advent of automated AI review platforms has shifted the focus of professional writing from mechanical grammatical perfection to authentic, narrative-driven storytelling." According to the passage, what is the primary consequence of AI review platforms?',
    'Writers can now ignore grammar rules.', 'Authentic storytelling is valued more than mere grammatical correctness.', 'AI will eventually replace human storytellers.', 'Grammar is no longer relevant in professional contexts.',
    'B',
    'The passage notes that the focus has shifted "from mechanical grammatical perfection to authentic, narrative-driven storytelling".',
    'Medium',
    ARRAY['tcs', 'infosys', 'wipro', 'cognizant', 'accenture', 'capgemini', 'hcl', 'tech-mahindra', 'amazon', 'google', 'microsoft', 'adobe']
  ),
  (
    'a9999999-9999-9999-9999-999999999999',
    '99999999-9999-9999-9999-999999999999',
    'Identify the part of the sentence that contains a grammatical error: "Neither of the two candidates (A) / were selected (B) / for the executive post (C) / No error (D)"',
    'Neither of the two candidates', 'were selected', 'for the executive post', 'No error',
    'B',
    'The subject "Neither" is singular and takes a singular verb. "were selected" should be "was selected".',
    'Easy',
    ARRAY['tcs', 'infosys', 'wipro', 'cognizant', 'accenture', 'capgemini', 'hcl', 'tech-mahindra', 'amazon', 'google', 'microsoft', 'adobe']
  ),
  (
    'aaaaaaaa-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'A company spends 30% of its budget on R&D, 25% on Marketing, 20% on Operations, 15% on Salaries, and the rest on Legal. If the total budget is $1,200,000, how much is spent on Legal?',
    '$120,000', '$60,000', '$180,000', '$100,000',
    'A',
    'Total spent = 90%. Legal = 10% = $120,000.',
    'Easy',
    ARRAY['tcs', 'infosys', 'wipro', 'cognizant', 'accenture', 'capgemini', 'hcl', 'tech-mahindra']
  ),
  (
    'aaaaaaaa-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Refer to the table of annual profits of Company X: - 2023: $120k - 2024: $150k - 2025: $180k. What is the percentage growth in profit from 2023 to 2025?',
    '50%', '30%', '25%', '60%',
    'A',
    'Increase = $60k. Percentage growth = (60 / 120) * 100 = 50%.',
    'Medium',
    ARRAY['tcs', 'infosys', 'wipro', 'cognizant', 'accenture', 'capgemini', 'hcl', 'tech-mahindra']
  )
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Mock Tests
INSERT INTO public.aptitude_tests (id, title, description, duration_minutes, difficulty)
VALUES
  (
    'f1111111-1111-1111-1111-111111111111',
    'TCS NQT Quantitative Booster',
    'Prepare for TCS NQT quantitative section with these practice questions.',
    60,
    'Medium'
  ),
  (
    'f2222222-2222-2222-2222-222222222222',
    'Infosys Logical Reasoning Test',
    'Practice logical reasoning questions mapped directly to Infosys hiring patterns.',
    45,
    'Medium'
  )
ON CONFLICT (id) DO NOTHING;

-- 4. Map Questions to Mock Tests
INSERT INTO public.test_questions (test_id, question_id)
VALUES
  -- TCS NQT booster gets percentage, profit & loss, time & work, ratio questions
  ('f1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111'),
  ('f1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222'),
  ('f1111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333'),
  ('f1111111-1111-1111-1111-111111111111', 'a4444444-4444-4444-4444-444444444444'),
  -- Infosys gets the logical reasoning questions
  ('f2222222-2222-2222-2222-222222222222', 'a5555555-5555-5555-5555-555555555555'),
  ('f2222222-2222-2222-2222-222222222222', 'a6666666-6666-6666-6666-666666666666'),
  ('f2222222-2222-2222-2222-222222222222', 'a7777777-7777-7777-7777-777777777777')
ON CONFLICT DO NOTHING;

-- 5. Insert Coding Topics
INSERT INTO public.coding_topics (id, name, description)
VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Arrays', 'Practice arrays, subarrays, multidimensional grids, sorting, and array manipulations.'),
  ('c2222222-2222-2222-2222-222222222222', 'Strings', 'Master string algorithms, substring searching, regex patterns, and conversions.'),
  ('c3333333-3333-3333-3333-333333333333', 'Linked List', 'Manipulate single, double, circular linked lists, node loops, and node splits.'),
  ('c4444444-4444-4444-4444-444444444444', 'Stack', 'Practice stack push/pop behaviors, bracket matching, monotonic stacks, and evaluations.'),
  ('c5555555-5555-5555-5555-555555555555', 'Queue', 'Implement circular queues, deques, sliding window maximums, and rate limiters.'),
  ('c6666666-6666-6666-6666-666666666666', 'Trees', 'Solve binary tree traversals, depth, diameters, paths, and tree serialization.'),
  ('c7777777-7777-7777-7777-777777777777', 'Binary Search Tree', 'Practice BST search, insertion, deletion, validations, and BST ranges.'),
  ('c8888888-8888-8888-8888-888888888888', 'Heap', 'Practice priority queues, kth largest values, heap-sorts, and stream medians.'),
  ('c9999999-9999-9999-9999-999999999999', 'Graph', 'Master BFS, DFS, Dijkstra, topological sorting, Kruskal, and cycle detections.'),
  ('caaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Dynamic Programming', 'Analyze knapsacks, fibonacci patterns, grid pathways, and optimal partitions.'),
  ('cbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Recursion', 'Implement divide and conquer, recursive computations, and helper operations.'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Backtracking', 'Explore permutations, combinations, N-Queens, Sudoku solvers, and subset divisions.')
ON CONFLICT (id) DO NOTHING;

-- 6. Insert Coding Questions
INSERT INTO public.coding_questions (id, topic_id, title, slug, description, difficulty, constraints, sample_input, sample_output, explanation, companies, starter_code, optimal_solutions, complexity, examples, acceptance_rate)
VALUES
  (
    'q1111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'Two Sum',
    'two-sum',
    'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
    'Easy',
    ARRAY['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9', 'Only one valid answer exists.'],
    'nums = [2,7,11,15], target = 9',
    '[0,1]',
    'Because nums[0] + nums[1] == 2 + 7 == 9, we return [0, 1].',
    ARRAY['amazon', 'google', 'microsoft', 'tcs', 'infosys'],
    '{"Python": "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        pass", "JavaScript": "function twoSum(nums, target) {\n    \n}", "Java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return new int[0];\n    }\n}", "C++": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        return {};\n    }\n}"}'::jsonb,
    '{"Python": "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        prevMap = {}\n        for i, n in enumerate(nums):\n            diff = target - n\n            if diff in prevMap:\n                return [prevMap[diff], i]\n            prevMap[n] = i\n        return []", "JavaScript": "function twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (map.has(diff)) {\n            return [map.get(diff), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}", "Java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        HashMap<Integer, Integer> prevMap = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int num = nums[i];\n            int diff = target - num;\n            if (prevMap.containsKey(diff)) {\n                return new int[] { prevMap.get(diff), i };\n            }\n            prevMap.put(num, i);\n        }\n        return new int[] {};\n    }\n}", "C++": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> prevMap;\n        for (int i = 0; i < nums.size(); i++) {\n            int num = nums[i];\n            int diff = target - num;\n            if (prevMap.find(diff) != prevMap.end()) {\n                return {prevMap[diff], i};\n            }\n            prevMap[num] = i;\n        }\n        return {};\n    }\n}"}'::jsonb,
    '{"time": "O(N)", "space": "O(N)"}'::jsonb,
    '[{"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "explanation": "Because nums[0] + nums[1] == 2 + 7 == 9, we return [0, 1]."}, {"input": "nums = [3,2,4], target = 6", "output": "[1,2]", "explanation": "Because nums[1] + nums[2] == 2 + 4 == 6, we return [1, 2]."}]'::jsonb,
    '49.5%'
  ),
  (
    'q2222222-2222-2222-2222-222222222222',
    'c2222222-2222-2222-2222-222222222222',
    'Reverse String',
    'reverse-string',
    'Write a function that reverses a string. The input string is given as an array of characters s.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.',
    'Easy',
    ARRAY['1 <= s.length <= 10^5', 's[i] is a printable ascii character.'],
    's = ["h","e","l","l","o"]',
    '["o","l","l","e","h"]',
    'The characters are reversed in-place from left to right.',
    ARRAY['amazon', 'microsoft', 'wipro', 'cognizant'],
    '{"Python": "class Solution:\n    def reverseString(self, s: List[str]) -> None:\n        pass", "JavaScript": "function reverseString(s) {\n    \n}", "Java": "class Solution {\n    public void reverseString(char[] s) {\n        \n    }\n}", "C++": "class Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        \n    }\n}"}'::jsonb,
    '{"Python": "class Solution:\n    def reverseString(self, s: List[str]) -> None:\n        left, right = 0, len(s) - 1\n        while left < right:\n            s[left], s[right] = s[right], s[left]\n            left, right = left + 1, right - 1", "JavaScript": "function reverseString(s) {\n    let left = 0, right = s.length - 1;\n    while (left < right) {\n        const temp = s[left];\n        s[left] = s[right];\n        s[right] = temp;\n        left++;\n        right--;\n    }\n}", "Java": "class Solution {\n    public void reverseString(char[] s) {\n        int left = 0, right = s.length - 1;\n        while (left < right) {\n            char temp = s[left];\n            s[left] = s[right];\n            s[right] = temp;\n            left++;\n            right--;\n        }\n    }\n}", "C++": "class Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        int left = 0, right = s.size() - 1;\n        while (left < right) {\n            swap(s[left], s[right]);\n            left++;\n            right--;\n        }\n    }\n}"}'::jsonb,
    '{"time": "O(N)", "space": "O(1)"}'::jsonb,
    '[{"input": "s = [\"h\",\"e\",\"l\",\"l\",\"o\"]", "output": "[\"o\",\"l\",\"l\",\"e\",\"h\"]"}, {"input": "s = [\"H\",\"a\",\"n\",\"n\",\"a\",\"h\"]", "output": "[\"h\",\"a\",\"n\",\"n\",\"a\",\"H\"]"}]'::jsonb,
    '75.2%'
  ),
  (
    'q3333333-3333-3333-3333-333333333333',
    'c3333333-3333-3333-3333-333333333333',
    'Reverse Linked List',
    'reverse-linked-list',
    'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    'Easy',
    ARRAY['The number of nodes in the list is the range [0, 5000].', '-5000 <= Node.val <= 5000'],
    'head = [1,2,3,4,5]',
    '[5,4,3,2,1]',
    'Reversing the links: [1->2->3->4->5] becomes [5->4->3->2->1].',
    ARRAY['amazon', 'google', 'facebook', 'tcs', 'accenture'],
    '{"Python": "# Definition for singly-linked list.\n# class ListNode:\n#     def __init__(self, val=0, next=None):\n#         self.val = val\n#         self.next = next\nclass Solution:\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        pass", "JavaScript": "function reverseList(head) {\n    \n}", "Java": "class Solution {\n    public ListNode reverseList(ListNode head) {\n        return null;\n    }\n}", "C++": "class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        return nullptr;\n    }\n}"}'::jsonb,
    '{"Python": "class Solution:\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        prev, curr = None, head\n        while curr:\n            nxt = curr.next\n            curr.next = prev\n            prev = curr\n            curr = nxt\n        return prev", "JavaScript": "function reverseList(head) {\n    let prev = null, curr = head;\n    while (curr) {\n        const nxt = curr.next;\n        curr.next = prev;\n        prev = curr;\n        curr = nxt;\n    }\n    return prev;", "Java": "class Solution {\n    public ListNode reverseList(ListNode head) {\n        ListNode prev = null;\n        ListNode curr = head;\n        while (curr != null) {\n            ListNode nxt = curr.next;\n            curr.next = prev;\n            prev = curr;\n            curr = nxt;\n        }\n        return prev;\n    }\n}", "C++": "class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        ListNode* prev = nullptr;\n        ListNode* curr = head;\n        while (curr != nullptr) {\n            ListNode* nxt = curr->next;\n            curr->next = prev;\n            prev = curr;\n            curr = nxt;\n        }\n        return prev;\n    }\n}"}'::jsonb,
    '{"time": "O(N)", "space": "O(1)"}'::jsonb,
    '[{"input": "head = [1,2,3,4,5]", "output": "[5,4,3,2,1]"}, {"input": "head = [1,2]", "output": "[2,1]"}]'::jsonb,
    '62.8%'
  ),
  (
    'q4444444-4444-4444-4444-444444444444',
    'c4444444-4444-4444-4444-444444444444',
    'Valid Parentheses',
    'valid-parentheses',
    'Given a string s containing just the characters ''('', '')'', ''{'', ''}'', ''['' and '']'', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
    'Easy',
    ARRAY['1 <= s.length <= 10^4', 's consists of parentheses only ''()[]{}''.'],
    's = "()[]{}"',
    'true',
    'Every brackets are properly balanced and matched.',
    ARRAY['amazon', 'google', 'microsoft', 'accenture', 'infosys'],
    '{"Python": "class Solution:\n    def isValid(self, s: str) -> bool:\n        pass", "JavaScript": "function isValid(s) {\n    \n}", "Java": "class Solution {\n    public boolean isValid(String s) {\n        return false;\n    }\n}", "C++": "class Solution {\npublic:\n    bool isValid(string s) {\n        return false;\n    }\n}"}'::jsonb,
    '{"Python": "class Solution:\n    def isValid(self, s: str) -> bool:\n        stack = []\n        closeToOpen = {\")\": \"(\", \"]\": \"[\", \"}\": \"{\"}\n        for c in s:\n            if c in closeToOpen:\n                if stack and stack[-1] == closeToOpen[c]:\n                    stack.pop()\n                else:\n                    return False\n            else:\n                stack.append(c)\n        return True if not stack else False", "JavaScript": "function isValid(s) {\n    const stack = [];\n    const mapping = { \")\": \"(\", \"]\": \"[\", \"}\": \"{\" };\n    for (let char of s) {\n        if (mapping[char]) {\n            const topElement = stack.length === 0 ? ''#'' : stack.pop();\n            if (topElement !== mapping[char]) {\n                return false;\n            }\n        } else {\n            stack.push(char);\n        }\n    }\n    return stack.length === 0;\n}", "Java": "class Solution {\n    public boolean isValid(String s) {\n        Stack<Character> stack = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (c == ''('' || c == ''{'' || c == ''['') {\n                stack.push(c);\n            } else {\n                if (stack.isEmpty()) return false;\n                char top = stack.pop();\n                if (c == '')'' && top != ''('') return false;\n                if (c == ''}'' && top != ''{'') return false;\n                if (c == '']'' && top != ''['') return false;\n            }\n        }\n        return stack.isEmpty();\n    }\n}", "C++": "class Solution {\npublic:\n    bool isValid(string s) {\n        stack<char> st;\n        for (char c : s) {\n            if (c == ''('' || c == ''{'' || c == ''['') {\n                st.push(c);\n            } else {\n                if (st.empty()) return false;\n                if (c == '')'' && st.top() != ''('') return false;\n                if (c == ''}'' && st.top() != ''{'') return false;\n                if (c == '']'' && st.top() != ''['') return false;\n                st.pop();\n            }\n        }\n        return st.empty();\n    }\n}"}'::jsonb,
    '{"time": "O(N)", "space": "O(N)"}'::jsonb,
    '[{"input": "s = \"()\"", "output": "true"}, {"input": "s = \"()[]{}\"", "output": "true"}, {"input": "s = \"(]\"", "output": "false"}]'::jsonb,
    '40.8%'
  )
ON CONFLICT (id) DO NOTHING;

-- 7. Insert Company Roadmaps
-- Insert roadmaps for seeded companies: TCS, Infosys, Wipro, Cognizant, Accenture, Capgemini, Amazon, Microsoft, Google
-- First, query the ID of companies to avoid hardcoding or use subqueries.
-- Since the companies table was seeded with a slug, we can use a subquery to insert the roadmaps.

-- TCS Roadmap
INSERT INTO public.company_roadmaps (company_id, overview, preparation_tips)
SELECT id, 
  'TCS (Tata Consultancy Services) is one of the largest IT services and consulting companies globally. The hiring process assesses core foundation skills in aptitude, basic logical reasoning, coding, and technical CS fundamentals.',
  ARRAY[
    'Focus on quantitative aptitude and logical reasoning speed.',
    'Master basic array and string programming tasks.',
    'Understand fundamental SQL queries, normalization, and relational databases.',
    'Prepare basic object-oriented programming concepts (OOP).'
  ]
FROM public.companies WHERE slug = 'tcs'
ON CONFLICT (company_id) DO NOTHING;

-- Amazon Roadmap
INSERT INTO public.company_roadmaps (company_id, overview, preparation_tips)
SELECT id, 
  'Amazon is a global technology leader in e-commerce, cloud computing, and AI. The SDE interview process is extremely rigorous, focusing on Data Structures & Algorithms, System Design, and Amazon Leadership Principles.',
  ARRAY[
    'Solve medium and hard LeetCode problems, particularly on trees, graphs, dynamic programming, and heaps.',
    'Understand OOP and solid design patterns.',
    'Master the Amazon Leadership Principles using the STAR method (Situation, Task, Action, Result).',
    'Practice system design (scalability, caching, databases) for SDE-2+ roles.'
  ]
FROM public.companies WHERE slug = 'amazon'
ON CONFLICT (company_id) DO NOTHING;

-- Google Roadmap
INSERT INTO public.company_roadmaps (company_id, overview, preparation_tips)
SELECT id, 
  'Google is a global tech giant known for search, advertising, cloud, and hardware. Interviews focus heavily on dynamic problem-solving, advanced algorithms, and Googleyness & leadership.',
  ARRAY[
    'Solve complex algorithm problems on graphs, dynamic programming, and recursion.',
    'Write clean, readable, and highly optimized code.',
    'Review system design concepts (scalability, storage, messaging queues).',
    'Demonstrate Googleyness (collaboration, feedback reception, and ethical thinking).'
  ]
FROM public.companies WHERE slug = 'google'
ON CONFLICT (company_id) DO NOTHING;

-- Other company roadmaps...
INSERT INTO public.company_roadmaps (company_id, overview, preparation_tips)
SELECT id, 
  'Infosys is a global leader in next-generation digital services and consulting. Hires freshers via InfyTQ and campus recruitment.',
  ARRAY[
    'Master Java or Python programming concepts.',
    'Practice SQL queries and normalization.',
    'Improve logical and verbal reasoning speed.',
    'Stay updated with emerging software trends.'
  ]
FROM public.companies WHERE slug = 'infosys'
ON CONFLICT (company_id) DO NOTHING;

INSERT INTO public.company_roadmaps (company_id, overview, preparation_tips)
SELECT id, 
  'Wipro is a leading global information technology, consulting, and business process services company. Hires freshers via NLTH.',
  ARRAY[
    'Focus on basic aptitude (quantitative and logical).',
    'Improve written and verbal communication.',
    'Practice C/C++/Java basics.',
    'Understand fundamental computer networking and OS concepts.'
  ]
FROM public.companies WHERE slug = 'wipro'
ON CONFLICT (company_id) DO NOTHING;

INSERT INTO public.company_roadmaps (company_id, overview, preparation_tips)
SELECT id, 
  'Cognizant is a leading professional services company, transforming clients'' business, operating, and technology models.',
  ARRAY[
    'Practice quantitative, logical, and verbal aptitude.',
    'Prepare basic automation testing and SQL queries.',
    'Improve communication and behavioral round preparation.',
    'Work on coding logic speed.'
  ]
FROM public.companies WHERE slug = 'cognizant'
ON CONFLICT (company_id) DO NOTHING;

INSERT INTO public.company_roadmaps (company_id, overview, preparation_tips)
SELECT id, 
  'Accenture is a global professional services company with leading capabilities in digital, cloud, and security.',
  ARRAY[
    'Practice cognitive and technical assessment modules.',
    'Master basic algorithms and array/string manipulations.',
    'Work on communication and presentation skills.',
    'Understand business logic and basic software architectures.'
  ]
FROM public.companies WHERE slug = 'accenture'
ON CONFLICT (company_id) DO NOTHING;

INSERT INTO public.company_roadmaps (company_id, overview, preparation_tips)
SELECT id, 
  'Capgemini is a global leader in partnering with companies to transform and manage their business by harnessing technology.',
  ARRAY[
    'Improve aptitude test-taking speed.',
    'Practice basic web technologies (HTML, CSS, JS).',
    'Revise SQL and database topics.',
    'Understand basic software lifecycle models.'
  ]
FROM public.companies WHERE slug = 'capgemini'
ON CONFLICT (company_id) DO NOTHING;

INSERT INTO public.company_roadmaps (company_id, overview, preparation_tips)
SELECT id, 
  'Microsoft is a global technology corporation focusing on cloud, software, hardware, and services. SDE interviews are highly technical and analytical.',
  ARRAY[
    'Solve DSA problems on trees, heaps, stacks, and queues.',
    'Understand object-oriented design and design patterns.',
    'Learn Microsoft culture and values.',
    'Review system design concepts for scalable services.'
  ]
FROM public.companies WHERE slug = 'microsoft'
ON CONFLICT (company_id) DO NOTHING;

-- 8. Map Topics/Questions to Companies
-- Let''s link aptitude topics and coding topics to the companies.
-- Aptitude Topic UUIDs:
--   ''11111111-1111-1111-1111-111111111111'' - Percentage
--   ''22222222-2222-2222-2222-222222222222'' - Profit & Loss
--   ''33333333-3333-3333-3333-333333333333'' - Time & Work
--   ''44444444-4444-4444-4444-444444444444'' - Ratio
--   ''88888888-8888-8888-8888-888888888888'' - Logical Reasoning
--   ''99999999-9999-9999-9999-999999999999'' - Verbal Ability
--   ''aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'' - Data Interpretation

-- Coding Topic UUIDs:
--   ''c1111111-1111-1111-1111-111111111111'' - Arrays
--   ''c2222222-2222-2222-2222-222222222222'' - Strings
--   ''c3333333-3333-3333-3333-333333333333'' - Linked List
--   ''c4444444-4444-4444-4444-444444444444'' - Stack
--   ''c5555555-5555-5555-5555-555555555555'' - Queue
--   ''c6666666-6666-6666-6666-666666666666'' - Trees
--   ''c7777777-7777-7777-7777-777777777777'' - BST
--   ''c8888888-8888-8888-8888-888888888888'' - Heap
--   ''c9999999-9999-9999-9999-999999999999'' - Graph
--   ''caaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'' - DP
--   ''cbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'' - Recursion
--   ''cccccccc-cccc-cccc-cccc-cccccccccccc'' - Backtracking

-- Let''s map some topics to TCS
INSERT INTO public.company_topics (company_id, topic_type, reference_id)
SELECT id, ''aptitude'', ''11111111-1111-1111-1111-111111111111'' FROM public.companies WHERE slug = ''tcs'' UNION ALL
SELECT id, ''aptitude'', ''22222222-2222-2222-2222-222222222222'' FROM public.companies WHERE slug = ''tcs'' UNION ALL
SELECT id, ''aptitude'', ''33333333-3333-3333-3333-333333333333'' FROM public.companies WHERE slug = ''tcs'' UNION ALL
SELECT id, ''coding'', ''c1111111-1111-1111-1111-111111111111'' FROM public.companies WHERE slug = ''tcs'' UNION ALL
SELECT id, ''coding'', ''c2222222-2222-2222-2222-222222222222'' FROM public.companies WHERE slug = ''tcs''
ON CONFLICT DO NOTHING;

-- Let''s map some topics to Amazon
INSERT INTO public.company_topics (company_id, topic_type, reference_id)
SELECT id, ''coding'', ''c1111111-1111-1111-1111-111111111111'' FROM public.companies WHERE slug = ''amazon'' UNION ALL
SELECT id, ''coding'', ''c3333333-3333-3333-3333-333333333333'' FROM public.companies WHERE slug = ''amazon'' UNION ALL
SELECT id, ''coding'', ''c6666666-6666-6666-6666-666666666666'' FROM public.companies WHERE slug = ''amazon'' UNION ALL
SELECT id, ''coding'', ''c9999999-9999-9999-9999-999999999999'' FROM public.companies WHERE slug = ''amazon'' UNION ALL
SELECT id, ''coding'', ''caaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'' FROM public.companies WHERE slug = ''amazon''
ON CONFLICT DO NOTHING;

-- Let''s map some topics to Google
INSERT INTO public.company_topics (company_id, topic_type, reference_id)
SELECT id, ''coding'', ''c9999999-9999-9999-9999-999999999999'' FROM public.companies WHERE slug = ''google'' UNION ALL
SELECT id, ''coding'', ''caaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'' FROM public.companies WHERE slug = ''google'' UNION ALL
SELECT id, ''coding'', ''cccccccc-cccc-cccc-cccc-cccccccccccc'' FROM public.companies WHERE slug = ''google''
ON CONFLICT DO NOTHING;


