"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { InterviewResult } from "./SpeakInterview";
import { Confetti } from "@/components/gamification/Confetti";
import { CheckCircle, AlertTriangle, ArrowRight, Sparkles, Target, BookOpen, TrendingUp, Star } from "lucide-react";

interface InterviewReportProps {
  result: InterviewResult;
  mode: string;
  onSave: () => void;
  onRestart: () => void;
}

export default function InterviewReport({ result, mode, onSave, onRestart }: InterviewReportProps) {
  const [showConfetti, setShowConfetti] = useState(true);

  const scoreColor = result.overallScore >= 80 ? "text-emerald-500" : result.overallScore >= 60 ? "text-amber-500" : "text-red-500";
  const scoreBg = result.overallScore >= 80 ? "bg-emerald-100 dark:bg-emerald-900/30" : result.overallScore >= 60 ? "bg-amber-100 dark:bg-amber-900/30" : "bg-red-100 dark:bg-red-900/30";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 pb-20">
      <Confetti active={showConfetti} duration={4000} />

      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
          <Sparkles className="h-8 w-8 mx-auto text-violet-500" />
        </motion.div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">Interview Complete</h1>
        <p className="text-sm text-zinc-500">
          {mode === "hr" ? "HR" : mode === "technical" ? "Technical" : "Mixed"} Interview · {result.totalQuestions} questions · {result.duration}
        </p>
      </div>

      {/* Score Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Overall Score", value: result.overallScore, color: scoreColor },
          { label: "HR Score", value: result.hrScore, color: "text-pink-500" },
          { label: "Technical Score", value: result.technicalScore, color: "text-blue-500" },
          { label: "Communication", value: result.communicationScore, color: "text-violet-500" },
        ].map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-center">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">{s.label}</p>
            <span className={`text-3xl font-black ${s.color}`}>{s.value}</span>
            <span className="text-xs text-zinc-400">/100</span>
          </motion.div>
        ))}
      </div>

      {/* Score Gauge */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className={`h-20 w-20 rounded-2xl ${scoreBg} flex items-center justify-center`}>
            <span className={`text-3xl font-black ${scoreColor}`}>{result.overallScore}</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              {result.overallScore >= 80 ? "Excellent Performance!" : result.overallScore >= 60 ? "Good Effort!" : "Keep Practicing!"}
            </h2>
            <p className="text-sm text-zinc-500">{result.questionResults.length} questions evaluated</p>
          </div>
        </div>
        {/* Score bar */}
        <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${result.overallScore}%` }}
            className={`h-full rounded-full ${result.overallScore >= 80 ? "bg-emerald-500" : result.overallScore >= 60 ? "bg-amber-500" : "bg-red-500"}`} />
        </div>
      </div>

      {/* Question Results */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
        <h3 className="font-bold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
          <Target className="h-4 w-4 text-violet-500" /> Question Breakdown
        </h3>
        <div className="space-y-3">
          {result.questionResults.map((qr, i) => (
            <div key={i} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Q{i + 1}.</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${qr.type === "hr" ? "bg-pink-100 dark:bg-pink-900/30 text-pink-700" : "bg-blue-100 dark:bg-blue-900/30 text-blue-700"}`}>
                      {qr.type}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{qr.question}</p>
                </div>
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-black shrink-0 ${qr.score >= 80 ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" : qr.score >= 60 ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600" : "bg-red-100 dark:bg-red-900/30 text-red-600"}`}>
                  {qr.score}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
          <h3 className="font-bold text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" /> Strengths
          </h3>
          <ul className="space-y-2">
            {result.strengths.map((s, i) => (
              <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
                <Star className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" /> {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
          <h3 className="font-bold text-amber-600 dark:text-amber-400 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Areas to Improve
          </h3>
          <ul className="space-y-2">
            {result.improvements.map((im, i) => (
              <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
                <ArrowRight className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" /> {im}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Improvement Plan */}
      <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-6 text-white">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5" /> Your Personalized Improvement Plan
        </h3>
        <div className="space-y-3">
          {result.improvementPlan.map((step, i) => (
            <div key={i} className="flex items-start gap-3 bg-white/10 rounded-xl p-3">
              <div className="h-6 w-6 rounded-lg bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
              <p className="text-sm text-violet-100">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <button onClick={onRestart} className="px-6 py-3 bg-aurora-card border border-aurora-border text-aurora-text-secondary font-bold rounded-xl hover:bg-aurora-card-hover transition-all cursor-pointer">
          Practice Again
        </button>
        <button onClick={onSave} className="px-6 py-3 aurora-gradient-primary text-white font-bold rounded-xl hover:shadow-lg transition-all cursor-pointer">
          Save & Return
        </button>
      </div>
    </div>
  );
}
