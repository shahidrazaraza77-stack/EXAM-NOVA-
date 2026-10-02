"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles, BrainCircuit, FileText, Code2, Mic, BarChart3,
  Building2, ArrowRight, ShieldCheck, Users, Trophy, Target,
  CheckCircle2, Rocket, Compass, Zap, Layers, Globe, Star, Heart, Eye
} from "lucide-react";

// 8 FLOATING GLASS WIDGETS
const FLOATING_WIDGETS = [
  { text: "Resume Score 95%", color: "border-[#FF2E8B]/40 text-[#FF2E8B]", top: "6%", left: "2%" },
  { text: "ATS Optimized ✓", color: "border-[#00FFC6]/40 text-[#00FFC6]", top: "4%", right: "4%" },
  { text: "Coding Progress 450+", color: "border-[#4F7CFF]/40 text-[#4F7CFF]", top: "30%", left: "-2%" },
  { text: "Interview Ready 🚀", color: "border-[#7C5CFF]/40 text-[#7C5CFF]", top: "28%", right: "-2%" },
  { text: "Job Match 99%", color: "border-[#00D9FF]/40 text-[#00D9FF]", top: "58%", left: "2%" },
  { text: "Placement Score Top 1%", color: "border-[#FF2E8B]/40 text-[#FF2E8B]", top: "56%", right: "4%" },
  { text: "AI Mentor Online 🟢", color: "border-[#00FFC6]/40 text-[#00FFC6]", top: "82%", left: "8%" },
  { text: "Weekly Goal 14 Hrs", color: "border-[#7C5CFF]/40 text-[#7C5CFF]", top: "84%", right: "8%" },
];

// 6 FEATURE CARDS
const FEATURE_CARDS = [
  {
    icon: BrainCircuit,
    title: "🤖 AI Career Mentor",
    desc: "Get personalized career guidance, daily goal recommendations, and skill diagnostics 24/7.",
    color: "#7C5CFF",
    bgColor: "bg-[#7C5CFF]/10 border-[#7C5CFF]/30",
  },
  {
    icon: FileText,
    title: "📄 Smart Resume Builder",
    desc: "Generate ATS-friendly resumes with AI keyword optimization, LaTeX export, and 95+ score targets.",
    color: "#FF2E8B",
    bgColor: "bg-[#FF2E8B]/10 border-[#FF2E8B]/30",
  },
  {
    icon: Code2,
    title: "💻 Coding Practice",
    desc: "Company-wise DSA challenges with 450+ real interview questions, test case runner, and complexity analysis.",
    color: "#4F7CFF",
    bgColor: "bg-[#4F7CFF]/10 border-[#4F7CFF]/30",
  },
  {
    icon: Mic,
    title: "🎤 AI Interview Coach",
    desc: "Practice HR and technical interviews with instant AI speech feedback, sentiment scoring, and transcript logs.",
    color: "#00D9FF",
    bgColor: "bg-[#00D9FF]/10 border-[#00D9FF]/30",
  },
  {
    icon: BarChart3,
    title: "📊 Placement Analytics",
    desc: "Track coding accuracy, aptitude speed, resume score, and live mock interview performance percentile.",
    color: "#00FFC6",
    bgColor: "bg-[#00FFC6]/10 border-[#00FFC6]/30",
  },
  {
    icon: Building2,
    title: "🏢 Company Preparation",
    desc: "Learn company-specific interview patterns, past question papers, and hiring strategy guides for 50+ companies.",
    color: "#7C5CFF",
    bgColor: "bg-[#7C5CFF]/10 border-[#7C5CFF]/30",
  },
];

// 4 STATISTIC CARDS
const STATS_DATA = [
  { value: "50,000+", label: "Students Guided", icon: Users, color: "text-[#7C5CFF]" },
  { value: "500+", label: "Hiring Companies", icon: Building2, color: "text-[#FF2E8B]" },
  { value: "10,000+", label: "Coding Problems", icon: Code2, color: "text-[#00D9FF]" },
  { value: "95%", label: "ATS Resume Success", icon: ShieldCheck, color: "text-[#00FFC6]" },
];

export default function AboutExamNova() {


  return (
    <section 
      id="about" 
      className="py-20 xl:py-28 bg-[#F8FAFF] dark:bg-[#060816] text-[#111827] dark:text-white relative overflow-hidden font-sans select-none transition-colors duration-300"
      style={{
        backgroundImage: `
          radial-gradient(circle at 15% 20%, rgba(124, 92, 255, 0.12) 0%, transparent 45%),
          radial-gradient(circle at 85% 60%, rgba(255, 46, 139, 0.10) 0%, transparent 50%),
          radial-gradient(circle at 50% 90%, rgba(0, 217, 255, 0.10) 0%, transparent 45%)
        `
      }}
    >
      {/* ─── IMMERSIVE FUTURISTIC ATMOSPHERE ─── */}
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
        <div className="absolute -top-[180px] left-[10%] w-[700px] h-[700px] rounded-full bg-[#7C5CFF]/12 dark:bg-[#7C5CFF]/15 blur-[180px] animate-pulse" />
        <div className="absolute top-[40%] right-[-80px] w-[650px] h-[650px] rounded-full bg-[#FF2E8B]/12 dark:bg-[#FF2E8B]/15 blur-[180px] animate-pulse" style={{ animationDelay: "2.5s" }} />
        <div className="absolute -bottom-[180px] left-[25%] w-[700px] h-[700px] rounded-full bg-[#00D9FF]/12 dark:bg-[#00D9FF]/15 blur-[180px]" />

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-tr from-[#7C5CFF] via-[#FF2E8B] to-[#00D9FF] animate-particle-drift"
            style={{
              width: `${(i % 4) + 2}px`,
              height: `${(i % 4) + 2}px`,
              top: `${((i * 17) % 90) + 5}%`,
              left: `${((i * 23) % 90) + 5}%`,
              opacity: 0.2 + ((i % 5) * 0.1),
              animationDuration: `${7 + (i % 6)}s`,
              animationDelay: `${i % 4}s`,
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
            About{" "}
            <span className="bg-gradient-to-r from-[#7C5CFF] via-[#FF2E8B] to-[#00D9FF] bg-clip-text text-transparent">
              ExamNova
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg lg:text-xl text-zinc-600 dark:text-zinc-400 font-semibold leading-relaxed"
          >
            The Future of AI-Powered Placement Preparation.
          </motion.p>
        </div>

        {/* ─── 3D HOLOGRAPHIC SCENE (LEFT) & COMPANION CONTENT (RIGHT) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16 items-center">
          
          {/* LEFT 3D AI SCENE (5 COLS) */}
          <div 
            className="lg:col-span-5 relative flex items-center justify-center min-h-[420px] xl:min-h-[460px] w-full"
          >
            {/* Glowing Volumetric Aura */}
            <div className="absolute w-80 h-80 xl:w-96 xl:h-96 rounded-full bg-gradient-to-tr from-[#7C5CFF]/25 via-[#FF2E8B]/20 to-[#00D9FF]/25 blur-3xl animate-pulse" />

            {/* Concentric Rotating Glass Rings */}
            <div className="absolute w-72 h-72 xl:w-80 xl:h-80 rounded-full border border-purple-500/30 dark:border-white/20 border-dashed pointer-events-none animate-spin-composited" />
            <div className="absolute w-60 h-60 xl:w-64 xl:h-64 rounded-full border border-[#00D9FF]/40 pointer-events-none animate-spin-reverse-composited" />

            {/* NOVA SPHERICAL CORE */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              
              {/* SPEECH BADGE */}
              <div className="glass-pill px-4 py-1.5 rounded-full border border-[#FF2E8B]/40 bg-white/80 dark:bg-white/10 backdrop-blur-xl shadow-2xl flex items-center gap-2 mb-4 text-xs font-black text-[#111827] dark:text-white animate-float-2">
                <div className="w-2 h-2 rounded-full bg-[#00FFC6] animate-ping" />
                <span>NOVA AI Core • Career Companion v4.0</span>
              </div>

              {/* Glowing Multi-layer Plasma Core */}
              <div className="w-36 h-36 xl:w-44 xl:h-44 rounded-full bg-gradient-to-tr from-[#7C5CFF] via-[#FF2E8B] to-[#00D9FF] p-[2px] shadow-[0_0_80px_rgba(124,92,255,0.4)] relative flex items-center justify-center animate-float-mascot">
                <div className="w-full h-full rounded-full bg-white dark:bg-[#060816] backdrop-blur-3xl flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#7C5CFF]/30 via-[#FF2E8B]/30 to-[#00D9FF]/30 animate-spin opacity-80" style={{ animationDuration: '10s' }} />
                  
                  <div className="relative z-10 flex flex-col items-center justify-center text-center p-3">
                    <BrainCircuit className="w-10 h-10 xl:w-12 xl:h-12 text-[#FF2E8B] dark:text-white animate-pulse mb-1" />
                    <span className="text-sm xl:text-base font-black tracking-wider text-[#111827] dark:text-white">NOVA</span>
                    <span className="text-[9px] font-extrabold text-[#00D9FF] uppercase tracking-widest">AI OS</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 8 FLOATING GLASS WIDGETS */}
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

          {/* RIGHT COMPANION CONTENT (7 COLS) */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold border border-purple-500/20">
              <Rocket className="w-3.5 h-3.5" />
              <span>Next-Gen Placement Ecosystem</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-black text-[#111827] dark:text-white tracking-tight leading-tight">
              Your AI Career Companion
            </h3>

            <div className="space-y-4 text-sm sm:text-base text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed">
              <p>
                <strong className="text-[#111827] dark:text-white font-extrabold">ExamNova</strong> is an intelligent placement operating system built to help students prepare smarter, faster, and more effectively.
              </p>
              <p>
                Instead of switching between multiple websites for coding practice, aptitude preparation, resume building, mock interviews, company preparation, and analytics, ExamNova brings everything together into one AI-powered platform.
              </p>
              <p>
                Our AI analyzes your strengths, identifies weak areas, creates personalized learning roadmaps, tracks your progress, and guides you step-by-step until you become placement-ready.
              </p>
              <p className="pt-1">
                Whether your dream company is <span className="font-extrabold text-[#7C5CFF]">Google</span>, <span className="font-extrabold text-[#FF2E8B]">Microsoft</span>, <span className="font-extrabold text-[#00D9FF]">Amazon</span>, Adobe, TCS, Infosys, or any leading organization, ExamNova adapts your preparation to match the hiring process.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              {["Google", "Microsoft", "Amazon", "Adobe", "TCS", "Infosys", "Wipro", "Accenture"].map((comp, cIdx) => (
                <span key={cIdx} className="px-3 py-1 rounded-full bg-purple-500/10 dark:bg-white/[0.05] border border-purple-500/20 dark:border-white/10 text-xs font-bold text-[#111827] dark:text-zinc-300">
                  {comp}
                </span>
              ))}
            </div>

          </motion.div>

        </div>

        {/* ─── 6 FEATURE GRID GLASS CARDS ─── */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-[#111827] dark:text-white">
              All-In-One Placement Features
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-semibold">
              Everything you need to crack your placement drives in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
            {FEATURE_CARDS.map((feat, fIdx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={fIdx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: fIdx * 0.1 }}
                  className="rounded-[24px] bg-white/80 dark:bg-white/[0.06] backdrop-blur-2xl border border-purple-500/15 dark:border-white/15 p-6 shadow-[0_20px_50px_rgba(123,97,255,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:-translate-y-2 hover:border-purple-500/30 dark:hover:border-white/30 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 dark:bg-white/10 border border-purple-500/20 dark:border-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" style={{ color: feat.color }} />
                  </div>

                  <h4 className="text-xl font-black text-[#111827] dark:text-white mb-2 group-hover:text-[#7C5CFF] dark:group-hover:text-[#00D9FF] transition-colors">
                    {feat.title}
                  </h4>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                    {feat.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ─── WHY CHOOSE EXAMNOVA STATS ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {STATS_DATA.map((st, sIdx) => {
            const Icon = st.icon;
            return (
              <motion.div
                key={sIdx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: sIdx * 0.1 }}
                className="rounded-[24px] bg-white/85 dark:bg-white/[0.06] backdrop-blur-2xl border border-purple-500/20 dark:border-white/15 p-6 text-center shadow-lg relative overflow-hidden group hover:scale-105 transition-transform"
              >
                <Icon className={`w-8 h-8 mx-auto mb-2 ${st.color} group-hover:scale-110 transition-transform`} />
                <span className="text-3xl sm:text-4xl font-black text-[#111827] dark:text-white block tracking-tight">
                  {st.value}
                </span>
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mt-1">
                  {st.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* ─── MISSION & VISION CARDS ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8">
          
          {/* OUR MISSION */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-[28px] bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-transparent dark:from-[#7C5CFF]/20 dark:via-[#FF2E8B]/15 dark:to-transparent border border-purple-500/20 dark:border-white/15 p-6 xl:p-8 backdrop-blur-2xl shadow-xl space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#7C5CFF]/20 border border-[#7C5CFF]/40 flex items-center justify-center text-[#7C5CFF]">
                <Target className="w-5 h-5" />
              </div>
              <h4 className="text-2xl font-black text-[#111827] dark:text-white">Our Mission</h4>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed">
              To empower every student with AI-driven learning, helping them confidently prepare for placements, improve their skills, and secure their dream careers regardless of their background.
            </p>
          </motion.div>

          {/* OUR VISION */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-[28px] bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-transparent dark:from-[#00D9FF]/20 dark:via-[#4F7CFF]/15 dark:to-transparent border border-cyan-500/20 dark:border-white/15 p-6 xl:p-8 backdrop-blur-2xl shadow-xl space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#00D9FF]/20 border border-[#00D9FF]/40 flex items-center justify-center text-[#00D9FF]">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="text-2xl font-black text-[#111827] dark:text-white">Our Vision</h4>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed">
              To become the world's most intelligent AI placement platform where every student has access to personalized career guidance, smart preparation tools, and industry-level interview training.
            </p>
          </motion.div>

        </div>

        {/* ─── CALL TO ACTION (CTA) ─── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[32px] bg-gradient-to-r from-[#7C5CFF]/15 via-[#FF2E8B]/15 to-[#00D9FF]/15 dark:from-[#7C5CFF]/25 dark:via-[#FF2E8B]/25 dark:to-[#00D9FF]/25 border border-purple-500/30 dark:border-white/20 p-8 sm:p-12 text-center space-y-6 relative overflow-hidden shadow-2xl"
        >
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h3 className="text-3xl sm:text-4xl xl:text-5xl font-black text-[#111827] dark:text-white tracking-tight leading-tight">
              Ready to Transform Your Career?
            </h3>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 font-medium">
              Join thousands of students already preparing smarter with AI.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 pt-2">
            <Link href="/register">
              <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#7C5CFF] via-[#FF2E8B] to-[#00D9FF] hover:opacity-95 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-[#7C5CFF]/30 flex items-center justify-center gap-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer border-0">
                <span>🚀 Get Started Free</span>
              </button>
            </Link>

            <Link href="/#roadmap">
              <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/80 dark:bg-white/10 hover:bg-white text-[#111827] dark:text-white font-black text-sm border border-purple-500/20 dark:border-white/20 backdrop-blur-xl flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm">
                <span>📅 Explore Roadmap</span>
              </button>
            </Link>
          </div>

        </motion.div>

      </div>
    </section>
  );
}
