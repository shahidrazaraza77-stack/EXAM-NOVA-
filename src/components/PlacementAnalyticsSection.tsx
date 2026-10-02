"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  BarChart3, Sparkles, Trophy, Award, Zap, CheckCircle2, 
  TrendingUp, ArrowRight, ShieldCheck, Flame, Info, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChartPoint {
  day: string;
  readiness: number;
}

const sevenDayData: ChartPoint[] = [
  { day: "Mon", readiness: 75 },
  { day: "Tue", readiness: 78 },
  { day: "Wed", readiness: 77 },
  { day: "Thu", readiness: 80 },
  { day: "Fri", readiness: 82 },
  { day: "Sat", readiness: 85 },
  { day: "Sun", readiness: 86 }
];

const thirtyDayData: ChartPoint[] = [
  { day: "Wk 1", readiness: 60 },
  { day: "Wk 2", readiness: 68 },
  { day: "Wk 3", readiness: 75 },
  { day: "Wk 4", readiness: 86 }
];

export default function PlacementAnalyticsSection() {
  const [activeTab, setActiveTab] = useState<"7day" | "30day">("7day");
  const chartData = activeTab === "7day" ? sevenDayData : thirtyDayData;

  // Generate SVG path for the chart data
  const getSvgPath = () => {
    const width = 500;
    const height = 140;
    const padding = 20;
    const xStep = (width - padding * 2) / (chartData.length - 1);
    
    let path = "";
    chartData.forEach((pt, index) => {
      const x = padding + index * xStep;
      // Map readiness (0-100) to height (140 to 20)
      const y = height - padding - ((pt.readiness - 50) / 50) * (height - padding * 2);
      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });
    return path;
  };

  const getSvgAreaPath = () => {
    const width = 500;
    const height = 140;
    const padding = 20;
    const xStep = (width - padding * 2) / (chartData.length - 1);
    
    let path = getSvgPath();
    const firstX = padding;
    const lastX = padding + (chartData.length - 1) * xStep;
    const bottomY = height - padding;
    
    path += ` L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
    return path;
  };

  return (
    <section id="analytics-insights" className="relative py-28 bg-white dark:bg-[#030014] text-zinc-900 dark:text-white overflow-hidden border-t border-zinc-200 dark:border-zinc-900/60">
      <style>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(99, 102, 241, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.04) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

      {/* Ambient lights */}
      <div className="absolute top-1/4 right-0 w-[450px] h-[450px] bg-indigo-500/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-[450px] h-[450px] bg-purple-500/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-50/80 dark:bg-zinc-900/60 border border-pink-200 dark:border-indigo-500/20 backdrop-blur-md text-pink-700 dark:text-zinc-350 text-xs font-semibold tracking-wide shadow-[0_0_15px_rgba(219,39,119,0.05)] dark:shadow-[0_0_15px_rgba(99,102,241,0.05)]"
          >
            <BarChart3 className="w-3.5 h-3.5 text-pink-500 dark:text-purple-400" />
            📊 AI-Powered Analytics
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5.5xl font-black tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent leading-tight"
          >
            Know Exactly Where You Stand
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          >
            Track your placement readiness, identify skill gaps, and receive personalized recommendations powered by AI.
          </motion.p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-20">
          
          {/* Left Panel: Analytics & Metrics (8/12) */}
          <div className="lg:col-span-8 space-y-6 flex flex-col justify-between">
            
            {/* Top Row: SVG Area Chart & Streak Stats */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              
              {/* SVG Trend Chart (7/12) */}
              <div className="md:col-span-7 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md p-5 relative overflow-hidden shadow-xl flex flex-col justify-between min-h-[240px]">
                <div className="flex justify-between items-center pb-2">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-pink-500 dark:text-indigo-400" />
                      Readiness Trend
                    </h4>
                    <p className="text-[9px] text-zinc-500">Practice consistency curve</p>
                  </div>
                  <div className="flex bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5">
                    <button 
                      onClick={() => setActiveTab("7day")}
                      className={`text-[9px] font-bold px-2 py-1 rounded-md transition-all ${
                        activeTab === "7day" ? "bg-pink-500 dark:bg-indigo-600 text-white shadow-sm" : "text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                      }`}
                    >
                      7-Day
                    </button>
                    <button 
                      onClick={() => setActiveTab("30day")}
                      className={`text-[9px] font-bold px-2 py-1 rounded-md transition-all ${
                        activeTab === "30day" ? "bg-pink-500 dark:bg-indigo-600 text-white shadow-sm" : "text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                      }`}
                    >
                      30-Day
                    </button>
                  </div>
                </div>

                {/* SVG Curve Area */}
                <div className="flex-1 min-h-[120px] flex items-center justify-center pt-4">
                  <svg viewBox="0 0 500 140" className="w-full h-full">
                    <defs>
                      <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    <line x1="20" y1="20" x2="480" y2="20" stroke="#1f1f2e" strokeDasharray="3" />
                    <line x1="20" y1="60" x2="480" y2="60" stroke="#1f1f2e" strokeDasharray="3" />
                    <line x1="20" y1="100" x2="480" y2="100" stroke="#1f1f2e" strokeDasharray="3" />
                    <line x1="20" y1="120" x2="480" y2="120" stroke="#1f1f2e" />

                    {/* Gradient Area path */}
                    <motion.path 
                      key={activeTab + "-area"}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6 }}
                      d={getSvgAreaPath()} 
                      fill="url(#chart-area-grad)" 
                    />

                    {/* Line path */}
                    <motion.path 
                      key={activeTab + "-line"}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6 }}
                      d={getSvgPath()} 
                      fill="none" 
                      stroke="#6366f1" 
                      strokeWidth="2.5" 
                    />

                    {/* Bottom labels */}
                    {chartData.map((pt, i) => {
                      const width = 500;
                      const padding = 20;
                      const xStep = (width - padding * 2) / (chartData.length - 1);
                      const x = padding + i * xStep;
                      return (
                        <text key={i} x={x} y="136" textAnchor="middle" fill="#52525b" fontSize="8" fontWeight="bold">
                          {pt.day}
                        </text>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Skill Gaps & Streak Card (5/12) */}
              <div className="md:col-span-5 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md p-5 relative overflow-hidden shadow-xl flex flex-col justify-between min-h-[240px]">
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 pb-3 border-b border-zinc-200 dark:border-zinc-900">
                    <Flame className="w-4.5 h-4.5 text-amber-500 dark:text-amber-500 animate-pulse" />
                    Skill Gap Analysis
                  </h4>
                  
                  <div className="space-y-3.5 pt-4">
                    <div className="flex justify-between items-center text-2xs">
                      <span className="text-zinc-500 dark:text-zinc-550 font-bold uppercase tracking-wider">Strongest Skill</span>
                      <span className="font-bold text-emerald-500 dark:text-emerald-450">Resume Building</span>
                    </div>
                    <div className="flex justify-between items-center text-2xs">
                      <span className="text-zinc-500 dark:text-zinc-550 font-bold uppercase tracking-wider">Weakest Skill</span>
                      <span className="font-bold text-rose-500 dark:text-rose-450">Technical Interviews</span>
                    </div>
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block">Recommended Focus</span>
                      <div className="flex flex-wrap gap-1">
                        {["DBMS", "Operating Systems", "Mock Interviews"].map((s, idx) => (
                          <span key={idx} className="text-[9px] font-bold text-zinc-700 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded-md">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-900 text-2xs text-zinc-600 dark:text-zinc-400">
                  <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Current Streak: <strong>5 Days Consistent</strong></span>
                </div>
              </div>

            </div>

            {/* Bottom Row: Score Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { name: "Resume Score", score: 92, desc: "ATS Verified", color: "from-blue-500 to-indigo-500" },
                { name: "Aptitude Score", score: 88, desc: "8 Topic Areas", color: "from-purple-500 to-violet-500" },
                { name: "Coding Score", score: 81, desc: "42 solved challenges", color: "from-emerald-500 to-teal-500" },
                { name: "Interview Score", score: 84, desc: "Clarity: High", color: "from-pink-500 to-rose-500" }
              ].map((crd, idx) => (
                <div key={idx} className="rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white/70 dark:bg-zinc-950/70 p-4 space-y-2.5 shadow-md group hover:border-zinc-300 dark:hover:border-zinc-800/80 transition-colors">
                  <span className="block text-[9px] text-zinc-500 dark:text-zinc-555 font-bold uppercase tracking-wider leading-none">{crd.name}</span>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xl font-black text-zinc-900 dark:text-white">{crd.score}%</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-550" />
                  </div>
                  <div className="h-1 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${crd.color} rounded-full`} style={{ width: `${crd.score}%` }} />
                  </div>
                  <span className="block text-[8px] text-zinc-500 dark:text-zinc-600 font-semibold">{crd.desc}</span>
                </div>
              ))}
            </div>

          </div>

          {/* Right Panel: Circular Gauge & Actions List (4/12) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Circular Gauge Card */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md p-6 relative overflow-hidden shadow-xl flex flex-col justify-between items-center text-center min-h-[220px]">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">OVERALL PLACEMENT READINESS</span>
              
              <div className="relative w-28 h-28 my-2">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="46" fill="none" stroke="currentColor" className="text-zinc-100 dark:text-[#18181b]" strokeWidth="6" />
                  <motion.circle
                    cx="56" cy="56" r="46" fill="none" stroke="url(#gauge-ring-grad)"
                    strokeWidth="6"
                    strokeDasharray={289.03}
                    initial={{ strokeDashoffset: 289.03 }}
                    whileInView={{ strokeDashoffset: 40.46 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gauge-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ec4899" className="dark:stop-color-[#8b5cf6]" />
                      <stop offset="100%" stopColor="#f43f5e" className="dark:stop-color-[#6366f1]" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-zinc-900 dark:text-white leading-none">86%</span>
                  <span className="text-[8px] font-semibold text-zinc-500 tracking-wider uppercase mt-1">Ready</span>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-pink-50 dark:bg-indigo-500/10 border border-pink-200 dark:border-indigo-500/20 px-3 py-1 rounded-full text-[9px] font-bold text-pink-600 dark:text-indigo-400 mt-2">
                <ShieldCheck className="w-3.5 h-3.5" /> Placement Audit Verified
              </div>
            </div>

            {/* AI Recommendation Widget */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md p-5 relative overflow-hidden shadow-xl">
              <div className="flex justify-between items-center pb-3 border-b border-zinc-200 dark:border-zinc-900 mb-4">
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-pink-500 dark:text-purple-400" />
                    Today's Action Plan
                  </h4>
                  <p className="text-[8px] text-zinc-500">AI-generated checklist recommendation</p>
                </div>
                <span className="text-[8px] font-bold text-zinc-600 dark:text-zinc-450 uppercase tracking-widest bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded">Mentor</span>
              </div>

              <div className="space-y-2">
                {[
                  "Solve 5 Aptitude Questions",
                  "Complete 2 Coding Problems",
                  "Attempt 1 Mock Interview",
                  "Improve DBMS Concepts"
                ].map((act, aIdx) => (
                  <div key={aIdx} className="flex items-center gap-2.5 p-2 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-900/60 rounded-xl">
                    <div className="w-4.5 h-4.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 dark:text-emerald-450" />
                    </div>
                    <span className="text-[11px] text-zinc-700 dark:text-zinc-300 font-semibold">{act}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Company Readiness scorecard preview */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md p-5 relative overflow-hidden shadow-xl">
              <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-550 uppercase tracking-wider block mb-3 leading-none">TARGET COMPANY READINESS</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: "TCS", score: 92, bg: "text-emerald-500 dark:text-emerald-400" },
                  { name: "Infosys", score: 89, bg: "text-emerald-500 dark:text-emerald-400" },
                  { name: "Wipro", score: 87, bg: "text-emerald-500 dark:text-emerald-400" },
                  { name: "Amazon", score: 72, bg: "text-pink-500 dark:text-indigo-400" },
                  { name: "Microsoft", score: 68, bg: "text-amber-500 dark:text-amber-400" },
                  { name: "Google", score: 61, bg: "text-amber-500 dark:text-amber-400" }
                ].map((cmp, cIdx) => (
                  <div key={cIdx} className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-900 p-2 rounded-xl text-center space-y-1">
                    <span className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400">{cmp.name}</span>
                    <span className={`text-xs font-black block ${cmp.bg}`}>{cmp.score}%</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Achievements Grid Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
          {[
            { title: "First Interview Completed", desc: "Coach evaluation unlocked", icon: Award, color: "text-blue-500 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/5" },
            { title: "100 Aptitude Questions", desc: "Quantitative mastery", icon: Trophy, color: "text-purple-500 dark:text-purple-400 border-purple-200 dark:border-purple-500/20 bg-purple-50 dark:bg-purple-500/5" },
            { title: "50 Coding Problems", desc: "DSA baseline cleared", icon: Zap, color: "text-emerald-500 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5" },
            { title: "ATS Score Above 90", desc: "Resume verified", icon: ShieldCheck, color: "text-pink-500 dark:text-pink-400 border-pink-200 dark:border-pink-500/20 bg-pink-50 dark:bg-pink-500/5" }
          ].map((ach, index) => {
            const Icon = ach.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white/50 dark:bg-zinc-900/30 p-4 space-y-3 flex items-start gap-3.5 shadow-sm group hover:border-zinc-300 dark:hover:border-zinc-800/80 transition-all duration-300"
              >
                <div className={`w-9 h-9 rounded-lg border ${ach.color} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-zinc-900 dark:text-white tracking-tight">{ach.title}</h5>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-550 mt-0.5">{ach.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Highlight Callout Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative max-w-4xl mx-auto rounded-3xl p-[1.5px] bg-gradient-to-r from-pink-500/30 via-rose-500/30 to-pink-500/30 dark:from-purple-500/30 dark:via-indigo-500/30 dark:to-blue-500/30 shadow-2xl"
        >
          <div className="relative rounded-3xl bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl px-8 py-10 md:py-12 text-center overflow-hidden border border-zinc-200 dark:border-white/5">
            {/* Backdrop glow lights */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-gradient-to-r from-pink-500/10 to-rose-500/10 dark:from-purple-650/10 dark:to-indigo-650/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 space-y-6">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-zinc-900 dark:text-white leading-tight">
                Your Personal Placement Mentor
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
                ExamNova continuously analyzes your progress and guides you toward your dream company with actionable insights.
              </p>
              
              <div className="pt-2 flex justify-center">
                <Link href="/register" className="group">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 dark:from-purple-600 dark:via-indigo-600 dark:to-blue-600 rounded-xl opacity-75 group-hover:opacity-100 blur transition-opacity duration-300 shadow-[0_0_15px_rgba(219,39,119,0.2)] dark:shadow-[0_0_15px_rgba(99,102,241,0.2)]" />
                    <button className="relative flex items-center gap-2 px-8 py-3.5 rounded-xl bg-aurora-primary text-white font-bold text-sm w-full justify-center border border-aurora-primary/20 cursor-pointer">
                      View Your Analytics
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
