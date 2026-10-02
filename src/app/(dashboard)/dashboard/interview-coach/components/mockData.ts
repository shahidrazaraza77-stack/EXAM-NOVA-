export interface InterviewQuestionItem {
  id: string;
  text: string;
  type: "HR" | "Technical";
}

export interface InterviewSessionItem {
  id: string;
  date: string;
  type: string;
  role: string;
  level: string;
  score: number | null;
  duration: string;
  feedbackCount: number;
  breakdown: {
    communication: number;
    technical: number;
    confidence: number;
    clarity: number;
  };
}

export interface FeedbackResult {
  communicationScore: number;
  technicalScore: number;
  confidenceScore: number;
  clarityScore: number;
  problemSolvingScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  improvementAreas: string[];
  actionPlan: string[];
  overallFeedback: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: "practice" | "dsa" | "communication" | "hr";
}

export interface InterviewMode {
  id: "quick" | "standard" | "full";
  label: string;
  description: string;
  questionCount: number;
  duration: string;
}

export const interviewModes: InterviewMode[] = [
  { id: "quick", label: "Quick Interview", description: "5 rapid-fire questions", questionCount: 5, duration: "10-15 min" },
  { id: "standard", label: "Standard Interview", description: "In-depth 10-question session", questionCount: 10, duration: "20-30 min" },
  { id: "full", label: "Full Placement", description: "Complete 15-20 question loop", questionCount: 18, duration: "40-60 min" },
];

export const roles = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "DevOps Engineer",
];

export const difficulties = ["Easy", "Medium", "Hard"];

export const companies = [
  { id: "tcs", name: "TCS" },
  { id: "infosys", name: "Infosys" },
  { id: "wipro", name: "Wipro" },
  { id: "amazon", name: "Amazon" },
  { id: "microsoft", name: "Microsoft" },
  { id: "google", name: "Google" },
];

export const hrQuestions: string[] = [
  "Tell me about yourself.",
  "Why should we hire you?",
  "What are your greatest strengths?",
  "What are your biggest weaknesses?",
  "Describe a challenge you faced at work or school and how you handled it.",
  "Where do you see yourself in 5 years?",
  "Why do you want to work at this company?",
  "Tell me about a time you worked in a team.",
  "Describe a time you disagreed with a teammate or manager.",
  "How do you handle pressure and deadlines?",
  "Tell me about a time you failed and what you learned.",
  "What motivates you?",
  "Describe your ideal work environment.",
  "Why did you choose your field of study?",
  "Tell me about a project you are proud of.",
  "How do you stay updated with industry trends?",
  "Describe a time you showed leadership.",
  "What makes you unique?",
  "How do you handle constructive criticism?",
  "Tell me about a time you went above and beyond.",
];

export const technicalQuestions: string[] = [
  "Explain OOP concepts with real-world examples.",
  "What is JWT and how does authentication work?",
  "Difference between SQL and NoSQL databases?",
  "Explain React lifecycle methods.",
  "What is normalization in databases?",
  "Explain the event loop in JavaScript.",
  "What are closures in JavaScript?",
  "Explain REST API principles.",
  "What is the difference between HTTP and HTTPS?",
  "Explain how garbage collection works.",
  "What is the difference between process and thread?",
  "Explain the OSI model layers.",
  "What is Docker and how does it work?",
  "Explain the difference between let, const, and var.",
  "What are design patterns? Give examples.",
  "Explain the concept of hoisting in JavaScript.",
  "What is the difference between == and === in JavaScript?",
  "Explain the virtual DOM in React.",
  "What is TypeScript and why use it?",
  "Explain the concept of middleware in Express.js.",
];

export const companyQuestions: Record<string, string[]> = {
  tcs: [
    "Tell us about your understanding of TCS' business model.",
    "How do you approach learning new technologies at TCS?",
    "Describe a time you worked under a tight deadline in a team.",
  ],
  infosys: [
    "Why do you want to join Infosys?",
    "How does Infosys' training program appeal to you?",
    "Describe your experience with Infosys' campus connect programs.",
  ],
  wipro: [
    "What do you know about Wipro's digital transformation initiatives?",
    "How would you handle a project with changing requirements at Wipro?",
    "Describe a time you demonstrated analytical thinking.",
  ],
  amazon: [
    "Tell me about a time you delivered results under tight deadlines.",
    "Describe a situation where you had to make a decision with incomplete data.",
    "How would you design a scalable system for Amazon's product catalog?",
    "Tell me about a time you disagreed with your manager.",
    "Describe a time you took ownership of a problem.",
  ],
  microsoft: [
    "Why do you want to work at Microsoft?",
    "Describe a time you had to quickly learn a new technology.",
    "How would you design a feature for Microsoft Teams?",
    "Tell me about a time you collaborated across teams.",
  ],
  google: [
    "How would you design a URL shortener like goo.gl?",
    "Tell me about a time you solved a complex problem with a creative solution.",
    "How do you handle ambiguity in product requirements?",
    "Describe a project where you had a major impact.",
  ],
};

export interface OverallStats {
  totalInterviews: number;
  averageScore: number;
  bestScore: number;
  confidenceScore: number;
  communicationScore: number;
  technicalScore: number;
  problemSolvingScore: number;
}

export const overallStats: OverallStats = {
  totalInterviews: 12,
  averageScore: 72,
  bestScore: 91,
  confidenceScore: 68,
  communicationScore: 74,
  technicalScore: 70,
  problemSolvingScore: 76,
};

export const mockSessionHistory: InterviewSessionItem[] = [
  { id: "s1", date: "2026-06-05", type: "HR", role: "Software Engineer", level: "Medium", score: 78, duration: "14:32", feedbackCount: 10, breakdown: { communication: 82, technical: 0, confidence: 76, clarity: 74 } },
  { id: "s2", date: "2026-06-03", type: "Technical", role: "Frontend Developer", level: "Hard", score: 65, duration: "22:15", feedbackCount: 10, breakdown: { communication: 60, technical: 72, confidence: 58, clarity: 68 } },
  { id: "s3", date: "2026-05-28", type: "Mixed", role: "Full Stack Developer", level: "Medium", score: 82, duration: "35:40", feedbackCount: 18, breakdown: { communication: 80, technical: 84, confidence: 78, clarity: 86 } },
  { id: "s4", date: "2026-05-20", type: "HR", role: "Backend Developer", level: "Easy", score: 71, duration: "12:10", feedbackCount: 5, breakdown: { communication: 75, technical: 0, confidence: 70, clarity: 68 } },
  { id: "s5", date: "2026-05-15", type: "Technical", role: "Data Analyst", level: "Medium", score: 88, duration: "18:45", feedbackCount: 10, breakdown: { communication: 85, technical: 92, confidence: 82, clarity: 90 } },
  { id: "s6", date: "2026-05-10", type: "Mixed", role: "Software Engineer", level: "Hard", score: 59, duration: "38:20", feedbackCount: 18, breakdown: { communication: 55, technical: 62, confidence: 52, clarity: 60 } },
  { id: "s7", date: "2026-05-05", type: "Technical", role: "DevOps Engineer", level: "Medium", score: 74, duration: "20:30", feedbackCount: 10, breakdown: { communication: 70, technical: 78, confidence: 72, clarity: 76 } },
  { id: "s8", date: "2026-04-28", type: "HR", role: "Full Stack Developer", level: "Easy", score: 91, duration: "11:50", feedbackCount: 5, breakdown: { communication: 94, technical: 0, confidence: 90, clarity: 88 } },
];

export interface ActivityItem {
  id: number;
  type: "interview_completed" | "score_milestone" | "practice_reminder";
  message: string;
  timestamp: string;
}

export const activityFeed: ActivityItem[] = [
  { id: 1, type: "interview_completed", message: "Completed Full Placement interview for Software Engineer", timestamp: "2 hours ago" },
  { id: 2, type: "score_milestone", message: "Achieved best score: 91% on HR interview", timestamp: "5 days ago" },
  { id: 3, type: "interview_completed", message: "Completed Technical interview for Frontend Developer", timestamp: "1 week ago" },
  { id: 4, type: "practice_reminder", message: "Practice DBMS concepts to improve technical score", timestamp: "1 week ago" },
];

export const aiInsights: string[] = [
  "You answer technical questions well but need more structured communication.",
  "Improve confidence when explaining projects — use the STAR method.",
  "Practice DBMS concepts — they appear in 70% of technical interviews.",
  "Your problem-solving approach is strong. Focus on articulating your thought process.",
  "Work on answering behavioral questions with specific examples rather than general statements.",
];
