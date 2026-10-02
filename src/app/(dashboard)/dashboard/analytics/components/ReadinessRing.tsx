"use client";

import React from "react";
import { Sparkles, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface ReadinessRingProps {
  score: number;
}

export default function ReadinessRing({ score }: ReadinessRingProps) {
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getDriveStatus = () => {
    if (score >= 80) return { label: "Job Ready 🚀", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" };
    if (score >= 60) return { label: "On Track 📈", color: "bg-[#00D9FF]/10 text-[#00D9FF] border-[#00D9FF]/30" };
    if (score >= 40) return { label: "Progressing ⚡", color: "bg-[#7C5CFF]/10 text-[#7C5CFF] border-[#7C5CFF]/30" };
    return { label: "Needs Practice 🎯", color: "bg-[#FF2E8B]/10 text-[#FF2E8B] border-[#FF2E8B]/30" };
  };

  const status = getDriveStatus();

  const getPrediction = () => {
    if (score >= 80) return "Top 5% candidate pool. You are fully prepared for Tier-1 Product Companies (Google, Amazon, Microsoft).";
    if (score >= 60) return "Strong placement foundation! Practice 2-3 Medium DSA problems & complete 1 Mock Interview to reach Tier-1 status.";
    if (score >= 40) return "Solid start! Focus on ATS resume optimization and Aptitude speed workouts to boost your readiness percentile.";
    return "Start with foundational DSA practice & resume building. Daily practice will rapidly elevate your readiness score.";
  };

  return (
    <div className="bg-white/85 dark:bg-white/[0.06] backdrop-blur-2xl border border-purple-500/20 dark:border-white/15 rounded-[28px] p-6 flex flex-col justify-between shadow-xl min-h-[380px] relative overflow-hidden transition-all duration-300">
      
      {/* Background Ambient Glows */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#7C5CFF]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#FF2E8B]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="space-y-1 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#FF2E8B]/10 via-[#7C5CFF]/10 to-[#00D9FF]/10 border border-purple-500/20 text-xs font-extrabold text-[#7C5CFF] dark:text-[#00D9FF]">
          <Sparkles className="w-3.5 h-3.5 text-[#FF2E8B] animate-pulse" />
          <span>READINESS ASSESSMENT</span>
        </div>
        <h3 className="font-black text-lg text-zinc-900 dark:text-white tracking-tight pt-2">
          Placement Readiness Score
        </h3>
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          AI-calculated multi-factorial readiness algorithm
        </p>
      </div>

      {/* SVG Ring Gauge */}
      <div className="my-6 flex flex-col items-center justify-center relative flex-1 z-10">
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <defs>
              <linearGradient id="readinessGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF2E8B" />
                <stop offset="50%" stopColor="#7C5CFF" />
                <stop offset="100%" stopColor="#00D9FF" />
              </linearGradient>
            </defs>
            <circle
              cx="88"
              cy="88"
              r={radius}
              className="stroke-purple-500/10 dark:stroke-white/10"
              strokeWidth="12"
              fill="transparent"
            />
            <motion.circle
              cx="88"
              cy="88"
              r={radius}
              stroke="url(#readinessGrad)"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight leading-none bg-gradient-to-r from-[#FF2E8B] via-[#7C5CFF] to-[#00D9FF] bg-clip-text text-transparent">
              {score}%
            </span>
            <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-400 uppercase tracking-widest mt-1.5">
              ELIGIBILITY INDEX
            </span>
          </div>
        </div>
      </div>

      {/* Footer Prediction */}
      <div className="pt-4 border-t border-purple-500/10 dark:border-white/10 space-y-3 shrink-0 relative z-10">
        <div className="flex justify-between items-center text-xs">
          <span className="text-zinc-500 dark:text-zinc-400 font-bold">Drive Readiness Status:</span>
          <span className={`font-black text-xs px-3 py-1 rounded-full border ${status.color}`}>
            {status.label}
          </span>
        </div>

        <div className="p-3.5 bg-purple-500/5 dark:bg-white/[0.04] rounded-2xl border border-purple-500/15 dark:border-white/10 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
          <span className="font-black text-zinc-900 dark:text-white block mb-1 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#FF2E8B]" />
            Placement AI Prediction:
          </span>
          {getPrediction()}
        </div>
      </div>

    </div>
  );
}
