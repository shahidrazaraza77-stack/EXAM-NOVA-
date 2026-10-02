"use client";

import React from "react";
import { motion } from "framer-motion";
import ReadinessRing from "../components/ReadinessRing";
import ActivityTimeline from "../components/ActivityTimeline";
import { RECOMMENDATIONS, DAILY_PLAN } from "../components/mockData";
import { Sparkles, TrendingUp, TrendingDown, Minus, CheckCircle, Clock, Target, Zap, ArrowRight, ShieldCheck, Code2, Brain } from "lucide-react";

interface OverviewViewProps {
  scores: {
    overall: number;
    resumeScore: number;
    aptitudeScore: number;
    codingScore: number;
    interviewScore: number;
  };
}

export default function OverviewView({ scores }: OverviewViewProps) {
  const { overall, resumeScore, aptitudeScore, codingScore, interviewScore } = scores;

  const kpiCards = [
    { title: "Placement Readiness", score: overall, change: "Overall Index", trend: overall >= 75 ? "up" as const : overall >= 50 ? "stable" as const : "down" as const, icon: Target, color: "#7C5CFF" },
    { title: "Resume Score", score: resumeScore, change: "ATS Match", trend: resumeScore >= 70 ? "up" as const : resumeScore >= 40 ? "stable" as const : "down" as const, icon: Sparkles, color: "#FF2E8B" },
    { title: "Aptitude Score", score: aptitudeScore, change: "Accuracy Rate", trend: aptitudeScore >= 70 ? "up" as const : aptitudeScore >= 40 ? "stable" as const : "down" as const, icon: Zap, color: "#00D9FF" },
    { title: "Coding Score", score: codingScore, change: "DSA Proficiency", trend: codingScore >= 70 ? "up" as const : codingScore >= 40 ? "stable" as const : "down" as const, icon: Code2, color: "#00FFC6" },
    { title: "Interview Score", score: interviewScore, change: "AI Feedback", trend: interviewScore >= 70 ? "up" as const : interviewScore >= 40 ? "stable" as const : "down" as const, icon: CheckCircle, color: "#F59E0B" },
  ];

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up": return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />;
      case "down": return <TrendingDown className="w-3.5 h-3.5 text-red-500" />;
      default: return <Minus className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-8">
      
      {/* ─── TOP 5 METRICS ROW ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -3, scale: 1.02 }}
              className="p-5 rounded-2xl bg-white/85 dark:bg-white/[0.06] backdrop-blur-2xl border flex flex-col justify-between shadow-lg space-y-4 transition-all duration-300 relative overflow-hidden group"
              style={{
                borderColor: `${card.color}35`,
                boxShadow: `0 10px 30px ${card.color}10, inset 0 1px 1px ${card.color}25`
              }}
            >
              {/* Background Glow */}
              <div 
                className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500"
                style={{ background: `${card.color}25` }}
              />

              <div className="flex items-center justify-between gap-2 relative z-10">
                <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest truncate">
                  {card.title}
                </span>
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110"
                  style={{ background: `${card.color}20`, border: `1px solid ${card.color}40` }}
                >
                  <Icon className="w-4 h-4" style={{ color: card.color }} />
                </div>
              </div>

              <div className="space-y-1.5 relative z-10">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">{card.score}%</span>
                  {getTrendIcon(card.trend)}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-extrabold" style={{ color: card.color }}>{card.change}</p>
                  <div className="w-16 h-1.5 rounded-full bg-zinc-200 dark:bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${card.score}%`, background: card.color }} />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ─── MAIN 3-COLUMN DASHBOARD GRID ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Readiness Ring */}
        <div className="lg:col-span-4 flex flex-col">
          <ReadinessRing score={overall} />
        </div>

        {/* Center Column: AI Recommendations & Daily Action Plan */}
        <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
          
          {/* AI Recommendations Card */}
          <div className="bg-white/85 dark:bg-white/[0.06] backdrop-blur-2xl border border-purple-500/20 dark:border-white/15 p-6 rounded-[28px] shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-purple-500/10 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#FF2E8B]" />
                <h3 className="font-black text-sm text-zinc-900 dark:text-white tracking-tight">AI Recommendations</h3>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FF2E8B]/10 text-[#FF2E8B] border border-[#FF2E8B]/30">
                AI Powered
              </span>
            </div>

            <div className="space-y-3">
              {RECOMMENDATIONS.slice(0, 3).map((rec) => (
                <div key={rec.id} className="p-3.5 rounded-2xl border border-purple-500/15 dark:border-white/10 bg-purple-500/5 dark:bg-white/[0.03] space-y-1.5 hover:border-purple-500/30 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-zinc-900 dark:text-white">{rec.title}</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                      rec.priority === "high" ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30" :
                      rec.priority === "medium" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" :
                      "bg-[#00D9FF]/10 text-[#00D9FF] border-[#00D9FF]/30"
                    }`}>{rec.priority}</span>
                  </div>
                  <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed">{rec.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Action Plan Card */}
          <div className="bg-white/85 dark:bg-white/[0.06] backdrop-blur-2xl border border-purple-500/20 dark:border-white/15 p-6 rounded-[28px] shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-purple-500/10 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#7C5CFF]" />
                <h3 className="font-black text-sm text-zinc-900 dark:text-white tracking-tight">Daily Action Plan</h3>
              </div>
              <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500">TODAY</span>
            </div>

            <div className="space-y-2.5">
              {DAILY_PLAN.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl border border-purple-500/10 dark:border-white/10 bg-purple-500/5 dark:bg-white/[0.03]">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      item.priority === "high" ? "bg-[#FF2E8B] shadow-sm shadow-[#FF2E8B]" :
                      item.priority === "medium" ? "bg-[#7C5CFF]" : "bg-[#00D9FF]"
                    }`} />
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{item.task}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-extrabold px-2 py-0.5 rounded-md bg-purple-500/10 dark:bg-white/10">{item.duration}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Activity Timeline */}
        <div className="lg:col-span-4 flex flex-col">
          <ActivityTimeline />
        </div>

      </div>

    </div>
  );
}
