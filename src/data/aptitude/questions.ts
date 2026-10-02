export interface AptitudeQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  category: string;
  companies: string[];
}

export const aptitudeQuestions: AptitudeQuestion[] = [
  {
    id: 1,
    category: "quantitative",
    topic: "Percentage",
    question: "What is 15% of 80% of 450?",
    options: ["45", "54", "60", "36"],
    correctAnswer: 1,
    explanation: "First, find 80% of 450: 0.8 * 450 = 360. Next, find 15% of 360: 0.15 * 360 = 54.",
    difficulty: "Easy",
    companies: ["tcs", "infosys", "wipro", "cognizant", "accenture", "capgemini", "hcl", "tech-mahindra"],
  },
  {
    id: 2,
    category: "quantitative",
    topic: "Profit & Loss",
    question: "A retailer buys an article at 20% discount on the printed price and sells it at 10% discount on the printed price. What is his percentage profit?",
    options: ["10%", "12.5%", "15%", "11.11%"],
    correctAnswer: 1,
    explanation: "Let the printed price be $100. CP = 100 - 20% = $80. SP = 100 - 10% = $90. Profit = $10. Profit % = (10 / 80) * 100 = 12.5%.",
    difficulty: "Medium",
    companies: ["tcs", "infosys", "wipro", "cognizant", "accenture", "capgemini", "hcl", "tech-mahindra"],
  },
  {
    id: 3,
    category: "quantitative",
    topic: "Time & Work",
    question: "A can do a piece of work in 10 days and B can do it in 15 days. They work together for 4 days. What fraction of the work is left?",
    options: ["1/3", "1/2", "1/6", "2/3"],
    correctAnswer: 0,
    explanation: "Work done by A in 1 day = 1/10. Work done by B in 1 day = 1/15. Work done by (A + B) in 1 day = 1/6. Work done in 4 days = 2/3. Remaining = 1 - 2/3 = 1/3.",
    difficulty: "Medium",
    companies: ["tcs", "infosys", "wipro", "cognizant", "accenture", "capgemini", "hcl", "tech-mahindra"],
  },
  {
    id: 4,
    category: "quantitative",
    topic: "Time Speed Distance",
    question: "A train 125 m long passes a telegraph post in 10 seconds. What is the speed of the train in km/hr?",
    options: ["40 km/hr", "45 km/hr", "50 km/hr", "36 km/hr"],
    correctAnswer: 1,
    explanation: "Speed = 125 / 10 = 12.5 m/s. Speed = 12.5 * 18/5 = 45 km/hr.",
    difficulty: "Easy",
    companies: ["tcs", "infosys", "wipro", "cognizant", "accenture", "capgemini", "hcl", "tech-mahindra"],
  },
  {
    id: 5,
    category: "quantitative",
    topic: "Ratio & Proportion",
    question: "If A : B = 2 : 3, B : C = 4 : 5 and C : D = 6 : 7, what is A : D?",
    options: ["16 : 35", "8 : 15", "12 : 35", "4 : 7"],
    correctAnswer: 0,
    explanation: "A/D = (2/3) * (4/5) * (6/7) = 48/105 = 16/35. Thus, A : D = 16 : 35.",
    difficulty: "Medium",
    companies: ["tcs", "infosys", "wipro", "cognizant", "accenture", "capgemini", "hcl", "tech-mahindra", "amazon", "google", "microsoft", "adobe"],
  },
  {
    id: 6,
    category: "logical",
    topic: "Blood Relations",
    question: "Pointing to a photograph, Vipul said, 'She is the daughter of my grandfather's only son.' How is the girl in the photograph related to Vipul?",
    options: ["Mother", "Sister", "Cousin", "Aunt"],
    correctAnswer: 1,
    explanation: "Vipul's grandfather's only son is Vipul's father. The daughter of Vipul's father is Vipul's sister.",
    difficulty: "Easy",
    companies: ["tcs", "infosys", "wipro", "cognizant", "accenture", "capgemini", "hcl", "tech-mahindra"],
  },
  {
    id: 7,
    category: "logical",
    topic: "Syllogism",
    question: "Statements: All bags are pockets. All pockets are pouches. \nConclusions: \nI. All bags are pouches. \nII. Some pouches are pockets.",
    options: ["Only conclusion I follows", "Only conclusion II follows", "Both conclusions I and II follow", "Neither follows"],
    correctAnswer: 2,
    explanation: "Since all bags are pockets and all pockets are pouches, all bags are pouches (I follows). Some pouches are pockets (II follows).",
    difficulty: "Medium",
    companies: ["tcs", "infosys", "wipro", "cognizant", "accenture", "capgemini", "hcl", "tech-mahindra", "amazon", "google", "microsoft", "adobe"],
  },
  {
    id: 8,
    category: "logical",
    topic: "Puzzles",
    question: "Five people A, B, C, D, and E are sitting in a row facing North. A is next to B but not next to C. D is next to C who is on the extreme left. E is not next to B. Who is sitting in the middle?",
    options: ["A", "B", "D", "E"],
    correctAnswer: 0,
    explanation: "The correct arrangement is C, D, A, B, E. A sits in the middle (position 3).",
    difficulty: "Hard",
    companies: ["tcs", "infosys", "wipro", "cognizant", "accenture", "capgemini", "hcl", "tech-mahindra", "amazon", "google", "microsoft", "adobe"],
  },
  {
    id: 9,
    category: "verbal",
    topic: "Reading Comprehension",
    question: "Read the snippet: 'The advent of automated AI review platforms has shifted the focus of professional writing from mechanical grammatical perfection to authentic, narrative-driven storytelling.' \nAccording to the passage, what is the primary consequence of AI review platforms?",
    options: [
      "Writers can now ignore grammar rules.",
      "Authentic storytelling is valued more than mere grammatical correctness.",
      "AI will eventually replace human storytellers.",
      "Grammar is no longer relevant in professional contexts."
    ],
    correctAnswer: 1,
    explanation: "The passage notes that the focus has shifted 'from mechanical grammatical perfection to authentic, narrative-driven storytelling'.",
    difficulty: "Medium",
    companies: ["tcs", "infosys", "wipro", "cognizant", "accenture", "capgemini", "hcl", "tech-mahindra", "amazon", "google", "microsoft", "adobe"],
  },
  {
    id: 10,
    category: "verbal",
    topic: "Error Detection",
    question: "Identify the part of the sentence that contains a grammatical error: \n'Neither of the two candidates (A) / were selected (B) / for the executive post (C) / No error (D)'",
    options: ["Neither of the two candidates", "were selected", "for the executive post", "No error"],
    correctAnswer: 1,
    explanation: "The subject 'Neither' is singular and takes a singular verb. 'were selected' should be 'was selected'.",
    difficulty: "Easy",
    companies: ["tcs", "infosys", "wipro", "cognizant", "accenture", "capgemini", "hcl", "tech-mahindra", "amazon", "google", "microsoft", "adobe"],
  },
  {
    id: 11,
    category: "data-interpretation",
    topic: "Pie Charts",
    question: "A company spends 30% of its budget on R&D, 25% on Marketing, 20% on Operations, 15% on Salaries, and the rest on Legal. If the total budget is $1,200,000, how much is spent on Legal?",
    options: ["$120,000", "$60,000", "$180,000", "$100,000"],
    correctAnswer: 0,
    explanation: "Total spent = 90%. Legal = 10% = $120,000.",
    difficulty: "Easy",
    companies: ["tcs", "infosys", "wipro", "cognizant", "accenture", "capgemini", "hcl", "tech-mahindra"],
  },
  {
    id: 12,
    category: "data-interpretation",
    topic: "Tables",
    question: "Refer to the table of annual profits of Company X: \n- 2023: $120k \n- 2024: $150k \n- 2025: $180k \nWhat is the percentage growth in profit from 2023 to 2025?",
    options: ["50%", "30%", "25%", "60%"],
    correctAnswer: 0,
    explanation: "Increase = $60k. Percentage growth = (60 / 120) * 100 = 50%.",
    difficulty: "Medium",
    companies: ["tcs", "infosys", "wipro", "cognizant", "accenture", "capgemini", "hcl", "tech-mahindra"],
  },
];

export function getAptitudeQuestionsByCompany(companyId: string): AptitudeQuestion[] {
  return aptitudeQuestions.filter(q => q.companies.includes(companyId));
}

export function getAptitudeQuestionsByTopic(topic: string): AptitudeQuestion[] {
  return aptitudeQuestions.filter(q => q.topic.toLowerCase() === topic.toLowerCase());
}

export function getAptitudeQuestionsByCategory(category: string): AptitudeQuestion[] {
  return aptitudeQuestions.filter(q => q.category === category);
}
