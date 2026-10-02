import { Company, getAllCompanies, getCompanyById } from "@/lib/company-data";

export interface RoadmapWeek {
  week: number;
  title: string;
  topics: string[];
  tasks: string[];
  duration: string;
}

export interface Roadmap {
  companyId: string;
  weeks: RoadmapWeek[];
}

const baseWeeks: RoadmapWeek[] = [
  { week: 1, title: "Foundation & Aptitude", topics: ["Quantitative Aptitude", "Logical Reasoning"], tasks: ["Practice 50 aptitude questions", "Solve 20 logical reasoning puzzles"], duration: "Week 1" },
  { week: 2, title: "Programming Basics", topics: ["C Programming Basics", "Data Types & Control Flow"], tasks: ["Review C/Java/Python syntax", "Solve 10 basic programming problems"], duration: "Week 2" },
  { week: 3, title: "Data Structures", topics: ["Arrays & Strings", "Linked Lists"], tasks: ["Implement basic data structures", "Solve 15 array/string problems"], duration: "Week 3" },
  { week: 4, title: "Advanced DSA", topics: ["Trees", "Graphs"], tasks: ["Practice tree traversals", "Solve 10 graph problems"], duration: "Week 4" },
  { week: 5, title: "Core Subjects", topics: ["DBMS", "Operating Systems"], tasks: ["Review normalization & SQL", "Study OS concepts & scheduling"], duration: "Week 5" },
  { week: 6, title: "Networking & OOP", topics: ["Computer Networks", "OOP Concepts"], tasks: ["Learn OSI model & protocols", "Practice OOP design patterns"], duration: "Week 6" },
  { week: 7, title: "Mock Tests & Interview", topics: ["Full-length Mock Test", "Technical Interview Prep"], tasks: ["Take 3 full-length mock tests", "Practice interview questions"], duration: "Week 7" },
  { week: 8, title: "Final Revision", topics: ["HR Interview", "Company-Specific Prep"], tasks: ["Prepare HR answers", "Review company-specific topics"], duration: "Week 8" },
];

const hardWeeks: RoadmapWeek[] = [
  { week: 1, title: "Advanced DSA Foundation", topics: ["Advanced Arrays", "String Algorithms"], tasks: ["Solve 20 medium LeetCode problems", "Practice string manipulation algorithms"], duration: "Week 1" },
  { week: 2, title: "Trees & Graphs", topics: ["Binary Trees", "Graph Algorithms"], tasks: ["Solve 15 tree problems", "Implement BFS, DFS, Dijkstra"], duration: "Week 2" },
  { week: 3, title: "Dynamic Programming", topics: ["DP Patterns", "Memoization & Tabulation"], tasks: ["Solve 15 DP problems", "Practice knapsack, LCS, LIS"], duration: "Week 3" },
  { week: 4, title: "System Design", topics: ["System Design Basics", "Scalability Patterns"], tasks: ["Study load balancing & caching", "Design URL shortener & chat system"], duration: "Week 4" },
  { week: 5, title: "Advanced Core Subjects", topics: ["Advanced DBMS", "Distributed Systems"], tasks: ["Study indexing & query optimization", "Learn CAP theorem & consensus"], duration: "Week 5" },
  { week: 6, title: "Company Rounds Prep", topics: ["Coding Round Practice", "Technical Deep Dive"], tasks: ["Solve company-specific problem set", "Practice whiteboard coding"], duration: "Week 6" },
  { week: 7, title: "Mock Interviews", topics: ["Mock Coding Interview", "Mock System Design"], tasks: ["Take 2 mock coding interviews", "Practice system design with peers"], duration: "Week 7" },
  { week: 8, title: "Final Preparation", topics: ["Leadership Principles", "Behavioral Questions"], tasks: ["Prepare STAR stories", "Review company culture & values"], duration: "Week 8" },
];

const expertWeeks: RoadmapWeek[] = [
  { week: 1, title: "Hard Algorithm Mastery", topics: ["Advanced Graphs", "Complex DP"], tasks: ["Solve 25 hard LeetCode problems", "Master segment trees & tries"], duration: "Week 1" },
  { week: 2, title: "System Design Deep Dive", topics: ["Distributed Systems", "Microservices"], tasks: ["Design scalable distributed systems", "Study consensus algorithms"], duration: "Week 2" },
  { week: 3, title: "Algorithms at Scale", topics: ["NP-Completeness", "Advanced Optimization"], tasks: ["Understand complexity classes", "Practice optimization techniques"], duration: "Week 3" },
  { week: 4, title: "Deep Technical Subjects", topics: ["OS Internals", "Advanced Networking"], tasks: ["Study memory management & scheduling", "Learn CDN & load balancing in depth"], duration: "Week 4" },
  { week: 5, title: "Design & Architecture", topics: ["System Design Rounds", "Design Patterns"], tasks: ["Design 3 large-scale systems", "Master 10+ design patterns"], duration: "Week 5" },
  { week: 6, title: "Company-Specific Prep", topics: ["Previous Year Problems", "Company Culture"], tasks: ["Solve 10 company-specific problems", "Study company engineering blog"], duration: "Week 6" },
  { week: 7, title: "Mock Interviews", topics: ["Full Interview Loop", "System Design Mock"], tasks: ["Take 2 full mock interview loops", "Practice with ex-interviewers"], duration: "Week 7" },
  { week: 8, title: "Final Polish", topics: ["Behavioral Mastery", "Confidence Building"], tasks: ["Refine STAR stories for all LPs", "Review all notes & mistakes"], duration: "Week 8" },
];

function buildRoadmap(companyId: string): Roadmap {
  const data = getCompanyById(companyId);
  const difficulty = data?.company.difficulty || "Easy";
  let weeks: RoadmapWeek[];
  if (difficulty === "Expert") weeks = expertWeeks;
  else if (difficulty === "Hard") weeks = hardWeeks;
  else weeks = baseWeeks;
  return { companyId, weeks };
}

export const roadmaps: Record<string, Roadmap> = {};

const allCompanies = getAllCompanies();
allCompanies.forEach((c: Company) => {
  roadmaps[c.id] = buildRoadmap(c.id);
});

export const mockBookmarkedCompanies: string[] = [
  "tcs", "infosys", "amazon", "google"
];

export interface ActivityItem {
  id: number;
  type: "company_added" | "practice_completed" | "readiness_updated" | "bookmark_added";
  message: string;
  timestamp: string;
}

export const mockActivityFeed: ActivityItem[] = [
  { id: 1, type: "company_added", message: "Added Google to your preparation list", timestamp: "2 hours ago" },
  { id: 2, type: "practice_completed", message: "Completed TCS Aptitude practice session", timestamp: "5 hours ago" },
  { id: 3, type: "readiness_updated", message: "Amazon readiness score updated to 70%", timestamp: "1 day ago" },
  { id: 4, type: "bookmark_added", message: "Bookmarked Microsoft for later preparation", timestamp: "2 days ago" },
  { id: 5, type: "practice_completed", message: "Solved 5 coding problems for Infosys", timestamp: "3 days ago" },
  { id: 6, type: "readiness_updated", message: "TCS readiness score updated to 82%", timestamp: "4 days ago" },
];

export interface OverallStats {
  totalCompanies: number;
  avgReadiness: number;
  practiceSessions: number;
  completedTopics: number;
  bookmarkedCompanies: number;
}

export const overallStats: OverallStats = {
  totalCompanies: allCompanies.length,
  avgReadiness: 64,
  practiceSessions: 48,
  completedTopics: 156,
  bookmarkedCompanies: mockBookmarkedCompanies.length,
};
