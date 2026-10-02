"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles, Code2, BrainCircuit, FileText, Mic, Building2,
  ArrowRight, Trophy, Zap, ShieldCheck, BarChart3,
  Target, Clock, Compass, User, Terminal, Laptop, ChevronRight
} from "lucide-react";

// 13-STAGE ROADMAP JOURNEY NODES
const ROADMAP_STEPS = [
  { id: "step-1", title: "Beginner", icon: User, color: "text-[#00FFC6]", active: true },
  { id: "step-2", title: "Programming", icon: Terminal, color: "text-[#00D9FF]", active: true },
  { id: "step-3", title: "Data Structures", icon: Code2, color: "text-[#4F7CFF]", active: true },
  { id: "step-4", title: "Algorithms", icon: CpuIcon, color: "text-[#7C5CFF]", active: true },
  { id: "step-5", title: "Projects", icon: Laptop, color: "text-[#FF2E8B]", active: true },
  { id: "step-6", title: "Resume Builder", icon: FileText, color: "text-[#00FFC6]", active: true },
  { id: "step-7", title: "ATS Optimization", icon: ShieldCheck, color: "text-[#00D9FF]", active: true },
  { id: "step-8", title: "Coding Challenges", icon: Zap, color: "text-[#4F7CFF]", active: true },
  { id: "step-9", title: "Mock Interviews", icon: Mic, color: "text-[#7C5CFF]", active: true },
  { id: "step-10", title: "Company Prep", icon: Building2, color: "text-[#FF2E8B]", active: true },
  { id: "step-11", title: "Placement Analytics", icon: BarChart3, color: "text-[#00FFC6]", active: true },
  { id: "step-12", title: "AI Career Coach", icon: BrainCircuit, color: "text-[#00D9FF]", active: true },
  { id: "step-13", title: "Dream Job 🎉", icon: Trophy, color: "text-[#FF2E8B]", active: true },
];

function CpuIcon(props: any) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="16" height="16" x="4" y="4" rx="2" />
      <rect width="6" height="6" x="9" y="9" rx="1" />
      <path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2" />
    </svg>
  );
}

// 6 DETAILED ROADMAP CARDS
const ROADMAP_CARDS = [
  {
    id: "card-1",
    title: "Programming Fundamentals",
    desc: "Master Python, C++, Java, OOP principles, data types, and Git version control.",
    duration: "3 Weeks",
    progress: 100,
    difficulty: "Beginner",
    difficultyColor: "bg-[#00FFC6]/15 text-[#00FFC6] border-[#00FFC6]/30",
    icon: Terminal,
    accentColor: "#00FFC6",
    gradient: "from-[#00FFC6]/20 to-transparent",
    topics: ["Python 3.12", "C++ STL", "OOP Concepts", "Git & GitHub"]
  },
  {
    id: "card-2",
    title: "DSA Mastery",
    desc: "Arrays, Linked Lists, Trees, Graphs, Dynamic Programming, and Sliding Window techniques.",
    duration: "6 Weeks",
    progress: 72,
    difficulty: "Advanced",
    difficultyColor: "bg-[#7C5CFF]/15 text-[#7C5CFF] border-[#7C5CFF]/30",
    icon: Code2,
    accentColor: "#7C5CFF",
    gradient: "from-[#7C5CFF]/20 to-transparent",
    topics: ["Arrays & Strings", "Trees & Graphs", "Dynamic Programming", "Sliding Window"]
  },
  {
    id: "card-3",
    title: "System Design & Projects",
    desc: "Build full-stack microservices, distributed caches, REST APIs, and production deployments.",
    duration: "4 Weeks",
    progress: 91,
    difficulty: "Intermediate",
    difficultyColor: "bg-[#4F7CFF]/15 text-[#4F7CFF] border-[#4F7CFF]/30",
    icon: Laptop,
    accentColor: "#4F7CFF",
    gradient: "from-[#4F7CFF]/20 to-transparent",
    topics: ["Next.js & Supabase", "System Architecture", "Redis Caching", "Docker Deployments"]
  },
  {
    id: "card-4",
    title: "Resume Builder & ATS Engine",
    desc: "AI-generated LaTeX resumes, ATS score auditing, missing keyword analysis, and portfolio site.",
    duration: "1 Week",
    progress: 95,
    difficulty: "Professional",
    difficultyColor: "bg-[#FF2E8B]/15 text-[#FF2E8B] border-[#FF2E8B]/30",
    icon: FileText,
    accentColor: "#FF2E8B",
    gradient: "from-[#FF2E8B]/20 to-transparent",
    topics: ["95+ ATS Score", "AI Bullet Point Enhancer", "Keyword Alignment", "Portfolio Builder"]
  },
  {
    id: "card-5",
    title: "AI Interview Coach",
    desc: "Live voice & video mock interviews, technical coding drills, confidence score, and HR prep.",
    duration: "2 Weeks",
    progress: 87,
    difficulty: "Expert",
    difficultyColor: "bg-[#00D9FF]/15 text-[#00D9FF] border-[#00D9FF]/30",
    icon: Mic,
    accentColor: "#00D9FF",
    gradient: "from-[#00D9FF]/20 to-transparent",
    topics: ["Technical Round", "System Design Drill", "Voice Sentiment 87%", "Behavioral STAR"]
  },
  {
    id: "card-6",
    title: "Dream Company Preparation",
    desc: "Targeted prep roadmaps for Google, Amazon, Microsoft, Adobe, Flipkart, and Goldman Sachs.",
    duration: "4 Weeks",
    progress: 45,
    difficulty: "FAANG / Tier-1",
    difficultyColor: "bg-[#FF2E8B]/15 text-[#FF2E8B] border-[#FF2E8B]/30",
    icon: Building2,
    accentColor: "#FF2E8B",
    gradient: "from-[#FF2E8B]/20 to-transparent",
    topics: ["Google Track", "Amazon LP Drills", "Microsoft Technical", "Previous Year Papers"]
  }
];

// FLOATING AI WIDGETS
const FLOATING_WIDGETS = [
  { text: "Google Interview Ready 🚀", color: "border-[#00D9FF]/40 text-[#00D9FF]", top: "10%", left: "3%" },
  { text: "Resume ATS 96% ✓", color: "border-[#00FFC6]/40 text-[#00FFC6]", top: "8%", right: "4%" },
  { text: "Coding Streak 42 Days 🔥", color: "border-[#FF2E8B]/40 text-[#FF2E8B]", top: "34%", left: "-1%" },
  { text: "Job Match 93%", color: "border-[#7C5CFF]/40 text-[#7C5CFF]", top: "32%", right: "-1%" },
  { text: "AI Mentor Online 🟢", color: "border-[#00FFC6]/40 text-[#00FFC6]", top: "68%", left: "4%" },
  { text: "Voice Confidence 82%", color: "border-[#4F7CFF]/40 text-[#4F7CFF]", top: "66%", right: "3%" },
  { text: "LinkedIn Score 91%", color: "border-[#7C5CFF]/40 text-[#7C5CFF]", top: "88%", left: "12%" }
];

// SKILL PROGRESS BARS
const SKILL_PROGRESS = [
  { name: "Programming", percent: 100, color: "bg-[#00FFC6]" },
  { name: "DSA Mastery", percent: 74, color: "bg-[#7C5CFF]" },
  { name: "Resume ATS", percent: 95, color: "bg-[#FF2E8B]" },
  { name: "AI Interview", percent: 67, color: "bg-[#00D9FF]" },
  { name: "Aptitude", percent: 82, color: "bg-[#4F7CFF]" },
  { name: "Projects", percent: 91, color: "bg-[#00FFC6]" }
];

export default function AICareerRoadmap() {
  const [selectedStep, setSelectedStep] = useState(3);


  return (
    <section 
      id="roadmap" 
      className="py-20 xl:py-28 bg-[#F8FAFF] dark:bg-[#060816] text-[#111827] dark:text-white relative overflow-hidden font-sans select-none transition-colors duration-300"
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 15%, rgba(124, 92, 255, 0.12) 0%, transparent 45%),
          radial-gradient(circle at 80% 50%, rgba(255, 46, 139, 0.10) 0%, transparent 50%),
          radial-gradient(circle at 50% 85%, rgba(0, 217, 255, 0.10) 0%, transparent 45%)
        `
      }}
    >
      {/* ─── IMMERSIVE DYNAMIC ATMOSPHERE ─── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        
        {/* SVG Neural Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.14] dark:opacity-[0.12]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(124, 92, 255, 0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(124, 92, 255, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: "56px 56px"
          }}
        />

        {/* Aurora Volumetric Light Orbs */}
        <div className="absolute -top-[200px] left-[15%] w-[750px] h-[750px] rounded-full bg-[#7C5CFF]/10 dark:bg-[#7C5CFF]/15 blur-[180px] animate-pulse" />
        <div className="absolute top-[35%] right-[-100px] w-[650px] h-[650px] rounded-full bg-[#FF2E8B]/10 dark:bg-[#FF2E8B]/15 blur-[180px] animate-pulse" style={{ animationDelay: "2.5s" }} />
        <div className="absolute -bottom-[200px] left-[30%] w-[700px] h-[700px] rounded-full bg-[#00D9FF]/10 dark:bg-[#00D9FF]/15 blur-[180px]" />

        {/* Ambient Particles */}
        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-tr from-[#7C5CFF] via-[#FF2E8B] to-[#00D9FF] animate-particle-drift"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              top: `${Math.random() * 95}%`,
              left: `${Math.random() * 95}%`,
              opacity: Math.random() * 0.6 + 0.2,
              animationDuration: `${Math.random() * 7 + 7}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16 xl:space-y-20">
        
        {/* ─── SECTION HEADER ─── */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-white/[0.07] border border-purple-500/20 dark:border-white/15 backdrop-blur-2xl shadow-md"
          >
            <Sparkles className="w-4 h-4 text-[#FF2E8B] animate-pulse" />
            <span className="text-xs font-black bg-gradient-to-r from-[#7C5CFF] via-[#FF2E8B] to-[#00D9FF] bg-clip-text text-transparent uppercase tracking-wider">
              AI CAREER OPERATING SYSTEM
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#111827] dark:text-white tracking-tight leading-[1.1]"
          >
            Your AI{" "}
            <span className="bg-gradient-to-r from-[#7C5CFF] via-[#FF2E8B] to-[#00D9FF] bg-clip-text text-transparent">
              Career Roadmap
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-sm sm:text-base lg:text-lg text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed"
          >
            Your personalized AI mentor creates a dynamic learning path that evolves with your skills, dream company, and placement goals.
          </motion.p>
        </div>

        {/* ─── 13-STAGE INTERACTIVE JOURNEY TRACK ─── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2 text-xs font-extrabold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5 text-[#00FFC6]">
              <Compass className="w-4 h-4" />
              <span>13-Stage AI Guided Journey</span>
            </span>
            <span className="text-[#7C5CFF]">Beginner → Dream Offer 🚀</span>
          </div>

          <div className="relative py-4 px-2 overflow-x-auto scrollbar-none flex items-center gap-2 sm:gap-3 justify-start lg:justify-between border-y border-purple-500/15 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl rounded-2xl shadow-sm">
            {ROADMAP_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isSelected = selectedStep === idx;
              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => setSelectedStep(idx)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                      isSelected 
                        ? "bg-gradient-to-r from-[#7C5CFF] via-[#FF2E8B] to-[#00D9FF] text-white border-white/40 shadow-lg scale-105" 
                        : "bg-white dark:bg-white/[0.05] hover:bg-purple-50 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 border-purple-500/15 dark:border-white/10"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : step.color}`} />
                    <span className="whitespace-nowrap">{step.title}</span>
                  </button>
                  {idx < ROADMAP_STEPS.length - 1 && (
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600 shrink-0 hidden sm:block" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ─── CENTERPIECE: HOLOGRAPHIC NOVA AI CORE & FLOATING WIDGETS ─── */}
        <div 
          className="relative my-6 flex flex-col items-center justify-center min-h-[380px] xl:min-h-[420px] w-full"
        >
          {/* Glowing Volumetric Aura */}
          <div className="absolute w-80 h-80 xl:w-96 xl:h-96 rounded-full bg-gradient-to-tr from-[#7C5CFF]/25 via-[#FF2E8B]/20 to-[#00D9FF]/25 blur-3xl animate-pulse" />
          
          {/* HOLOGRAPHIC CONCENTRIC GLASS RINGS */}
          <div className="absolute w-72 h-72 xl:w-80 xl:h-80 rounded-full border border-purple-500/30 dark:border-white/20 border-dashed pointer-events-none animate-spin-composited" />
          <div className="absolute w-60 h-60 xl:w-64 xl:h-64 rounded-full border border-[#00D9FF]/40 pointer-events-none animate-spin-reverse-composited" />

          {/* NOVA SPHERICAL CORE */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            
            {/* SPEECH BADGE */}
            <div className="glass-pill px-4 py-1.5 rounded-full border border-[#FF2E8B]/40 bg-white/80 dark:bg-white/10 backdrop-blur-xl shadow-2xl flex items-center gap-2 mb-4 text-xs font-black text-[#111827] dark:text-white animate-float-2">
              <div className="w-2 h-2 rounded-full bg-[#00FFC6] animate-ping" />
              <span>NOVA AI Core • Generating Optimal Career Path</span>
            </div>

            {/* Glowing Multi-layer Plasma Core */}
            <div className="w-36 h-36 xl:w-44 xl:h-44 rounded-full bg-gradient-to-tr from-[#7C5CFF] via-[#FF2E8B] to-[#00D9FF] p-[2px] shadow-[0_0_80px_rgba(124,92,255,0.4)] relative flex items-center justify-center animate-float-mascot">
              <div className="w-full h-full rounded-full bg-white dark:bg-[#060816] backdrop-blur-3xl flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#7C5CFF]/30 via-[#FF2E8B]/30 to-[#00D9FF]/30 animate-spin opacity-80" style={{ animationDuration: '10s' }} />
                
                <div className="relative z-10 flex flex-col items-center justify-center text-center p-3">
                  <BrainCircuit className="w-10 h-10 xl:w-12 xl:h-12 text-[#FF2E8B] dark:text-white animate-pulse mb-1" />
                  <span className="text-sm xl:text-base font-black tracking-wider text-[#111827] dark:text-white">NOVA</span>
                  <span className="text-[9px] font-extrabold text-[#00D9FF] uppercase tracking-widest">v4.0 OS</span>
                </div>
              </div>
            </div>
          </div>

          {/* FLOATING AI WIDGETS SURROUNDING NOVA */}
          {FLOATING_WIDGETS.map((widget, wIdx) => (
            <div
              key={wIdx}
              className={`absolute z-20 hidden md:block ${wIdx % 2 === 0 ? "animate-float-1" : "animate-float-2"}`}
              style={{ top: widget.top, left: widget.left, right: widget.right }}
            >
              <div className={`px-3.5 py-1.5 rounded-2xl bg-white/85 dark:bg-white/[0.08] backdrop-blur-2xl border ${widget.color} shadow-xl text-xs font-black hover:scale-105 transition-transform cursor-pointer flex items-center gap-2`}>
                <span>{widget.text}</span>
              </div>
            </div>
          ))}

        </div>

        {/* ─── 6 PREMIUM ROADMAP GLASS CARDS GRID ─── */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-black text-[#111827] dark:text-white flex items-center gap-2">
              <span>Personalized Placement Modules</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 text-[#7C5CFF] uppercase font-extrabold">6 Core Pillars</span>
            </h3>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 hidden sm:block">Hover cards to explore syllabus</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
            {ROADMAP_CARDS.map((card, cIdx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: cIdx * 0.1 }}
                  className="rounded-[24px] bg-white/80 dark:bg-white/[0.06] backdrop-blur-2xl border border-purple-500/15 dark:border-white/15 p-6 shadow-[0_20px_50px_rgba(123,97,255,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:-translate-y-2 hover:border-purple-500/30 dark:hover:border-white/30 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Top Gradient Overlay */}
                  <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${card.gradient} pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity`} />

                  <div className="relative z-10 space-y-4">
                    
                    {/* Header Row */}
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/10 dark:bg-white/10 border border-purple-500/20 dark:border-white/20 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6" style={{ color: card.accentColor }} />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${card.difficultyColor}`}>
                        {card.difficulty}
                      </span>
                    </div>

                    {/* Title & Desc */}
                    <div>
                      <h4 className="text-xl font-black text-[#111827] dark:text-white group-hover:text-[#7C5CFF] dark:group-hover:text-[#00D9FF] transition-colors mb-1.5">
                        {card.title}
                      </h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                        {card.desc}
                      </p>
                    </div>

                    {/* Syllabus Keypoints Pill Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {card.topics.map((tp, tIdx) => (
                        <span key={tIdx} className="px-2 py-0.5 rounded-lg bg-purple-500/10 dark:bg-white/[0.05] border border-purple-500/20 dark:border-white/10 text-[10px] font-semibold text-purple-700 dark:text-zinc-300">
                          {tp}
                        </span>
                      ))}
                    </div>

                  </div>

                  {/* Bottom Stats Footer */}
                  <div className="relative z-10 pt-5 mt-5 border-t border-purple-500/10 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{card.duration}</span>
                      </span>
                      <span className="font-extrabold" style={{ color: card.accentColor }}>
                        {card.progress}% Completed
                      </span>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-purple-100 dark:bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${card.progress}%`,
                          backgroundColor: card.accentColor 
                        }}
                      />
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ─── AI RECOMMENDATION PANEL & PROGRESS DASHBOARD GRID ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT: FLOATING AI RECOMMENDATION PANEL (5 COLS) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 rounded-[28px] bg-white/85 dark:bg-white/[0.06] backdrop-blur-2xl border border-purple-500/20 dark:border-white/15 p-6 xl:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#7C5CFF]/15 blur-3xl pointer-events-none" />

            <div className="space-y-6 relative z-10">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 flex items-center justify-center text-[#7C5CFF]">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-[#FF2E8B] uppercase tracking-wider block">Real-time Insights</span>
                    <span className="text-base font-black text-[#111827] dark:text-white">AI Recommendation</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold">
                  Active Mentor
                </span>
              </div>

              {/* Recommendation Grid Items */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-white/[0.04] border border-purple-500/15 dark:border-white/10 space-y-1">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold block">Target Role</span>
                  <span className="text-sm font-black text-[#111827] dark:text-white">AI Engineer</span>
                </div>
                <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-white/[0.04] border border-purple-500/15 dark:border-white/10 space-y-1">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold block">Current Readiness</span>
                  <span className="text-sm font-black text-[#00FFC6]">62%</span>
                </div>
                <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-white/[0.04] border border-purple-500/15 dark:border-white/10 space-y-1">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold block">Est. Placement Time</span>
                  <span className="text-sm font-black text-[#00D9FF]">18 Weeks</span>
                </div>
                <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-white/[0.04] border border-purple-500/15 dark:border-white/10 space-y-1">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold block">Next Target Skill</span>
                  <span className="text-sm font-black text-[#7C5CFF]">Dynamic Prog.</span>
                </div>
              </div>

              {/* Today's Goal Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#7C5CFF]/10 via-[#FF2E8B]/10 to-[#00D9FF]/10 dark:from-[#7C5CFF]/15 dark:via-[#FF2E8B]/15 dark:to-[#00D9FF]/15 border border-purple-500/20 dark:border-white/20 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#111827] dark:text-white">
                  <span className="flex items-center gap-1.5 text-[#FF2E8B]">
                    <Target className="w-4 h-4" />
                    <span>Today's Goal</span>
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400">3/5 Solved</span>
                </div>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 font-semibold">
                  Solve 5 DSA Questions (Trees & Graph Traversal)
                </p>
              </div>

              {/* Metric Indicators */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div className="p-2 rounded-xl bg-purple-50/60 dark:bg-white/[0.03] border border-purple-500/15 dark:border-white/10">
                  <span className="block text-[9px] text-zinc-500 dark:text-zinc-400 font-bold">Resume Score</span>
                  <span className="text-sm font-black text-[#FF2E8B]">94%</span>
                </div>
                <div className="p-2 rounded-xl bg-purple-50/60 dark:bg-white/[0.03] border border-purple-500/15 dark:border-white/10">
                  <span className="block text-[9px] text-zinc-500 dark:text-zinc-400 font-bold">Interview Conf.</span>
                  <span className="text-sm font-black text-[#00D9FF]">81%</span>
                </div>
                <div className="p-2 rounded-xl bg-purple-50/60 dark:bg-white/[0.03] border border-purple-500/15 dark:border-white/10">
                  <span className="block text-[9px] text-zinc-500 dark:text-zinc-400 font-bold">Weekly Target</span>
                  <span className="text-sm font-black text-[#00FFC6]">14 Hours</span>
                </div>
              </div>

            </div>
          </motion.div>

          {/* RIGHT: PROGRESS ANALYTICS DASHBOARD (7 COLS) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 rounded-[28px] bg-white/85 dark:bg-white/[0.06] backdrop-blur-2xl border border-purple-500/20 dark:border-white/15 p-6 xl:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between"
          >
            <div className="space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-black text-[#111827] dark:text-white">Placement Readiness Analytics</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Real-time skill mastery breakdown across core modules</p>
                </div>
                <span className="text-xs font-black text-[#00FFC6] bg-[#00FFC6]/15 px-3 py-1.5 rounded-full border border-[#00FFC6]/30">
                  Top 5% Band
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* CIRCULAR PROGRESS GAUGE (5 COLS) */}
                <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-purple-50/60 dark:bg-white/[0.03] border border-purple-500/15 dark:border-white/10 rounded-2xl text-center space-y-2">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" className="stroke-purple-200 dark:stroke-white/10" strokeWidth="10" fill="none" />
                      <circle
                        cx="50" cy="50" r="40"
                        stroke="url(#gradientGaugeTheme)"
                        strokeWidth="10"
                        strokeDasharray="251.2"
                        strokeDashoffset="52.7"
                        strokeLinecap="round"
                        fill="none"
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="gradientGaugeTheme" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#7C5CFF" />
                          <stop offset="50%" stopColor="#FF2E8B" />
                          <stop offset="100%" stopColor="#00D9FF" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-[#111827] dark:text-white">79%</span>
                      <span className="text-[9px] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Overall Fit</span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">Ready for Top Drives</span>
                </div>

                {/* HORIZONTAL SKILL PROGRESS BARS (7 COLS) */}
                <div className="md:col-span-7 space-y-3">
                  {SKILL_PROGRESS.map((skill, sIdx) => (
                    <div key={sIdx} className="space-y-1">
                      <div className="flex justify-between items-center text-xs font-extrabold text-zinc-800 dark:text-zinc-200">
                        <span>{skill.name}</span>
                        <span className="text-[#111827] dark:text-white">{skill.percent}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-purple-100 dark:bg-white/10 overflow-hidden">
                        <div className={`h-full rounded-full ${skill.color}`} style={{ width: `${skill.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

              </div>

            </div>
          </motion.div>

        </div>

        {/* ─── BOTTOM CALL TO ACTION (CTA) ─── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[32px] bg-gradient-to-r from-[#7C5CFF]/15 via-[#FF2E8B]/15 to-[#00D9FF]/15 dark:from-[#7C5CFF]/25 dark:via-[#FF2E8B]/25 dark:to-[#00D9FF]/25 border border-purple-500/30 dark:border-white/20 p-8 sm:p-12 text-center space-y-6 relative overflow-hidden shadow-2xl"
        >
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/10 dark:bg-white/10 blur-3xl pointer-events-none rounded-full" />

          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h3 className="text-3xl sm:text-4xl xl:text-5xl font-black text-[#111827] dark:text-white tracking-tight leading-tight">
              Your Dream Career Starts Here
            </h3>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 font-medium">
              Generate a personalized AI roadmap in less than 30 seconds and start preparing smarter, not harder.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 pt-2">
            <Link href="/register">
              <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#7C5CFF] via-[#FF2E8B] to-[#00D9FF] hover:opacity-95 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-[#7C5CFF]/30 flex items-center justify-center gap-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer border-0">
                <span>Generate My AI Roadmap</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>

            <Link href="/#features">
              <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/80 dark:bg-white/10 hover:bg-white text-[#111827] dark:text-white font-black text-sm border border-purple-500/20 dark:border-white/20 backdrop-blur-xl flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm">
                <span>Explore Career Paths</span>
              </button>
            </Link>
          </div>

        </motion.div>

      </div>
    </section>
  );
}
