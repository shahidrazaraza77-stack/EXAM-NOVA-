export interface HRQuestion {
  id: number;
  question: string;
  tip: string;
  category: string;
  companies: string[];
}

export const hrQuestionCategories = [
  "Introduction",
  "Motivation",
  "Self Assessment",
  "Company Knowledge",
  "Career Goals",
  "Behavioral",
  "Leadership Principle",
  "Problem Solving",
  "Technical",
] as const;

export const hrQuestions: HRQuestion[] = [
  {
    id: 1,
    question: "Tell me about yourself.",
    tip: "Structure your answer: education -> skills -> experience -> why you're interested in this role.",
    category: "Introduction",
    companies: ["tcs", "infosys", "wipro", "cognizant", "accenture", "capgemini", "hcl", "tech-mahindra", "amazon", "google", "microsoft", "adobe"],
  },
  {
    id: 2,
    question: "Why should we hire you?",
    tip: "Highlight your unique skills, relevant experience, and how you can add value to the company.",
    category: "Motivation",
    companies: ["tcs", "infosys", "wipro", "cognizant", "accenture", "capgemini", "hcl", "tech-mahindra"],
  },
  {
    id: 3,
    question: "What are your strengths and weaknesses?",
    tip: "Be honest about weaknesses but show how you're working to improve them. Connect strengths to the role.",
    category: "Self Assessment",
    companies: ["tcs", "infosys", "wipro", "cognizant", "accenture", "capgemini", "hcl", "tech-mahindra"],
  },
  {
    id: 4,
    question: "Where do you see yourself in 5 years?",
    tip: "Show ambition aligned with the company's growth. Mention skill development and leadership aspirations.",
    category: "Career Goals",
    companies: ["tcs", "infosys", "wipro", "cognizant", "accenture", "capgemini", "hcl", "tech-mahindra"],
  },
  {
    id: 5,
    question: "Tell me about a time you worked in a team.",
    tip: "Use the STAR method: Situation, Task, Action, Result. Highlight collaboration and conflict resolution.",
    category: "Behavioral",
    companies: ["tcs", "infosys", "wipro", "cognizant", "accenture", "capgemini", "hcl", "tech-mahindra"],
  },
  {
    id: 6,
    question: "How do you handle pressure and deadlines?",
    tip: "Provide real examples. Mention prioritization, time management, and staying calm under pressure.",
    category: "Behavioral",
    companies: ["tcs", "infosys", "wipro", "cognizant", "accenture", "capgemini", "hcl", "tech-mahindra"],
  },
  {
    id: 7,
    question: "Why do you want to join our company?",
    tip: "Research the company's projects, culture, and values. Mention specific aspects that appeal to you.",
    category: "Company Knowledge",
    companies: ["tcs", "infosys", "wipro", "cognizant", "accenture", "capgemini", "hcl", "tech-mahindra"],
  },
  {
    id: 8,
    question: "Why did you choose engineering/your field?",
    tip: "Share your genuine passion for technology and problem-solving. Mention specific projects or experiences.",
    category: "Motivation",
    companies: ["tcs", "infosys", "wipro", "cognizant", "accenture", "capgemini", "hcl", "tech-mahindra", "amazon", "google", "microsoft", "adobe"],
  },
  {
    id: 9,
    question: "Tell me about a time you disagreed with your manager.",
    tip: "Use STAR method. Show respect while demonstrating conviction. Amazon values 'Have Backbone; Disagree and Commit'.",
    category: "Leadership Principle",
    companies: ["amazon", "google", "microsoft", "adobe"],
  },
  {
    id: 10,
    question: "Describe a time you delivered results under tight deadlines.",
    tip: "Focus on measurable impact. Amazon values 'Deliver Results' principle. Use metrics.",
    category: "Leadership Principle",
    companies: ["amazon", "google", "microsoft", "adobe"],
  },
  {
    id: 11,
    question: "Tell me about a time you took a calculated risk.",
    tip: "Show data-driven decision making. Explain how you evaluated trade-offs and what you learned.",
    category: "Leadership Principle",
    companies: ["amazon", "google", "microsoft", "adobe"],
  },
  {
    id: 12,
    question: "How would you improve a product?",
    tip: "Show customer obsession. Suggest specific, actionable improvements with reasoning.",
    category: "Problem Solving",
    companies: ["amazon", "google", "microsoft", "adobe"],
  },
  {
    id: 13,
    question: "Tell me about a time you failed.",
    tip: "Be honest. Focus on what you learned and how you improved. Companies value learning from failures.",
    category: "Leadership Principle",
    companies: ["amazon", "google", "microsoft", "adobe"],
  },
  {
    id: 14,
    question: "Describe your most challenging technical project.",
    tip: "Highlight architecture decisions, trade-offs, team collaboration, and measurable outcomes.",
    category: "Technical",
    companies: ["amazon", "google", "microsoft", "adobe"],
  },
];

export function getHRQuestionsByCompany(companyId: string): HRQuestion[] {
  return hrQuestions.filter(q => q.companies.includes(companyId));
}
