export interface KPICardData {
  title: string;
  score: number;
  change: string;
  trend: "up" | "down" | "stable";
  iconName: string;
}

export interface ChartDataPoint {
  name: string;
  Overall: number;
  Aptitude: number;
  Coding: number;
  Interview: number;
}

export interface ActivityLog {
  id: string;
  title: string;
  date: string;
  type: "resume" | "coding" | "interview" | "aptitude";
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  category: string;
}

export interface PlacementPrediction {
  predictedMonth: string;
  confidence: number;
  targetRole: string;
  predictedCompanies: string[];
  readinessTrend: "improving" | "stable" | "declining";
  estimatedPackage: string;
}

export interface DailyPlanItem {
  id: string;
  task: string;
  category: string;
  priority: string;
  duration: string;
}

export interface LearningMetricsData {
  totalHoursStudied: number;
  problemsSolved: number;
  mockTestsTaken: number;
  resumeVersions: number;
  interviewSessions: number;
  streakDays: number;
}

export interface CompanyComparisonData {
  company: string;
  overall: number;
  aptitude: number;
  coding: number;
  interview: number;
  resume: number;
  match: number;
}

export interface RecommendationData {
  id: string;
  title: string;
  description: string;
  priority: string;
  category: string;
}

export const KPI_CARDS: KPICardData[] = [
  { title: "Placement Readiness Score", score: 82, change: "+4% from last week", trend: "up", iconName: "Milestone" },
  { title: "Resume Score", score: 85, change: "Stable", trend: "stable", iconName: "FileText" },
  { title: "Aptitude Score", score: 78, change: "-2% from last week", trend: "down", iconName: "HelpCircle" },
  { title: "Coding Score", score: 81, change: "+5% from last week", trend: "up", iconName: "Code2" },
  { title: "Interview Score", score: 79, change: "+3% from last week", trend: "up", iconName: "User" },
  { title: "Communication Score", score: 84, change: "+2% from last week", trend: "up", iconName: "Mic" }
];

export const CHART_WEEKLY: ChartDataPoint[] = [
  { name: "Week 1", Overall: 75, Aptitude: 76, Coding: 70, Interview: 72 },
  { name: "Week 2", Overall: 78, Aptitude: 80, Coding: 75, Interview: 75 },
  { name: "Week 3", Overall: 80, Aptitude: 79, Coding: 78, Interview: 77 },
  { name: "Week 4", Overall: 82, Aptitude: 78, Coding: 81, Interview: 79 }
];

export const CHART_MONTHLY: ChartDataPoint[] = [
  { name: "Jan", Overall: 65, Aptitude: 68, Coding: 60, Interview: 62 },
  { name: "Feb", Overall: 70, Aptitude: 72, Coding: 65, Interview: 68 },
  { name: "Mar", Overall: 74, Aptitude: 75, Coding: 70, Interview: 72 },
  { name: "Apr", Overall: 78, Aptitude: 76, Coding: 74, Interview: 75 },
  { name: "May", Overall: 80, Aptitude: 80, Coding: 78, Interview: 78 },
  { name: "Jun", Overall: 82, Aptitude: 78, Coding: 81, Interview: 79 }
];

export const CHART_QUARTERLY: ChartDataPoint[] = [
  { name: "Q3 2025", Overall: 58, Aptitude: 62, Coding: 50, Interview: 55 },
  { name: "Q4 2025", Overall: 66, Aptitude: 70, Coding: 62, Interview: 63 },
  { name: "Q1 2026", Overall: 74, Aptitude: 75, Coding: 70, Interview: 72 },
  { name: "Q2 2026", Overall: 82, Aptitude: 78, Coding: 81, Interview: 79 }
];

export const COMPANY_READINESS = [
  { company: "TCS", score: 92 },
  { company: "Infosys", score: 89 },
  { company: "Wipro", score: 90 },
  { company: "Amazon", score: 72 },
  { company: "Google", score: 65 },
  { company: "Microsoft", score: 68 }
];

export const SKILL_GAPS = [
  { topic: "Dynamic Programming (DP)", priority: "High" as const },
  { topic: "Database Normalization (DBMS)", priority: "Medium" as const },
  { topic: "SQL Joins & Queries", priority: "Medium" as const },
  { topic: "Confidence During Interviews", priority: "Low" as const }
];

export const ACHIEVEMENTS_BADGES: Badge[] = [
  { id: "b-1", title: "Resume Expert", description: "ATS Score of 85+ achieved on Resume builder.", earned: true, category: "resume" },
  { id: "b-2", title: "Aptitude Champion", description: "Passed 10 quantitative mock tests.", earned: true, category: "aptitude" },
  { id: "b-3", title: "Coding Warrior", description: "Solved 40+ DSA coding problems.", earned: true, category: "coding" },
  { id: "b-4", title: "Interview Pro", description: "Cleared technical and HR loops in Mock Placement.", earned: false, category: "interview" },
  { id: "b-5", title: "Placement Ready", description: "Overall Placement Readiness Score above 80%.", earned: true, category: "placement" },
  { id: "b-6", title: "Streak Master", description: "Maintained a 7-day study streak.", earned: true, category: "placement" },
  { id: "b-7", title: "Speed Solver", description: "Solved 5 coding problems in under 30 minutes.", earned: false, category: "coding" },
  { id: "b-8", title: "Communication Pro", description: "Scored 90%+ in SpeakWise assessment.", earned: false, category: "interview" },
];

export const ACTIVITY_TIMELINE: ActivityLog[] = [
  { id: "act-1", title: "Resume Analyzed & Updated", date: "2 hours ago", type: "resume" },
  { id: "act-2", title: "Reverse Linked List Challenge Completed", date: "Yesterday", type: "coding" },
  { id: "act-3", title: "Mock Technical Interview Completed", date: "2 days ago", type: "interview" },
  { id: "act-4", title: "Quantitative Aptitude Test Finished", date: "3 days ago", type: "aptitude" }
];

export const PLACEMENT_PREDICTION: PlacementPrediction = {
  predictedMonth: "August 2026",
  confidence: 82,
  targetRole: "SDE-1",
  predictedCompanies: ["TCS", "Infosys", "Wipro"],
  readinessTrend: "improving",
  estimatedPackage: "8-12 LPA",
};

export const DAILY_PLAN: DailyPlanItem[] = [
  { id: "dp-1", task: "Solve 3 DP problems", category: "coding", priority: "high", duration: "45 min" },
  { id: "dp-2", task: "Practice SQL joins & subqueries", category: "coding", priority: "medium", duration: "30 min" },
  { id: "dp-3", task: "Update resume with new projects", category: "resume", priority: "high", duration: "20 min" },
  { id: "dp-4", task: "Mock HR interview round", category: "interview", priority: "medium", duration: "30 min" },
  { id: "dp-5", task: "Quantitative aptitude test", category: "aptitude", priority: "low", duration: "25 min" },
  { id: "dp-6", task: "Review OS & CN concepts", category: "coding", priority: "low", duration: "20 min" },
];

export const LEARNING_METRICS: LearningMetricsData = {
  totalHoursStudied: 142,
  problemsSolved: 356,
  mockTestsTaken: 18,
  resumeVersions: 4,
  interviewSessions: 12,
  streakDays: 7,
};

export const COMPANY_COMPARISON: CompanyComparisonData[] = [
  { company: "TCS", overall: 92, aptitude: 85, coding: 80, interview: 88, resume: 90, match: 90 },
  { company: "Infosys", overall: 89, aptitude: 82, coding: 78, interview: 85, resume: 88, match: 87 },
  { company: "Wipro", overall: 90, aptitude: 88, coding: 76, interview: 82, resume: 86, match: 85 },
  { company: "Amazon", overall: 72, aptitude: 70, coding: 75, interview: 68, resume: 80, match: 70 },
  { company: "Google", overall: 65, aptitude: 72, coding: 68, interview: 62, resume: 78, match: 62 },
  { company: "Microsoft", overall: 68, aptitude: 70, coding: 72, interview: 65, resume: 76, match: 65 },
];

export const RECOMMENDATIONS: RecommendationData[] = [
  { id: "rec-1", title: "Focus on Dynamic Programming", description: "DP is your weakest area. Practice 2-3 problems daily to build pattern recognition.", priority: "high", category: "coding" },
  { id: "rec-2", title: "Improve ATS Score", description: "Optimize your resume with keywords from target job descriptions to boost matching.", priority: "high", category: "resume" },
  { id: "rec-3", title: "Practice Mock Interviews", description: "Schedule at least 2 mock interviews per week to build confidence.", priority: "medium", category: "interview" },
  { id: "rec-4", title: "Strengthen Communication", description: "Focus on structured STAR responses for HR and behavioral rounds.", priority: "medium", category: "interview" },
  { id: "rec-5", title: "Speed up Aptitude", description: "Practice time-bound tests to improve solving speed and accuracy.", priority: "low", category: "aptitude" },
];
