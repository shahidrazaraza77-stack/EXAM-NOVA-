"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGamification } from "@/context/GamificationContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, LayoutDashboard, Video, History, BarChart3,
  FileText, Settings, ChevronRight, MessageSquare, Brain, Zap
} from "lucide-react";
import {
  InterviewQuestionItem, InterviewSessionItem, Recommendation, interviewModes,
  type InterviewMode
} from "./components/mockData";
import OverviewView from "./components/OverviewView";
import StartInterviewView from "./components/StartInterviewView";
import LiveInterview from "./components/LiveInterview";
import FeedbackReportView from "./components/FeedbackReportView";
import HistoryView from "./components/HistoryView";
import AnalyticsView from "./components/AnalyticsView";
import SettingsView from "./components/SettingsView";
import { interviewService } from "@/services/interview.service";
import { analyticsService } from "@/services/analytics.service";

type ViewState = "overview" | "start" | "live" | "report" | "history" | "analytics" | "feedback" | "settings";

export default function InterviewCoachPage() {
  const { user } = useAuth();
  const { awardXP, trackActivity, updateChallengeProgress, updateMissionProgress } = useGamification();
  const [view, setView] = useState<ViewState>("overview");
  const [history, setHistory] = useState<InterviewSessionItem[]>([]);

  const [interviewConfig, setInterviewConfig] = useState<{
    type: "HR" | "Technical" | "Mixed" | "Company" | "Resume";
    role: string;
    difficulty: string;
    company: string | null;
    resumeId: string | null;
    mode: InterviewMode;
  }>({
    type: "HR",
    role: "Software Engineer",
    difficulty: "Medium",
    company: null,
    resumeId: null,
    mode: interviewModes[0],
  });

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeQuestions, setActiveQuestions] = useState<InterviewQuestionItem[]>([]);
  const [sessionReport, setSessionReport] = useState<{
    score: number; duration: string; feedbackCount: number;
    breakdown: { communication: number; technical: number; confidence: number; clarity: number; problemSolving: number };
    weakAreas?: string[];
    improvementRoadmap?: string[];
  } | null>(null);

  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    { id: "rec-1", title: "Practice Self Introduction", description: "Re-record 'Tell me about yourself' aiming for under 2 minutes with 3 key highlights.", category: "communication" },
    { id: "rec-2", title: "Solve 10 DBMS Questions", description: "Focus on Normalization and SQL joins.", category: "dsa" },
    { id: "rec-3", title: "Vocal Confidence & Pacing", description: "Steady your pace when tackling technical concepts.", category: "communication" },
    { id: "rec-4", title: "STAR Method Structuring", description: "Review behavioral answers to ensure clear Situation, Task, Action, Result.", category: "hr" },
  ]);

  const loadHistory = useCallback(async () => {
    if (!user?.id) return;
    const uid = user.id;
    try {
      const sessions = await interviewService.getSessions(uid);
      const items: InterviewSessionItem[] = sessions.map((s) => ({
        id: s.id,
        date: s.created_at ? new Date(s.created_at).toISOString().split("T")[0] : "",
        type: s.mode.toUpperCase(),
        role: s.role || "Software Engineer",
        level: s.difficulty ? s.difficulty.charAt(0).toUpperCase() + s.difficulty.slice(1) : "Medium",
        score: s.score,
        duration: s.duration ? `${Math.floor(s.duration / 60)}:${(s.duration % 60).toString().padStart(2, "0")}` : "N/A",
        feedbackCount: s.score ? 1 : 0,
        breakdown: {
          communication: s.communication_score || 0,
          technical: s.technical_score || 0,
          confidence: s.confidence_score || 0,
          clarity: s.communication_score || 0,
        },
      }));
      setHistory(items);
    } catch (e) {
      console.error("Failed to load interview history", e);
    }
  }, [user?.id]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const handleStartInterview = async (config: {
    type: "HR" | "Technical" | "Mixed" | "Company" | "Resume";
    role: string;
    difficulty: string;
    company: string | null;
    resumeId: string | null;
    mode: InterviewMode;
  }) => {
    setInterviewConfig(config);

    if (!user?.id) return;

    try {
      const session = await interviewService.startSession(
        user.id,
        config.type.toLowerCase(),
        config.role,
        config.difficulty.toLowerCase(),
        config.company,
        config.resumeId
      );
      setSessionId(session.id);

      const firstQuestion = await interviewService.generateQuestion(session.id, config.type.toLowerCase(), config.role, config.difficulty, []);
      setActiveQuestions([{ id: firstQuestion.id, text: firstQuestion.question, type: (firstQuestion.mode === "technical" ? "Technical" : "HR") as "HR" | "Technical" }]);
      setView("live");
    } catch {
      setView("overview");
    }
  };

  const handleAddQuestion = async (previousQAs: { question: string; answer: string }[]): Promise<InterviewQuestionItem | null> => {
    if (!sessionId || !user?.id) return null;
    try {
      const prevTexts = activeQuestions.map(q => q.text);
      const question = await interviewService.generateQuestion(sessionId, interviewConfig.type, interviewConfig.role, interviewConfig.difficulty, prevTexts);
      return { id: question.id, text: question.question, type: (question.mode === "technical" ? "Technical" : "HR") as "HR" | "Technical" };
    } catch {
      return null;
    }
  };

  const handleComplete = (reportData: {
    score: number; duration: string; feedbackCount: number;
    breakdown: { communication: number; technical: number; confidence: number; clarity: number; problemSolving: number };
    weakAreas?: string[];
    improvementRoadmap?: string[];
  }) => {
    trackActivity("interview");
    updateChallengeProgress("interview");
    updateMissionProgress("interviews");
    const xpGained = Math.max(10, Math.round(reportData.score * 0.8));
    awardXP(xpGained, `Completed ${interviewConfig.type} Interview`);
    if (reportData.score >= 80) awardXP(25, "High Score Bonus");

    if (reportData.improvementRoadmap && reportData.improvementRoadmap.length > 0) {
      const mappedRecs = reportData.improvementRoadmap.map((road, idx) => ({
        id: `rec-${idx}-${Date.now()}`,
        title: road.split(":")[0]?.trim() || `Recommendation ${idx + 1}`,
        description: road.split(":")[1]?.trim() || road,
        category: "practice" as const,
      }));
      setRecommendations(mappedRecs);
    }
    setSessionReport(reportData);
    setView("report");
  };

  const handleSaveReport = async () => {
    const uid = user?.id;
    if (uid) {
      try {
        await analyticsService.calculateReadiness(uid);
      } catch (err) {
        console.error("Failed to recalculate readiness score:", err);
      }
    }
    loadHistory();
    setSessionReport(null);
    setSessionId(null);
    setActiveQuestions([]);
    setView("overview");
  };

  const handleRetake = () => {
    setSessionReport(null);
    setSessionId(null);
    setActiveQuestions([]);
    handleStartInterview(interviewConfig);
  };

  const tabs = [
    { id: "overview" as ViewState, label: "Overview", icon: LayoutDashboard },
    { id: "start" as ViewState, label: "Start Interview", icon: Video },
    { id: "history" as ViewState, label: "History", icon: History },
    { id: "analytics" as ViewState, label: "Analytics", icon: BarChart3 },
    { id: "settings" as ViewState, label: "Settings", icon: Settings },
  ];

  const isLiveView = view === "live" || view === "report";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16 min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">AI Interview Coach</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Practice real interview scenarios and receive personalized AI-powered feedback.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {!isLiveView && (
          <nav className="lg:w-48 shrink-0">
            <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = view === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setView(tab.id)}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap border-none cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20"
                        : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="hidden lg:inline">{tab.label}</span>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto hidden lg:block" />}
                  </button>
                );
              })}
            </div>
          </nav>
        )}

        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {view === "overview" && <OverviewView onNavigate={(tab) => setView(tab as ViewState)} />}
              {view === "start" && (
                <StartInterviewView onStart={handleStartInterview} onCancel={() => setView("overview")} />
              )}
              {view === "live" && (
                <LiveInterview
                  role={interviewConfig.role}
                  difficulty={interviewConfig.difficulty}
                  interviewType={interviewConfig.type}
                  questions={activeQuestions}
                  sessionId={sessionId || ""}
                  questionCount={interviewConfig.mode.questionCount}
                  company={interviewConfig.company}
                  onAddQuestion={handleAddQuestion}
                  onComplete={handleComplete}
                  onCancel={() => { setSessionId(null); setActiveQuestions([]); setView("overview"); }}
                />
              )}
              {view === "report" && sessionReport && (
                <FeedbackReportView
                  overallScore={sessionReport.score}
                  breakdown={sessionReport.breakdown}
                  duration={sessionReport.duration}
                  role={interviewConfig.role}
                  difficulty={interviewConfig.difficulty}
                  interviewType={interviewConfig.type}
                  recommendations={recommendations}
                  weakAreas={sessionReport.weakAreas}
                  improvementRoadmap={sessionReport.improvementRoadmap}
                  onFinish={handleSaveReport}
                  onRestart={handleRetake}
                />
              )}
              {view === "history" && <HistoryView />}
              {view === "analytics" && <AnalyticsView />}
              {view === "settings" && <SettingsView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
