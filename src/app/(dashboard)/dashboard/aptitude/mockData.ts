export interface Topic {
  name: string;
  questionsCount: number;
  completedCount: number;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  questionsCount: number;
  completedCount: number;
  topics: Topic[];
}

export interface MockTest {
  id: string;
  title: string;
  questionsCount: number;
  durationMinutes: number;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  category: "topic" | "mixed" | "company" | "full";
  topic?: string;
}

export interface CompanyPractice {
  id: string;
  name: string;
  logo: string;
  questionsCount: number;
  difficulty: "Easy" | "Medium" | "Hard";
  progress: number;
  topics: string[];
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  score: number;
  accuracy: number;
  streak: number;
  isCurrentUser?: boolean;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface SampleQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  estimatedTime: string;
}

export interface AIRecommendation {
  title: string;
  desc: string;
  action: string;
  priority: "high" | "medium" | "low";
}

export const mockDashboardStats = {
  totalSolved: 342,
  totalQuestions: 1200,
  accuracy: 78,
  averageScore: 82,
  dailyStreak: 5,
  timeSpent: "28h 15m",
};

export const mockCategories: Category[] = [
  {
    id: "quantitative",
    name: "Quantitative Aptitude",
    icon: "Calculator",
    description: "Arithmetic, algebra, geometry, and number word problems.",
    questionsCount: 450,
    completedCount: 165,
    topics: [
      { name: "Percentage", questionsCount: 50, completedCount: 35, difficulty: "Easy" },
      { name: "Profit & Loss", questionsCount: 65, completedCount: 22, difficulty: "Easy" },
      { name: "Time & Work", questionsCount: 60, completedCount: 15, difficulty: "Medium" },
      { name: "Time, Speed & Distance", questionsCount: 75, completedCount: 28, difficulty: "Medium" },
      { name: "Ratio & Proportion", questionsCount: 80, completedCount: 40, difficulty: "Easy" },
      { name: "Number System", questionsCount: 60, completedCount: 15, difficulty: "Medium" },
      { name: "Simple Interest", questionsCount: 60, completedCount: 10, difficulty: "Easy" },
    ],
  },
  {
    id: "logical",
    name: "Logical Reasoning",
    icon: "BrainCircuit",
    description: "Logic patterns, blood relations, puzzles, and spatial reasoning.",
    questionsCount: 350,
    completedCount: 110,
    topics: [
      { name: "Puzzles", questionsCount: 80, completedCount: 20, difficulty: "Hard" },
      { name: "Seating Arrangement", questionsCount: 70, completedCount: 18, difficulty: "Hard" },
      { name: "Blood Relations", questionsCount: 65, completedCount: 32, difficulty: "Easy" },
      { name: "Coding Decoding", questionsCount: 75, completedCount: 25, difficulty: "Medium" },
      { name: "Syllogism", questionsCount: 60, completedCount: 15, difficulty: "Medium" },
    ],
  },
  {
    id: "verbal",
    name: "Verbal Ability",
    icon: "Languages",
    description: "Reading comprehension, vocabulary, grammar, and error detection.",
    questionsCount: 250,
    completedCount: 45,
    topics: [
      { name: "Reading Comprehension", questionsCount: 80, completedCount: 12, difficulty: "Medium" },
      { name: "Synonyms & Antonyms", questionsCount: 60, completedCount: 18, difficulty: "Easy" },
      { name: "Error Detection", questionsCount: 55, completedCount: 5, difficulty: "Hard" },
      { name: "Sentence Correction", questionsCount: 55, completedCount: 10, difficulty: "Medium" },
    ],
  },
  {
    id: "data-interpretation",
    name: "Data Interpretation",
    icon: "BarChart3",
    description: "Analyze charts, tables, and graphs to solve numerical problems.",
    questionsCount: 150,
    completedCount: 22,
    topics: [
      { name: "Pie Charts", questionsCount: 40, completedCount: 10, difficulty: "Medium" },
      { name: "Bar Graphs", questionsCount: 40, completedCount: 5, difficulty: "Medium" },
      { name: "Data Tables", questionsCount: 35, completedCount: 7, difficulty: "Medium" },
      { name: "Line Graphs", questionsCount: 35, completedCount: 0, difficulty: "Hard" },
    ],
  },
];

export const allTopics: Topic[] = [
  { name: "Percentage", questionsCount: 50, completedCount: 35, difficulty: "Easy" },
  { name: "Ratio & Proportion", questionsCount: 45, completedCount: 28, difficulty: "Easy" },
  { name: "Profit & Loss", questionsCount: 65, completedCount: 22, difficulty: "Easy" },
  { name: "Time & Work", questionsCount: 60, completedCount: 15, difficulty: "Medium" },
  { name: "Time, Speed & Distance", questionsCount: 75, completedCount: 28, difficulty: "Medium" },
  { name: "Number System", questionsCount: 60, completedCount: 15, difficulty: "Medium" },
  { name: "Probability", questionsCount: 40, completedCount: 8, difficulty: "Hard" },
  { name: "Permutation & Combination", questionsCount: 35, completedCount: 5, difficulty: "Hard" },
  { name: "Data Interpretation", questionsCount: 150, completedCount: 22, difficulty: "Medium" },
  { name: "Logical Reasoning", questionsCount: 350, completedCount: 110, difficulty: "Medium" },
  { name: "Verbal Ability", questionsCount: 250, completedCount: 45, difficulty: "Easy" },
  { name: "Quantitative Aptitude", questionsCount: 450, completedCount: 165, difficulty: "Easy" },
];

export const sampleQuestions: SampleQuestion[] = [
  { id: "q1", question: "A shopkeeper gives a 10% discount on the marked price and still makes a 20% profit. If the marked price is ₹600, what is the cost price?", options: ["₹400", "₹450", "₹480", "₹500"], correctAnswer: 1, explanation: "Selling Price = 600 × 0.9 = ₹540. Since profit is 20%, Cost Price = 540 / 1.2 = ₹450.", topic: "Profit & Loss", difficulty: "Easy", estimatedTime: "1 min" },
  { id: "q2", question: "If 15 workers can complete a job in 24 days, how many workers are needed to complete the same job in 18 days?", options: ["18", "20", "22", "25"], correctAnswer: 1, explanation: "M1 × D1 = M2 × D2 → 15 × 24 = M2 × 18 → M2 = 360/18 = 20 workers.", topic: "Time & Work", difficulty: "Easy", estimatedTime: "1 min" },
  { id: "q3", question: "A train 150 m long passes a pole in 9 seconds. What is the speed of the train in km/h?", options: ["54 km/h", "60 km/h", "72 km/h", "80 km/h"], correctAnswer: 1, explanation: "Speed = Distance/Time = 150/9 = 16.67 m/s. In km/h: 16.67 × 18/5 = 60 km/h.", topic: "Time, Speed & Distance", difficulty: "Medium", estimatedTime: "1.5 min" },
  { id: "q4", question: "What is 15% of 60% of 450?", options: ["36.5", "38.5", "40.5", "42.5"], correctAnswer: 2, explanation: "60% of 450 = 270. 15% of 270 = 270 × 0.15 = 40.5.", topic: "Percentage", difficulty: "Easy", estimatedTime: "45 sec" },
  { id: "q5", question: "If the ratio of boys to girls in a class is 3:5 and there are 120 girls, how many boys are there?", options: ["60", "66", "72", "84"], correctAnswer: 2, explanation: "5 parts = 120, so 1 part = 24. Boys = 3 × 24 = 72.", topic: "Ratio & Proportion", difficulty: "Easy", estimatedTime: "45 sec" },
  { id: "q6", question: "How many 3-digit numbers are divisible by 7?", options: ["126", "128", "130", "132"], correctAnswer: 1, explanation: "Smallest 3-digit number divisible by 7 = 105. Largest = 994. Number of terms = (994-105)/7 + 1 = 889/7 + 1 = 127 + 1 = 128.", topic: "Number System", difficulty: "Medium", estimatedTime: "2 min" },
  { id: "q7", question: "A bag contains 4 red, 3 blue, and 5 green balls. What is the probability of drawing a blue ball?", options: ["1/4", "1/3", "1/2", "3/8"], correctAnswer: 0, explanation: "Total balls = 12. Blue balls = 3. Probability = 3/12 = 1/4.", topic: "Probability", difficulty: "Easy", estimatedTime: "30 sec" },
  { id: "q8", question: "In how many ways can 6 people be seated in a row of 6 chairs?", options: ["360", "480", "600", "720"], correctAnswer: 3, explanation: "Number of ways = 6! = 6 × 5 × 4 × 3 × 2 × 1 = 720.", topic: "Permutation & Combination", difficulty: "Medium", estimatedTime: "1 min" },
  { id: "q9", question: "Find the next number in the series: 2, 6, 12, 20, 30, ?", options: ["38", "40", "42", "44"], correctAnswer: 2, explanation: "The pattern is 1×2, 2×3, 3×4, 4×5, 5×6, so next is 6×7 = 42.", topic: "Logical Reasoning", difficulty: "Easy", estimatedTime: "1 min" },
  { id: "q10", question: "If 'POUND' is coded as 'QPVOE', how is 'CRANE' coded?", options: ["DSBOF", "DSCOF", "DTCPG", "DSBPE"], correctAnswer: 0, explanation: "Each letter is shifted +1: C→D, R→S, A→B, N→O, E→F. So CRANE → DSBOF.", topic: "Logical Reasoning", difficulty: "Medium", estimatedTime: "1.5 min" },
  { id: "q11", question: "Choose the correct spelling:", options: ["Accommodate", "Acommodate", "Accomodate", "Acomodate"], correctAnswer: 0, explanation: "The correct spelling is 'Accommodate' with double 'c' and double 'm'.", topic: "Verbal Ability", difficulty: "Easy", estimatedTime: "30 sec" },
  { id: "q12", question: "Identify the error: 'He has (A)/ returned from (B)/ the office (C)/ yesterday (D).'", options: ["A", "B", "C", "D"], correctAnswer: 0, explanation: "'Has returned' (present perfect) cannot be used with a specific past time 'yesterday'. Use 'returned' (simple past).", topic: "Verbal Ability", difficulty: "Medium", estimatedTime: "1 min" },
  { id: "q13", question: "Study the table: Company A sold 500 units in Q1, 600 in Q2, 750 in Q3, 800 in Q4. What is the percentage increase from Q1 to Q4?", options: ["50%", "60%", "70%", "80%"], correctAnswer: 1, explanation: "Increase = 800 - 500 = 300. Percentage increase = 300/500 × 100 = 60%.", topic: "Data Interpretation", difficulty: "Easy", estimatedTime: "1 min" },
  { id: "q14", question: "A can do a piece of work in 10 days, B in 15 days. They work together for 3 days, then A leaves. How many more days does B need to finish the work?", options: ["6.5", "7.5", "8.5", "9.5"], correctAnswer: 1, explanation: "A's 1 day work = 1/10, B's = 1/15. Together in 1 day = 1/10+1/15 = 1/6. In 3 days = 3/6 = 1/2. Remaining = 1/2. B needs (1/2)/(1/15) = 7.5 days.", topic: "Time & Work", difficulty: "Hard", estimatedTime: "2 min" },
  { id: "q15", question: "If log₂x + log₂4 = 5, what is the value of x?", options: ["4", "6", "8", "10"], correctAnswer: 2, explanation: "log₂x + log₂4 = log₂(4x) = 5 → 4x = 2⁵ = 32 → x = 8.", topic: "Quantitative Aptitude", difficulty: "Hard", estimatedTime: "1.5 min" },
];

export const mockMockTests: MockTest[] = [
  { id: "topic-percent", title: "Percentage Practice Test", questionsCount: 10, durationMinutes: 15, difficulty: "Easy", description: "Test your understanding of percentages.", category: "topic", topic: "Percentage" },
  { id: "topic-twd", title: "Time & Work Test", questionsCount: 10, durationMinutes: 15, difficulty: "Medium", description: "Practice time and work problems.", category: "topic", topic: "Time & Work" },
  { id: "mixed-1", title: "Mixed Aptitude Test 1", questionsCount: 20, durationMinutes: 30, difficulty: "Medium", description: "Mixed questions from all quantitative topics.", category: "mixed" },
  { id: "mixed-2", title: "Mixed Aptitude Test 2", questionsCount: 30, durationMinutes: 45, difficulty: "Hard", description: "Advanced mixed questions covering all sections.", category: "mixed" },
  { id: "company-tcs", title: "TCS Placement Aptitude", questionsCount: 15, durationMinutes: 20, difficulty: "Medium", description: "TCS-specific aptitude pattern with previous year questions.", category: "company" },
  { id: "company-infy", title: "Infosys Placement Aptitude", questionsCount: 15, durationMinutes: 20, difficulty: "Medium", description: "Infosys-specific aptitude pattern.", category: "company" },
  { id: "full-1", title: "Full Aptitude Mock Test", questionsCount: 50, durationMinutes: 60, difficulty: "Hard", description: "Comprehensive test covering all aptitude sections.", category: "full" },
];

export const mockCompanyPractice: CompanyPractice[] = [
  { id: "tcs", name: "TCS", logo: "TCS", questionsCount: 120, difficulty: "Medium", progress: 40, topics: ["Percentage", "Time & Work", "Probability"] },
  { id: "infosys", name: "Infosys", logo: "INFY", questionsCount: 95, difficulty: "Easy", progress: 60, topics: ["Ratio", "Profit & Loss", "Logical"] },
  { id: "wipro", name: "Wipro", logo: "WIPR", questionsCount: 80, difficulty: "Easy", progress: 75, topics: ["Percentage", "Time Speed", "Verbal"] },
  { id: "cognizant", name: "Cognizant", logo: "CTS", questionsCount: 110, difficulty: "Medium", progress: 20, topics: ["Data Interpretation", "Logical"] },
  { id: "accenture", name: "Accenture", logo: "ACN", questionsCount: 130, difficulty: "Medium", progress: 10, topics: ["All Topics"] },
  { id: "capgemini", name: "Capgemini", logo: "CAP", questionsCount: 100, difficulty: "Medium", progress: 5, topics: ["Quantitative", "Logical"] },
  { id: "amazon", name: "Amazon", logo: "AMZN", questionsCount: 85, difficulty: "Hard", progress: 0, topics: ["Advanced Quantitative", "Logical"] },
  { id: "microsoft", name: "Microsoft", logo: "MSFT", questionsCount: 90, difficulty: "Hard", progress: 0, topics: ["Advanced Math", "Logical"] },
  { id: "google", name: "Google", logo: "GOOG", questionsCount: 95, difficulty: "Hard", progress: 0, topics: ["Problem Solving", "Data Analysis"] },
];

export const mockWeakTopics = [
  { name: "Probability", category: "Quantitative Aptitude", score: 45, recommendation: "Review conditional probability formulas and solve 15 medium-difficulty exercises." },
  { name: "Time & Work", category: "Quantitative Aptitude", score: 52, recommendation: "Practice joint-efficiency questions and pipe-cistern scenarios." },
  { name: "Puzzles", category: "Logical Reasoning", score: 48, recommendation: "Draw linear and circular grids for multi-variable puzzle layouts." },
];

export const mockAchievements: AchievementBadge[] = [
  { id: "badge-1", title: "5-Day Hot Streak", description: "Maintain a 5-day preparation streak without a gap.", icon: "Flame", unlocked: true, unlockedAt: "2026-06-03" },
  { id: "badge-2", title: "Centurion Solver", description: "Answer 100 questions correctly in practice pools.", icon: "Award", unlocked: true, unlockedAt: "2026-05-28" },
  { id: "badge-3", title: "Sniper Accuracy", description: "Achieve a 90% or higher accuracy rating on a full test.", icon: "Target", unlocked: false },
  { id: "badge-4", title: "Aptitude Master", description: "Solve 500+ questions across all sections.", icon: "Crown", unlocked: false },
  { id: "badge-5", title: "Company Ready", description: "Complete company-specific practice for all 6 service-based companies.", icon: "Briefcase", unlocked: false },
];

export const mockLeaderboard: LeaderboardUser[] = [
  { rank: 1, name: "Pranav Sharma", score: 980, accuracy: 96, streak: 45 },
  { rank: 2, name: "Ananya Iyer", score: 945, accuracy: 92, streak: 38 },
  { rank: 3, name: "Rohit Verma", score: 910, accuracy: 90, streak: 30 },
  { rank: 4, name: "Shahid (You)", score: 865, accuracy: 78, streak: 5, isCurrentUser: true },
  { rank: 5, name: "Meera Nair", score: 840, accuracy: 84, streak: 15 },
  { rank: 6, name: "Vikram Sen", score: 795, accuracy: 81, streak: 12 },
  { rank: 7, name: "Kavya Patel", score: 760, accuracy: 76, streak: 8 },
  { rank: 8, name: "Arjun Reddy", score: 720, accuracy: 72, streak: 6 },
];

export const mockAnalyticsData = {
  topicAccuracy: [
    { topic: "Percentage", accuracy: 85 },
    { topic: "Profit & Loss", accuracy: 74 },
    { topic: "Time & Work", accuracy: 52 },
    { topic: "Time & Speed", accuracy: 68 },
    { topic: "Blood Relations", accuracy: 90 },
    { topic: "Syllogisms", accuracy: 78 },
    { topic: "Puzzles", accuracy: 58 },
    { topic: "Verbal Ability", accuracy: 82 },
    { topic: "Data Interpretation", accuracy: 65 },
    { topic: "Probability", accuracy: 45 },
  ],
  weeklySolved: [
    { day: "Mon", solved: 15, correct: 12 },
    { day: "Tue", solved: 22, correct: 17 },
    { day: "Wed", solved: 30, correct: 24 },
    { day: "Thu", solved: 18, correct: 13 },
    { day: "Fri", solved: 25, correct: 20 },
    { day: "Sat", solved: 40, correct: 32 },
    { day: "Sun", solved: 35, correct: 28 },
  ],
  monthlyScore: [
    { week: "Week 1", score: 72 },
    { week: "Week 2", score: 75 },
    { week: "Week 3", score: 80 },
    { week: "Week 4", score: 82 },
  ],
  timePerTopic: [
    { topic: "Percentage", hours: 4.5 },
    { topic: "Profit & Loss", hours: 3.2 },
    { topic: "Time & Work", hours: 2.8 },
    { topic: "Logical", hours: 5.1 },
    { topic: "Verbal", hours: 2.5 },
  ],
};

export const mockAIRecommendations: AIRecommendation[] = [
  { title: "Improve Probability", desc: "Your accuracy in Probability is 45%. Practice 10 medium-level questions to improve.", action: "Start Practice", priority: "high" },
  { title: "Practice Data Interpretation", desc: "DI questions are frequently asked in all placement tests. Focus on bar graphs and tables.", action: "Start Practice", priority: "high" },
  { title: "Take Full Mock Test", desc: "You haven't taken a full-length test this week. Assess your overall readiness.", action: "Take Test", priority: "medium" },
  { title: "Review Time & Work", desc: "Review pipe-cistern and efficiency formulas before attempting more questions.", action: "Review Topic", priority: "medium" },
];
