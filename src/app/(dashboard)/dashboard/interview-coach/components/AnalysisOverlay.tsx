"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Sparkles, CheckCircle, AlertCircle, ArrowRight, 
  X, MessageSquare, Award, Volume2, ShieldAlert, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AnalysisOverlayProps {
  isOpen: boolean;
  onNext: () => void;
  onEndInterview: () => void;
  isLastQuestion: boolean;
  questionText: string;
  feedback: any;
  isLoading?: boolean;
}

export default function AnalysisOverlay({
  isOpen,
  onNext,
  onEndInterview,
  isLastQuestion,
  questionText,
  feedback,
  isLoading
}: AnalysisOverlayProps) {
  const [activeTab, setActiveTab] = useState<"scores" | "feedback" | "tips">("scores");

  const radius = 28;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (isOpen) {
      setActiveTab("scores");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          <div className="p-6 border-b border-zinc-150 dark:border-zinc-900 bg-gradient-to-r from-violet-600/5 to-indigo-600/5 flex items-start justify-between">
            <div className="space-y-1 pr-6">
              <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest block flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" /> {isLoading ? "Analyzing..." : "Answer Analyzed"}
              </span>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white line-clamp-1 leading-snug">
                &ldquo;{questionText}&rdquo;
              </h3>
            </div>
            <button 
              onClick={onNext}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isLoading || !feedback ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
          ) : (
            <>
              <div className="flex border-b border-zinc-100 dark:border-zinc-900 text-xs font-semibold px-6 bg-zinc-50/50 dark:bg-zinc-900/10">
                {[
                  { id: "scores" as const, label: "Performance Scores", icon: Award },
                  { id: "feedback" as const, label: "Detailed Feedback", icon: MessageSquare },
                  { id: "tips" as const, label: "Improvement Tips", icon: Volume2 }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 py-3.5 px-4 border-b-2 transition-all cursor-pointer ${
                        isActive 
                          ? "border-violet-600 text-violet-600 dark:border-violet-500 dark:text-violet-400 font-bold" 
                          : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {activeTab === "scores" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: "Communication", score: feedback.communicationScore || 0, color: "text-blue-500", stroke: "#3b82f6" },
                        { label: "Confidence", score: feedback.confidenceScore || 0, color: "text-emerald-500", stroke: "#10b981" },
                        { label: "Technical Accuracy", score: feedback.technicalScore || 0, color: "text-violet-500", stroke: "#8b5cf6" },
                        { label: "Clarity", score: feedback.clarityScore || 0, color: "text-amber-500", stroke: "#f59e0b" }
                      ].map((s, idx) => {
                        const strokeDashoffset = circumference - (s.score / 100) * circumference;
                        return (
                          <Card key={idx} className="p-4 border border-zinc-150 dark:border-zinc-800 flex flex-col items-center justify-center text-center bg-zinc-50/20 dark:bg-zinc-900/5">
                            <div className="relative w-16 h-16">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle cx="32" cy="32" r={radius} className="stroke-zinc-100 dark:stroke-zinc-800" strokeWidth="5.5" fill="transparent" />
                                <motion.circle
                                  cx="32" cy="32" r={radius} stroke={s.stroke} strokeWidth="5.5" fill="transparent"
                                  strokeDasharray={circumference}
                                  initial={{ strokeDashoffset: circumference }}
                                  animate={{ strokeDashoffset }}
                                  transition={{ duration: 1.2, ease: "easeOut" }}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-zinc-800 dark:text-zinc-100">
                                {s.score}%
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mt-3 block uppercase tracking-wider leading-tight">
                              {s.label}
                            </span>
                          </Card>
                        );
                      })}
                    </div>

                    {feedback.overallFeedback && (
                      <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/10 text-2xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                        <span className="font-bold text-violet-600 dark:text-violet-400 block mb-1">Coach Summary</span>
                        {feedback.overallFeedback}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "feedback" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-5"
                  >
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" /> Strengths
                      </h4>
                      <ul className="space-y-2">
                        {feedback.strengths?.map((str: string, i: number) => (
                          <li key={i} className="text-2xs text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/40 p-3 rounded-lg border border-zinc-100 dark:border-zinc-900 flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2.5">
                      <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> Areas to Improve
                      </h4>
                      <ul className="space-y-2">
                        {feedback.weaknesses?.map((imp: string, i: number) => (
                          <li key={i} className="text-2xs text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/40 p-3 rounded-lg border border-zinc-100 dark:border-zinc-900 flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                            <span>{imp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}

                {activeTab === "tips" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-5"
                  >
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4" /> Suggestions for Improvement
                      </h4>
                      <ul className="space-y-2">
                        {feedback.suggestions?.map((tip: string, i: number) => (
                          <li key={i} className="text-2xs text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/40 p-3 rounded-lg border border-zinc-100 dark:border-zinc-900 flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </div>
            </>
          )}

          <div className="p-6 border-t border-zinc-150 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/20 flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={onEndInterview}
              disabled={isLoading}
              className="text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-900/50 cursor-pointer disabled:opacity-50"
            >
              End Interview Loop
            </Button>
            <Button
              onClick={onNext}
              disabled={isLoading}
              className="bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-md shadow-violet-500/10 disabled:opacity-50"
            >
              {isLastQuestion ? "Finish & Get Report" : "Proceed to Next Question"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
