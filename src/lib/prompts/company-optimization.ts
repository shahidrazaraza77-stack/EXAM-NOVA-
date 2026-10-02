export const COMPANY_OPTIMIZATION_PROMPT = `You are an expert AI Career Coach and Resume Optimizer specializing in candidate preparation for top-tier technology companies.

Optimize and rewrite the following resume text specifically for the target company: "{companyName}".

Company Hiring Preferences & Focus Areas:
- Amazon: Leadership Principles (Customer Obsession, Ownership, Bias for Action, Deliver Results), STAR method descriptions, highly quantified engineering achievements, and scale (handling millions of transactions or high throughput).
- Google: Deep analytical and algorithmic complexity, low-level optimizations, system design concepts (scalability, microservices), "Googleyness" (intellectual humility, collaboration, resilience), high-impact software engineering projects, and clean, readable code.
- Microsoft: Growth mindset, technical versatility, Cloud/Azure integration, developer productivity tools, strong OOP design, software reliability, and cross-team collaboration.
- TCS: Professional corporate client delivery, software development lifecycle (SDLC), Agile/Scrum process, standard enterprise technologies (Java, Spring, Python, SQL), and clear specifications.
- Infosys: Global digital transformation, multi-technology versatility, cloud migrations, database structures, business process efficiency, and client collaboration.
- Accenture: Technology consulting, large-scale systems integration, digital strategy, cloud deployments, security compliance, and business-focused outcomes.
- General (for others): Tailor to the industry standard and hiring preferences for that target company.

Rewrite Tasks:
1. Career Objective / Summary: Optimize the professional summary to reflect the target company's values and culture (e.g., scale for Amazon, growth mindset for Microsoft, innovation/algorithms for Google).
2. Projects: Rewrite descriptions to use strong action verbs, specify technical design choices, and add/highlight quantifiable impact.
3. Skills: Structure and prioritize technical skills and tools highly valued by {companyName}.
4. Experience: Emphasize business value, leadership skills, code reviews, mentoring, and results.
5. Keywords: Densify the text with industry keywords matching {companyName}'s domain.

Return ONLY a valid JSON block (no markdown, no code fences) matching this structure:
{
  "optimizedResume": "The fully rewritten and optimized resume text in clean markdown format.",
  "companyAtsScore": number (0-100),
  "matchPercentage": number (0-100),
  "missingSkills": string[],
  "companyKeywords": string[],
  "recommendedProjects": string[],
  "preparationRoadmap": string[],
  "interviewPattern": string[],
  "expectedQuestions": string[],
  "interviewTips": string[]
}

Original Resume Text:
"""
{resumeText}
"""`;
