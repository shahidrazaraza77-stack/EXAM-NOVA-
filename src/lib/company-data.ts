export interface Company {
  id: string;
  name: string;
  type: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Expert";
  progress: number;
  readinessScore: number;
  logoColor: string;
  logoBg: string;
}

export interface OverviewData {
  hiringPattern: string;
  selectionProcess: string[];
  preparationTips: string[];
  requiredSkills: string[];
}

export interface AptitudeCategory {
  name: string;
  totalQuestions: number;
  difficulty: string;
  completed: number;
}

export interface CodingCategory {
  name: string;
  questionCount: number;
  difficulty: string;
  completionPercentage: number;
}

export interface PlacementRound {
  round: number;
  title: string;
  description: string;
  estimatedDifficulty: string;
  duration: string;
}

export interface AnalyticsData {
  preparationProgress: number;
  aptitudeReadiness: number;
  codingReadiness: number;
  technicalReadiness: number;
  hrReadiness: number;
}

export interface AIRecommendation {
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
}

export interface FullCompanyData {
  company: Company;
  overview: OverviewData;
  aptitude: AptitudeCategory[];
  coding: CodingCategory[];
  placementProcess: PlacementRound[];
  analytics: AnalyticsData;
  recommendations: AIRecommendation[];
}

const companies: Company[] = [
  { id: "tcs", name: "TCS", type: "IT Services", difficulty: "Easy", progress: 85, readinessScore: 82, logoColor: "from-blue-600 to-blue-800", logoBg: "bg-blue-100 dark:bg-blue-950" },
  { id: "infosys", name: "Infosys", type: "IT Services", difficulty: "Easy", progress: 78, readinessScore: 76, logoColor: "from-orange-500 to-orange-700", logoBg: "bg-orange-100 dark:bg-orange-950" },
  { id: "wipro", name: "Wipro", type: "IT Services", difficulty: "Easy", progress: 72, readinessScore: 70, logoColor: "from-red-500 to-red-700", logoBg: "bg-red-100 dark:bg-red-950" },
  { id: "cognizant", name: "Cognizant", type: "IT Services", difficulty: "Easy", progress: 68, readinessScore: 65, logoColor: "from-blue-500 to-blue-700", logoBg: "bg-blue-100 dark:bg-blue-950" },
  { id: "accenture", name: "Accenture", type: "Consulting", difficulty: "Medium", progress: 74, readinessScore: 71, logoColor: "from-purple-500 to-purple-700", logoBg: "bg-purple-100 dark:bg-purple-950" },
  { id: "capgemini", name: "Capgemini", type: "IT Services", difficulty: "Easy", progress: 65, readinessScore: 62, logoColor: "from-teal-500 to-teal-700", logoBg: "bg-teal-100 dark:bg-teal-950" },
  { id: "hcl", name: "HCL", type: "IT Services", difficulty: "Easy", progress: 60, readinessScore: 58, logoColor: "from-green-500 to-green-700", logoBg: "bg-green-100 dark:bg-green-950" },
  { id: "tech-mahindra", name: "Tech Mahindra", type: "IT Services", difficulty: "Easy", progress: 55, readinessScore: 52, logoColor: "from-cyan-500 to-cyan-700", logoBg: "bg-cyan-100 dark:bg-cyan-950" },
  { id: "amazon", name: "Amazon", type: "E-commerce / Tech", difficulty: "Hard", progress: 72, readinessScore: 70, logoColor: "from-amber-500 to-amber-700", logoBg: "bg-amber-100 dark:bg-amber-950" },
  { id: "google", name: "Google", type: "Technology", difficulty: "Expert", progress: 45, readinessScore: 48, logoColor: "from-green-500 to-emerald-700", logoBg: "bg-green-100 dark:bg-green-950" },
  { id: "microsoft", name: "Microsoft", type: "Technology", difficulty: "Hard", progress: 55, readinessScore: 58, logoColor: "from-blue-500 to-indigo-700", logoBg: "bg-blue-100 dark:bg-blue-950" },
  { id: "adobe", name: "Adobe", type: "Software", difficulty: "Hard", progress: 40, readinessScore: 42, logoColor: "from-red-500 to-rose-700", logoBg: "bg-red-100 dark:bg-red-950" },
];

const overviews: Record<string, OverviewData> = {
  tcs: {
    hiringPattern: "TCS hires through multiple channels: TCS NQT (National Qualifier Test) for freshers, off-campus drives, and lateral hiring for experienced professionals. The recruitment process is conducted in multiple batches throughout the year.",
    selectionProcess: [
      "Online application and resume screening",
      "TCS NQT - Aptitude and Reasoning Test",
      "Technical Interview (usually 2 rounds)",
      "HR Interview",
      "Offer letter and onboarding"
    ],
    preparationTips: [
      "Focus on quantitative aptitude and logical reasoning",
      "Practice C, C++, Java, and Python basics",
      "Prepare core subjects: DBMS, OS, OOP, CN",
      "Work on communication skills",
      "Solve previous year TCS NQT papers"
    ],
    requiredSkills: [
      "Programming (C, Java, Python)",
      "Database Management",
      "Operating Systems",
      "Computer Networks",
      "Aptitude & Reasoning",
      "Communication Skills"
    ]
  },
  infosys: {
    hiringPattern: "Infosys conducts InfyTQ for freshers, along with off-campus drives and lateral hiring. InfyTQ is a learning and certification program that leads to job opportunities based on performance.",
    selectionProcess: [
      "InfyTQ certification test",
      "Aptitude and technical assessment",
      "Technical interview round",
      "HR interview round",
      "Final selection and offer"
    ],
    preparationTips: [
      "Master Java and Python programming",
      "Practice SQL and database concepts",
      "Strengthen logical reasoning skills",
      "Prepare system design basics",
      "Focus on communication and soft skills"
    ],
    requiredSkills: [
      "Java / Python",
      "SQL & Databases",
      "Logical Reasoning",
      "Data Structures",
      "Web Technologies",
      "Communication Skills"
    ]
  },
  wipro: {
    hiringPattern: "Wipro hires through Wipro NLTH (National Level Talent Hunt) for freshers, Wipro Elite for high performers, and lateral hiring for experienced roles across domains.",
    selectionProcess: [
      "Wipro NLTH Aptitude Test",
      "Written Communication Test",
      "Technical Interview",
      "HR Interview",
      "Offer release"
    ],
    preparationTips: [
      "Focus on verbal and written communication",
      "Practice programming fundamentals",
      "Master SQL and database queries",
      "Prepare basic networking concepts",
      "Build strong aptitude skills"
    ],
    requiredSkills: [
      "C / Java Programming",
      "SQL & Databases",
      "Written Communication",
      "Aptitude & Reasoning",
      "Basic Networking"
    ]
  },
  cognizant: {
    hiringPattern: "Cognizant hires through campus placements, off-campus drives, and CTS (Cognizant Technology Solutions) recruitment process for both freshers and experienced professionals.",
    selectionProcess: [
      "Online aptitude and technical test",
      "Technical interview round",
      "HR interview round",
      "Document verification",
      "Offer and onboarding"
    ],
    preparationTips: [
      "Practice quantitative and logical aptitude",
      "Learn Java, SQL, and web technologies",
      "Focus on automation testing concepts",
      "Prepare for behavioral questions",
      "Improve problem-solving speed"
    ],
    requiredSkills: [
      "Java / .NET",
      "SQL & PL/SQL",
      "Testing Concepts",
      "Aptitude & Reasoning",
      "Web Technologies"
    ]
  },
  accenture: {
    hiringPattern: "Accenture hires through campus placements and off-campus drives. The process includes cognitive and technical assessments followed by interview rounds for various roles including ASE and AASE.",
    selectionProcess: [
      "Cognitive and technical assessment",
      "Coding assessment",
      "Technical interview",
      "HR interview",
      "Offer and onboarding"
    ],
    preparationTips: [
      "Strengthen cognitive abilities and logical reasoning",
      "Practice coding in multiple languages",
      "Prepare for competency-based questions",
      "Focus on communication and presentation",
      "Learn about Accenture's domains and services"
    ],
    requiredSkills: [
      "Programming (any language)",
      "Cognitive Ability",
      "Communication Skills",
      "Problem Solving",
      "Team Collaboration",
      "Adaptability"
    ]
  },
  capgemini: {
    hiringPattern: "Capgemini hires through campus recruitment and off-campus drives. The selection process includes aptitude test, technical assessment, and interviews for various roles across domains.",
    selectionProcess: [
      "Aptitude and reasoning test",
      "Technical assessment",
      "Group discussion (sometimes)",
      "Technical interview",
      "HR interview"
    ],
    preparationTips: [
      "Practice aptitude questions thoroughly",
      "Learn Java, Python, and web technologies",
      "Focus on database concepts and SQL",
      "Prepare for group discussions",
      "Stay updated with industry trends"
    ],
    requiredSkills: [
      "Java / Python",
      "SQL & Databases",
      "Web Technologies",
      "Aptitude Skills",
      "Communication Skills"
    ]
  },
  hcl: {
    hiringPattern: "HCL hires through campus placements and off-campus drives. The recruitment process includes online test, technical interview, and HR interview for various roles across the organization.",
    selectionProcess: [
      "Online aptitude test",
      "Technical assessment",
      "Technical interview round",
      "HR interview round",
      "Offer and joining"
    ],
    preparationTips: [
      "Master C, C++, and Java programming",
      "Practice database and SQL concepts",
      "Focus on networking fundamentals",
      "Strengthen operating system concepts",
      "Work on problem-solving abilities"
    ],
    requiredSkills: [
      "C / C++ / Java",
      "SQL & Databases",
      "Computer Networks",
      "Operating Systems",
      "Problem Solving"
    ]
  },
  "tech-mahindra": {
    hiringPattern: "Tech Mahindra hires through campus placements and off-campus drives. The selection process includes aptitude tests, technical assessments, and interviews for freshers and experienced candidates.",
    selectionProcess: [
      "Aptitude and logical reasoning test",
      "Technical written test",
      "Technical interview",
      "HR interview",
      "Offer and onboarding"
    ],
    preparationTips: [
      "Practice aptitude and reasoning questions",
      "Learn core Java and SQL",
      "Focus on telecom and IT concepts",
      "Prepare for behavioral questions",
      "Improve communication skills"
    ],
    requiredSkills: [
      "Java / SQL",
      "Telecom Basics",
      "Aptitude & Reasoning",
      "Problem Solving",
      "Communication Skills"
    ]
  },
  amazon: {
    hiringPattern: "Amazon hires through campus placements and off-campus drives. The SDE interview process is known for its rigorous bar-raising philosophy and leadership principles.",
    selectionProcess: [
      "Online coding assessment (2-3 problems)",
      "Technical phone screen (for off-campus)",
      "On-site / Virtual loop (4-5 rounds)",
      "System design round (for SDE II+)",
      "Bar raiser round",
      "HR interview and offer"
    ],
    preparationTips: [
      "Master data structures and algorithms",
      "Practice system design for experienced roles",
      "Study Amazon Leadership Principles",
      "Use STAR method for behavioral questions",
      "Solve 100+ LeetCode problems",
      "Practice coding under time pressure"
    ],
    requiredSkills: [
      "Data Structures & Algorithms",
      "System Design",
      "Object-Oriented Design",
      "Leadership Principles",
      "Problem Solving",
      "Coding Proficiency"
    ]
  },
  google: {
    hiringPattern: "Google hires through campus placements and off-campus drives. The interview process focuses on algorithmic thinking, problem-solving, and Googleyness.",
    selectionProcess: [
      "Online coding assessment",
      "Technical phone screen",
      "On-site interviews (4-5 rounds)",
      "Coding and algorithms rounds",
      "System design round",
      "Googleyness and leadership round"
    ],
    preparationTips: [
      "Solve hard-level algorithm problems",
      "Master dynamic programming and graphs",
      "Practice system design extensively",
      "Study Google's hiring principles",
      "Focus on clean, optimized code",
      "Practice whiteboard coding"
    ],
    requiredSkills: [
      "Advanced Algorithms",
      "Data Structures",
      "System Design",
      "Problem Solving",
      "Coding Proficiency",
      "Analytical Thinking"
    ]
  },
  microsoft: {
    hiringPattern: "Microsoft hires through campus placements and off-campus drives. The interview process includes coding rounds, system design, and ASK (Aptitude, Skills, Knowledge) rounds.",
    selectionProcess: [
      "Online coding assessment",
      "Technical interview round 1",
      "Technical interview round 2",
      "System design round (for experienced)",
      "ASK (Aptitude, Skills, Knowledge) round",
      "Final interview and offer"
    ],
    preparationTips: [
      "Master DSA with focus on trees and graphs",
      "Practice system design questions",
      "Prepare for design discussions",
      "Study Microsoft's culture and values",
      "Solve LeetCode medium and hard problems",
      "Practice pair programming"
    ],
    requiredSkills: [
      "Data Structures & Algorithms",
      "System Design",
      "Design Patterns",
      "Coding Proficiency",
      "Problem Solving",
      "Team Collaboration"
    ]
  },
  adobe: {
    hiringPattern: "Adobe hires through campus placements and off-campus drives. The interview process focuses on product development skills, design thinking, and technical excellence.",
    selectionProcess: [
      "Online coding assessment",
      "Technical interview round 1",
      "Technical interview round 2",
      "Design and product sense round",
      "Managerial round",
      "HR interview and offer"
    ],
    preparationTips: [
      "Focus on product-based problem solving",
      "Master JavaScript and web technologies",
      "Practice design patterns and architecture",
      "Learn about Adobe products and services",
      "Solve creative coding problems",
      "Prepare portfolio of projects"
    ],
    requiredSkills: [
      "JavaScript / TypeScript",
      "Web Technologies",
      "Design Patterns",
      "Product Thinking",
      "Data Structures",
      "Creative Problem Solving"
    ]
  }
};

const aptitudeData: Record<string, AptitudeCategory[]> = {
  tcs: [
    { name: "Quantitative Aptitude", totalQuestions: 50, difficulty: "Medium", completed: 35 },
    { name: "Logical Reasoning", totalQuestions: 40, difficulty: "Easy", completed: 32 },
    { name: "Verbal Ability", totalQuestions: 30, difficulty: "Medium", completed: 25 }
  ],
  infosys: [
    { name: "Quantitative Aptitude", totalQuestions: 45, difficulty: "Medium", completed: 30 },
    { name: "Logical Reasoning", totalQuestions: 35, difficulty: "Medium", completed: 25 },
    { name: "Verbal Ability", totalQuestions: 25, difficulty: "Easy", completed: 20 }
  ],
  wipro: [
    { name: "Quantitative Aptitude", totalQuestions: 40, difficulty: "Easy", completed: 35 },
    { name: "Logical Reasoning", totalQuestions: 35, difficulty: "Easy", completed: 30 },
    { name: "Verbal Ability", totalQuestions: 40, difficulty: "Medium", completed: 25 }
  ],
  cognizant: [
    { name: "Quantitative Aptitude", totalQuestions: 45, difficulty: "Medium", completed: 28 },
    { name: "Logical Reasoning", totalQuestions: 35, difficulty: "Easy", completed: 25 },
    { name: "Verbal Ability", totalQuestions: 30, difficulty: "Medium", completed: 20 }
  ],
  accenture: [
    { name: "Quantitative Aptitude", totalQuestions: 50, difficulty: "Medium", completed: 38 },
    { name: "Logical Reasoning", totalQuestions: 45, difficulty: "Medium", completed: 32 },
    { name: "Verbal Ability", totalQuestions: 35, difficulty: "Easy", completed: 28 }
  ],
  capgemini: [
    { name: "Quantitative Aptitude", totalQuestions: 40, difficulty: "Easy", completed: 32 },
    { name: "Logical Reasoning", totalQuestions: 35, difficulty: "Easy", completed: 28 },
    { name: "Verbal Ability", totalQuestions: 25, difficulty: "Easy", completed: 20 }
  ],
  hcl: [
    { name: "Quantitative Aptitude", totalQuestions: 35, difficulty: "Easy", completed: 25 },
    { name: "Logical Reasoning", totalQuestions: 30, difficulty: "Easy", completed: 22 },
    { name: "Verbal Ability", totalQuestions: 30, difficulty: "Medium", completed: 18 }
  ],
  "tech-mahindra": [
    { name: "Quantitative Aptitude", totalQuestions: 35, difficulty: "Easy", completed: 28 },
    { name: "Logical Reasoning", totalQuestions: 30, difficulty: "Easy", completed: 24 },
    { name: "Verbal Ability", totalQuestions: 25, difficulty: "Easy", completed: 20 }
  ],
  amazon: [
    { name: "Quantitative Aptitude", totalQuestions: 30, difficulty: "Hard", completed: 18 },
    { name: "Logical Reasoning", totalQuestions: 35, difficulty: "Hard", completed: 20 },
    { name: "Verbal Ability", totalQuestions: 25, difficulty: "Medium", completed: 18 }
  ],
  google: [
    { name: "Quantitative Aptitude", totalQuestions: 25, difficulty: "Expert", completed: 10 },
    { name: "Logical Reasoning", totalQuestions: 30, difficulty: "Expert", completed: 12 },
    { name: "Verbal Ability", totalQuestions: 20, difficulty: "Hard", completed: 14 }
  ],
  microsoft: [
    { name: "Quantitative Aptitude", totalQuestions: 30, difficulty: "Hard", completed: 16 },
    { name: "Logical Reasoning", totalQuestions: 35, difficulty: "Hard", completed: 18 },
    { name: "Verbal Ability", totalQuestions: 25, difficulty: "Medium", completed: 17 }
  ],
  adobe: [
    { name: "Quantitative Aptitude", totalQuestions: 25, difficulty: "Hard", completed: 12 },
    { name: "Logical Reasoning", totalQuestions: 30, difficulty: "Hard", completed: 14 },
    { name: "Verbal Ability", totalQuestions: 20, difficulty: "Medium", completed: 13 }
  ]
};

const codingData: Record<string, CodingCategory[]> = {
  tcs: [
    { name: "Arrays", questionCount: 20, difficulty: "Easy", completionPercentage: 80 },
    { name: "Strings", questionCount: 15, difficulty: "Easy", completionPercentage: 75 },
    { name: "Linked Lists", questionCount: 10, difficulty: "Medium", completionPercentage: 60 },
    { name: "Trees", questionCount: 8, difficulty: "Medium", completionPercentage: 50 },
    { name: "Graphs", questionCount: 5, difficulty: "Hard", completionPercentage: 30 }
  ],
  infosys: [
    { name: "Arrays", questionCount: 18, difficulty: "Easy", completionPercentage: 75 },
    { name: "Strings", questionCount: 14, difficulty: "Medium", completionPercentage: 65 },
    { name: "Linked Lists", questionCount: 8, difficulty: "Medium", completionPercentage: 55 },
    { name: "Trees", questionCount: 7, difficulty: "Hard", completionPercentage: 40 },
    { name: "Graphs", questionCount: 4, difficulty: "Hard", completionPercentage: 25 }
  ],
  wipro: [
    { name: "Arrays", questionCount: 15, difficulty: "Easy", completionPercentage: 85 },
    { name: "Strings", questionCount: 12, difficulty: "Easy", completionPercentage: 80 },
    { name: "Linked Lists", questionCount: 6, difficulty: "Medium", completionPercentage: 50 },
    { name: "Trees", questionCount: 5, difficulty: "Medium", completionPercentage: 40 },
    { name: "Graphs", questionCount: 3, difficulty: "Hard", completionPercentage: 20 }
  ],
  cognizant: [
    { name: "Arrays", questionCount: 16, difficulty: "Easy", completionPercentage: 70 },
    { name: "Strings", questionCount: 12, difficulty: "Easy", completionPercentage: 65 },
    { name: "Linked Lists", questionCount: 8, difficulty: "Medium", completionPercentage: 45 },
    { name: "Trees", questionCount: 6, difficulty: "Medium", completionPercentage: 35 },
    { name: "Graphs", questionCount: 4, difficulty: "Hard", completionPercentage: 20 }
  ],
  accenture: [
    { name: "Arrays", questionCount: 22, difficulty: "Easy", completionPercentage: 82 },
    { name: "Strings", questionCount: 16, difficulty: "Easy", completionPercentage: 78 },
    { name: "Linked Lists", questionCount: 10, difficulty: "Medium", completionPercentage: 55 },
    { name: "Trees", questionCount: 8, difficulty: "Medium", completionPercentage: 45 },
    { name: "Graphs", questionCount: 5, difficulty: "Hard", completionPercentage: 28 }
  ],
  capgemini: [
    { name: "Arrays", questionCount: 14, difficulty: "Easy", completionPercentage: 78 },
    { name: "Strings", questionCount: 10, difficulty: "Easy", completionPercentage: 70 },
    { name: "Linked Lists", questionCount: 6, difficulty: "Easy", completionPercentage: 60 },
    { name: "Trees", questionCount: 4, difficulty: "Medium", completionPercentage: 40 },
    { name: "Graphs", questionCount: 3, difficulty: "Medium", completionPercentage: 25 }
  ],
  hcl: [
    { name: "Arrays", questionCount: 12, difficulty: "Easy", completionPercentage: 72 },
    { name: "Strings", questionCount: 10, difficulty: "Easy", completionPercentage: 68 },
    { name: "Linked Lists", questionCount: 6, difficulty: "Easy", completionPercentage: 55 },
    { name: "Trees", questionCount: 5, difficulty: "Medium", completionPercentage: 35 },
    { name: "Graphs", questionCount: 3, difficulty: "Medium", completionPercentage: 20 }
  ],
  "tech-mahindra": [
    { name: "Arrays", questionCount: 12, difficulty: "Easy", completionPercentage: 75 },
    { name: "Strings", questionCount: 8, difficulty: "Easy", completionPercentage: 70 },
    { name: "Linked Lists", questionCount: 5, difficulty: "Easy", completionPercentage: 60 },
    { name: "Trees", questionCount: 4, difficulty: "Medium", completionPercentage: 35 },
    { name: "Graphs", questionCount: 2, difficulty: "Medium", completionPercentage: 20 }
  ],
  amazon: [
    { name: "Arrays", questionCount: 35, difficulty: "Hard", completionPercentage: 55 },
    { name: "Strings", questionCount: 28, difficulty: "Hard", completionPercentage: 50 },
    { name: "Linked Lists", questionCount: 20, difficulty: "Medium", completionPercentage: 60 },
    { name: "Trees", questionCount: 25, difficulty: "Hard", completionPercentage: 45 },
    { name: "Graphs", questionCount: 18, difficulty: "Expert", completionPercentage: 30 }
  ],
  google: [
    { name: "Arrays", questionCount: 40, difficulty: "Expert", completionPercentage: 30 },
    { name: "Strings", questionCount: 32, difficulty: "Expert", completionPercentage: 28 },
    { name: "Linked Lists", questionCount: 15, difficulty: "Hard", completionPercentage: 40 },
    { name: "Trees", questionCount: 30, difficulty: "Expert", completionPercentage: 25 },
    { name: "Graphs", questionCount: 25, difficulty: "Expert", completionPercentage: 20 }
  ],
  microsoft: [
    { name: "Arrays", questionCount: 30, difficulty: "Hard", completionPercentage: 42 },
    { name: "Strings", questionCount: 25, difficulty: "Hard", completionPercentage: 38 },
    { name: "Linked Lists", questionCount: 18, difficulty: "Medium", completionPercentage: 50 },
    { name: "Trees", questionCount: 22, difficulty: "Hard", completionPercentage: 35 },
    { name: "Graphs", questionCount: 15, difficulty: "Hard", completionPercentage: 25 }
  ],
  adobe: [
    { name: "Arrays", questionCount: 28, difficulty: "Hard", completionPercentage: 35 },
    { name: "Strings", questionCount: 22, difficulty: "Hard", completionPercentage: 32 },
    { name: "Linked Lists", questionCount: 14, difficulty: "Medium", completionPercentage: 45 },
    { name: "Trees", questionCount: 18, difficulty: "Hard", completionPercentage: 30 },
    { name: "Graphs", questionCount: 12, difficulty: "Expert", completionPercentage: 18 }
  ]
};

const placementData: Record<string, PlacementRound[]> = {
  tcs: [
    { round: 1, title: "Aptitude Test", description: "TCS NQT: Quantitative aptitude, logical reasoning, verbal ability. 60 minutes, 50 questions.", estimatedDifficulty: "Easy", duration: "60 min" },
    { round: 2, title: "Coding Assessment", description: "Solve 2-3 coding problems on platform like HackerRank. Languages: C, Java, Python.", estimatedDifficulty: "Medium", duration: "45 min" },
    { round: 3, title: "Technical Interview", description: "Assessment of programming skills, core subjects, and project work. Usually 30-45 minutes.", estimatedDifficulty: "Medium", duration: "30-45 min" },
    { round: 4, title: "HR Interview", description: "Behavioral questions, communication skills, and cultural fit assessment.", estimatedDifficulty: "Easy", duration: "15-20 min" },
    { round: 5, title: "Offer", description: "Selected candidates receive offer letters with joining details and compensation package.", estimatedDifficulty: "N/A", duration: "N/A" }
  ],
  amazon: [
    { round: 1, title: "Online Coding Assessment", description: "2-3 medium to hard coding problems on Amazon's platform. Focus on DSA. 90 minutes.", estimatedDifficulty: "Hard", duration: "90 min" },
    { round: 2, title: "Technical Interview 1", description: "Data structures and algorithms. Problem-solving and coding on shared editor.", estimatedDifficulty: "Hard", duration: "45-60 min" },
    { round: 3, title: "Technical Interview 2", description: "System design (for SDE II+) or advanced DSA. Focus on scalability.", estimatedDifficulty: "Expert", duration: "45-60 min" },
    { round: 4, title: "Bar Raiser Round", description: "Leadership principles assessment. Behavioral questions with STAR method.", estimatedDifficulty: "Hard", duration: "45-60 min" },
    { round: 5, title: "HR Interview", description: "Compensation discussion, role alignment, and cultural fit.", estimatedDifficulty: "Easy", duration: "30 min" }
  ]
};

placementData["infosys"] = placementData["tcs"];
placementData["wipro"] = placementData["tcs"];
placementData["cognizant"] = placementData["tcs"];
placementData["accenture"] = placementData["tcs"];
placementData["capgemini"] = placementData["tcs"];
placementData["hcl"] = placementData["tcs"];
placementData["tech-mahindra"] = placementData["tcs"];
placementData["google"] = [
  { round: 1, title: "Online Coding Assessment", description: "2 medium-hard algorithm problems on Google's coding platform. 60-90 minutes.", estimatedDifficulty: "Hard", duration: "60-90 min" },
  { round: 2, title: "Technical Phone Screen", description: "1-2 coding problems over phone/video call with a Google engineer.", estimatedDifficulty: "Hard", duration: "45 min" },
  { round: 3, title: "On-site Coding Round 1", description: "Advanced algorithms and data structures. Focus on optimization.", estimatedDifficulty: "Expert", duration: "45 min" },
  { round: 4, title: "On-site Coding Round 2", description: "More algorithm problems. Clean code and testing mindset.", estimatedDifficulty: "Expert", duration: "45 min" },
  { round: 5, title: "System Design", description: "Design a scalable system. For SWE roles, focus on architecture.", estimatedDifficulty: "Expert", duration: "45 min" },
  { round: 6, title: "Googleyness & Leadership", description: "Cultural fit, leadership, and ethical decision-making assessment.", estimatedDifficulty: "Medium", duration: "30-45 min" }
];
placementData["microsoft"] = placementData["amazon"];
placementData["adobe"] = [
  { round: 1, title: "Online Coding Assessment", description: "2-3 coding problems on HackerRank. Focus on DSA and problem-solving.", estimatedDifficulty: "Hard", duration: "75 min" },
  { round: 2, title: "Technical Interview 1", description: "Data structures, algorithms, and JavaScript/web technologies.", estimatedDifficulty: "Hard", duration: "45 min" },
  { round: 3, title: "Technical Interview 2", description: "System design and design patterns. Product development focus.", estimatedDifficulty: "Hard", duration: "45 min" },
  { round: 4, title: "Design & Product Sense", description: "Product design questions. How would you build/improve a feature?", estimatedDifficulty: "Hard", duration: "45 min" },
  { round: 5, title: "HR Interview", description: "Cultural fit, team collaboration, and compensation discussion.", estimatedDifficulty: "Easy", duration: "30 min" }
];

const analyticsData: Record<string, AnalyticsData> = {
  tcs: { preparationProgress: 82, aptitudeReadiness: 80, codingReadiness: 75, technicalReadiness: 78, hrReadiness: 85 },
  infosys: { preparationProgress: 76, aptitudeReadiness: 78, codingReadiness: 70, technicalReadiness: 72, hrReadiness: 80 },
  wipro: { preparationProgress: 70, aptitudeReadiness: 75, codingReadiness: 68, technicalReadiness: 65, hrReadiness: 78 },
  cognizant: { preparationProgress: 65, aptitudeReadiness: 70, codingReadiness: 62, technicalReadiness: 60, hrReadiness: 72 },
  accenture: { preparationProgress: 71, aptitudeReadiness: 74, codingReadiness: 68, technicalReadiness: 66, hrReadiness: 80 },
  capgemini: { preparationProgress: 62, aptitudeReadiness: 68, codingReadiness: 60, technicalReadiness: 58, hrReadiness: 70 },
  hcl: { preparationProgress: 58, aptitudeReadiness: 62, codingReadiness: 55, technicalReadiness: 54, hrReadiness: 65 },
  "tech-mahindra": { preparationProgress: 52, aptitudeReadiness: 58, codingReadiness: 50, technicalReadiness: 48, hrReadiness: 60 },
  amazon: { preparationProgress: 70, aptitudeReadiness: 65, codingReadiness: 72, technicalReadiness: 68, hrReadiness: 75 },
  google: { preparationProgress: 48, aptitudeReadiness: 45, codingReadiness: 50, technicalReadiness: 42, hrReadiness: 55 },
  microsoft: { preparationProgress: 58, aptitudeReadiness: 55, codingReadiness: 60, technicalReadiness: 56, hrReadiness: 62 },
  adobe: { preparationProgress: 42, aptitudeReadiness: 40, codingReadiness: 45, technicalReadiness: 38, hrReadiness: 50 }
};

const recommendationData: Record<string, AIRecommendation[]> = {
  tcs: [
    { title: "Complete TCS NQT Mock Tests", description: "Practice 3 full-length NQT mock tests to improve speed and accuracy.", priority: "High" },
    { title: "Revise DBMS Concepts", description: "Focus on normalization, SQL queries, and transaction management for technical interview.", priority: "High" },
    { title: "Practice Communication Skills", description: "HR round emphasizes communication. Practice common HR questions.", priority: "Medium" }
  ],
  infosys: [
    { title: "Take InfyTQ Practice Tests", description: "Complete the InfyTQ certification practice modules for better preparation.", priority: "High" },
    { title: "Strengthen Java Programming", description: "Infosys focuses heavily on Java. Practice core Java concepts and coding.", priority: "High" },
    { title: "Improve Logical Reasoning", description: "Solve 20+ logical reasoning puzzles daily to improve speed.", priority: "Medium" }
  ],
  amazon: [
    { title: "Solve 10 Graph Problems", description: "Graph algorithms are frequently asked in Amazon coding rounds. Focus on BFS, DFS, Dijkstra.", priority: "High" },
    { title: "Revise DBMS Concepts", description: "Database design questions come up in both coding and system design rounds.", priority: "High" },
    { title: "Practice HR Interviews", description: "Use STAR method for Amazon Leadership Principles. Prepare 8-10 behavioral stories.", priority: "Medium" },
    { title: "Study System Design", description: "For SDE roles, practice designing scalable systems like URL shortener, chat system.", priority: "High" }
  ],
  google: [
    { title: "Solve 20 Hard DP Problems", description: "Dynamic Programming is crucial for Google interviews. Focus on optimization.", priority: "High" },
    { title: "Master System Design", description: "Practice designing large-scale distributed systems with trade-off analysis.", priority: "High" },
    { title: "Review Googleyness", description: "Prepare stories that demonstrate leadership, collaboration, and ethical decision-making.", priority: "Medium" },
    { title: "Practice Coding Speed", description: "Work on solving problems quickly with clean, optimized code.", priority: "High" }
  ],
  microsoft: [
    { title: "Practice Tree & Graph Problems", description: "Microsoft emphasizes tree and graph algorithms. Solve 15+ problems.", priority: "High" },
    { title: "Study Design Patterns", description: "Microsoft interviews often include design pattern discussions. Review common patterns.", priority: "Medium" },
    { title: "Prepare ASK Round", description: "Aptitude, Skills, Knowledge round requires broad technical knowledge.", priority: "High" }
  ],
  adobe: [
    { title: "Master JavaScript & TypeScript", description: "Adobe values strong frontend skills. Practice JS/TS coding problems.", priority: "High" },
    { title: "Build a Creative Project", description: "Showcase product thinking with a portfolio project demonstrating design skills.", priority: "Medium" },
    { title: "Learn Adobe Products", description: "Understanding Adobe's product suite helps in design and product sense rounds.", priority: "Medium" }
  ]
};

recommendationData["wipro"] = [
  { title: "Complete Wipro NLTH Mock Tests", description: "Practice NLTH pattern tests to familiarize with the exam format.", priority: "High" },
  { title: "Improve Written Communication", description: "Wipro has a written communication test. Practice essay writing.", priority: "High" },
  { title: "Revise C Programming", description: "C programming questions are common in Wipro technical rounds.", priority: "Medium" }
];

recommendationData["cognizant"] = [
  { title: "Practice SQL Queries", description: "SQL is heavily tested. Practice complex joins, subqueries, and PL/SQL.", priority: "High" },
  { title: "Review Testing Concepts", description: "Cognizant values automation testing knowledge. Learn Selenium basics.", priority: "Medium" },
  { title: "Take Mock Aptitude Tests", description: "Speed and accuracy in aptitude are critical for Cognizant.", priority: "High" }
];

recommendationData["accenture"] = [
  { title: "Practice Cognitive Assessments", description: "Accenture's cognitive test requires strong logical and analytical skills.", priority: "High" },
  { title: "Prepare Competency Questions", description: "Accenture uses competency-based interviews. Prepare specific examples.", priority: "Medium" },
  { title: "Improve Communication", description: "Accenture values client-facing communication skills highly.", priority: "High" }
];

recommendationData["capgemini"] = [
  { title: "Practice Group Discussion", description: "Capgemini sometimes includes GD. Practice discussing topics clearly.", priority: "Medium" },
  { title: "Strengthen Web Technologies", description: "HTML, CSS, JavaScript basics are important for Capgemini.", priority: "Medium" },
  { title: "Take Aptitude Tests", description: "Complete full-length aptitude tests to improve speed.", priority: "High" }
];

recommendationData["hcl"] = [
  { title: "Revise Networking Concepts", description: "HCL focuses on networking. Review OSI model, TCP/IP, routing protocols.", priority: "High" },
  { title: "Practice C++ Programming", description: "C++ is commonly used at HCL. Practice OOP concepts in C++.", priority: "Medium" },
  { title: "Work on Problem Solving", description: "Solve logical and analytical problems to improve reasoning skills.", priority: "High" }
];

recommendationData["tech-mahindra"] = [
  { title: "Learn Telecom Basics", description: "Tech Mahindra is telecom-focused. Learn 4G/5G fundamentals.", priority: "Medium" },
  { title: "Practice Core Java", description: "Java is essential for Tech Mahindra technical rounds.", priority: "High" },
  { title: "Improve Aptitude Speed", description: "Focus on quick calculations and logical reasoning.", priority: "High" }
];

export function getAllCompanies(): Company[] {
  return companies;
}

export function getCompanyById(id: string): FullCompanyData | null {
  const company = companies.find(c => c.id === id);
  if (!company) return null;

  return {
    company,
    overview: overviews[id] || overviews["tcs"],
    aptitude: aptitudeData[id] || aptitudeData["tcs"],
    coding: codingData[id] || codingData["tcs"],
    placementProcess: placementData[id] || placementData["tcs"],
    analytics: analyticsData[id] || analyticsData["tcs"],
    recommendations: recommendationData[id] || recommendationData["tcs"]
  };
}

export const difficultyColors: Record<string, string> = {
  Easy: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  Hard: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  Expert: "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
};
