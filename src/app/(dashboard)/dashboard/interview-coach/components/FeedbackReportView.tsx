"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Sparkles, CheckCircle2, RefreshCw, LogOut, BarChart3, Award,
  MessageSquare, ShieldAlert, ChevronRight, Bookmark, ArrowLeft,
  Target, TrendingUp, Brain, Code2, Users, Lightbulb, Star, Zap,
  AlertTriangle
} from "lucide-react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from "recharts";
import { Recommendation } from "./mockData";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FeedbackReportViewProps {
  overallScore: number;
  breakdown: {
    communication: number;
    technical: number;
    confidence: number;
    clarity: number;
    problemSolving: number;
  };
  duration: string;
  role: string;
  difficulty: string;
  interviewType: string;
  recommendations: Recommendation[];
  onFinish: () => void;
  onRestart: () => void;
  weakAreas?: string[];
  improvementRoadmap?: string[];
}

export default function FeedbackReportView({
  overallScore, breakdown, duration, role, difficulty, interviewType,
  recommendations, onFinish, onRestart, weakAreas = [], improvementRoadmap = []
}: FeedbackReportViewProps) {
  const chartData = [
    { subject: "Communication", A: breakdown.communication || 0, fullMark: 100 },
    { subject: "Technical", A: breakdown.technical || 0, fullMark: 100 },
    { subject: "Confidence", A: breakdown.confidence || 0, fullMark: 100 },
    { subject: "Clarity", A: breakdown.clarity || 0, fullMark: 100 },
    { subject: "Problem Solving", A: breakdown.problemSolving || 0, fullMark: 100 },
  ];

  const barData = [
    { name: "Communication", value: breakdown.communication || 0, fill: "#6366f1" },
    { name: "Technical", value: breakdown.technical || 0, fill: "#10b981" },
    { name: "Confidence", value: breakdown.confidence || 0, fill: "#f59e0b" },
    { name: "Clarity", value: breakdown.clarity || 0, fill: "#ec4899" },
    { name: "Problem Solving", value: breakdown.problemSolving || 0, fill: "#8b5cf6" },
  ];

  const getStatus = () => {
    if (overallScore >= 85) return { label: "Excellent!", desc: "You demonstrate strong interview readiness. Well-structured and technically sound.", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40" };
    if (overallScore >= 75) return { label: "Good Attempt", desc: "Solid baseline! Focus on structuring answers more clearly.", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/40" };
    if (overallScore >= 60) return { label: "Needs Practice", desc: "Focus on building deeper technical knowledge and answer structure.", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/40" };
    return { label: "Keep Practicing", desc: "Review feedback areas and focus on core concepts.", color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-950/40" };
  };

  const status = getStatus();

  const weakest = [...barData].sort((a, b) => a.value - b.value)[0];
  const strongest = [...barData].sort((a, b) => b.value - a.value)[0];

  const actionPlan = [
    `Review ${weakest.name.toLowerCase()} concepts — your lowest scoring area at ${weakest.value}%`,
    `Practice STAR method for behavioral questions to improve communication`,
    `Take a ${interviewType.toLowerCase()} mock interview every week to track progress`,
    `Focus on time management — complete answers within 2-3 minutes`,
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Performance Report
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Interview Feedback Report</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{role} ({difficulty}) &bull; {interviewType} &bull; {duration}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onRestart} className="text-xs font-bold gap-1.5 cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" /> Retake
          </Button>
          <Button onClick={onFinish} className="text-xs font-bold gap-1.5 cursor-pointer aurora-gradient-primary text-white shadow-md px-4">
            <LogOut className="w-3.5 h-3.5" /> Save & Return
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 flex flex-col justify-center">
          <div className="text-center space-y-4">
            <div className="mx-auto w-40 h-40 rounded-full border-8 border-violet-500/10 flex flex-col items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20">
              <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest">Overall</span>
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="text-5xl font-black text-violet-600 dark:text-violet-400 leading-tight"
              >
                {overallScore}
              </motion.span>
              <span className="text-[10px] text-zinc-400 font-semibold">/100</span>
            </div>
            <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold", status.bg, status.color)}>
              <Star className="w-3.5 h-3.5" />
              {status.label}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{status.desc}</p>
          </div>
        </Card>

        <Card className="lg:col-span-8 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-5 text-violet-600" /> Skill Assessment
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                <PolarGrid stroke="#e4e4e7" className="dark:stroke-zinc-800" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#71717a", fontSize: 10, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#71717a", fontSize: 9 }} />
                <Radar name="Score" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-5 gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-900 text-center mt-4">
            {barData.map(s => (
              <div key={s.name} className="space-y-1">
                <span className="text-[9px] block truncate font-medium text-zinc-400">{s.name}</span>
                <span className="text-xs font-black text-zinc-800 dark:text-zinc-200">{s.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
          <CardHeader className="px-0 pt-0 pb-4 border-b border-zinc-100 dark:border-zinc-900">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-5 text-emerald-600" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pt-4 space-y-3">
            {[
              `${strongest.name}: Scored ${strongest.value}% — your strongest area`,
              "Good at articulating technical concepts clearly",
              `Demonstrated ${difficulty.toLowerCase()} level understanding`,
              "Structured answers with relevant examples",
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{s}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
          <CardHeader className="px-0 pt-0 pb-4 border-b border-zinc-100 dark:border-zinc-900">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-5 text-amber-600" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pt-4 space-y-3">
            {(weakAreas && weakAreas.length > 0 ? weakAreas : [
              `${weakest.name}: Scored ${weakest.value}% — focus here most`,
              "Practice more concise answers under time pressure",
              "Deepen understanding of advanced concepts",
              "Use more quantifiable metrics in examples",
            ]).map((w, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <Target className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{w}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
        <CardHeader className="px-0 pt-0 pb-4 border-b border-zinc-100 dark:border-zinc-900">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Lightbulb className="w-4 h-5 text-amber-600" />
            Action Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pt-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(improvementRoadmap && improvementRoadmap.length > 0 ? improvementRoadmap : actionPlan).map((plan, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/50">
                <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center shrink-0">
                  <span className="text-xs font-extrabold text-violet-600 dark:text-violet-400">{i + 1}</span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{plan}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Bookmark className="w-4 h-5 text-violet-600" /> AI Coach Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendations.map((rec, i) => (
            <Card key={rec.id} className="border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 p-5 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest block">Action {i + 1}</span>
                <h4 className="font-extrabold text-xs text-zinc-900 dark:text-white">{rec.title}</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{rec.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
