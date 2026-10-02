import { aptitudeQuestions, type AptitudeQuestion } from "../aptitude/questions";
import { codingProblems, type CodingProblem } from "../coding/problems";
import { technicalQuestions, type TechnicalQuestion } from "../technical/questions";
import { hrQuestions, type HRQuestion } from "../hr/questions";

export interface CompanyQuestionMapping {
  companyId: string;
  aptitude: {
    categories: { name: string; totalQuestions: number; difficulty: string }[];
    questionIds: number[];
  };
  coding: {
    topics: { name: string; questionCount: number; difficulty: string }[];
    problemIds: string[];
  };
  technical: {
    subjects: string[];
    questionIds: number[];
  };
  hr: {
    questionIds: number[];
  };
}

export function getCompanyAptitudeQuestions(companyId: string): AptitudeQuestion[] {
  return aptitudeQuestions.filter(q => q.companies.includes(companyId));
}

export function getCompanyCodingProblems(companyId: string): CodingProblem[] {
  return codingProblems.filter(p => p.companies.includes(companyId));
}

export function getCompanyTechnicalQuestions(companyId: string): TechnicalQuestion[] {
  return technicalQuestions.filter(q => q.companies.includes(companyId));
}

export function getCompanyHRQuestions(companyId: string): HRQuestion[] {
  return hrQuestions.filter(q => q.companies.includes(companyId));
}

export function getCompanyAptitudeCategories(companyId: string): { name: string; totalQuestions: number; difficulty: string }[] {
  const qs = getCompanyAptitudeQuestions(companyId);
  const catMap = new Map<string, { name: string; totalQuestions: number; difficulties: Set<string> }>();

  for (const q of qs) {
    const cat = q.category;
    if (!catMap.has(cat)) {
      catMap.set(cat, { name: cat, totalQuestions: 0, difficulties: new Set() });
    }
    const entry = catMap.get(cat)!;
    entry.totalQuestions++;
    entry.difficulties.add(q.difficulty);
  }

  return Array.from(catMap.values()).map(e => ({
    name: e.name,
    totalQuestions: e.totalQuestions,
    difficulty: e.difficulties.has("Hard") ? "Hard" : e.difficulties.has("Medium") ? "Medium" : "Easy",
  }));
}

export function getCompanyCodingTopics(companyId: string): { name: string; questionCount: number; difficulty: string }[] {
  const probs = getCompanyCodingProblems(companyId);
  const topicMap = new Map<string, { name: string; questionCount: number; difficulties: Set<string> }>();

  for (const p of probs) {
    if (!topicMap.has(p.topic)) {
      topicMap.set(p.topic, { name: p.topic, questionCount: 0, difficulties: new Set() });
    }
    const entry = topicMap.get(p.topic)!;
    entry.questionCount++;
    entry.difficulties.add(p.difficulty);
  }

  return Array.from(topicMap.values()).map(e => ({
    name: e.name,
    questionCount: e.questionCount,
    difficulty: e.difficulties.has("Hard") ? "Hard" : e.difficulties.has("Medium") ? "Medium" : "Easy",
  }));
}

export function getCompanyTechnicalSubjects(companyId: string): string[] {
  const qs = getCompanyTechnicalQuestions(companyId);
  return [...new Set(qs.map(q => q.subject))];
}
