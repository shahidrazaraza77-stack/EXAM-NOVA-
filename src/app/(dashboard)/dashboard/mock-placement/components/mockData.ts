export interface CompanyWeightage {
  company: string;
  aptitude: number;
  coding: number;
  technical: number;
  hr: number;
}

export interface AptitudeQuestion {
  id: string;
  question: string;
  options: string[];
  correctIdx: number;
  topic: string;
  difficulty: string;
}

export interface CodingChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  starterCode: string;
  testCases: { input: string; expected: string }[];
}

export interface TechnicalQuestion {
  id: string;
  topic: string;
  question: string;
  difficulty: string;
}

export interface HrQuestion {
  id: string;
  category: string;
  question: string;
}

export interface PlacementSession {
  id: string;
  company: string;
  mode: string;
  date: string;
  duration: string;
  overallScore: number;
  roundScores: { aptitude: number; coding: number; technical: number; hr: number };
  result: "Selected" | "Borderline" | "Not Selected";
  readiness: number;
}

export const COMPANY_WEIGHTAGES: CompanyWeightage[] = [
  { company: "TCS", aptitude: 40, coding: 20, technical: 20, hr: 20 },
  { company: "Infosys", aptitude: 35, coding: 25, technical: 25, hr: 15 },
  { company: "Wipro", aptitude: 35, coding: 20, technical: 25, hr: 20 },
  { company: "Cognizant", aptitude: 30, coding: 25, technical: 25, hr: 20 },
  { company: "Accenture", aptitude: 30, coding: 20, technical: 30, hr: 20 },
  { company: "Capgemini", aptitude: 35, coding: 20, technical: 25, hr: 20 },
  { company: "Amazon", aptitude: 15, coding: 40, technical: 30, hr: 15 },
  { company: "Microsoft", aptitude: 10, coding: 45, technical: 35, hr: 10 },
  { company: "Google", aptitude: 10, coding: 45, technical: 35, hr: 10 },
];

export const MOCK_APTITUDE_QUESTIONS: AptitudeQuestion[] = [
  { id: "aq-1", question: "If 15 workers can build a wall in 20 days, how many workers are needed to build the same wall in 12 days?", options: ["20", "22", "25", "18"], correctIdx: 2, topic: "Time & Work", difficulty: "Medium" },
  { id: "aq-2", question: "What is the next number in the series: 2, 6, 12, 20, 30, ?", options: ["38", "42", "40", "36"], correctIdx: 1, topic: "Series", difficulty: "Easy" },
  { id: "aq-3", question: "If LOGIC is coded as BDFHJ, how is POWER coded?", options: ["MNQDG", "MNSDG", "MNQBG", "MNQDH"], correctIdx: 0, topic: "Coding-Decoding", difficulty: "Medium" },
  { id: "aq-4", question: "A train 150m long passes a pole in 15 seconds. What is its speed in km/h?", options: ["36", "42", "48", "54"], correctIdx: 0, topic: "Speed & Distance", difficulty: "Hard" },
  { id: "aq-5", question: "Find the odd one out: 4, 9, 16, 25, 36, 49", options: ["4", "9", "16", "25"], correctIdx: 0, topic: "Odd One Out", difficulty: "Easy" },
  { id: "aq-6", question: "If A:B = 2:3 and B:C = 4:5, then A:C = ?", options: ["8:15", "2:5", "3:5", "4:5"], correctIdx: 0, topic: "Ratios", difficulty: "Medium" },
  { id: "aq-7", question: "The average of 5 numbers is 20. If one number is removed, the average becomes 18. What is the removed number?", options: ["24", "28", "26", "22"], correctIdx: 1, topic: "Averages", difficulty: "Medium" },
  { id: "aq-8", question: "A shopkeeper gives a 20% discount on an item and still makes a 20% profit. What is the markup percentage?", options: ["50%", "40%", "30%", "25%"], correctIdx: 0, topic: "Profit & Loss", difficulty: "Hard" },
  { id: "aq-9", question: "Choose the correct alternative: DETERIORATE is to IMPROVE as ???", options: ["Hasten is to Delay", "Create is to Build", "Love is to Adore", "Strong is to Weak"], correctIdx: 0, topic: "Analogies", difficulty: "Medium" },
  { id: "aq-10", question: "If 2^x = 32, what is the value of x?", options: ["4", "5", "6", "3"], correctIdx: 1, topic: "Exponents", difficulty: "Easy" },
  { id: "aq-11", question: "In a class, 60% are boys and the rest are girls. If 40% of boys and 30% of girls passed, what percentage of students passed?", options: ["36%", "42%", "38%", "35%"], correctIdx: 0, topic: "Percentages", difficulty: "Hard" },
  { id: "aq-12", question: "Complete the analogy: Book : Chapter :: Tree : ?", options: ["Forest", "Branch", "Root", "Leaf"], correctIdx: 1, topic: "Analogies", difficulty: "Easy" },
];

export const MOCK_CODING_CHALLENGES: CodingChallenge[] = [
  {
    id: "cc-1",
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers that add up to target. You may assume that each input has exactly one solution.",
    difficulty: "Easy",
    starterCode: "function twoSum(nums, target) {\n  // Your code here\n}",
    testCases: [
      { input: "nums = [2,7,11,15], target = 9", expected: "[0,1]" },
      { input: "nums = [3,2,4], target = 6", expected: "[1,2]" },
      { input: "nums = [3,3], target = 6", expected: "[0,1]" },
    ],
  },
  {
    id: "cc-2",
    title: "Valid Parentheses",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. A string is valid if brackets close in the correct order.",
    difficulty: "Medium",
    starterCode: "function isValid(s) {\n  // Your code here\n}",
    testCases: [
      { input: 's = "()"', expected: "true" },
      { input: 's = "()[]{}"', expected: "true" },
      { input: 's = "(]"', expected: "false" },
    ],
  },
  {
    id: "cc-3",
    title: "LRU Cache",
    description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class with get and put methods in O(1) time complexity.",
    difficulty: "Hard",
    starterCode: "class LRUCache {\n  constructor(capacity) {\n    // Your code here\n  }\n  \n  get(key) {\n    // Your code here\n  }\n  \n  put(key, value) {\n    // Your code here\n  }\n}",
    testCases: [
      { input: 'LRUCache(2), put(1,1), put(2,2), get(1)', expected: "1" },
      { input: 'put(3,3), get(2)', expected: "-1" },
      { input: 'put(4,4), get(1)', expected: "-1" },
    ],
  },
];

export const MOCK_TECHNICAL_QUESTIONS: TechnicalQuestion[] = [
  { id: "tq-1", topic: "DBMS", question: "Explain the concept of normalization and its different normal forms (1NF, 2NF, 3NF, BCNF). Why is normalization important in database design?", difficulty: "Medium" },
  { id: "tq-2", topic: "DBMS", question: "What are SQL joins? Explain LEFT JOIN, RIGHT JOIN, INNER JOIN, and FULL OUTER JOIN with examples.", difficulty: "Easy" },
  { id: "tq-3", topic: "OOP", question: "Explain the four pillars of Object-Oriented Programming: Encapsulation, Inheritance, Polymorphism, and Abstraction. Provide real-world examples for each.", difficulty: "Medium" },
  { id: "tq-4", topic: "OOP", question: "What is the difference between method overloading and method overriding? When would you use each?", difficulty: "Easy" },
  { id: "tq-5", topic: "OS", question: "What is a deadlock? Explain the four necessary conditions for deadlock and how you can prevent it.", difficulty: "Medium" },
  { id: "tq-6", topic: "OS", question: "Explain different CPU scheduling algorithms (FCFS, SJF, Round Robin, Priority). Which one is most commonly used and why?", difficulty: "Hard" },
  { id: "tq-7", topic: "CN", question: "Explain the OSI model and TCP/IP model. How does data flow from one system to another over a network?", difficulty: "Medium" },
  { id: "tq-8", topic: "CN", question: "What is the difference between TCP and UDP? When would you use each protocol?", difficulty: "Easy" },
  { id: "tq-9", topic: "Projects", question: "Walk me through your most significant technical project. What challenges did you face, and how did you overcome them?", difficulty: "Medium" },
  { id: "tq-10", topic: "Projects", question: "Describe a time when you had to make an architectural decision. What tradeoffs did you consider?", difficulty: "Hard" },
];

export const MOCK_HR_QUESTIONS: HrQuestion[] = [
  { id: "hr-1", category: "Behavioral", question: "Tell me about yourself and why you're interested in this role." },
  { id: "hr-2", category: "Behavioral", question: "What are your greatest strengths and weaknesses? Provide specific examples." },
  { id: "hr-3", category: "Situational", question: "Describe a time when you faced a conflict with a team member. How did you resolve it?" },
  { id: "hr-4", category: "Situational", question: "How do you handle pressure or tight deadlines? Give an example from your experience." },
  { id: "hr-5", category: "Communication", question: "Explain a complex technical concept to a non-technical stakeholder. How would you approach this?" },
  { id: "hr-6", category: "Behavioral", question: "Where do you see yourself in 5 years? How does this role align with your career goals?" },
];

export const PLACEMENT_HISTORY: PlacementSession[] = [
  { id: "ph-1", company: "TCS", mode: "Quick", date: "2026-05-15", duration: "18 min", overallScore: 85, roundScores: { aptitude: 88, coding: 80, technical: 0, hr: 0 }, result: "Selected", readiness: 92 },
  { id: "ph-2", company: "Amazon", mode: "Standard", date: "2026-05-10", duration: "42 min", overallScore: 62, roundScores: { aptitude: 70, coding: 65, technical: 55, hr: 0 }, result: "Borderline", readiness: 72 },
  { id: "ph-3", company: "Infosys", mode: "Full", date: "2026-04-28", duration: "75 min", overallScore: 78, roundScores: { aptitude: 82, coding: 75, technical: 70, hr: 85 }, result: "Borderline", readiness: 80 },
  { id: "ph-4", company: "Google", mode: "Quick", date: "2026-04-20", duration: "20 min", overallScore: 45, roundScores: { aptitude: 50, coding: 42, technical: 0, hr: 0 }, result: "Not Selected", readiness: 55 },
  { id: "ph-5", company: "Microsoft", mode: "Standard", date: "2026-04-12", duration: "40 min", overallScore: 71, roundScores: { aptitude: 75, coding: 73, technical: 65, hr: 0 }, result: "Borderline", readiness: 76 },
];

export interface PlacementStats {
  totalTaken: number;
  averageScore: number;
  bestScore: number;
  readinessScore: number;
  selectionRate: number;
}

export const MOCK_STATS: PlacementStats = {
  totalTaken: 12,
  averageScore: 71,
  bestScore: 92,
  readinessScore: 78,
  selectionRate: 42,
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
  Medium: "text-amber-600 bg-amber-500/10 border-amber-500/20",
  Hard: "text-red-600 bg-red-500/10 border-red-500/20",
};

export const COMPANY_LOGOS: Record<string, string> = {
  TCS: "bg-blue-600", Infosys: "bg-orange-600", Wipro: "bg-emerald-600",
  Cognizant: "bg-indigo-600", Accenture: "bg-zinc-800", Capgemini: "bg-rose-600",
  Amazon: "bg-amber-600", Microsoft: "bg-cyan-600", Google: "bg-blue-500",
};

export function calculateAptitudeScore(answers: Record<string, number>): number {
  const answered = Object.keys(answers).length;
  if (answered === 0) return 0;
  const correct = MOCK_APTITUDE_QUESTIONS.filter(q => answers[q.id] === q.correctIdx).length;
  return Math.round((correct / MOCK_APTITUDE_QUESTIONS.length) * 100);
}

export function calculateCodingScore(passedTests: number, totalTests: number): number {
  if (totalTests === 0) return 0;
  return Math.round((passedTests / totalTests) * 100);
}

export function calculateRoundScore(answers: Record<string, string>): number {
  const values = Object.values(answers).filter(a => a.trim().length > 0);
  if (values.length === 0) return 0;
  const avgLength = values.reduce((sum, a) => sum + a.length, 0) / values.length;
  return Math.min(100, Math.max(40, Math.round(avgLength / 3 + 40)));
}

export function calculateOverallScore(
  roundScores: { aptitude: number; coding: number; technical: number; hr: number },
  weightages: CompanyWeightage
): number {
  const total = 
    roundScores.aptitude * (weightages.aptitude / 100) +
    roundScores.coding * (weightages.coding / 100) +
    roundScores.technical * (weightages.technical / 100) +
    roundScores.hr * (weightages.hr / 100);
  return Math.round(total);
}

export function determineResult(overallScore: number): "Selected" | "Borderline" | "Not Selected" {
  if (overallScore >= 80) return "Selected";
  if (overallScore >= 60) return "Borderline";
  return "Not Selected";
}

export function generateReport(
  roundScores: { aptitude: number; coding: number; technical: number; hr: number }
): { strengths: string[]; weaknesses: string[]; recommendations: string[] } {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  if (roundScores.aptitude >= 70) { strengths.push("Aptitude & Logical Reasoning"); }
  else { weaknesses.push("Aptitude & Logical Reasoning"); recommendations.push("Practice quantitative aptitude daily with timed mock tests"); }

  if (roundScores.coding >= 70) { strengths.push("Coding & Problem Solving"); }
  else { weaknesses.push("Coding & Problem Solving"); recommendations.push("Solve at least 3 DSA problems daily on LeetCode or HackerRank"); }

  if (roundScores.technical >= 70) { strengths.push("Technical Fundamentals (DBMS, OS, CN, OOP)"); }
  else { weaknesses.push("Technical Fundamentals (DBMS, OS, CN, OOP)"); recommendations.push("Complete DBMS and OOP modules in ExamNova"); }

  if (roundScores.hr >= 70) { strengths.push("Communication & Soft Skills"); }
  else { weaknesses.push("Communication & Soft Skills"); recommendations.push("Attempt 2 mock interviews to improve confidence and communication"); }

  if (!strengths.includes("Aptitude & Logical Reasoning") && roundScores.aptitude >= 60) { recommendations.push("Improve aptitude accuracy to 80%+ for better placement chances"); }
  if (strengths.length === 0) { strengths.push("Good attempt! Focus on building fundamentals."); }

  return { strengths, weaknesses, recommendations };
}

export function getTimeLimit(mode: string): number {
  switch (mode) {
    case "Quick": return 20 * 60;
    case "Standard": return 45 * 60;
    case "Full": return 90 * 60;
    default: return 45 * 60;
  }
}

export function getRoundTimeLimit(round: string, mode: string): number {
  const isQuick = mode === "Quick";
  const isStandard = mode === "Standard";
  switch (round) {
    case "aptitude": return isQuick ? 8 * 60 : 12 * 60;
    case "coding": return isQuick ? 12 * 60 : isStandard ? 18 * 60 : 25 * 60;
    case "technical": return isStandard ? 15 * 60 : 25 * 60;
    case "hr": return 15 * 60;
    default: return 10 * 60;
  }
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
