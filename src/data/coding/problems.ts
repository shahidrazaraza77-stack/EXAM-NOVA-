export interface CodingProblem {
  id: string;
  title: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  acceptanceRate: string;
  status: "Solved" | "Attempted" | "Todo";
  tags: string[];
  description: string;
  constraints: string[];
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  explanation: string;
  complexity: {
    time: string;
    space: string;
  };
  boilerplates: Record<string, string>;
  optimalSolutions: Record<string, string>;
  companies: string[];
}

export const codingProblems: CodingProblem[] = [
  {
    id: "two-sum",
    title: "Two Sum",
    topic: "Arrays",
    difficulty: "Easy",
    acceptanceRate: "49.6%",
    status: "Solved",
    tags: ["Arrays", "Hash Table"],
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" }
    ],
    explanation: "We can solve this problem in O(N) time complexity using a Hash Map.\nAs we traverse the array, we check if the complement (target - current_value) exists in our hash map.",
    complexity: { time: "O(N) where N is the length of the array.", space: "O(N) to store values in the hash map." },
    boilerplates: {
      "C++": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write code here\n    }\n};",
      "Java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write code here\n    }\n}",
      "Python": "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # Write code here",
      "JavaScript": "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    // Write code here\n};"
    },
    optimalSolutions: {
      "C++": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> mp;\n        for (int i = 0; i < nums.size(); i++) {\n            int complement = target - nums[i];\n            if (mp.count(complement)) return {mp[complement], i};\n            mp[nums[i]] = i;\n        }\n        return {};\n    }\n};",
      "Java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) return new int[] { map.get(complement), i };\n            map.put(nums[i], i);\n        }\n        throw new IllegalArgumentException(\"No solution found\");\n    }\n}",
      "Python": "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        prevMap = {}\n        for i, n in enumerate(nums):\n            diff = target - n\n            if diff in prevMap:\n                return [prevMap[diff], i]\n            prevMap[n] = i\n        return []",
      "JavaScript": "var twoSum = function(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) return [map.get(complement), i];\n        map.set(nums[i], i);\n    }\n    return [];\n};"
    },
    companies: ["tcs", "infosys", "wipro", "cognizant", "accenture", "capgemini", "hcl", "tech-mahindra", "amazon", "google", "microsoft", "adobe"],
  },
  {
    id: "reverse-linked-list",
    title: "Reverse Linked List",
    topic: "Linked Lists",
    difficulty: "Easy",
    acceptanceRate: "73.2%",
    status: "Todo",
    tags: ["Linked Lists", "Recursion"],
    description: "Given the `head` of a singly linked list, reverse the list, and return *the reversed list*.",
    constraints: [
      "The number of nodes in the list is the range [0, 5000].",
      "-5000 <= Node.val <= 5000"
    ],
    examples: [
      { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" },
      { input: "head = [1,2]", output: "[2,1]" }
    ],
    explanation: "We can reverse the list iteratively by keeping track of three pointers: `prev` (NULL), `curr` (head), and `next` (to store the next node temporarily).",
    complexity: { time: "O(N) where N is the number of nodes.", space: "O(1) auxiliary space." },
    boilerplates: {
      "C++": "/**\n * Definition for singly-linked list.\n * struct ListNode {\n *     int val;\n *     ListNode *next;\n *     ListNode() : val(0), next(nullptr) {}\n *     ListNode(x) : val(x), next(nullptr) {}\n * };\n */\nclass Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        // Write code here\n    }\n};",
      "Java": "/**\n * Definition for singly-linked list.\n * public class ListNode {\n *     int val;\n *     ListNode next;\n *     ListNode(int val) { this.val = val; }\n * }\n */\nclass Solution {\n    public ListNode reverseList(ListNode head) {\n        // Write code here\n    }\n}",
      "Python": "# Definition for singly-linked list.\n# class ListNode:\n#     def __init__(self, val=0, next=None):\n#         self.val = val\n#         self.next = next\nclass Solution:\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        # Write code here",
      "JavaScript": "/**\n * Definition for singly-linked list.\n * function ListNode(val, next) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.next = (next===undefined ? null : next)\n * }\n */\nvar reverseList = function(head) {\n    // Write code here\n};"
    },
    optimalSolutions: {
      "C++": "class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        ListNode* prev = nullptr;\n        ListNode* curr = head;\n        while (curr) {\n            ListNode* nextTemp = curr->next;\n            curr->next = prev;\n            prev = curr;\n            curr = nextTemp;\n        }\n        return prev;\n    }\n};",
      "Java": "class Solution {\n    public ListNode reverseList(ListNode head) {\n        ListNode prev = null;\n        ListNode curr = head;\n        while (curr != null) {\n            ListNode nextTemp = curr.next;\n            curr.next = prev;\n            prev = curr;\n            curr = nextTemp;\n        }\n        return prev;\n    }\n}",
      "Python": "class Solution:\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        prev = None\n        curr = head\n        while curr:\n            nxt = curr.next\n            curr.next = prev\n            prev = curr\n            curr = nxt\n        return prev",
      "JavaScript": "var reverseList = function(head) {\n    let prev = null;\n    let curr = head;\n    while (curr) {\n        let nxt = curr.next;\n        curr.next = prev;\n        prev = curr;\n        curr = nxt;\n    }\n    return prev;\n};"
    },
    companies: ["tcs", "infosys", "wipro", "cognizant", "accenture", "capgemini", "hcl", "tech-mahindra", "amazon", "google", "microsoft", "adobe"],
  },
  {
    id: "longest-palindromic-substring",
    title: "Longest Palindromic Substring",
    topic: "Strings",
    difficulty: "Medium",
    acceptanceRate: "32.4%",
    status: "Attempted",
    tags: ["Strings", "Dynamic Programming"],
    description: "Given a string `s`, return *the longest palindromic substring* in `s`.",
    constraints: [
      "1 <= s.length <= 1000",
      "`s` consists of only digits and English letters."
    ],
    examples: [
      { input: "s = \"babad\"", output: "\"bab\"", explanation: "\"aba\" is also a valid answer." },
      { input: "s = \"cbbd\"", output: "\"bb\"" }
    ],
    explanation: "We can solve this by expanding around center. A palindrome mirrors around its center. There are 2N - 1 centers (odd and even length centers).",
    complexity: { time: "O(N^2) where N is the length of the string.", space: "O(1) constant auxiliary space." },
    boilerplates: {
      "C++": "class Solution {\npublic:\n    string longestPalindrome(string s) {\n        // Write code here\n    }\n};",
      "Java": "class Solution {\n    public String longestPalindrome(String s) {\n        // Write code here\n    }\n}",
      "Python": "class Solution:\n    def longestPalindrome(self, s: str) -> str:\n        # Write code here",
      "JavaScript": "var longestPalindrome = function(s) {\n    // Write code here\n};"
    },
    optimalSolutions: {
      "Python": "class Solution:\n    def longestPalindrome(self, s: str) -> str:\n        res = \"\"\n        resLen = 0\n        for i in range(len(s)):\n            l, r = i, i\n            while l >= 0 and r < len(s) and s[l] == s[r]:\n                if (r - l + 1) > resLen:\n                    res = s[l:r+1]\n                    resLen = r - l + 1\n                l -= 1\n                r += 1\n            l, r = i, i + 1\n            while l >= 0 and r < len(s) and s[l] == s[r]:\n                if (r - l + 1) > resLen:\n                    res = s[l:r+1]\n                    resLen = r - l + 1\n                l -= 1\n                r += 1\n        return res"
    },
    companies: ["amazon", "google", "microsoft", "adobe"],
  },
  {
    id: "number-of-islands",
    title: "Number of Islands",
    topic: "Graphs",
    difficulty: "Medium",
    acceptanceRate: "57.8%",
    status: "Todo",
    tags: ["Graphs", "BFS", "DFS"],
    description: "Given an `m x n` 2D binary grid `grid` which represents a map of `'1'`s (land) and `'0'`s (water), return *the number of islands*.\n\nAn island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.",
    constraints: [
      "m == grid.length",
      "n == grid[i].length",
      "1 <= m, n <= 300",
      "grid[i][j] is '0' or '1'."
    ],
    examples: [
      { input: "grid = [\n  [\"1\",\"1\",\"1\",\"1\",\"0\"],\n  [\"1\",\"1\",\"0\",\"1\",\"0\"],\n  [\"1\",\"1\",\"0\",\"0\",\"0\"],\n  [\"0\",\"0\",\"0\",\"0\",\"0\"]\n]", output: "1" }
    ],
    explanation: "We traverse the grid. When we find a '1', we increment island count and trigger DFS to mark all adjacent connected land nodes as visited.",
    complexity: { time: "O(M * N) where M is rows and N is columns.", space: "O(M * N) in the worst case for call stack recursion." },
    boilerplates: {
      "Python": "class Solution:\n    def numIslands(self, grid: List[List[str]]) -> int:\n        # Write code here"
    },
    optimalSolutions: {
      "Python": "class Solution:\n    def numIslands(self, grid: List[List[str]]) -> int:\n        if not grid: return 0\n        rows, cols = len(grid), len(grid[0])\n        visit = set()\n        islands = 0\n        def dfs(r, c):\n            if (r < 0 or c < 0 or r == rows or c == cols or grid[r][c] == \"0\" or (r, c) in visit):\n                return\n            visit.add((r, c))\n            dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1)\n        for r in range(rows):\n            for c in range(cols):\n                if grid[r][c] == \"1\" and (r, c) not in visit:\n                    dfs(r, c)\n                    islands += 1\n        return islands"
    },
    companies: ["amazon", "google"],
  },
  {
    id: "edit-distance",
    title: "Edit Distance",
    topic: "Dynamic Programming",
    difficulty: "Hard",
    acceptanceRate: "52.4%",
    status: "Todo",
    tags: ["Dynamic Programming", "Strings"],
    description: "Given two strings `word1` and `word2`, return *the minimum number of operations required to convert `word1` to `word2`*.\n\nYou have the following three operations permitted on a word:\n- Insert a character\n- Delete a character\n- Replace a character",
    constraints: [
      "0 <= word1.length, word2.length <= 500",
      "word1 and word2 consist of lowercase English letters."
    ],
    examples: [
      { input: "word1 = \"horse\", word2 = \"ros\"", output: "3", explanation: "horse -> rorse (replace 'h' with 'r')\nrorse -> rose (remove 'r')\nrose -> ros (remove 'e')" }
    ],
    explanation: "This is a classic 2D Dynamic Programming problem. We create a 2D grid DP where dp[i][j] stores the edit distance to match word1[i:] and word2[j:].",
    complexity: { time: "O(M * N) where M, N are lengths of word1 and word2.", space: "O(M * N) to store the DP table." },
    boilerplates: {
      "Python": "class Solution:\n    def minDistance(self, word1: str, word2: str) -> int:\n        # Write code here"
    },
    optimalSolutions: {
      "Python": "class Solution:\n    def minDistance(self, word1: str, word2: str) -> int:\n        dp = [[float(\"inf\")] * (len(word2) + 1) for _ in range(len(word1) + 1)]\n        for j in range(len(word2) + 1):\n            dp[len(word1)][j] = len(word2) - j\n        for i in range(len(word1) + 1):\n            dp[i][len(word2)] = len(word1) - i\n        for i in range(len(word1) - 1, -1, -1):\n            for j in range(len(word2) - 1, -1, -1):\n                if word1[i] == word2[j]:\n                    dp[i][j] = dp[i + 1][j + 1]\n                else:\n                    dp[i][j] = 1 + min(dp[i + 1][j], dp[i][j + 1], dp[i + 1][j + 1])\n        return dp[0][0]"
    },
    companies: ["amazon", "google", "microsoft", "adobe"],
  },
];

export function getCodingProblemsByCompany(companyId: string): CodingProblem[] {
  return codingProblems.filter(p => p.companies.includes(companyId));
}

export function getCodingProblemsByTopic(topic: string): CodingProblem[] {
  return codingProblems.filter(p => p.topic.toLowerCase() === topic.toLowerCase());
}
