"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Sparkles, CheckCircle, AlertTriangle, ArrowLeft,
  Award, Eye, Zap, Volume2, ShieldCheck,
  ChevronRight, RefreshCw, LogOut, ArrowRight,
  TrendingUp, BarChart2
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from "recharts";
import { motion } from "framer-motion";

interface SpeakReportProps {
  topicTitle: string;
  report: {
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
  };
  onSave: () => void;
  onRestart: () => void;
}

export default function SpeakReport({
  topicTitle,
  report,
  onSave,
  onRestart
}: SpeakReportProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "eye-contact" | "fillers">("overview");

  // Format Recharts data for eye contact attention trend
  const attentionTrendData = report.eyeContactMetrics.attentionTrend.map((val, idx) => ({
    name: `t-${idx + 1}`,
    Attention: val
  }));

  const getSpeedCategory = (wpm: number) => {
    if (wpm > 150) return { text: "Fast Pacing", color: "text-amber-500", desc: "Speaking too quickly. Take deep pauses to digest topics." };
    if (wpm < 110) return { text: "Slow Pacing", color: "text-amber-500", desc: "Pacing is slightly sluggish. Speak with more energetic inflection." };
    return { text: "Ideal Pacing", color: "text-emerald-500", desc: "Perfect speech velocity matching conversational standards." };
  };

  const speedEval = getSpeedCategory(report.breakdown.speed);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-pink-600 dark:text-pink-400 uppercase tracking-widest block flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Diagnostic Speech Assessment Completed
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Speech Analytics Report
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Target Prompt: "{topicTitle}"
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onRestart}
            className="text-xs font-bold gap-1.5 cursor-pointer dark:hover:bg-zinc-900"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retake Practice
          </Button>
          <Button 
            onClick={onSave}
            className="text-xs font-bold gap-1.5 cursor-pointer bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 px-4"
          >
            Save & Return <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold bg-zinc-50/50 dark:bg-zinc-900/10 rounded-xl p-1 w-fit border">
        {[
          { id: "overview" as const, label: "Core Overview", icon: Award },
          { id: "eye-contact" as const, label: "Eye Contact Dashboard", icon: Eye },
          { id: "fillers" as const, label: "Filler Word Analysis", icon: Volume2 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 py-2 px-4 rounded-lg transition-all cursor-pointer ${
                isActive 
                  ? "bg-white dark:bg-zinc-950 text-pink-600 dark:text-pink-400 font-bold shadow-sm" 
                  : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="space-y-8">
        {activeTab === "overview" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
          >
            {/* Left Card: Score Summary Circle & Rating Bars (5/12) */}
            <Card className="lg:col-span-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 flex flex-col justify-between shadow-sm">
              <div className="space-y-6 text-center md:text-left flex-1 flex flex-col justify-center">
                {/* Score Circle */}
                <div className="mx-auto w-36 h-36 rounded-full border-8 border-pink-500/10 flex flex-col items-center justify-center relative shadow-inner shadow-pink-500/5 bg-zinc-50/50 dark:bg-zinc-900/10">
                  <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-widest">COMMUNICATION</span>
                  <span className="text-4xl font-black text-pink-600 dark:text-pink-400 leading-tight">
                    {report.overallScore}
                  </span>
                  <span className="text-[9px] text-zinc-400 font-semibold">out of 100</span>
                </div>

                {/* Score Breakdowns */}
                <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                  <span className="text-[9px] font-bold text-zinc-450 uppercase tracking-widest block">METRICS RATING</span>
                  {[
                    { label: "Confidence", val: report.breakdown.confidence, color: "bg-amber-500" },
                    { label: "Eye Contact", val: report.breakdown.eyeContact, color: "bg-blue-500" },
                    { label: "Fluency", val: report.breakdown.fluency, color: "bg-emerald-500" }
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
                        <span>{item.label}</span>
                        <span>{item.val}%</span>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: `${item.val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Right Card: Speed evaluation & feedback list (7/12) */}
            <Card className="lg:col-span-7 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 flex flex-col justify-between shadow-sm">
              <div className="space-y-6">
                {/* Speed indicator */}
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-900 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-zinc-400 uppercase font-bold">Speaking Speed (WPM)</span>
                    <h5 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-1.5">
                      {report.breakdown.speed} WPM
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 ${speedEval.color}`}>
                        {speedEval.text}
                      </span>
                    </h5>
                    <p className="text-[10px] text-zinc-500 max-w-sm leading-relaxed mt-1">
                      {speedEval.desc}
                    </p>
                  </div>
                </div>

                {/* AI Coach Critique */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> Strengths
                    </h4>
                    <ul className="space-y-2">
                      {report.feedback.strengths.map((str, i) => (
                        <li key={i} className="text-2xs text-zinc-650 dark:text-zinc-350 bg-zinc-50/50 dark:bg-zinc-900/20 p-3 rounded-lg border border-zinc-100 dark:border-zinc-900 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> Improvements
                    </h4>
                    <ul className="space-y-2">
                      {report.feedback.improvements.map((imp, i) => (
                        <li key={i} className="text-2xs text-zinc-650 dark:text-zinc-350 bg-zinc-50/50 dark:bg-zinc-900/20 p-3 rounded-lg border border-zinc-100 dark:border-zinc-900 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === "eye-contact" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
          >
            {/* Left Card: Eye contact stats and gauge (5/12) */}
            <Card className="lg:col-span-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 flex flex-col justify-between shadow-sm">
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Eye className="w-4.5 h-4.5 text-blue-500" /> Focus Analytics
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Evaluation of gaze vectors over simulation window.</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-900 rounded-xl space-y-1">
                    <span className="text-[9px] text-zinc-400 font-semibold block">LOOKING FORWARD</span>
                    <h5 className="text-2xl font-black text-blue-500">
                      {report.eyeContactMetrics.eyeContactPct}%
                    </h5>
                  </div>
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-900 rounded-xl space-y-1">
                    <span className="text-[9px] text-zinc-400 font-semibold block">LOOKING AWAY</span>
                    <h5 className="text-2xl font-black text-amber-500">
                      {report.eyeContactMetrics.lookingAwayPct}%
                    </h5>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/[0.03] border border-blue-500/10 text-2xs text-zinc-650 dark:text-zinc-350 leading-relaxed">
                  <span className="font-bold text-blue-600 dark:text-blue-400 block mb-1">Gaze Summary Review</span>
                  You maintained steady central focus during crucial conceptual highlights. A minor gaze drift was noticed at the 40s mark (potentially searching for vocabulary). Focus on keeping a locked gaze even during mental pauses.
                </div>
              </div>
            </Card>

            {/* Right Card: Attention Trend chart (7/12) */}
            <Card className="lg:col-span-7 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <TrendingUp className="w-4.5 h-4.5 text-blue-500" /> Attention Stability
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Realtime tracking of camera alignment and pupil focus consistency.</p>
                </div>

                <div className="h-56 w-full select-none text-[10px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={attentionTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" className="dark:stroke-zinc-900" />
                      <XAxis dataKey="name" tick={{ fill: "#71717a", fontSize: 9 }} />
                      <YAxis tick={{ fill: "#71717a", fontSize: 9 }} domain={[60, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="Attention" stroke="#3b82f6" strokeWidth={2.5} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === "fillers" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Filler overall metrics card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-1">
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Total Filler Words</span>
                <h5 className={`text-2xl font-black ${report.breakdown.fillerWords > 4 ? "text-amber-500" : "text-emerald-500"}`}>
                  {report.breakdown.fillerWords} count
                </h5>
              </Card>
              <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-1">
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Words Evaluated</span>
                <h5 className="text-2xl font-black text-zinc-900 dark:text-white">
                  {topicTitle ? "90+ words" : "N/A"}
                </h5>
              </Card>
              <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-1">
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Filler Ratio</span>
                <h5 className="text-2xl font-black text-pink-500">
                  {Math.round((report.breakdown.fillerWords / 90) * 100)}%
                </h5>
              </Card>
            </div>

            {/* Individual filler word cards */}
            <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-5">
              <div>
                <h4 className="font-bold text-xs text-zinc-900 dark:text-white">Repetitive Word Tracking</h4>
                <p className="text-[10px] text-zinc-500 mt-0.5">Granular summary of transitional speech fillers.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {[
                  { word: '"um"', count: report.fillerWordsBreakdown.um, color: "text-amber-500" },
                  { word: '"uh"', count: report.fillerWordsBreakdown.uh, color: "text-amber-500" },
                  { word: '"like"', count: report.fillerWordsBreakdown.like, color: "text-pink-500" },
                  { word: '"basically"', count: report.fillerWordsBreakdown.basically, color: "text-blue-500" },
                  { word: '"actually"', count: report.fillerWordsBreakdown.actually, color: "text-violet-500" }
                ].map((f, i) => (
                  <div key={i} className="p-4 border border-zinc-150 dark:border-zinc-855 bg-zinc-50/20 dark:bg-zinc-900/5 rounded-xl flex items-center justify-between">
                    <span className="text-2xs font-extrabold text-zinc-800 dark:text-zinc-200">{f.word}</span>
                    <span className={`px-2 py-0.5 rounded font-black text-xs ${
                      f.count > 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" : "bg-zinc-100 text-zinc-400 dark:bg-zinc-900"
                    }`}>
                      {f.count}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
