"use client";

import React from "react";
import Link from "next/link";
import { 
  User, FileText, BookOpen, Mic, Trophy, 
  ArrowRight, Sparkles, CheckCircle2, ChevronRight, Zap
} from "lucide-react";
import { motion } from "framer-motion";

interface Step {
  icon: any;
  title: string;
  description: string;
  badge: string;
  color: string;
  visual: React.ReactNode;
}

const steps: Step[] = [
  {
    icon: User,
    title: "Create Your Profile",
    description: "Sign up, select your target role, target company, and career goals.",
    badge: "Step 1",
    color: "from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30",
    visual: (
      <div className="bg-white/80 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-3 shadow-xl max-w-[260px] mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-rose-600 dark:from-indigo-500 dark:to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-inner">SR</div>
          <div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Shahid Raza</h4>
            <p className="text-[9px] text-zinc-500">Student Profile Setup</p>
          </div>
        </div>
        <div className="space-y-1.5 pt-1 border-t border-zinc-200 dark:border-zinc-800/60">
          <div className="flex justify-between text-[9px] text-zinc-600 dark:text-zinc-400">
            <span>Target Role:</span>
            <span className="font-semibold text-zinc-900 dark:text-white">Software Engineer</span>
          </div>
          <div className="flex justify-between text-[9px] text-zinc-600 dark:text-zinc-400">
            <span>Target Company:</span>
            <span className="font-semibold text-pink-500 dark:text-indigo-400">Google</span>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: FileText,
    title: "Build an ATS-Friendly Resume",
    description: "Upload or create your resume and get AI-powered feedback with ATS scoring.",
    badge: "Step 2",
    color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
    visual: (
      <div className="bg-white/80 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-3 shadow-xl max-w-[260px] mx-auto flex items-center justify-between gap-3">
        <div className="space-y-1">
          <span className="text-[8px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider block">ATS ANALYZER</span>
          <h4 className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">Resume_v2.pdf</h4>
          <p className="text-[9px] text-zinc-500">Feedback: 3 improvements</p>
        </div>
        <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 flex items-center justify-center bg-emerald-50 dark:bg-emerald-500/5 shrink-0">
          <span className="text-xs font-black text-emerald-500 dark:text-emerald-400">92%</span>
        </div>
      </div>
    )
  },
  {
    icon: BookOpen,
    title: "Practice Smartly",
    description: "Prepare aptitude, coding, technical, and HR questions with structured learning paths.",
    badge: "Step 3",
    color: "from-purple-500/20 to-violet-500/20 text-purple-400 border-purple-500/30",
    visual: (
      <div className="bg-white/80 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-3 shadow-xl max-w-[260px] mx-auto">
        <div className="space-y-2.5">
          <div>
            <div className="flex justify-between text-[9px] text-zinc-600 dark:text-zinc-400 mb-1">
              <span>Aptitude Mastery</span>
              <span className="text-pink-500 dark:text-indigo-400">88%</span>
            </div>
            <div className="h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-pink-500 dark:bg-indigo-500 w-[88%] rounded-full" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[9px] text-zinc-600 dark:text-zinc-400 mb-1">
              <span>Coding Challenges</span>
              <span className="text-purple-500 dark:text-purple-400">81%</span>
            </div>
            <div className="h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 dark:bg-purple-500 w-[81%] rounded-full" />
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: Mic,
    title: "Take AI Mock Interviews",
    description: "Practice interviews and receive personalized feedback to improve performance.",
    badge: "Step 4",
    color: "from-pink-500/20 to-rose-500/20 text-pink-400 border-pink-500/30",
    visual: (
      <div className="bg-white/80 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-3 shadow-xl max-w-[260px] mx-auto">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-1.5 mb-1">
          <span className="text-[8px] font-bold text-pink-500 dark:text-pink-400 uppercase tracking-wider">AI Speech Review</span>
          <span className="text-[9px] text-emerald-500 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded">Excellent</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-zinc-50 dark:bg-zinc-850/50 p-1.5 rounded-lg border border-zinc-100 dark:border-zinc-800/30">
            <span className="block text-[8px] text-zinc-500">Clarity</span>
            <span className="text-[10px] font-bold text-zinc-900 dark:text-white">85%</span>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-850/50 p-1.5 rounded-lg border border-zinc-100 dark:border-zinc-800/30">
            <span className="block text-[8px] text-zinc-500">Pacing</span>
            <span className="text-[10px] font-bold text-zinc-900 dark:text-white">130 WPM</span>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: Trophy,
    title: "Become Placement Ready",
    description: "Track readiness scores, company-specific preparation, and mock placement results.",
    badge: "Step 5",
    color: "from-yellow-500/20 to-amber-500/20 text-yellow-400 border-yellow-500/30",
    visual: (
      <div className="bg-white/80 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-3 shadow-xl max-w-[260px] mx-auto flex items-center justify-between gap-3">
        <div className="space-y-1">
          <span className="text-[8px] font-bold text-yellow-500 dark:text-yellow-400 uppercase tracking-wider block">PREPARATION COMPLETE</span>
          <h4 className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">Ready for TCS drive</h4>
          <p className="text-[9px] text-zinc-500">Roadmap: 100% finished</p>
        </div>
        <div className="w-12 h-12 rounded-full border-2 border-yellow-500/20 flex items-center justify-center bg-yellow-50 dark:bg-yellow-500/5 shrink-0">
          <span className="text-xs font-black text-yellow-500 dark:text-yellow-400">86%</span>
        </div>
      </div>
    )
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-28 bg-zinc-50 dark:bg-[#030014] text-zinc-900 dark:text-white overflow-hidden border-t border-zinc-200 dark:border-zinc-900/60">
      <style>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(99, 102, 241, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.04) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>

      {/* Grid Background overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

      {/* Decorative gradient blur */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-50/80 dark:bg-zinc-900/60 border border-pink-200 dark:border-indigo-500/20 backdrop-blur-md text-pink-700 dark:text-zinc-350 text-xs font-semibold tracking-wide shadow-[0_0_15px_rgba(219,39,119,0.05)] dark:shadow-[0_0_15px_rgba(99,102,241,0.05)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-500 dark:text-purple-400" />
            ⚡ Simple Process
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5.5xl font-black tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent leading-tight"
          >
            Your Placement Journey in 5 Simple Steps
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          >
            ExamNova guides you from preparation to placement with AI-powered learning and personalized roadmaps.
          </motion.p>
        </div>

        {/* Timeline Path */}
        <div className="relative max-w-5xl mx-auto">
          {/* Vertical line down the middle on desktop */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-4 bottom-4 w-[1px] bg-gradient-to-b from-indigo-500/30 via-purple-500/30 to-indigo-500/10 hidden md:block" />

          <div className="space-y-16 md:space-y-24">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isEven = idx % 2 === 0;

              return (
                <div
                  key={idx}
                  className={`flex flex-col md:flex-row items-center justify-between relative ${
                    isEven ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Timeline node center indicator on desktop */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-2xl z-10 hidden md:flex hover:border-pink-500/50 dark:hover:border-indigo-500/50 hover:scale-105 transition-all duration-300">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center border border-black/5 dark:border-white/5`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                  </div>

                  {/* Text Card (Left/Right side) */}
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                    className="w-full md:w-[44%] relative rounded-2xl p-[1px] bg-gradient-to-br from-zinc-200/40 to-zinc-300/40 dark:from-zinc-850/40 dark:to-zinc-900/40 shadow-xl"
                  >
                    <div className="bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md p-6 rounded-2xl border border-black/5 dark:border-white/5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center border border-black/5 dark:border-white/5 md:hidden`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-pink-500 dark:text-indigo-400 uppercase tracking-widest block leading-none mb-1">{step.badge}</span>
                          <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">{step.title}</h3>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{step.description}</p>
                    </div>
                  </motion.div>

                  {/* Illustration component (Opposite side) */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="w-full md:w-[44%] flex justify-center py-4"
                  >
                    <div className="w-full group">
                      <motion.div
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.3 }}
                      >
                        {step.visual}
                      </motion.div>
                    </div>
                  </motion.div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Highlight Dashboard Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative mt-28 max-w-3xl mx-auto rounded-3xl p-[1.5px] bg-gradient-to-br from-pink-500/20 via-rose-500/20 to-pink-500/20 dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-blue-500/20 shadow-2xl"
        >
          <div className="relative rounded-3xl bg-white/90 dark:bg-zinc-950/80 backdrop-blur-xl px-6 py-8 md:p-10 border border-zinc-200 dark:border-white/5 overflow-hidden">
            {/* Header info */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800/80">
              <div>
                <h4 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-4.5 h-4.5 text-pink-500 dark:text-indigo-400" />
                  Placement Readiness Scorecard
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-550">Simulated student ready index based on ExamNova standards.</p>
              </div>
              <div className="flex items-center gap-3 bg-pink-50 dark:bg-indigo-500/10 border border-pink-200 dark:border-indigo-500/20 px-4 py-2 rounded-2xl">
                <span className="text-2xs font-extrabold text-pink-500 dark:text-indigo-400 uppercase tracking-widest">Overall Readiness</span>
                <span className="text-lg font-black text-zinc-900 dark:text-white">86%</span>
              </div>
            </div>

            {/* Stats list */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
              {[
                { name: "Resume ATS Match", value: 92, color: "from-blue-500 to-indigo-500" },
                { name: "Aptitude Score", value: 88, color: "from-purple-500 to-violet-500" },
                { name: "Coding Progress", value: 81, color: "from-emerald-500 to-teal-500" },
                { name: "Interview Readiness", value: 84, color: "from-pink-500 to-rose-500" }
              ].map((stat, i) => (
                <div key={i} className="space-y-2 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-900 p-4 rounded-xl">
                  <span className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider leading-none mb-1">{stat.name}</span>
                  <div className="flex justify-between items-baseline">
                     <span className="text-lg font-black text-zinc-900 dark:text-white">{stat.value}%</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-450" />
                  </div>
                  <div className="h-1 bg-zinc-200 dark:bg-zinc-850 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${stat.color} rounded-full`} style={{ width: `${stat.value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Action button */}
            <div className="mt-8 flex justify-center">
              <Link href="/register" className="group">
                <motion.div
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 dark:from-purple-600 dark:via-indigo-600 dark:to-blue-600 rounded-xl opacity-75 group-hover:opacity-100 blur transition-opacity duration-300 shadow-[0_0_15px_rgba(219,39,119,0.2)] dark:shadow-[0_0_15px_rgba(99,102,241,0.2)]" />
                  <button className="relative flex items-center gap-2 px-8 py-3.5 rounded-xl bg-aurora-primary text-white font-bold text-sm w-full justify-center border border-aurora-primary/20 cursor-pointer">
                    Start Your Placement Journey
                    <ChevronRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              </Link>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
