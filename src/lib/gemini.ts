import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { RESUME_ANALYSIS_PROMPT } from "@/lib/prompts/resume-analysis";
import { JOB_MATCH_PROMPT } from "@/lib/prompts/job-match";
import { INTERVIEW_QUESTION_PROMPT } from "@/lib/prompts/interview-question";
import { INTERVIEW_FEEDBACK_PROMPT } from "@/lib/prompts/interview-feedback";
import { INTERVIEW_REPORT_PROMPT } from "@/lib/prompts/interview-report";
import { SKILL_GAP_PROMPT } from "@/lib/prompts/skill-gap";
import { RECOMMENDATIONS_PROMPT } from "@/lib/prompts/recommendations";
import { READINESS_ANALYSIS_PROMPT } from "@/lib/prompts/readiness-analysis";
import { PLACEMENT_FEEDBACK_PROMPT } from "@/lib/prompts/placement-feedback";

// Strictly server-only GEMINI_API_KEY to prevent client credential leakage
const apiKey = process.env.GEMINI_API_KEY || "";

if (!apiKey && typeof window === "undefined") {
  console.warn("[SECURITY] GEMINI_API_KEY is not set. AI operations will fail until configured in .env.local");
}

export const genAI = new GoogleGenerativeAI(apiKey);

export async function safeGenerateContent(
  prompt: string | Array<any>,
  modelName: string = "gemini-2.5-flash"
): Promise<string> {
  // Use official available production models
  const modelsToTry = Array.from(new Set([
    modelName,
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash"
  ]));
  
  let lastError: any = null;

  for (const currentModel of modelsToTry) {
    try {
      const modelInstance = genAI.getGenerativeModel({ model: currentModel });
      // Call with an 8-second timeout so it never freezes the server/page
      const generatePromise = modelInstance.generateContent(prompt as any);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after 8s on ${currentModel}`)), 8000)
      );

      const result: any = await Promise.race([generatePromise, timeoutPromise]);
      const response = result.response;
      const text = response.text();
      if (text) {
        return text.trim();
      }
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || "";
      console.warn(`Gemini generation using ${currentModel} failed: ${errMsg}`);
      // Proceed to next fallback model immediately
    }
  }

  throw lastError || new Error("Gemini generation failed after trying fallback models.");
}

export interface AnalysisResult {
  atsScore: number;
  sectionScores: {
    formatting: number;
    keywords: number;
    projects: number;
    skills: number;
    education: number;
    experience: number;
    achievements: number;
    grammar: number;
  };
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  weakSections: string[];
  strongSections: string[];
  suggestions: string[];
  overallFeedback: string;
  rewrittenBulletPoints?: string[];
  rewrittenSummary?: string;
  actionPlan?: string[];
}

export interface JobMatchResult {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  missingKeywords: string[];
  suggestedImprovements: string[];
  recommendedCourses: string[];
  interviewQuestions: string[];
  expectedSalary: string;
  companyDifficulty: string;
  hiringProbability: string;
}

export async function analyzeResumeWithGemini(resumeText: string): Promise<AnalysisResult> {
  const prompt = RESUME_ANALYSIS_PROMPT.replace("{resumeText}", resumeText);
  const text = await safeGenerateContent(prompt);
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*$/gm, "").trim();
  return JSON.parse(cleaned) as AnalysisResult;
}

export interface InterviewQuestionResult {
  question: string;
  type: "HR" | "Technical";
}

export interface InterviewFeedbackResult {
  score: number;
  feedback: string;
  improvements: string[];
  confidence_level: number;
  communicationScore: number;
  technicalScore: number;
  confidenceScore: number;
  clarityScore: number;
}

export interface InterviewReportResult {
  score: number;
  communicationScore: number;
  technicalScore: number;
  confidenceScore: number;
  weakAreas: string[];
  improvementRoadmap: string[];
}

export async function generateInterviewQuestion(
  interviewType: string,
  role: string,
  level: string,
  previousQuestions: string[],
  company: string | null = null,
  weakAreas: string[] = [],
  resumeText: string | null = null
): Promise<InterviewQuestionResult> {
  const prompt = INTERVIEW_QUESTION_PROMPT
    .replace("{interviewType}", interviewType)
    .replace("{role}", role)
    .replace("{level}", level)
    .replace("{company}", company || "Not specified")
    .replace("{weakAreas}", weakAreas.length > 0 ? weakAreas.join(", ") : "None")
    .replace("{previousQuestions}", previousQuestions.length > 0
      ? previousQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")
      : "None"
    )
    .replace("{resumeText}", resumeText || "None");

  const text = await safeGenerateContent(prompt);
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*$/gm, "").trim();
  return JSON.parse(cleaned) as InterviewQuestionResult;
}

export async function evaluateInterviewAnswer(
  question: string,
  answer: string
): Promise<InterviewFeedbackResult> {
  const prompt = INTERVIEW_FEEDBACK_PROMPT
    .replace("{question}", question)
    .replace("{answer}", answer);

  const text = await safeGenerateContent(prompt);
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*$/gm, "").trim();
  return JSON.parse(cleaned) as InterviewFeedbackResult;
}

export async function generateFinalInterviewReport(
  role: string,
  difficulty: string,
  mode: string,
  company: string | null,
  transcript: string
): Promise<InterviewReportResult> {
  const prompt = INTERVIEW_REPORT_PROMPT
    .replace("{role}", role)
    .replace("{difficulty}", difficulty)
    .replace("{mode}", mode)
    .replace("{company}", company || "Not specified")
    .replace("{transcript}", transcript);

  const text = await safeGenerateContent(prompt);
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*$/gm, "").trim();
  return JSON.parse(cleaned) as InterviewReportResult;
}

export interface SkillGapResult {
  weakestSkill: string;
  weakestScore: number;
  strongestSkill: string;
  strongestScore: number;
  skillGaps: Array<{ skill: string; gap: string; priority: string }>;
  analysis: string;
}

export interface RecommendationsResult {
  recommendations: Array<{ title: string; description: string; priority: string }>;
  dailyPlan: string[];
}

export interface ReadinessAnalysisResult {
  readinessLevel: string;
  readinessSummary: string;
  companyReadiness: Array<{ company: string; readiness: number; confidence: string }>;
  improvementSuggestions: string[];
}

export async function analyzeSkillGaps(scores: {
  resumeScore: number;
  aptitudeScore: number;
  codingScore: number;
  interviewScore: number;
  overallReadiness: number;
}): Promise<SkillGapResult> {
  const prompt = SKILL_GAP_PROMPT
    .replace("{resumeScore}", String(scores.resumeScore))
    .replace("{aptitudeScore}", String(scores.aptitudeScore))
    .replace("{codingScore}", String(scores.codingScore))
    .replace("{interviewScore}", String(scores.interviewScore))
    .replace("{overallReadiness}", String(scores.overallReadiness));

  const text = await safeGenerateContent(prompt);
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*$/gm, "").trim();
  return JSON.parse(cleaned) as SkillGapResult;
}

export async function generateRecommendations(
  scores: {
    resumeScore: number;
    aptitudeScore: number;
    codingScore: number;
    interviewScore: number;
    overallReadiness: number;
  },
  targetCompany: string,
  recentActivity: string
): Promise<RecommendationsResult> {
  const prompt = RECOMMENDATIONS_PROMPT
    .replace("{resumeScore}", String(scores.resumeScore))
    .replace("{aptitudeScore}", String(scores.aptitudeScore))
    .replace("{codingScore}", String(scores.codingScore))
    .replace("{interviewScore}", String(scores.interviewScore))
    .replace("{overallReadiness}", String(scores.overallReadiness))
    .replace("{targetCompany}", targetCompany)
    .replace("{recentActivity}", recentActivity);

  const text = await safeGenerateContent(prompt);
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*$/gm, "").trim();
  return JSON.parse(cleaned) as RecommendationsResult;
}

export async function analyzeReadiness(
  scores: {
    resumeScore: number;
    aptitudeScore: number;
    codingScore: number;
    interviewScore: number;
    overallReadiness: number;
  },
  companyReadiness: Array<{ company: string; readiness: number }>
): Promise<ReadinessAnalysisResult> {
  const companyReadinessText = companyReadiness
    .map((c) => `${c.company}: ${c.readiness}%`)
    .join("\n");

  const prompt = READINESS_ANALYSIS_PROMPT
    .replace("{resumeScore}", String(scores.resumeScore))
    .replace("{aptitudeScore}", String(scores.aptitudeScore))
    .replace("{codingScore}", String(scores.codingScore))
    .replace("{interviewScore}", String(scores.interviewScore))
    .replace("{overallReadiness}", String(scores.overallReadiness))
    .replace("{companyReadiness}", companyReadinessText);

  const text = await safeGenerateContent(prompt);
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*$/gm, "").trim();
  return JSON.parse(cleaned) as ReadinessAnalysisResult;
}

export async function matchResumeWithJob(resumeText: string, jobDescription: string): Promise<JobMatchResult> {
  const prompt = JOB_MATCH_PROMPT
    .replace("{resumeText}", resumeText)
    .replace("{jobDescription}", jobDescription);

  const text = await safeGenerateContent(prompt);
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*$/gm, "").trim();
  return JSON.parse(cleaned) as JobMatchResult;
}

export interface PlacementFeedbackResult {
  performanceAnalysis: string;
  strengths: string[];
  weaknesses: string[];
  preparationStrategy: string;
}

export async function generatePlacementFeedback(
  companyName: string,
  scores: { resume: number; aptitude: number; coding: number; technical: number; hr: number },
  weights: { resume: number; aptitude: number; coding: number; technical: number; hr: number },
  overallScore: number,
  result: string
): Promise<PlacementFeedbackResult> {
  const prompt = PLACEMENT_FEEDBACK_PROMPT
    .replace("{companyName}", companyName)
    .replace(/{companyName}/g, companyName)
    .replace("{resumeScore}", String(scores.resume))
    .replace("{aptitudeScore}", String(scores.aptitude))
    .replace("{codingScore}", String(scores.coding))
    .replace("{technicalScore}", String(scores.technical))
    .replace("{hrScore}", String(scores.hr))
    .replace("{overallScore}", String(overallScore))
    .replace("{result}", result)
    .replace("{resumeWeight}", String(weights.resume))
    .replace("{aptitudeWeight}", String(weights.aptitude))
    .replace("{codingWeight}", String(weights.coding))
    .replace("{technicalWeight}", String(weights.technical))
    .replace("{hrWeight}", String(weights.hr));

  const text = await safeGenerateContent(prompt);
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*$/gm, "").trim();
  return JSON.parse(cleaned) as PlacementFeedbackResult;
}

export const RESUME_PARSING_PROMPT = `You are an expert ATS Parser. Parse the following resume text into a highly structured JSON object representing all candidates details.
Return ONLY valid JSON (no markdown, no code fences) with the following structure:
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "links": {
    "linkedin": "string",
    "github": "string",
    "portfolio": "string"
  },
  "location": "string",
  "professionalSummary": "string",
  "experience": [
    {
      "company": "string",
      "position": "string",
      "startDate": "string",
      "endDate": "string",
      "highlights": ["string"],
      "location": "string"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"],
      "url": "string",
      "highlights": ["string"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "fieldOfStudy": "string",
      "startDate": "string",
      "endDate": "string",
      "gpa": "string",
      "location": "string"
    }
  ],
  "certifications": ["string"],
  "achievements": ["string"],
  "skills": {
    "technicalSkills": ["string"],
    "softSkills": ["string"],
    "languages": ["string"]
  },
  "volunteerWork": [
    {
      "organization": "string",
      "role": "string",
      "description": "string",
      "startDate": "string",
      "endDate": "string"
    }
  ],
  "awards": ["string"],
  "publications": ["string"]
}

Resume Text:
{resumeText}`;

export interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  links: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    [key: string]: string | undefined;
  };
  location: string;
  professionalSummary: string;
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    highlights: string[];
    location?: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    highlights: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    gpa?: string;
    location?: string;
  }>;
  certifications: string[];
  achievements: string[];
  skills: {
    technicalSkills: string[];
    softSkills: string[];
    languages: string[];
  };
  volunteerWork: Array<{
    organization: string;
    role: string;
    description: string;
    startDate: string;
    endDate: string;
  }>;
  awards: string[];
  publications: string[];
}

export async function parseResumeWithGemini(resumeText: string): Promise<ParsedResume> {
  const prompt = RESUME_PARSING_PROMPT.replace("{resumeText}", resumeText);
  const text = await safeGenerateContent(prompt);
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*$/gm, "").trim();
  return JSON.parse(cleaned) as ParsedResume;
}

