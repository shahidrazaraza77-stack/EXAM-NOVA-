"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, FileText, Mic, BrainCircuit, BarChart3, 
  ArrowRight, ShieldCheck, CheckCircle2, Cpu, Zap, Building2, Code2, Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AIFeaturesShowcase() {
  const [activeTab, setActiveTab] = useState<"resume" | "interview" | "analytics">("resume");

  return (
    <section id="roadmap" className="py-14 bg-examnova-pastel relative overflow-hidden">
      
      {/* Soft Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/3 w-[550px] h-[550px] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[550px] h-[550px] bg-pink-500/10 dark:bg-pink-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-zinc-900/80 border border-purple-500/20 shadow-md backdrop-blur-md"
          >
            <Cpu className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent uppercase tracking-wider">
              Deep-Dive Platform Architecture
            </span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight"
          >
            How ExamNova Guarantees Your <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Placement Success
            </span>
          </motion.h2>
        </div>

        {/* FEATURE 1: ALTERNATE LAYOUT (LEFT TEXT, RIGHT 3D ILLUSTRATION CARD) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-600 text-xs font-bold border border-pink-500/20">
              <FileText className="w-3.5 h-3.5" />
              <span>01 • AI Resume & ATS Engine</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Bypass ATS Filters With Precision Score Optimization
            </h3>

            <p className="text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Our advanced AI parser compares your resume against target company JD databases in real-time. Uncover missing tech stack keywords, action verbs, and structural flaws before recruiters review your profile.
            </p>

            <ul className="space-y-3 font-semibold text-sm text-zinc-700 dark:text-zinc-200">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Instant ATS match scoring (90%+ target accuracy)</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>One-click AI bullet point enhancer for LaTeX & PDF</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Role-specific keyword recommendation matrix</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link href="/register">
                <button className="flex items-center gap-2 text-sm font-bold text-pink-600 dark:text-pink-400 hover:text-purple-600 transition-colors group">
                  <span>Try AI Resume Analyzer</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Right 3D Illustration Graphic */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6"
          >
            <div className="glass-card-saas p-6 sm:p-8 rounded-[32px] border border-white/80 dark:border-white/10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-pink-500/20 to-transparent rounded-bl-full pointer-events-none" />
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-zinc-400 font-bold block">Resume Audit</span>
                      <span className="text-sm font-extrabold text-zinc-900 dark:text-white">Software_Engineer_Resume.pdf</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-black">
                    94/100 ATS Score
                  </span>
                </div>

                {/* 3D Dashboard Image Element */}
                <div className="relative rounded-2xl overflow-hidden border border-purple-500/20 shadow-lg group-hover:scale-[1.02] transition-transform duration-300">
                  <img src="/hero-3d-dashboard.png" alt="Resume ATS Analytics Mockup" className="w-full h-auto object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent flex items-end p-4">
                    <div className="text-xs text-white space-y-1">
                      <p className="font-bold">✨ AI Suggested Keywords Added:</p>
                      <p className="text-pink-300 font-mono text-[11px]">System Architecture • Microservices • Docker • Redis</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

        </div>

        {/* FEATURE 2: ALTERNATE LAYOUT (LEFT 3D ILLUSTRATION CARD, RIGHT TEXT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left 3D Illustration Graphic */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 order-2 lg:order-1"
          >
            <div className="glass-card-saas p-6 sm:p-8 rounded-[32px] border border-white/80 dark:border-white/10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-purple-500/20 to-transparent rounded-br-full pointer-events-none" />

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                      <Mic className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-zinc-400 font-bold block">Live Mock Session</span>
                      <span className="text-sm font-extrabold text-zinc-900 dark:text-white">Amazon System Design Interview</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20 text-xs font-black animate-pulse">
                    Live Recording
                  </span>
                </div>

                {/* 3D AI Interview Visual Image Element */}
                <div className="relative rounded-2xl overflow-hidden border border-purple-500/20 shadow-lg group-hover:scale-[1.02] transition-transform duration-300">
                  <img src="/roadmap-3d-ai-interview.png" alt="AI Voice & Video Interview Coach Visual" className="w-full h-[220px] object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent flex items-end p-4">
                    <div className="text-xs text-white space-y-1">
                      <p className="font-bold flex items-center gap-1.5 text-emerald-400">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Speech & Confidence Score: 98%</span>
                      </p>
                      <p className="text-zinc-300 font-mono text-[11px]">System Architecture • Microservices • Distributed Cache</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

          {/* Right Text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 space-y-6 order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 text-xs font-bold border border-purple-500/20">
              <Mic className="w-3.5 h-3.5" />
              <span>02 • AI Voice & Video Interview Coach</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Master Technical & HR Rounds With Realistic AI Simulation
            </h3>

            <p className="text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Eliminate interview anxiety. Practice with our adaptive AI interviewer that asks follow-up questions, evaluates speech confidence, checks system design architecture, and provides instant audio-visual scorecards.
            </p>

            <ul className="space-y-3 font-semibold text-sm text-zinc-700 dark:text-zinc-200">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Company-tailored question sets (Google, Amazon, TCS, Microsoft)</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Speech pace, filler word, and confidence metric tracking</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Detailed transcript reports with ideal sample answers</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link href="/register">
                <button className="flex items-center gap-2 text-sm font-bold text-purple-600 dark:text-purple-400 hover:text-pink-600 transition-colors group">
                  <span>Start Mock Interview</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </motion.div>

        </div>

        {/* FEATURE 3: ALTERNATE LAYOUT (LEFT TEXT, RIGHT 3D ILLUSTRATION CARD) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 text-xs font-bold border border-indigo-500/20">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>03 • Placement Analytics & Company Hub</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Track Your Readiness & Crack Company Specific Papers
            </h3>

            <p className="text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Gain complete visibility into your preparation velocity. Analyze topic-wise accuracy, speed metrics, and access authentic previous year placement papers for over 50 top tech companies.
            </p>

            <ul className="space-y-3 font-semibold text-sm text-zinc-700 dark:text-zinc-200">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Company-wise aptitude & coding pattern archives</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Real-time readiness percentile calculation</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Automated weak topic remediation roadmaps</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link href="/register">
                <button className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-pink-600 transition-colors group">
                  <span>Explore Company Hub</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Right Graphic */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6"
          >
            <div className="glass-card-saas p-6 sm:p-8 rounded-[32px] border border-white/80 dark:border-white/10 shadow-2xl relative overflow-hidden group">
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-indigo-500/20 to-transparent rounded-tl-full pointer-events-none" />

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-zinc-400 font-bold block">Placement Index</span>
                      <span className="text-sm font-extrabold text-zinc-900 dark:text-white">Top 2% Candidate Band</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-xs font-black">
                    Ready for Drive
                  </span>
                </div>

                {/* 3D Coding & Placement Image Element */}
                <div className="relative rounded-2xl overflow-hidden border border-indigo-500/20 shadow-lg group-hover:scale-[1.02] transition-transform duration-300">
                  <img src="/roadmap-3d-coding.png" alt="Coding Challenges & Company Placement Hub Visual" className="w-full h-[200px] object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent flex items-end p-4">
                    <div className="text-xs text-white space-y-1">
                      <p className="font-bold flex items-center gap-1.5 text-indigo-300">
                        <Code2 className="w-3.5 h-3.5 text-pink-400" />
                        <span>450+ Solved • All Test Cases Passed (100%)</span>
                      </p>
                      <p className="text-zinc-300 font-mono text-[11px]">Google Match: 89% • Amazon Match: 94% • Microsoft Match: 92%</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

        </div>

        {/* ─── INTERACTIVE AI PLACEMENT ROADMAP SECTION ─── */}
        <div className="pt-12 border-t border-purple-500/10 dark:border-white/10 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-bold border border-pink-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step-by-Step AI Placement Roadmap</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Your Guided Journey From Day 1 To Offer Letter
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              ExamNova's AI engine creates a personalized 8-week placement roadmap tailored to your target companies.
            </p>
          </div>

          {/* 4 ROADMAP PHASES CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            
            {[
              {
                phase: "Phase 01",
                title: "ATS Resume Diagnostic",
                desc: "Instant ATS score check, role keyword alignment, and LaTeX PDF export.",
                icon: FileText,
                time: "Week 1",
                badge: "95+ Target Score",
                gradient: "from-pink-500 to-rose-500",
                borderColor: "border-pink-500/30"
              },
              {
                phase: "Phase 02",
                title: "Technical & Aptitude Mastery",
                desc: "Topic-wise DSA, System Design, SQL, and 10,000+ practice questions.",
                icon: Code2,
                time: "Weeks 2-4",
                badge: "Domain Certified",
                gradient: "from-purple-500 to-indigo-500",
                borderColor: "border-purple-500/30"
              },
              {
                phase: "Phase 03",
                title: "AI Interview Simulation",
                desc: "Real-time voice sentiment, confidence score, and technical drill downs.",
                icon: Mic,
                time: "Weeks 5-6",
                badge: "Interview Ready",
                gradient: "from-indigo-500 to-blue-500",
                borderColor: "border-indigo-500/30"
              },
              {
                phase: "Phase 04",
                title: "Placement Drive & Offer",
                desc: "Auto-matched company drives, recruiter referral alerts, and offer negotiation.",
                icon: Award,
                time: "Weeks 7-8",
                badge: "Dream Offer 🚀",
                gradient: "from-emerald-500 to-teal-500",
                borderColor: "border-emerald-500/30"
              }
            ].map((step, sIdx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={sIdx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: sIdx * 0.15 }}
                  className={`glass-card-saas p-6 rounded-[24px] border ${step.borderColor} shadow-xl relative overflow-hidden group hover:-translate-y-1.5 transition-transform duration-300`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-gradient-to-r ${step.gradient} text-white shadow-sm`}>
                      {step.phase}
                    </span>
                    <span className="text-xs font-bold text-zinc-400">
                      {step.time}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-purple-500/15 shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>

                  <h4 className="text-lg font-black text-zinc-900 dark:text-white mb-2">
                    {step.title}
                  </h4>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                    {step.desc}
                  </p>

                  <div className="pt-3 border-t border-purple-500/10 flex items-center justify-between text-[11px] font-extrabold text-purple-600 dark:text-purple-300">
                    <span>{step.badge}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                </motion.div>
              );
            })}

          </div>

        </div>

      </div>
    </section>
  );
}
