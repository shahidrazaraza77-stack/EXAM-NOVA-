"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InterviewQuestion, evaluateAnswer, RealTimeFeedback, getQuestionsForMode } from "./InterviewData";
import { useGamification } from "@/context/GamificationContext";
import {
  Mic, Square, Play, SkipForward, CheckCircle, X, AlertTriangle,
  Sparkles, ArrowLeft, Volume2, Loader2, MessageSquare, BarChart3,
  Lightbulb, ChevronRight,
} from "lucide-react";

interface SpeakInterviewProps {
  mode: "hr" | "technical" | "mixed";
  difficulty: string;
  onComplete: (results: InterviewResult) => void;
  onCancel: () => void;
}

export interface InterviewResult {
  overallScore: number;
  hrScore: number;
  technicalScore: number;
  communicationScore: number;
  questionResults: {
    question: string;
    type: string;
    score: number;
    feedback: RealTimeFeedback;
  }[];
  strengths: string[];
  improvements: string[];
  improvementPlan: string[];
  totalQuestions: number;
  duration: string;
}

export default function SpeakInterview({ mode, difficulty, onComplete, onCancel }: SpeakInterviewProps) {
  const { awardXP, trackActivity } = useGamification();
  const [questions] = useState<InterviewQuestion[]>(() => getQuestionsForMode(mode, difficulty));
  const [currentQ, setCurrentQ] = useState(0);
  const [phase, setPhase] = useState<"ready" | "recording" | "evaluating" | "feedback">("ready");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<RealTimeFeedback | null>(null);
  const [results, setResults] = useState<InterviewResult["questionResults"]>([]);
  const [timer, setTimer] = useState(0);
  const [showWaveform, setShowWaveform] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef<HTMLTextAreaElement>(null);
  const startTime = useRef(Date.now());

  // Waveform bars
  const waveformBars = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    height: Math.random() * 40 + 10,
    delay: Math.random() * 0.5,
  }));

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startRecording = () => {
    setPhase("recording");
    setShowWaveform(true);
    setAnswer("");
    setTimer(0);
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
  };

  const stopRecording = () => {
    setPhase("evaluating");
    setShowWaveform(false);
    if (timerRef.current) clearInterval(timerRef.current);
    // Simulate evaluation delay
    setTimeout(() => {
      const simulatedAnswer = answer || generateSimulatedAnswer(questions[currentQ]);
      const fb = evaluateAnswer(questions[currentQ], simulatedAnswer);
      setFeedback(fb);
      setResults((prev) => [...prev, { question: questions[currentQ].question, type: questions[currentQ].type, score: fb.score, feedback: fb }]);
      setPhase("feedback");
    }, 800);
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1);
      setPhase("ready");
      setFeedback(null);
      setAnswer("");
      setTimer(0);
    } else {
      finishInterview();
    }
  };

  const finishInterview = () => {
    const qResults = results;
    const allScores = qResults.map((r) => r.score);
    const hrScores = qResults.filter((r) => r.type === "hr").map((r) => r.score);
    const techScores = qResults.filter((r) => r.type === "technical").map((r) => r.score);
    const overallScore = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
    const hrScore = hrScores.length > 0 ? Math.round(hrScores.reduce((a, b) => a + b, 0) / hrScores.length) : 0;
    const techScore = techScores.length > 0 ? Math.round(techScores.reduce((a, b) => a + b, 0) / techScores.length) : 0;
    const commScore = Math.round((overallScore + Math.random() * 10) / 2);

    const allStrengths = qResults.flatMap((r) => r.feedback.strengths);
    const allImprovements = qResults.flatMap((r) => r.feedback.improvements);

    const durationSec = Math.floor((Date.now() - startTime.current) / 1000);
    const duration = `${Math.floor(durationSec / 60)}m ${durationSec % 60}s`;

    // Award gamification XP
    awardXP(overallScore >= 70 ? 50 : 25, `Completed ${mode} interview`);
    trackActivity("interview");

    const result: InterviewResult = {
      overallScore,
      hrScore,
      technicalScore: techScore,
      communicationScore: commScore,
      questionResults: qResults,
      strengths: [...new Set(allStrengths)].slice(0, 5),
      improvements: [...new Set(allImprovements)].slice(0, 5),
      improvementPlan: generateImprovementPlan(allImprovements, mode),
      totalQuestions: qResults.length,
      duration,
    };
    onComplete(result);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const progress = ((currentQ + (phase === "feedback" ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onCancel} className="flex items-center gap-1.5 text-xs font-semibold text-aurora-text-muted hover:text-aurora-text cursor-pointer transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Exit
        </button>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-[10px] font-bold uppercase">
            {mode === "hr" ? "HR Interview" : mode === "technical" ? "Technical Interview" : "Mixed Interview"}
          </span>
          <span className="text-xs font-bold text-zinc-500">{currentQ + 1}/{questions.length}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full" />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div key={currentQ + phase} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8">
          {/* Question Number */}
          <div className="flex items-center gap-2 mb-4">
            <div className="h-7 w-7 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-700 dark:text-violet-300 text-xs font-bold">
              Q{currentQ + 1}
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${questions[currentQ].type === "hr" ? "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300" : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"}`}>
              {questions[currentQ].type === "hr" ? "HR" : "Technical"}
            </span>
            <span className="text-[10px] text-zinc-400 capitalize">{questions[currentQ].topic}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">{questions[currentQ].question}</h2>

          {/* Phase: Ready */}
          {phase === "ready" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-900/30">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-violet-700 dark:text-violet-300 mb-1">Tips for this question</p>
                    <ul className="space-y-1">
                      {questions[currentQ].idealAnswerPoints.map((p, i) => (
                        <li key={i} className="text-[11px] text-violet-600 dark:text-violet-400 flex items-start gap-1.5"><CheckCircle className="h-3 w-3 mt-0.5 shrink-0" /> {p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <button onClick={startRecording} className="flex items-center gap-2 px-6 py-3 aurora-gradient-primary text-white font-bold rounded-xl hover:shadow-lg transition-all cursor-pointer">
                <Mic className="h-4 w-4" /> Start Recording Answer
              </button>
            </div>
          )}

          {/* Phase: Recording */}
          {phase === "recording" && (
            <div className="space-y-4">
              {/* Waveform */}
              {showWaveform && (
                <div className="h-16 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center gap-[3px] px-4 overflow-hidden">
                  {waveformBars.slice(0, 30).map((bar) => (
                    <div
                      key={bar.id}
                      className="w-1.5 bg-violet-500 rounded-full animate-waveform"
                      style={{
                        height: `${bar.height}px`,
                        animationDelay: `${bar.delay}s`,
                        animationDuration: `${0.8 + bar.delay}s`
                      }}
                    />
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Recording... {formatTime(timer)}</span>
              </div>
              <textarea ref={transcriptRef} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Your answer will appear here... (or type your answer)"
                className="w-full h-32 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none" />
              <button onClick={stopRecording} className="flex items-center gap-2 px-6 py-3 bg-aurora-danger text-white font-bold rounded-xl hover:bg-aurora-danger-hover transition-all cursor-pointer">
                <Square className="h-4 w-4" /> Stop Recording
              </button>
            </div>
          )}

          {/* Phase: Evaluating */}
          {phase === "evaluating" && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500 mx-auto" />
                <p className="text-sm font-semibold text-zinc-500">AI is evaluating your response...</p>
              </div>
            </div>
          )}

          {/* Phase: Feedback */}
          {phase === "feedback" && feedback && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-16 w-16 rounded-full flex items-center justify-center text-xl font-black ${feedback.score >= 80 ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : feedback.score >= 60 ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"}`}>
                  {feedback.score}
                </div>
                <div>
                  <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{feedback.message}</p>
                  <p className="text-xs text-zinc-500">Score: {feedback.score}/100</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30">
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-2">Strengths</p>
                  <ul className="space-y-1">
                    {feedback.strengths.map((s, i) => (<li key={i} className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-start gap-1.5"><CheckCircle className="h-3 w-3 mt-0.5 shrink-0" />{s}</li>))}
                  </ul>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30">
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-2">Improvements</p>
                  <ul className="space-y-1">
                    {feedback.improvements.map((im, i) => (<li key={i} className="text-[11px] text-amber-600 dark:text-amber-400 flex items-start gap-1.5"><AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />{im}</li>))}
                  </ul>
                </div>
              </div>
              <button onClick={nextQuestion} className="flex items-center gap-2 px-6 py-3 aurora-gradient-primary text-white font-bold rounded-xl hover:shadow-lg transition-all cursor-pointer">
                {currentQ < questions.length - 1 ? <>Next Question <ChevronRight className="h-4 w-4" /></> : "View Results"}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function generateSimulatedAnswer(question: InterviewQuestion): string {
  const templates = [
    `Based on my experience, ${question.idealAnswerPoints[0]?.toLowerCase() || "I have worked on similar concepts"}. I believe ${question.idealAnswerPoints[1]?.toLowerCase() || "this is an important area"}. In my previous work, I demonstrated ${question.expectedKeywords.slice(0, 2).join(" and ") || "relevant skills"}.`,
    `I would approach this by focusing on ${question.expectedKeywords[0] || "the key aspects"}. For example, ${question.idealAnswerPoints[0]?.toLowerCase() || "I have practical experience"}. This connects to ${question.expectedKeywords[1] || "broader concepts"} which is crucial in this context.`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateImprovementPlan(improvements: string[], mode: string): string[] {
  const plan = [
    "Practice structuring answers using the STAR method (Situation, Task, Action, Result)",
    "Record yourself daily and review filler word usage",
    "Focus on providing specific examples rather than generic statements",
    "Study common technical concepts and practice explaining them simply",
    "Take deep breaths before answering to maintain composure",
  ];
  if (mode === "technical") plan.push("Review core CS fundamentals and practice whiteboard explanations");
  if (mode === "hr") plan.push("Prepare 5-7 strong behavioral stories that demonstrate key competencies");
  return plan.slice(0, 5);
}
