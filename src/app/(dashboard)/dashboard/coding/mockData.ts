import { codingProblems } from "@/data/coding/problems";
export { codingProblems as mockProblems };
export type { CodingProblem } from "@/data/coding/problems";

export interface TopicCard {
  name: string;
  questionsCount: number;
  completedPercentage: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
}

export interface CompanyPractice {
  name: string;
  logo: string;
  questionsCount: number;
  difficulty: "Easy" | "Medium" | "Hard" | "Advanced";
  progressPercentage: number;
  topics: string[];
}

export interface LeaderboardRow {
  rank: number;
  name: string;
  score: number;
  problemsSolved: number;
  streak: number;
  isCurrentUser?: boolean;
}

export interface BadgeCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface AIRecommendation {
  title: string;
  desc: string;
  count: number;
  action: string;
  priority: "high" | "medium" | "low";
}

export interface Submission {
  id: string;
  problemId: string;
  problemTitle: string;
  language: string;
  status: "Accepted" | "Wrong Answer" | "Time Limit Exceeded" | "Compile Error";
  executionTime: number;
  memoryUsed: number;
  submittedAt: string;
  testCasesPassed: number;
  totalTestCases: number;
}

export const mockCodingStats = {
  solvedEasy: 45,
  totalEasy: 120,
  solvedMedium: 32,
  totalMedium: 200,
  solvedHard: 8,
  totalHard: 80,
  accuracy: 82,
  streak: 7,
  rating: 1680,
  readinessIndex: 78,
};

export const mockTopics: TopicCard[] = [
  { name: "Arrays", questionsCount: 45, completedPercentage: 80, easyCount: 20, mediumCount: 18, hardCount: 7 },
  { name: "Strings", questionsCount: 35, completedPercentage: 60, easyCount: 15, mediumCount: 15, hardCount: 5 },
  { name: "Linked Lists", questionsCount: 25, completedPercentage: 40, easyCount: 10, mediumCount: 10, hardCount: 5 },
  { name: "Stack", questionsCount: 20, completedPercentage: 50, easyCount: 8, mediumCount: 8, hardCount: 4 },
  { name: "Queue", questionsCount: 15, completedPercentage: 30, easyCount: 5, mediumCount: 7, hardCount: 3 },
  { name: "Trees", questionsCount: 40, completedPercentage: 25, easyCount: 10, mediumCount: 20, hardCount: 10 },
  { name: "Binary Search Trees", questionsCount: 20, completedPercentage: 35, easyCount: 6, mediumCount: 10, hardCount: 4 },
  { name: "Heaps", questionsCount: 15, completedPercentage: 20, easyCount: 3, mediumCount: 8, hardCount: 4 },
  { name: "Hashing", questionsCount: 22, completedPercentage: 65, easyCount: 8, mediumCount: 10, hardCount: 4 },
  { name: "Recursion", questionsCount: 15, completedPercentage: 70, easyCount: 5, mediumCount: 7, hardCount: 3 },
  { name: "Backtracking", questionsCount: 18, completedPercentage: 30, easyCount: 3, mediumCount: 10, hardCount: 5 },
  { name: "Dynamic Programming", questionsCount: 50, completedPercentage: 15, easyCount: 5, mediumCount: 25, hardCount: 20 },
  { name: "Graphs", questionsCount: 30, completedPercentage: 20, easyCount: 5, mediumCount: 15, hardCount: 10 },
  { name: "Greedy Algorithms", questionsCount: 25, completedPercentage: 45, easyCount: 8, mediumCount: 12, hardCount: 5 },
  { name: "Searching", questionsCount: 15, completedPercentage: 85, easyCount: 8, mediumCount: 5, hardCount: 2 },
  { name: "Sorting", questionsCount: 20, completedPercentage: 90, easyCount: 10, mediumCount: 7, hardCount: 3 },
];

export const mockCompanyPractice: CompanyPractice[] = [
  { name: "TCS", logo: "TCS", questionsCount: 50, difficulty: "Easy", progressPercentage: 60, topics: ["Arrays", "Strings", "Linked Lists"] },
  { name: "Infosys", logo: "INFY", questionsCount: 40, difficulty: "Easy", progressPercentage: 45, topics: ["Arrays", "Hashing", "Recursion"] },
  { name: "Wipro", logo: "WIPR", questionsCount: 30, difficulty: "Easy", progressPercentage: 70, topics: ["Arrays", "Strings", "Sorting"] },
  { name: "Cognizant", logo: "CTS", questionsCount: 35, difficulty: "Medium", progressPercentage: 55, topics: ["Arrays", "Searching", "Trees"] },
  { name: "Accenture", logo: "ACN", questionsCount: 42, difficulty: "Medium", progressPercentage: 35, topics: ["Strings", "Linked Lists", "Stacks"] },
  { name: "Capgemini", logo: "CAP", questionsCount: 38, difficulty: "Medium", progressPercentage: 20, topics: ["Arrays", "Recursion", "Sorting"] },
  { name: "Amazon", logo: "AMZN", questionsCount: 85, difficulty: "Advanced", progressPercentage: 20, topics: ["DP", "Graphs", "Trees", "Backtracking"] },
  { name: "Microsoft", logo: "MSFT", questionsCount: 95, difficulty: "Advanced", progressPercentage: 15, topics: ["DP", "Graphs", "Strings", "Linked Lists"] },
  { name: "Google", logo: "GOOG", questionsCount: 110, difficulty: "Advanced", progressPercentage: 10, topics: ["DP", "Graphs", "Backtracking", "Heaps"] },
];

export const mockSubmissions: Submission[] = [
  { id: "sub-1", problemId: "two-sum", problemTitle: "Two Sum", language: "Python", status: "Accepted", executionTime: 45, memoryUsed: 14.2, submittedAt: "2026-06-07T10:30:00Z", testCasesPassed: 57, totalTestCases: 57 },
  { id: "sub-2", problemId: "two-sum", problemTitle: "Two Sum", language: "JavaScript", status: "Accepted", executionTime: 52, memoryUsed: 15.1, submittedAt: "2026-06-06T14:20:00Z", testCasesPassed: 57, totalTestCases: 57 },
  { id: "sub-3", problemId: "reverse-linked-list", problemTitle: "Reverse Linked List", language: "Python", status: "Wrong Answer", executionTime: 38, memoryUsed: 13.8, submittedAt: "2026-06-05T09:15:00Z", testCasesPassed: 12, totalTestCases: 25 },
  { id: "sub-4", problemId: "longest-palindromic-substring", problemTitle: "Longest Palindromic Substring", language: "Java", status: "Accepted", executionTime: 120, memoryUsed: 42.5, submittedAt: "2026-06-04T16:45:00Z", testCasesPassed: 48, totalTestCases: 48 },
  { id: "sub-5", problemId: "reverse-linked-list", problemTitle: "Reverse Linked List", language: "C++", status: "Compile Error", executionTime: 0, memoryUsed: 0, submittedAt: "2026-06-03T11:00:00Z", testCasesPassed: 0, totalTestCases: 25 },
  { id: "sub-6", problemId: "number-of-islands", problemTitle: "Number of Islands", language: "Python", status: "Time Limit Exceeded", executionTime: 2500, memoryUsed: 85.0, submittedAt: "2026-06-02T08:30:00Z", testCasesPassed: 8, totalTestCases: 10 },
  { id: "sub-7", problemId: "edit-distance", problemTitle: "Edit Distance", language: "Python", status: "Accepted", executionTime: 85, memoryUsed: 22.3, submittedAt: "2026-05-30T13:00:00Z", testCasesPassed: 40, totalTestCases: 40 },
];

export const mockLeaderboard: LeaderboardRow[] = [
  { rank: 1, name: "Siddharth Goel", score: 2840, problemsSolved: 420, streak: 45 },
  { rank: 2, name: "Aditi Rao", score: 2650, problemsSolved: 395, streak: 38 },
  { rank: 3, name: "Karan Johar", score: 2410, problemsSolved: 350, streak: 30 },
  { rank: 4, name: "Shahid (You)", score: 2150, problemsSolved: 85, streak: 7, isCurrentUser: true },
  { rank: 5, name: "Simran Kaur", score: 1980, problemsSolved: 210, streak: 15 },
  { rank: 6, name: "Rohan Mehta", score: 1820, problemsSolved: 185, streak: 12 },
  { rank: 7, name: "Priya Singh", score: 1650, problemsSolved: 150, streak: 8 },
  { rank: 8, name: "Amit Verma", score: 1480, problemsSolved: 120, streak: 5 },
];

export const mockAchievements: BadgeCard[] = [
  { id: "badge-1", title: "Hello Code World", description: "Successfully solve your first DSA challenge.", icon: "CheckCircle", unlocked: true },
  { id: "badge-2", title: "Centurion Coder", description: "Solve 100 coding challenges in practice panels.", icon: "Trophy", unlocked: false },
  { id: "badge-3", title: "Streak Master", description: "Maintain a 7-day preparation coding streak.", icon: "Flame", unlocked: true },
  { id: "badge-4", title: "Array Master", description: "Complete 80% of arrays topics challenges.", icon: "Box", unlocked: true },
  { id: "badge-5", title: "Graph Expert", description: "Solve 15 Hard/Medium graph problems.", icon: "Network", unlocked: false },
  { id: "badge-6", title: "Company Ready", description: "Complete Amazon SDE preparation track.", icon: "Building2", unlocked: false },
];

export const mockRecommendations: AIRecommendation[] = [
  { title: "Complete Trees Module", desc: "Trees are crucial for technical interviews. 75% of problems remain unsolved.", count: 12, action: "Start Practice", priority: "high" },
  { title: "Practice DP Problems", desc: "Dynamic Programming is the most asked topic in FAANG interviews.", count: 8, action: "Practice Now", priority: "high" },
  { title: "Attempt Amazon Coding Set", desc: "Amazon-specific 85 problem set covers all core DSA topics.", count: 15, action: "View Set", priority: "medium" },
  { title: "Review Graph Traversal", desc: "BFS/DFS highly asked in Google, Amazon and Uber screening tests.", count: 10, action: "Review Topic", priority: "medium" },
  { title: "Solve Weekly Contest", desc: "Improve your contest rating by participating in Placement Sprint.", count: 1, action: "Join Contest", priority: "low" },
];

export const mockAnalyticsData = {
  weeklySolved: [
    { name: "Week 1", solved: 5, correct: 3 },
    { name: "Week 2", solved: 12, correct: 9 },
    { name: "Week 3", solved: 8, correct: 6 },
    { name: "Week 4", solved: 15, correct: 12 },
    { name: "Week 5", solved: 22, correct: 18 },
    { name: "Week 6", solved: 23, correct: 19 },
  ],
  accuracyTrend: [
    { name: "Week 1", accuracy: 60 },
    { name: "Week 2", accuracy: 75 },
    { name: "Week 3", accuracy: 75 },
    { name: "Week 4", accuracy: 80 },
    { name: "Week 5", accuracy: 82 },
    { name: "Week 6", accuracy: 85 },
  ],
  topicCompletion: [
    { name: "Arrays", percentage: 80 },
    { name: "Strings", percentage: 60 },
    { name: "Recursion", percentage: 70 },
    { name: "Linked Lists", percentage: 40 },
    { name: "Sorting", percentage: 90 },
    { name: "Searching", percentage: 85 },
    { name: "DP", percentage: 15 },
    { name: "Graphs", percentage: 20 },
  ],
  difficultyBreakdown: [
    { name: "Easy", solved: 45, total: 120, color: "#22c55e" },
    { name: "Medium", solved: 32, total: 200, color: "#f59e0b" },
    { name: "Hard", solved: 8, total: 80, color: "#ef4444" },
  ],
  weeklyComparison: [
    { label: "This Week", value: 23 },
    { label: "Last Week", value: 22 },
    { label: "2 Weeks Ago", value: 15 },
    { label: "3 Weeks Ago", value: 8 },
  ],
  languagesUsed: [
    { name: "Python", percentage: 45 },
    { name: "JavaScript", percentage: 25 },
    { name: "Java", percentage: 18 },
    { name: "C++", percentage: 12 },
  ],
};

export const activeProblemIds = ["two-sum", "reverse-linked-list", "longest-palindromic-substring", "number-of-islands", "edit-distance"];
