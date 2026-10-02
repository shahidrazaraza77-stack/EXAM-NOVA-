"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Sparkles, CheckCircle2, RefreshCw, LogOut, 
  BarChart3, Award, MessageSquare, ShieldAlert,
  ChevronRight, Bookmark, ArrowLeft
} from "lucide-react";
import { 
  Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer 
} from "recharts";
import { Recommendation } from "./mockData";
import { motion } from "framer-motion";

interface ProgressReportProps {
  overallScore: number;
  breakdown: {
    communication: number;
    technical: number;
    confidence: number;
    clarity: number;
  };
  duration: string;
  totalFillerWords: number;
  role: string;
  level: string;
  interviewType: string;
  recommendations: Recommendation[];
  onFinish: () => void;
  onRestart: () => void;
}

export default function ProgressReport({
  overallScore,
  breakdown,
  duration,
  totalFillerWords,
  role,
  level,
  interviewType,
  recommendations,
  onFinish,
  onRestart
}: ProgressReportProps) {
  
  const chartData = [
    { subject: "Communication", A: breakdown.communication || 0, fullMark: 100 },
    { subject: "Technical", A: breakdown.technical || 0, fullMark: 100 },
    { subject: "Confidence", A: breakdown.confidence || 0, fullMark: 100 },
    { subject: "Clarity", A: breakdown.clarity || 0, fullMark: 100 },
  ];

  const feedbackSummary = () => {
    if (overallScore >= 85) return { label: "Excellent Performance!", desc: "You demonstrate strong interview readiness. Your answers are well-structured and technically sound." };
    if (overallScore >= 75) return { label: "Good Attempt!", desc: "Solid baseline! You answered questions accurately. Focus on structuring your answers more clearly." };
    if (overallScore >= 60) return { label: "Needs Practice", desc: "A great practice run. Focus on building deeper technical knowledge and improving answer structure." };
    return { label: "Keep Practicing", desc: "Review the feedback areas and practice more. Focus on understanding core concepts and communicating clearly." };
  };

  const status = feedbackSummary();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 pb-16">
      <div className="-mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onFinish} 
          className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 gap-1.5 cursor-pointer -ml-2 text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Coach Home
        </Button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest block flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Performance Assessment Complete
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Interview Analytics Report
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {role} ({level}) &bull; {interviewType} Mock Session
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onRestart}
            className="text-xs font-bold gap-1.5 cursor-pointer dark:hover:bg-zinc-900"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retake Mock
          </Button>
          <Button 
            onClick={onFinish}
            className="text-xs font-bold gap-1.5 cursor-pointer bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 px-4"
          >
            Save & Return <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 flex flex-col justify-between shadow-sm">
          <div className="space-y-6 text-center md:text-left flex-1 flex flex-col justify-center">
            <div className="mx-auto w-36 h-36 rounded-full border-8 border-violet-500/10 flex flex-col items-center justify-center relative shadow-inner shadow-violet-500/5 bg-zinc-50/50 dark:bg-zinc-900/10">
              <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest">OVERALL</span>
              <span className="text-4xl font-black text-violet-600 dark:text-violet-400 leading-tight">
                {overallScore}
              </span>
              <span className="text-[10px] text-zinc-400 font-semibold">out of 100</span>
            </div>

            <div className="space-y-2 text-center">
              <h3 className="font-extrabold text-base text-zinc-905 dark:text-white leading-tight">
                {status.label}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                {status.desc}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-6 border-t border-zinc-100 dark:border-zinc-900 mt-6 text-center">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-100 dark:border-zinc-900">
              <span className="text-[9px] text-zinc-500 uppercase font-semibold block">Duration</span>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block mt-1">{duration}</span>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-100 dark:border-zinc-900">
              <span className="text-[9px] text-zinc-500 uppercase font-semibold block">Questions</span>
              <span className="text-xs font-bold text-violet-500 block mt-1">{chartData.length} answered</span>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-100 dark:border-zinc-900">
              <span className="text-[9px] text-zinc-500 uppercase font-semibold block">Status</span>
              <span className={`text-xs font-bold block mt-1 ${overallScore >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {overallScore >= 75 ? "Pass" : "Needs Work"}
              </span>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-7 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-violet-600" /> Skill Vector Analysis
            </h3>
            <p className="text-2xs text-zinc-500">Radar representation of category weights relative to maximum rating.</p>
          </div>

          <div className="h-72 w-full flex items-center justify-center mt-4 text-xs font-semibold select-none">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                <PolarGrid stroke="#e4e4e7" strokeDasharray="3 3" className="dark:stroke-zinc-800" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: "#71717a", fontSize: 10, fontWeight: 700 }}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={{ fill: "#71717a", fontSize: 9 }}
                />
                <Radar 
                  name="Score" 
                  dataKey="A" 
                  stroke="#8b5cf6" 
                  fill="#8b5cf6" 
                  fillOpacity={0.25} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-6 border-t border-zinc-100 dark:border-zinc-900 text-center text-zinc-500">
            {[
              { label: "Communication", score: breakdown.communication },
              { label: "Technical", score: breakdown.technical },
              { label: "Confidence", score: breakdown.confidence },
              { label: "Clarity", score: breakdown.clarity }
            ].map((skill, index) => (
              <div key={index} className="space-y-1">
                <span className="text-[9px] block truncate font-medium">{skill.label}</span>
                <span className="text-xs font-black text-zinc-800 dark:text-zinc-200">{skill.score || "N/A"}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-violet-600" /> AI Coach Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec, i) => (
            <Card key={rec.id} className="border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 p-5 flex flex-col justify-between h-40">
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest block">Action Item {i + 1}</span>
                <h4 className="font-extrabold text-xs text-zinc-900 dark:text-white leading-tight">{rec.title}</h4>
                <p className="text-3xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3">{rec.description}</p>
              </div>
              <div className="flex items-center text-[10px] font-semibold text-violet-600 dark:text-violet-400 mt-3 hover:underline cursor-pointer gap-0.5">
                Go to modules <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
