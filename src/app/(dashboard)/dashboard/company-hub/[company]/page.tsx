"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Bookmark, BookmarkCheck, Building2, Brain, Code2, Monitor, Users, Milestone, BarChart3,
  Sparkles, Target, Clock, ChevronRight, CheckCircle2, PlayCircle, Eye, GraduationCap, Lightbulb,
  ShieldCheck, TrendingUp, Layers, ExternalLink, BookOpen, Network, Database, Workflow, FileJson,
  ListChecks, Loader2
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
  Cell
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  getCompanyById, difficultyColors, type FullCompanyData
} from "@/lib/company-data";
import {
  getCompanyTechnicalQuestions,
  getCompanyHRQuestions,
  getCompanyAptitudeCategories,
  getCompanyCodingTopics,
  getCompanyTechnicalSubjects,
} from "@/data/companies/mappings";
import { companyService, type FrontendCompany, type HiringProcessStep } from "@/services/company.service";
import { dashboardService } from "@/services/dashboard.service";
import { useAuth } from "@/context/AuthContext";

const tabs = [
  { id: "overview", label: "Overview", icon: Building2 },
  { id: "aptitude", label: "Aptitude", icon: Brain },
  { id: "coding", label: "Coding", icon: Code2 },
  { id: "technical", label: "Technical", icon: Monitor },
  { id: "hr", label: "HR Interview", icon: Users },
  { id: "placement", label: "Placement Process", icon: Milestone },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

const subjectIcons: Record<string, React.ReactNode> = {
  "DBMS": <Database className="w-5 h-5" />,
  "Operating System": <Monitor className="w-5 h-5" />,
  "Computer Networks": <Network className="w-5 h-5" />,
  "OOP": <Workflow className="w-5 h-5" />,
  "SQL": <FileJson className="w-5 h-5" />,
};

const subjectColors: Record<string, string> = {
  "DBMS": "from-blue-500 to-blue-700",
  "Operating System": "from-purple-500 to-purple-700",
  "Computer Networks": "from-cyan-500 to-cyan-700",
  "OOP": "from-amber-500 to-amber-700",
  "SQL": "from-emerald-500 to-emerald-700",
};

const subjectBgColors: Record<string, string> = {
  "DBMS": "bg-blue-50 dark:bg-blue-950/40",
  "Operating System": "bg-purple-50 dark:bg-purple-950/40",
  "Computer Networks": "bg-cyan-50 dark:bg-cyan-950/40",
  "OOP": "bg-amber-50 dark:bg-amber-950/40",
  "SQL": "bg-emerald-50 dark:bg-emerald-950/40",
};

function SkeletonTab() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        ))}
      </div>
    </div>
  );
}

function TabOverview({
  data,
  dbDescription,
  dbEligibility
}: {
  data: FullCompanyData;
  dbDescription?: string | null;
  dbEligibility?: string | null;
}) {
  const { overview } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {dbDescription && (
        <Card className="relative overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-aurora-primary before:to-aurora-accent">
          <CardContent className="p-6 space-y-3">
            <h3 className="font-bold text-sm text-aurora-text flex items-center gap-2">
              <Building2 className="w-4 h-4 text-aurora-primary" />
              Company Overview
            </h3>
            <p className="text-sm text-aurora-text-secondary leading-relaxed">{dbDescription}</p>
          </CardContent>
        </Card>
      )}

      {dbEligibility && (
        <Card className="relative overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-violet-500 before:to-fuchsia-500">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-violet-500 dark:text-violet-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-aurora-text">Eligibility Criteria</h3>
                <p className="text-[10px] text-aurora-text-muted">Academic & backlog criteria</p>
              </div>
            </div>
            <p className="text-sm text-aurora-text-secondary leading-relaxed">{dbEligibility}</p>
          </CardContent>
        </Card>
      )}

      <Card className="relative overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-indigo-500 before:to-blue-500">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-aurora-text">Hiring Pattern</h3>
              <p className="text-[10px] text-aurora-text-muted">Overview of hiring process</p>
            </div>
          </div>
          <p className="text-sm text-aurora-text-secondary leading-relaxed">{overview.hiringPattern}</p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-emerald-500 before:to-teal-500">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Layers className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-aurora-text">Selection Process</h3>
              <p className="text-[10px] text-aurora-text-muted">Step-by-step process</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {overview.selectionProcess.map((step, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-aurora-bg/30 border border-aurora-border">
                <div className="w-7 h-7 rounded-lg bg-aurora-primary/10 border border-aurora-primary/20 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <span className="text-xs font-black text-aurora-primary">{i + 1}</span>
                </div>
                <p className="text-xs font-medium text-aurora-text-secondary leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="relative overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-amber-500 before:to-orange-500">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-aurora-text">Preparation Tips</h3>
                <p className="text-[10px] text-aurora-text-muted">Expert recommendations</p>
              </div>
            </div>
            <ul className="space-y-3 pt-1">
              {overview.preparationTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-aurora-text-secondary leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-aurora-success shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-pink-500 before:to-rose-500">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-pink-500 dark:text-pink-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-aurora-text">Required Skills</h3>
                <p className="text-[10px] text-aurora-text-muted">Key skills to focus on</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {overview.requiredSkills.map((skill, i) => (
                <span key={i} className="px-3 py-1.5 rounded-xl bg-aurora-primary/10 border border-aurora-border text-xs font-semibold text-aurora-primary shadow-sm hover:scale-[1.02] transition-transform duration-200">
                  {skill}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

function TabAptitude({ data, dbQuestions }: { data: FullCompanyData; dbQuestions?: any[] }) {
  let categories = getCompanyAptitudeCategories(data.company.id);
  if (dbQuestions && dbQuestions.length > 0) {
    const catMap = new Map<string, { name: string; totalQuestions: number; difficulties: Set<string> }>();
    dbQuestions.forEach(q => {
      const cat = q.aptitude_topics?.name || q.category || "Quantitative Aptitude";
      if (!catMap.has(cat)) {
        catMap.set(cat, { name: cat, totalQuestions: 0, difficulties: new Set() });
      }
      const entry = catMap.get(cat)!;
      entry.totalQuestions++;
      entry.difficulties.add(q.difficulty || "Medium");
    });
    categories = Array.from(catMap.values()).map(e => ({
      name: e.name,
      totalQuestions: e.totalQuestions,
      difficulty: e.difficulties.has("Hard") ? "Hard" : e.difficulties.has("Medium") ? "Medium" : "Easy",
      completed: 0
    }));
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Brain className="w-5 h-5 text-aurora-primary" />
        <h3 className="font-bold text-base text-aurora-text">Aptitude Preparation Roadmap</h3>
      </div>

      <Card className="border border-aurora-primary/20 bg-gradient-to-r from-aurora-primary/5 to-aurora-accent/5">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-aurora-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-aurora-text">Aptitude questions are stored in the central question bank.</p>
              <p className="text-xs text-aurora-text-secondary mt-1">
                Practice aptitude questions in the Aptitude Prep Hub. Topics relevant to {data.company.name} are listed below.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card hoverEffect className="h-full">
              <CardContent className="p-6 space-y-4 flex flex-col h-full">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aurora-primary/10 to-aurora-accent/10 border border-aurora-primary/20 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-aurora-primary" />
                  </div>
                  <span className={cn("text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-aurora-border bg-aurora-surface text-aurora-text-secondary", difficultyColors[cat.difficulty])}>
                    {cat.difficulty}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-aurora-text">{cat.name}</h4>
                  <p className="text-xs text-aurora-text-secondary mt-1">
                    {cat.totalQuestions} questions available
                  </p>
                </div>
                <Link href="/dashboard/aptitude" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-between gap-2 border-aurora-border hover:border-aurora-border-strong hover:bg-aurora-card-hover text-aurora-text cursor-pointer">
                    <span>Practice in Aptitude Hub</span>
                    <ExternalLink className="w-4 h-4 text-aurora-text-secondary" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function TabCoding({ data, dbQuestions }: { data: FullCompanyData; dbQuestions?: any[] }) {
  let topics = getCompanyCodingTopics(data.company.id);
  if (dbQuestions && dbQuestions.length > 0) {
    const topicMap = new Map<string, { name: string; questionCount: number; difficulties: Set<string> }>();
    dbQuestions.forEach(q => {
      const topicName = q.coding_topics?.name || q.topic_name || "Data Structures";
      if (!topicMap.has(topicName)) {
        topicMap.set(topicName, { name: topicName, questionCount: 0, difficulties: new Set() });
      }
      const entry = topicMap.get(topicName)!;
      entry.questionCount++;
      entry.difficulties.add(q.difficulty || "Medium");
    });
    topics = Array.from(topicMap.values()).map(e => ({
      name: e.name,
      questionCount: e.questionCount,
      difficulty: e.difficulties.has("Hard") ? "Hard" : e.difficulties.has("Medium") ? "Medium" : "Easy",
      completionPercentage: 0
    }));
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Code2 className="w-5 h-5 text-aurora-primary" />
        <h3 className="font-bold text-base text-aurora-text">Coding Preparation Roadmap</h3>
      </div>

      <Card className="border border-aurora-primary/20 bg-gradient-to-r from-aurora-primary/5 to-aurora-accent/5">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-aurora-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-aurora-text">Coding problems are stored in the central problem bank.</p>
              <p className="text-xs text-aurora-text-secondary mt-1">
                Practice coding problems in the Coding Prep Platform. Topics relevant to {data.company.name} are listed below.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {topics.map((topic, i) => (
          <motion.div
            key={topic.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card hoverEffect className="h-full">
              <CardContent className="p-5 space-y-4 flex flex-col h-full">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aurora-primary/10 to-aurora-accent/10 border border-aurora-primary/20 flex items-center justify-center">
                    <Code2 className="w-5 h-5 text-aurora-primary" />
                  </div>
                  <span className={cn("text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-aurora-border bg-aurora-surface text-aurora-text-secondary", difficultyColors[topic.difficulty])}>
                    {topic.difficulty}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-aurora-text">{topic.name}</h4>
                  <p className="text-xs text-aurora-text-secondary mt-1">{topic.questionCount} problems</p>
                </div>
                <Link href="/dashboard/coding" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-between gap-2 border-aurora-border hover:border-aurora-border-strong hover:bg-aurora-card-hover text-aurora-text cursor-pointer">
                    <span>Solve in Coding Hub</span>
                    <ExternalLink className="w-4 h-4 text-aurora-text-secondary" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function TabTechnical({ data }: { data: FullCompanyData }) {
  const subjects = getCompanyTechnicalSubjects(data.company.id);
  const questions = getCompanyTechnicalQuestions(data.company.id);
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);

  const toggleQuestion = (id: number) => {
    setExpandedQuestions(prev =>
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Monitor className="w-5 h-5 text-aurora-primary" />
        <h3 className="font-bold text-base text-aurora-text">Technical Preparation</h3>
      </div>

      <Card className="border border-aurora-primary/20 bg-gradient-to-r from-aurora-primary/5 to-aurora-accent/5">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-aurora-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-aurora-text">Technical questions are stored in the central question bank.</p>
              <p className="text-xs text-aurora-text-secondary mt-1">
                Review key concepts for {data.company.name} below. Practice questions are in the Technical module.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        {subjects.map(subject => (
          <div
            key={subject}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-aurora-border bg-aurora-card/60 backdrop-blur-sm hover:border-aurora-border-strong hover:bg-aurora-card-hover transition-all duration-200"
          >
            <div className="w-8 h-8 rounded-lg bg-aurora-surface flex items-center justify-center shadow-sm text-aurora-primary border border-aurora-border">
              {subjectIcons[subject] || <BookOpen className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-sm font-bold text-aurora-text">{subject}</span>
              <p className="text-[10px] text-aurora-text-secondary">
                {questions.filter(q => q.subject === subject).length} questions
              </p>
            </div>
          </div>
        ))}
      </div>

      {subjects.length > 0 && (
        <div className="pt-4 space-y-4">
          <h4 className="font-bold text-sm text-aurora-text flex items-center gap-2">
            <ListChecks className="w-4 h-5 text-aurora-primary" />
            Practice Questions
          </h4>
          <div className="space-y-3">
            {questions.map((q) => (
              <Card key={q.id} className="overflow-hidden hover:border-aurora-border-strong transition-all duration-200">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleQuestion(q.id)}
                    className="w-full flex items-start justify-between p-5 text-left hover:bg-aurora-card-hover/40 transition-colors border-none bg-transparent cursor-pointer"
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-aurora-primary/10 text-aurora-primary border border-aurora-primary/20">
                          {q.subject}
                        </span>
                        <span className={cn("text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-aurora-border bg-aurora-surface text-aurora-text-secondary", difficultyColors[q.difficulty])}>
                          {q.difficulty}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-aurora-text">{q.question}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-aurora-primary shrink-0 mt-1">
                      <Eye className="w-3.5 h-3.5" />
                      {expandedQuestions.includes(q.id) ? "Hide Answer" : "View Answer"}
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedQuestions.includes(q.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-2 border-t border-aurora-border">
                          <div className="flex items-start gap-3 p-4 rounded-xl bg-aurora-bg/30 border border-aurora-border">
                            <Lightbulb className="w-4 h-4 text-aurora-warning shrink-0 mt-0.5" />
                            <p className="text-sm text-aurora-text-secondary leading-relaxed">{q.answer}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function TabHR({ data, dbQuestions }: { data: FullCompanyData; dbQuestions?: any[] }) {
  const [expandedHR, setExpandedHR] = useState<number[]>([]);
  const hrQuestions = dbQuestions && dbQuestions.length > 0 ? dbQuestions : getCompanyHRQuestions(data.company.id);

  const toggleHR = (id: number) => {
    setExpandedHR(prev =>
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Users className="w-5 h-5 text-aurora-primary" />
        <h3 className="font-bold text-base text-aurora-text">HR Interview Preparation</h3>
      </div>

      <Card className="border border-aurora-primary/20 bg-gradient-to-r from-aurora-primary/5 to-aurora-accent/5">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-aurora-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-aurora-text">HR questions are stored in the central question bank.</p>
              <p className="text-xs text-aurora-text-secondary mt-1">
                Common HR questions that are frequently asked in {data.company.name} interviews.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {hrQuestions.map((q, i) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="overflow-hidden hover:border-aurora-border-strong transition-all duration-200">
              <CardContent className="p-0">
                <button
                  onClick={() => toggleHR(q.id)}
                  className="w-full flex items-start justify-between p-5 text-left hover:bg-aurora-card-hover/40 transition-colors border-none bg-transparent cursor-pointer"
                >
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-aurora-accent/10 text-aurora-accent border border-aurora-accent/20">
                        {q.category}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-aurora-text">{q.question}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-aurora-primary shrink-0 mt-1">
                    <Eye className="w-3.5 h-3.5" />
                    {expandedHR.includes(q.id) ? "Hide Tip" : "View Tip"}
                  </div>
                </button>
                <AnimatePresence>
                  {expandedHR.includes(q.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-2 border-t border-aurora-border">
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-aurora-warning/5 border border-aurora-warning/20">
                          <Lightbulb className="w-5 h-5 text-aurora-warning shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-aurora-warning mb-1">Pro Tip</p>
                            <p className="text-sm text-aurora-text-secondary leading-relaxed">{q.tip}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function TabPlacement({ data, dbHiringProcess }: { data: FullCompanyData; dbHiringProcess?: HiringProcessStep[] }) {
  const rounds = dbHiringProcess && dbHiringProcess.length > 0
    ? dbHiringProcess.map(step => ({
        round: step.round,
        title: step.title,
        description: step.description,
        estimatedDifficulty: "Medium",
        duration: "N/A"
      }))
      : data.placementProcess;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Milestone className="w-5 h-5 text-aurora-primary" />
        <h3 className="font-bold text-base text-aurora-text">Placement Process Timeline</h3>
      </div>
      <div className="relative">
        <div className="absolute left-[23px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-aurora-primary via-aurora-accent to-aurora-border" />
        <div className="space-y-6">
          {rounds.map((round, i) => (
            <motion.div
              key={round.round}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative pl-14"
            >
              <div className={cn(
                "absolute left-[15px] w-4 h-4 rounded-full border-2 border-aurora-bg z-10 shadow-sm",
                i === rounds.length - 1
                  ? "bg-aurora-success ring-4 ring-aurora-success/20"
                  : "bg-aurora-primary ring-4 ring-aurora-primary/20"
              )} />
              <Card className="hover:border-aurora-border-strong transition-all duration-200">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-aurora-text-muted uppercase tracking-wider">Round {round.round}</span>
                        {i === rounds.length - 1 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-aurora-success/10 text-aurora-success border border-aurora-success/20">
                            Final Round
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-aurora-text mt-1">{round.title}</h4>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border border-aurora-border bg-aurora-surface text-aurora-text-secondary", difficultyColors[round.estimatedDifficulty] || "bg-aurora-primary/10 text-aurora-primary")}>
                        {round.estimatedDifficulty}
                      </span>
                      {round.duration !== "N/A" && (
                        <span className="text-[10px] font-semibold text-aurora-text-secondary flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {round.duration}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-aurora-text-secondary leading-relaxed">{round.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function TabAnalytics({ data, readinessScore }: { data: FullCompanyData; readinessScore?: number }) {
  const { analytics } = data;
  const [chartMounted] = useState(true);

  const overallReadiness = readinessScore ?? analytics.preparationProgress;
  const radarData = [
    { subject: "Aptitude", value: analytics.aptitudeReadiness, fullMark: 100 },
    { subject: "Coding", value: analytics.codingReadiness, fullMark: 100 },
    { subject: "Technical", value: analytics.technicalReadiness, fullMark: 100 },
    { subject: "HR", value: analytics.hrReadiness, fullMark: 100 },
  ];

  const barData = [
    { name: "Aptitude", value: analytics.aptitudeReadiness, fill: "#6D5DF6" },
    { name: "Coding", value: analytics.codingReadiness, fill: "#00D4FF" },
    { name: "Technical", value: analytics.technicalReadiness, fill: "#F59E0B" },
    { name: "HR", value: analytics.hrReadiness, fill: "#DB2777" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <Card className="bg-gradient-to-br from-aurora-primary to-aurora-primary/80 text-white border-none shadow-xl relative overflow-hidden aurora-noise">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        <CardContent className="p-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="text-center shrink-0">
              <div className="text-6xl font-black tracking-tight drop-shadow-md">{overallReadiness}%</div>
              <p className="text-xs font-semibold text-white/85 mt-2 uppercase tracking-wider">Overall Readiness</p>
            </div>
            <div className="flex-1 w-full space-y-4">
              {barData.map(item => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-white/90">{item.name}</span>
                    <span className="text-white font-bold">{item.value}%</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-white transition-all duration-1000 ease-out" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:border-aurora-border-strong transition-all duration-200">
          <CardHeader className="border-b border-aurora-border pb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-aurora-text">
              <Target className="w-4 h-5 text-aurora-primary" />
              Readiness Radar
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {chartMounted && (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--aurora-border)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "var(--aurora-text-secondary)" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--aurora-text-secondary)" }} />
                  <Radar name="Readiness" dataKey="value" stroke="#6D5DF6" fill="#6D5DF6" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="hover:border-aurora-border-strong transition-all duration-200">
          <CardHeader className="border-b border-aurora-border pb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-aurora-text">
              <BarChart3 className="w-4 h-5 text-aurora-primary" />
              Topic-wise Readiness
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {chartMounted && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--aurora-border)" />
                  <XAxis dataKey="name" stroke="var(--aurora-text-muted)" fontSize={10} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="var(--aurora-text-muted)" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "var(--aurora-surface)", border: "1px solid var(--aurora-border-strong)", borderRadius: "12px", fontSize: "11px", color: "var(--aurora-text)" }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 hover:border-aurora-border-strong transition-all duration-200">
          <CardHeader className="border-b border-aurora-border pb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-aurora-text">
              <TrendingUp className="w-4 h-5 text-aurora-primary" />
              Preparation Progress Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {chartMounted && (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={[
                  { month: "Jan", score: Math.max(0, overallReadiness - 25) },
                  { month: "Feb", score: Math.max(0, overallReadiness - 20) },
                  { month: "Mar", score: Math.max(0, overallReadiness - 15) },
                  { month: "Apr", score: Math.max(0, overallReadiness - 8) },
                  { month: "May", score: overallReadiness - 3 },
                  { month: "Jun", score: overallReadiness },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--aurora-border)" />
                  <XAxis dataKey="month" stroke="var(--aurora-text-muted)" fontSize={10} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="var(--aurora-text-muted)" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ background: "var(--aurora-surface)", border: "1px solid var(--aurora-border-strong)", borderRadius: "12px", fontSize: "11px", color: "var(--aurora-text)" }} />
                  <Line type="monotone" dataKey="score" stroke="#6D5DF6" strokeWidth={3} dot={{ r: 4, fill: "#6D5DF6" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

export default function CompanyDetailPage({
  params,
}: {
  params: Promise<{ company: string }>
}) {
  const { company: slug } = use(params);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isSaved, setIsSaved] = useState(false);
  const [dbCompany, setDbCompany] = useState<FrontendCompany | null>(null);
  const [readinessScore, setReadinessScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<{
    aptitude: any[];
    coding: any[];
    hr: any[];
  }>({ aptitude: [], coding: [], hr: [] });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const { company } = await companyService.getCompany(slug);
        setDbCompany(company);

        if (user?.id) {
          const score = await companyService.getReadiness(user.id, company.id);
          setReadinessScore(score);
        }

        // Fetch company questions
        const qData = await companyService.getCompanyQuestions(company.id, company.name);
        setQuestions(qData);

        // Fetch bookmark state
        const saved = localStorage.getItem("examnova_company_bookmarks");
        if (saved) {
          try {
            const list = JSON.parse(saved);
            setIsSaved(list.includes(company.slug));
          } catch (e) {
            setIsSaved(false);
          }
        }
      } catch (err) {
        console.error("Failed to load company:", err);
        setDbCompany(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, user?.id]);

  const toggleSave = () => {
    if (!dbCompany) return;
    const saved = localStorage.getItem("examnova_company_bookmarks");
    let list: string[] = [];
    if (saved) {
      try {
        list = JSON.parse(saved);
      } catch (e) {
        list = [];
      }
    }
    if (isSaved) {
      list = list.filter(s => s !== dbCompany.slug);
    } else {
      if (!list.includes(dbCompany.slug)) {
        list.push(dbCompany.slug);
      }
      if (user?.id) {
        dashboardService.logActivity(user.id, `Bookmarked ${dbCompany.name} for later preparation`, "company-hub");
      }
    }
    localStorage.setItem("examnova_company_bookmarks", JSON.stringify(list));
    setIsSaved(!isSaved);
  };

  // Fall back to static data for rich display info
  const staticData = dbCompany ? getCompanyById(dbCompany.slug) || getCompanyById(dbCompany.name.toLowerCase()) : null;
  const companyId = dbCompany?.slug || slug;
  const baseData = staticData || getCompanyById(companyId);

  // Merge dbCompany prep_materials details dynamically
  const data = baseData ? {
    ...baseData,
    company: {
      ...baseData.company,
      name: dbCompany?.name || baseData.company.name,
      difficulty: (dbCompany?.difficulty || baseData.company.difficulty) as "Medium" | "Hard" | "Easy" | "Expert",
    },
    overview: {
      ...baseData.overview,
      preparationTips: dbCompany?.preparation_tips && dbCompany.preparation_tips.length > 0
        ? dbCompany.preparation_tips
        : baseData.overview.preparationTips,
      requiredSkills: dbCompany?.required_skills && dbCompany.required_skills.length > 0
        ? dbCompany.required_skills
        : baseData.overview.requiredSkills,
    },
    recommendations: dbCompany?.recommendations && dbCompany.recommendations.length > 0
      ? dbCompany.recommendations
      : baseData.recommendations,
  } as FullCompanyData : null;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm text-zinc-500 font-medium">Loading company details...</p>
        </div>
      </div>
    );
  }

  if (!data || !dbCompany) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <Building2 className="w-16 h-16 text-zinc-300 dark:text-zinc-700 mx-auto" />
        <h2 className="text-2xl font-bold text-zinc-700 dark:text-zinc-300">Company not found</h2>
        <p className="text-sm text-zinc-500">The company you are looking for doesn&apos;t exist.</p>
        <Link href="/dashboard/company-hub">
          <Button variant="outline" className="cursor-pointer">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Company Hub
          </Button>
        </Link>
      </div>
    );
  }

  const { company } = data;

  const tabComponents: Record<string, React.ReactNode> = {
    overview: <TabOverview data={data} dbDescription={dbCompany.description} dbEligibility={dbCompany.eligibility} />,
    aptitude: <TabAptitude data={data} dbQuestions={questions.aptitude} />,
    coding: <TabCoding data={data} dbQuestions={questions.coding} />,
    technical: <TabTechnical data={data} />,
    hr: <TabHR data={data} dbQuestions={questions.hr} />,
    placement: <TabPlacement data={data} dbHiringProcess={dbCompany.hiring_process} />,
    analytics: <TabAnalytics data={data} readinessScore={readinessScore} />,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-16">
      <Link
        href="/dashboard/company-hub"
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-aurora-border bg-aurora-card/40 backdrop-blur-sm text-xs font-semibold text-aurora-text-secondary hover:text-aurora-text hover:border-aurora-border-strong hover:bg-aurora-card-hover transition-all duration-200 shadow-sm"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Company Hub
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center gap-6"
      >
        <div className={cn("w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-md border border-aurora-border shrink-0", company.logoBg)}>
          <span className={cn("text-2xl font-extrabold bg-gradient-to-r bg-clip-text text-transparent", company.logoColor)}>
            {company.name.slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-extrabold text-aurora-text">{company.name}</h1>
            <span className={cn("text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-aurora-border bg-aurora-surface text-aurora-text-secondary", difficultyColors[company.difficulty])}>
              {company.difficulty}
            </span>
          </div>
          <p className="text-sm text-aurora-text-secondary mt-1">{company.type}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={isSaved ? "primary" : "outline"}
            size="sm"
            onClick={toggleSave}
            className={cn(
              "gap-2 cursor-pointer rounded-xl font-semibold transition-all duration-205",
              isSaved
                ? "bg-aurora-primary hover:bg-aurora-primary-hover text-white border-none shadow-sm"
                : "border-aurora-border hover:bg-aurora-card-hover hover:border-aurora-border-strong text-aurora-text"
            )}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            {isSaved ? "Saved" : "Save for Later"}
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-aurora-primary/5 via-aurora-accent/5 to-transparent border border-aurora-border shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-aurora-primary animate-pulse" />
              <h3 className="font-bold text-sm text-aurora-text">AI Recommendations for {company.name}</h3>
            </div>
            <p className="text-xs text-aurora-text-secondary">To improve {company.name} readiness:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {data.recommendations.map((rec, i) => (
                <div key={i} className="p-4 rounded-2xl bg-aurora-card border border-aurora-border hover:border-aurora-border-strong transition-all duration-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                      rec.priority === "High" ? "bg-aurora-danger/10 border-aurora-danger/20 text-aurora-danger" :
                      rec.priority === "Medium" ? "bg-aurora-warning/10 border-aurora-warning/20 text-aurora-warning" :
                      "bg-aurora-primary/10 border-aurora-primary/20 text-aurora-primary"
                    )}>
                      {rec.priority}
                    </span>
                    <Target className="w-3.5 h-3.5 text-aurora-text-muted" />
                  </div>
                  <h4 className="font-bold text-xs text-aurora-text">{rec.title}</h4>
                  <p className="text-[10px] text-aurora-text-secondary leading-relaxed">{rec.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="space-y-6">
        <div className="flex overflow-x-auto gap-1.5 p-1.5 rounded-2xl bg-aurora-card border border-aurora-border scrollbar-none relative">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap border-none cursor-pointer z-10",
                  isActive
                    ? "text-aurora-primary"
                    : "text-aurora-text-secondary hover:text-aurora-text"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-aurora-primary/10 border border-aurora-primary/20 rounded-xl z-[-1]"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {tabComponents[activeTab] || <SkeletonTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
