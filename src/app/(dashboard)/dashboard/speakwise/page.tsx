"use client";

import React, { useState, useEffect } from "react";
import { 
  SPEAKWISE_MODES, 
  INITIAL_SPEAK_HISTORY, 
  SPEAKWISE_ACHIEVEMENTS, 
  SpeakSessionLog, 
  AchievementBadge, 
  SpeechTopic 
} from "./components/mockData";
import SpeakHome from "./components/SpeakHome";
import SpeakSession from "./components/SpeakSession";
import SpeakReport from "./components/SpeakReport";
import SpeakInterview from "./components/SpeakInterview";
import InterviewReport from "./components/InterviewReport";
import InterviewSettings from "./components/InterviewSettings";
import { InterviewResult } from "./components/SpeakInterview";
import { AnimatePresence, motion } from "framer-motion";

type ViewState = "home" | "session" | "report" | "interview-setup" | "interview" | "interview-report";

export default function SpeakWisePage() {
  const [view, setView] = useState<ViewState>("home");
  const [history, setHistory] = useState<SpeakSessionLog[]>([]);
  const [achievements, setAchievements] = useState<AchievementBadge[]>([]);
  
  // Speech practice state
  const [selectedModeTitle, setSelectedModeTitle] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<SpeechTopic | null>(null);

  // Interview state
  const [interviewMode, setInterviewMode] = useState<"hr" | "technical" | "mixed">("mixed");
  const [interviewDifficulty, setInterviewDifficulty] = useState("medium");
  const [interviewResult, setInterviewResult] = useState<InterviewResult | null>(null);

  // Consolidated Report (speech)
  const [sessionReport, setSessionReport] = useState<{
    overallScore: number;
    breakdown: {
      confidence: number;
      eyeContact: number;
      fluency: number;
      speed: number;
      fillerWords: number;
    };
    fillerWordsBreakdown: {
      um: number;
      uh: number;
      like: number;
      basically: number;
      actually: number;
    };
    eyeContactMetrics: {
      eyeContactPct: number;
      lookingAwayPct: number;
      attentionTrend: number[];
    };
    feedback: {
      strengths: string[];
      improvements: string[];
    };
  } | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedLogs = localStorage.getItem("examnova_speakwise_history");
    if (savedLogs) {
      try {
        setHistory(JSON.parse(savedLogs));
      } catch (e) {
        console.error("Error parsing history from local storage", e);
        setHistory(INITIAL_SPEAK_HISTORY);
      }
    } else {
      setHistory(INITIAL_SPEAK_HISTORY);
      localStorage.setItem("examnova_speakwise_history", JSON.stringify(INITIAL_SPEAK_HISTORY));
    }

    setAchievements(SPEAKWISE_ACHIEVEMENTS);
  }, []);

  // Speech practice handlers
  const handleStartSession = (modeTitle: string, topic: SpeechTopic) => {
    setSelectedModeTitle(modeTitle);
    setSelectedTopic(topic);
    setView("session");
  };

  const handleCompleteSession = (reportData: typeof sessionReport) => {
    setSessionReport(reportData);
    setView("report");
  };

  const handleSaveReport = () => {
    if (!sessionReport || !selectedTopic) return;
    const newLog: SpeakSessionLog = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      type: selectedModeTitle,
      topic: selectedTopic.title,
      score: sessionReport.overallScore,
      duration: "1m 20s"
    };
    const updatedHistory = [newLog, ...history];
    setHistory(updatedHistory);
    localStorage.setItem("examnova_speakwise_history", JSON.stringify(updatedHistory));
    const updatedAchievements = achievements.map((badge) => {
      if (badge.id === "badge-4" && sessionReport.breakdown.confidence >= 90) return { ...badge, earned: true };
      if (badge.id === "badge-5") {
        const typesPractised = new Set(updatedHistory.map((h) => h.type));
        if (typesPractised.size >= 5) return { ...badge, earned: true };
      }
      return badge;
    });
    setAchievements(updatedAchievements);
    setSessionReport(null);
    setSelectedTopic(null);
    setView("home");
  };

  const handleRestartSession = () => {
    if (!selectedTopic) return;
    setSessionReport(null);
    setView("session");
  };

  // Interview handlers
  const handleStartInterview = () => setView("interview");
  const handleCompleteInterview = (result: InterviewResult) => {
    setInterviewResult(result);
    setView("interview-report");
  };
  const handleSaveInterview = () => {
    if (!interviewResult) return;
    const newLog: SpeakSessionLog = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      type: `${interviewMode === "hr" ? "HR" : interviewMode === "technical" ? "Technical" : "Mixed"} Interview`,
      topic: `Interview (${interviewResult.totalQuestions} questions)`,
      score: interviewResult.overallScore,
      duration: interviewResult.duration,
    };
    const updatedHistory = [newLog, ...history];
    setHistory(updatedHistory);
    localStorage.setItem("examnova_speakwise_history", JSON.stringify(updatedHistory));
    setInterviewResult(null);
    setView("home");
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950/20 text-zinc-900 dark:text-zinc-100">
      <AnimatePresence mode="wait">
        {view === "home" && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SpeakHome
              modes={SPEAKWISE_MODES}
              history={history}
              achievements={achievements}
              onStartSession={handleStartSession}
              onStartInterview={() => setView("interview-setup")}
            />
          </motion.div>
        )}

        {view === "session" && selectedTopic && (
          <motion.div key="session" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SpeakSession
              modeTitle={selectedModeTitle}
              topic={selectedTopic}
              onComplete={handleCompleteSession}
              onCancel={() => setView("home")}
            />
          </motion.div>
        )}

        {view === "report" && sessionReport && selectedTopic && (
          <motion.div key="report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SpeakReport
              topicTitle={selectedTopic.title}
              report={sessionReport}
              onSave={handleSaveReport}
              onRestart={handleRestartSession}
            />
          </motion.div>
        )}

        {view === "interview-setup" && (
          <motion.div key="interview-setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <InterviewSettings
              mode={interviewMode}
              difficulty={interviewDifficulty}
              onModeChange={setInterviewMode}
              onDifficultyChange={setInterviewDifficulty}
              onStart={handleStartInterview}
            />
          </motion.div>
        )}

        {view === "interview" && (
          <motion.div key="interview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SpeakInterview
              mode={interviewMode}
              difficulty={interviewDifficulty}
              onComplete={handleCompleteInterview}
              onCancel={() => setView("home")}
            />
          </motion.div>
        )}

        {view === "interview-report" && interviewResult && (
          <motion.div key="interview-report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <InterviewReport
              result={interviewResult}
              mode={interviewMode}
              onSave={handleSaveInterview}
              onRestart={handleStartInterview}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
