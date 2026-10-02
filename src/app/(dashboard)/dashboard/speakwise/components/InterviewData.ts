export interface InterviewQuestion {
  id: string;
  question: string;
  type: "hr" | "technical" | "mixed";
  topic: string;
  expectedKeywords: string[];
  difficulty: "easy" | "medium" | "hard";
  idealAnswerPoints: string[];
}

export const HR_QUESTIONS: InterviewQuestion[] = [
  { id: "hr-1", question: "Tell me about yourself", type: "hr", topic: "Self Introduction", expectedKeywords: ["experience", "skills", "career", "passion"], difficulty: "easy", idealAnswerPoints: ["Current role and responsibilities", "Key past achievements", "Career goals and motivation"] },
  { id: "hr-2", question: "Why should we hire you?", type: "hr", topic: "Motivation", expectedKeywords: ["unique", "value", "skills", "company", "fit"], difficulty: "medium", idealAnswerPoints: ["Unique combination of skills", "Proven track record", "Cultural alignment with company"] },
  { id: "hr-3", question: "What are your strengths and weaknesses?", type: "hr", topic: "Self Awareness", expectedKeywords: ["strength", "improve", "learning", "growth"], difficulty: "medium", idealAnswerPoints: ["Strength with concrete example", "Honest weakness with improvement plan", "Self-awareness demonstration"] },
  { id: "hr-4", question: "Describe a challenge you faced at work", type: "hr", topic: "Problem Solving", expectedKeywords: ["challenge", "solution", "team", "result", "learned"], difficulty: "medium", idealAnswerPoints: ["Situation context", "Action taken", "Positive outcome achieved"] },
  { id: "hr-5", question: "Where do you see yourself in 5 years?", type: "hr", topic: "Career Aspiration", expectedKeywords: ["growth", "leadership", "skills", "contribute"], difficulty: "easy", idealAnswerPoints: ["Short-term skill building", "Long-term leadership goals", "Alignment with company growth"] },
  { id: "hr-6", question: "Why do you want to leave your current job?", type: "hr", topic: "Career Change", expectedKeywords: ["growth", "opportunity", "challenge", "career"], difficulty: "hard", idealAnswerPoints: ["Focus on positive reasons", "Desire for growth", "Avoid negative comments about current employer"] },
  { id: "hr-7", question: "Tell me about a time you worked in a team", type: "hr", topic: "Teamwork", expectedKeywords: ["team", "collaboration", "conflict", "resolution"], difficulty: "medium", idealAnswerPoints: ["Team context and goal", "Your specific contribution", "How conflict was resolved"] },
];

export const TECHNICAL_QUESTIONS: InterviewQuestion[] = [
  { id: "tech-1", question: "Explain Object-Oriented Programming concepts", type: "technical", topic: "OOP", expectedKeywords: ["encapsulation", "inheritance", "polymorphism", "abstraction"], difficulty: "easy", idealAnswerPoints: ["Four pillars of OOP", "Real-world analogy for each", "Benefits of OOP approach"] },
  { id: "tech-2", question: "What is the difference between REST and GraphQL?", type: "technical", topic: "API Design", expectedKeywords: ["REST", "GraphQL", "endpoint", "query", "flexibility"], difficulty: "medium", idealAnswerPoints: ["REST uses multiple endpoints", "GraphQL uses single endpoint", "GraphQL allows client-specified data shape"] },
  { id: "tech-3", question: "Explain database normalization", type: "technical", topic: "Databases", expectedKeywords: ["normalization", "redundancy", "normal forms", "integrity"], difficulty: "medium", idealAnswerPoints: ["Purpose of normalization", "1NF, 2NF, 3NF explained", "Trade-offs with denormalization"] },
  { id: "tech-4", question: "What is the time complexity of binary search?", type: "technical", topic: "Algorithms", expectedKeywords: ["O(log n)", "logarithmic", "sorted", "divide"], difficulty: "easy", idealAnswerPoints: ["O(log n) time complexity", "Divide and conquer approach", "Requires sorted array"] },
  { id: "tech-5", question: "Explain how garbage collection works in Java", type: "technical", topic: "Memory Management", expectedKeywords: ["garbage", "memory", "heap", "mark", "sweep"], difficulty: "hard", idealAnswerPoints: ["Automatic memory management", "Mark and sweep algorithm", "Generational collection approach"] },
  { id: "tech-6", question: "What is the difference between TCP and UDP?", type: "technical", topic: "Networking", expectedKeywords: ["TCP", "UDP", "reliable", "connection", "speed"], difficulty: "medium", idealAnswerPoints: ["TCP is connection-oriented and reliable", "UDP is faster but unreliable", "Use cases for each protocol"] },
  { id: "tech-7", question: "Explain the concept of microservices", type: "technical", topic: "Architecture", expectedKeywords: ["microservices", "decomposition", "scalability", "independent"], difficulty: "medium", idealAnswerPoints: ["Decomposition of monolith", "Independent deployability", "Communication via APIs"] },
  { id: "tech-8", question: "How does HTTPS work?", type: "technical", topic: "Security", expectedKeywords: ["SSL", "TLS", "encryption", "certificate", "handshake"], difficulty: "hard", idealAnswerPoints: ["SSL/TLS handshake process", "Public/private key encryption", "Certificate authority verification"] },
];

export function generateMixedQuestions(count: number = 5): InterviewQuestion[] {
  const shuffled = [...HR_QUESTIONS, ...TECHNICAL_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getQuestionsForMode(mode: "hr" | "technical" | "mixed", difficulty?: string): InterviewQuestion[] {
  let questions: InterviewQuestion[];
  if (mode === "hr") questions = [...HR_QUESTIONS];
  else if (mode === "technical") questions = [...TECHNICAL_QUESTIONS];
  else questions = generateMixedQuestions(6);

  if (difficulty && difficulty !== "all") {
    questions = questions.filter((q) => q.difficulty === difficulty);
  }

  return questions.sort(() => Math.random() - 0.5).slice(0, 6);
}

export interface RealTimeFeedback {
  score: number;
  message: string;
  strengths: string[];
  improvements: string[];
}

export function evaluateAnswer(question: InterviewQuestion, answer: string): RealTimeFeedback {
  const words = answer.toLowerCase().split(/\s+/);
  const keywordMatches = question.expectedKeywords.filter((kw) => words.some((w) => w.includes(kw)));
  const keywordScore = (keywordMatches.length / question.expectedKeywords.length) * 100;
  const lengthScore = Math.min(100, (words.length / 30) * 100);
  const confidenceScore = words.length > 15 ? 75 + Math.random() * 20 : 50 + Math.random() * 30;

  const overall = Math.round((keywordScore * 0.5 + lengthScore * 0.2 + confidenceScore * 0.3));

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (keywordMatches.length >= 2) strengths.push(`Covered key concepts: ${keywordMatches.slice(0, 3).join(", ")}`);
  else improvements.push("Try to include more relevant technical terms");

  if (words.length >= 20) strengths.push("Good response length with adequate detail");
  else improvements.push("Expand your answer with more specific details");

  if (words.length <= 5) improvements.push("Your answer is too brief — provide more context and examples");
  if (overall < 60) improvements.push("Structure your answer using STAR or direct approach");

  return {
    score: overall,
    message: overall >= 80 ? "Excellent answer!" : overall >= 60 ? "Good answer with room for improvement" : "Needs significant improvement",
    strengths: strengths.length > 0 ? strengths : ["You attempted the question"],
    improvements: improvements.length > 0 ? improvements : ["Try to be more specific with examples"],
  };
}
