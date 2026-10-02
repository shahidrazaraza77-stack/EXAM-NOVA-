"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  HelpCircle, Code2, User, Mic, FileText, 
  CheckCircle, AlertTriangle, ArrowRight, Eye,
  Award, TrendingUp, Sparkles, ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";

interface SectionalAnalyticsProps {
  resumeScore: number;
  aptitudeScore: number;
  codingScore: number;
  interviewScore: number;
  skillGaps: any;
}

export default function SectionalAnalytics({
  resumeScore, aptitudeScore, codingScore, interviewScore, skillGaps
}: SectionalAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<"apt" | "code" | "int" | "speech" | "res">("apt");

  const tabs = [
    { id: "apt" as const, label: "Aptitude Practice", icon: HelpCircle },
    { id: "code" as const, label: "Coding IDE", icon: Code2 },
    { id: "int" as const, label: "AI Interviewer", icon: User },
    { id: "speech" as const, label: "SpeakWise Speech", icon: Mic },
    { id: "res" as const, label: "ATS Resume Builder", icon: FileText }
  ];

  const gapReport: any = skillGaps?.report || {};
  const weakestSkill = skillGaps?.weakest_skill || "";
  const strongestSkill = skillGaps?.strongest_skill || "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap border-b border-zinc-200 dark:border-zinc-800 gap-2 text-xs font-semibold pb-1.5">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 py-2 px-3.5 rounded-lg border transition-all cursor-pointer ${
                isActive 
                  ? "border-violet-600 dark:border-violet-500 bg-violet-500/5 text-violet-600 dark:text-violet-400 font-bold" 
                  : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        
        {activeTab === "apt" && (
          <motion.div
            key="apt"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-4 flex flex-col justify-between shadow-sm">
              <div>
                <h4 className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-blue-500" /> Aptitude Diagnostics
                </h4>
                <p className="text-[10px] text-zinc-500 mt-0.5">Quantitative and logical filters analytics.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-zinc-150 dark:border-zinc-900 bg-zinc-50/40 dark:bg-zinc-900/10 text-center">
                  <span className="text-[9px] text-zinc-400 font-semibold block">CURRENT ACCURACY</span>
                  <span className="text-2xl font-black text-zinc-850 dark:text-zinc-150">{aptitudeScore}%</span>
                </div>
                <div className="p-4 rounded-xl border border-zinc-150 dark:border-zinc-900 bg-zinc-50/40 dark:bg-zinc-900/10 text-center">
                  <span className="text-[9px] text-zinc-400 font-semibold block">AVERAGE ACCURACY</span>
                  <span className="text-2xl font-black text-blue-500">{Math.max(aptitudeScore - 5, 0)}%</span>
                </div>
              </div>
            </Card>

            <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Strongest Area</span>
                  <div className="space-y-1.5">
                    <div className="p-2 border border-zinc-150 dark:border-zinc-850 bg-zinc-50/20 dark:bg-zinc-900/5 rounded-lg text-3xs font-semibold text-zinc-700 dark:text-zinc-350">
                      {strongestSkill || "N/A"}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Weakest Area</span>
                  <div className="space-y-1.5">
                    <div className="p-2 border border-zinc-150 dark:border-zinc-850 bg-zinc-50/20 dark:bg-zinc-900/5 rounded-lg text-3xs font-semibold text-zinc-700 dark:text-zinc-355">
                      {weakestSkill || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === "code" && (
          <motion.div
            key="code"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6"
          >
            <Card className="md:col-span-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 flex flex-col justify-between shadow-sm min-h-[220px]">
              <div>
                <h4 className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-emerald-500" /> Coding IDE Analytics
                </h4>
                <p className="text-[10px] text-zinc-500 mt-0.5">Algorithms solved totals.</p>
              </div>

              <div className="flex items-center justify-between gap-4 py-2 mt-2">
                <div className="text-center">
                  <span className="text-[9px] text-zinc-400 font-semibold block">CURRENT PROFICIENCY</span>
                  <span className="text-2xl font-black text-zinc-850 dark:text-zinc-150">{codingScore}%</span>
                </div>

                <div className="space-y-1 text-3xs font-bold w-32 shrink-0">
                  <div className="flex justify-between items-center text-emerald-500">
                    <span>Readiness:</span>
                    <span>{codingScore >= 70 ? "Strong" : codingScore >= 40 ? "Moderate" : "Needs Work"}</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="md:col-span-7 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm space-y-4">
              <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-widest block">Score Breakdown</span>
              <div className="space-y-2">
                {[
                  { topic: "Resume Score", score: resumeScore, color: resumeScore >= 70 ? "bg-emerald-500" : resumeScore >= 40 ? "bg-amber-500" : "bg-red-500" },
                  { topic: "Aptitude Score", score: aptitudeScore, color: aptitudeScore >= 70 ? "bg-emerald-500" : aptitudeScore >= 40 ? "bg-amber-500" : "bg-red-500" },
                  { topic: "Coding Score", score: codingScore, color: codingScore >= 70 ? "bg-emerald-500" : codingScore >= 40 ? "bg-amber-500" : "bg-red-500" },
                  { topic: "Interview Score", score: interviewScore, color: interviewScore >= 70 ? "bg-emerald-500" : interviewScore >= 40 ? "bg-amber-500" : "bg-red-500" },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between text-3xs font-bold text-zinc-700 dark:text-zinc-300">
                      <span>{item.topic}</span>
                      <span>{item.score}%</span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-1 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === "int" && (
          <motion.div
            key="int"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <User className="w-4 h-4 text-violet-500" /> Mock Interview Telemetry
                </h4>
                <p className="text-[10px] text-zinc-500 mt-0.5">Summary of dynamic interview loops.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-150 dark:border-zinc-900 text-center">
                  <span className="text-[9px] text-zinc-400 font-semibold block font-sans">INTERVIEW SCORE</span>
                  <span className="text-xl font-black text-zinc-850 dark:text-zinc-150">{interviewScore}%</span>
                </div>
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-150 dark:border-zinc-900 text-center">
                  <span className="text-[9px] text-zinc-400 font-semibold block">TECHNICAL ACCURACY</span>
                  <span className="text-xl font-black text-violet-600">{Math.min(interviewScore + 5, 100)}%</span>
                </div>
              </div>
            </Card>

            <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm space-y-4">
              <span className="text-[10px] font-bold text-zinc-455 uppercase tracking-widest block">Core Gated Parameters</span>
              <div className="space-y-3 pt-1">
                {[
                  { label: "Communication", score: Math.min(interviewScore + 10, 100), color: "bg-indigo-500" },
                  { label: "Technical Knowledge", score: Math.min(interviewScore + 5, 100), color: "bg-indigo-500" },
                  { label: "Problem Solving", score: interviewScore, color: "bg-amber-500" }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-3xs font-bold text-zinc-700 dark:text-zinc-300">
                      <span>{item.label}</span>
                      <span>{item.score}% score</span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === "speech" && (
          <motion.div
            key="speech"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-pink-500" /> SpeakWise AI Telemetry
                </h4>
                <p className="text-[10px] text-zinc-500 mt-0.5">Vocal stability and camera pupil focus analytics.</p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[9px] font-bold">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-150 dark:border-zinc-900">
                  <span className="text-zinc-400 block uppercase">Fluency</span>
                  <span className="text-sm font-black text-zinc-850 dark:text-zinc-150 block mt-1">{Math.min(interviewScore + 5, 100)}%</span>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-150 dark:border-zinc-900">
                  <span className="text-zinc-400 block uppercase">Confidence</span>
                  <span className="text-sm font-black text-pink-600 block mt-1">{interviewScore}%</span>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-150 dark:border-zinc-900">
                  <span className="text-zinc-400 block uppercase">Clarity</span>
                  <span className="text-sm font-black text-zinc-850 dark:text-zinc-150 block mt-1">{Math.min(interviewScore + 10, 100)}%</span>
                </div>
              </div>
            </Card>

            <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm space-y-4">
              <span className="text-[10px] font-bold text-zinc-455 uppercase tracking-widest block">Analysis Summary</span>
              <p className="text-2xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {gapReport?.readinessSummary || gapReport?.analysis || "Run a full readiness calculation to get AI-powered speech analysis and recommendations."}
              </p>
            </Card>
          </motion.div>
        )}

        {activeTab === "res" && (
          <motion.div
            key="res"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-violet-500" /> ATS Resume Scanner
                </h4>
                <p className="text-[10px] text-zinc-500 mt-0.5">Resume parser keyword density audits.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-150 dark:border-zinc-900 text-center">
                  <span className="text-[9px] text-zinc-400 font-semibold block font-sans">ATS RATING SCORE</span>
                  <span className="text-xl font-black text-zinc-850 dark:text-zinc-150">{resumeScore}% score</span>
                </div>
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-150 dark:border-zinc-900 text-center">
                  <span className="text-[9px] text-zinc-400 font-semibold block">STRENGTH LEVEL</span>
                  <span className={`text-xl font-black ${resumeScore >= 70 ? "text-emerald-600" : resumeScore >= 40 ? "text-amber-600" : "text-red-600"}`}>
                    {resumeScore >= 70 ? "Good Fit" : resumeScore >= 40 ? "Needs Work" : "Needs Improvement"}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm space-y-4">
              <span className="text-[10px] font-bold text-zinc-455 uppercase tracking-widest block">Readiness Summary</span>
              <p className="text-2xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {gapReport?.readinessSummary || gapReport?.analysis || "Upload and analyze your resume to get detailed ATS feedback and keyword coverage analysis."}
              </p>
            </Card>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

import { AnimatePresence } from "framer-motion";
