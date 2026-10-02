"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Building2, ChevronRight, Award, Zap, CheckCircle2, 
  Sparkles, Calendar, BookOpen, Brain, Code2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CompanyData {
  name: string;
  difficulty: "Advanced" | "Medium" | "Basic";
  readiness: number;
  hiringProcess: string[];
  roadmap: {
    week: string;
    topics: string[];
  }[];
  recommendations: string[];
}

const companiesData: Record<string, CompanyData> = {
  Google: {
    name: "Google",
    difficulty: "Advanced",
    readiness: 65,
    hiringProcess: ["Coding", "Technical Interview", "HR Interview"],
    roadmap: [
      { week: "Week 1", topics: ["Graphs", "Dynamic Programming", "Advanced Aptitude"] },
      { week: "Week 2", topics: ["Trees", "System Design", "System Performance"] },
      { week: "Week 3", topics: ["Advanced DSA", "Live Coding Simulations"] },
      { week: "Week 4", topics: ["Google Mock Drive", "Panel Interview Preparation"] }
    ],
    recommendations: ["Solve 15 Graph Problems", "Complete System Design Module", "Take 2 Google Mock Tests"]
  },
  Microsoft: {
    name: "Microsoft",
    difficulty: "Advanced",
    readiness: 72,
    hiringProcess: ["Aptitude", "Coding", "Technical Interview", "HR Interview"],
    roadmap: [
      { week: "Week 1", topics: ["Trees & Graphs", "OS Basics", "Quantitative Aptitude"] },
      { week: "Week 2", topics: ["Linked Lists", "System Performance", "DBMS Normalization"] },
      { week: "Week 3", topics: ["Sorting & Searching", "System Design Basics"] },
      { week: "Week 4", topics: ["Microsoft Mock Drive", "Behavioral STAR Practice"] }
    ],
    recommendations: ["Solve 10 String/Tree Problems", "Complete OS Module", "Attempt 1 Tech Interview"]
  },
  Amazon: {
    name: "Amazon",
    difficulty: "Advanced",
    readiness: 78,
    hiringProcess: ["Aptitude", "Coding", "Technical Interview", "HR Interview"],
    roadmap: [
      { week: "Week 1", topics: ["Arrays", "Strings", "Aptitude Basics"] },
      { week: "Week 2", topics: ["Linked List", "OOP", "Logical Reasoning"] },
      { week: "Week 3", topics: ["Trees", "DBMS", "Technical Interview Prep"] },
      { week: "Week 4", topics: ["Mock Interviews", "Mock Placement Process"] }
    ],
    recommendations: ["Solve 10 Tree Problems", "Complete DBMS Module", "Attempt 1 Mock Interview"]
  },
  Accenture: {
    name: "Accenture",
    difficulty: "Medium",
    readiness: 84,
    hiringProcess: ["Aptitude", "Coding", "Technical Interview", "HR Interview"],
    roadmap: [
      { week: "Week 1", topics: ["Quantitative Aptitude", "Logical Reasoning", "Pseudo-code"] },
      { week: "Week 2", topics: ["Arrays & Strings", "DBMS Basics", "Technical MCQs"] },
      { week: "Week 3", topics: ["Communication Modules", "OOP Principles"] },
      { week: "Week 4", topics: ["Accenture Mock Drive", "HR Panel Interview Prep"] }
    ],
    recommendations: ["Complete Pseudo-code Practice", "Practice 5 Basic Coding Problems", "Complete HR Mock"]
  },
  TCS: {
    name: "TCS",
    difficulty: "Medium",
    readiness: 90,
    hiringProcess: ["Aptitude", "Coding", "Technical Interview", "HR Interview"],
    roadmap: [
      { week: "Week 1", topics: ["TCS NQT Aptitude", "Verbal Skills", "Pseudo-code"] },
      { week: "Week 2", topics: ["Basic Arrays", "Data Structures", "SQL Queries"] },
      { week: "Week 3", topics: ["Core Technical Topics", "Mock MCQs"] },
      { week: "Week 4", topics: ["TCS Mock Drive", "Interview Coach Simulation"] }
    ],
    recommendations: ["Review SQL Join Queries", "Attempt 2 TCS Mock Drives", "Practice Verbal Aptitude"]
  },
  Infosys: {
    name: "Infosys",
    difficulty: "Medium",
    readiness: 86,
    hiringProcess: ["Aptitude", "Coding", "Technical Interview", "HR Interview"],
    roadmap: [
      { week: "Week 1", topics: ["Mathematical Reasoning", "Puzzle Solving", "Verbal Ability"] },
      { week: "Week 2", topics: ["Pseudo-code Parsing", "DBMS Fundamentals", "Basic DSA"] },
      { week: "Week 3", topics: ["OOP Concept Mapping", "Python/Java Review"] },
      { week: "Week 4", topics: ["Infosys Mock Drive", "Behavioral Interview Prep"] }
    ],
    recommendations: ["Practice 10 Puzzles", "Review Java/Python OOP", "Complete 1 Aptitude Mock"]
  },
  Wipro: {
    name: "Wipro",
    difficulty: "Medium",
    readiness: 88,
    hiringProcess: ["Aptitude", "Coding", "Technical Interview", "HR Interview"],
    roadmap: [
      { week: "Week 1", topics: ["Quantitative Aptitude", "English Comprehension", "Logic"] },
      { week: "Week 2", topics: ["Basic Coding", "SQL Joins", "OS"] },
      { week: "Week 3", topics: ["Tech MCQs", "Code Debugging Practice"] },
      { week: "Week 4", topics: ["Wipro Mock Drive", "HR Fit Evaluation"] }
    ],
    recommendations: ["Complete Code Debugging Module", "Solve 5 Array Problems", "Attempt Wipro Mock"]
  },
  Capgemini: {
    name: "Capgemini",
    difficulty: "Medium",
    readiness: 82,
    hiringProcess: ["Aptitude", "Technical Interview", "HR Interview"],
    roadmap: [
      { week: "Week 1", topics: ["Game-Based Aptitude", "Behavioral Profiling"] },
      { week: "Week 2", topics: ["English Communication", "Technical MCQs", "OOP"] },
      { week: "Week 3", topics: ["Database & SQL", "Basic Data Structures"] },
      { week: "Week 4", topics: ["Capgemini Mock Drive", "Tech & HR Panel Mock"] }
    ],
    recommendations: ["Practice Game-Based Aptitude", "Complete Database Module", "Practice STAR Responses"]
  },
  Cognizant: {
    name: "Cognizant",
    difficulty: "Medium",
    readiness: 85,
    hiringProcess: ["Aptitude", "Coding", "Technical Interview", "HR Interview"],
    roadmap: [
      { week: "Week 1", topics: ["Quantitative Aptitude", "Logical Reasoning", "Verbal Ability"] },
      { week: "Week 2", topics: ["Coding Basics", "Database Schema Basics", "SQL"] },
      { week: "Week 3", topics: ["Web Tech Basics", "OOP Principles", "Pseudo-code"] },
      { week: "Week 4", topics: ["Cognizant Mock Drive", "Mock HR Panel Coach"] }
    ],
    recommendations: ["Solve 10 Basic DSA Problems", "Complete Web Tech Module", "Run 1 Mock Placement"]
  }
};

const companyList = Object.keys(companiesData);

export default function CompanyHubSection() {
  const [selectedCompany, setSelectedCompany] = useState<string>("Amazon");
  const activeData = companiesData[selectedCompany];

  return (
    <section id="company-prep" className="relative py-28 bg-white dark:bg-[#030014] text-zinc-900 dark:text-white overflow-hidden border-t border-zinc-200 dark:border-zinc-900/60">
      <style>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(99, 102, 241, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.04) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

      {/* Glow lights */}
      <div className="absolute top-1/3 left-0 w-[450px] h-[450px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[450px] h-[450px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

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
            <Building2 className="w-3.5 h-3.5 text-pink-500 dark:text-purple-400" />
            🏢 Company-Specific Preparation
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5.5xl font-black tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent leading-tight"
          >
            Prepare for Your Dream Company
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          >
            Follow personalized preparation roadmaps designed for top companies and placement drives.
          </motion.p>
        </div>

        {/* Two-Column Interactive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Company Cards List (5/12) */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 max-h-[640px] overflow-y-auto pr-2 custom-scrollbar">
            {companyList.map((cName) => {
              const comp = companiesData[cName];
              const isSelected = selectedCompany === cName;
              return (
                <motion.div
                  key={cName}
                  onClick={() => setSelectedCompany(cName)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`relative rounded-xl p-[1px] cursor-pointer transition-all duration-300 ${
                    isSelected 
                      ? "bg-gradient-to-r from-pink-500 to-rose-500 dark:from-indigo-500 dark:to-purple-500 shadow-lg shadow-pink-500/10 dark:shadow-indigo-500/10" 
                      : "bg-gradient-to-br from-zinc-200/40 to-zinc-300/40 dark:from-zinc-800/40 dark:to-zinc-900/40 hover:from-zinc-300/60 hover:to-zinc-400/60 dark:hover:from-zinc-700/60 dark:hover:to-zinc-800/60"
                  }`}
                >
                  <div className={`rounded-xl p-4 flex justify-between items-center gap-4 ${
                    isSelected ? "bg-white/90 dark:bg-zinc-900/90" : "bg-white/70 dark:bg-zinc-950/70"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-zinc-50 dark:bg-zinc-900 border ${
                        isSelected ? "border-pink-500/30 dark:border-indigo-500/30" : "border-zinc-200 dark:border-zinc-800"
                      } flex items-center justify-center font-black text-zinc-900 dark:text-white text-xs`}>
                        {comp.name.substring(0, 2)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">{comp.name}</h4>
                        <span className={`text-[9px] font-semibold uppercase tracking-wider ${
                          comp.difficulty === "Advanced" ? "text-red-500 dark:text-red-400" : "text-amber-500 dark:text-amber-400"
                        }`}>
                          {comp.difficulty}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="text-right">
                        <span className="block text-[8px] text-zinc-500 dark:text-zinc-550 uppercase tracking-widest leading-none mb-0.5">Readiness</span>
                        <span className="text-xs font-black text-zinc-900 dark:text-white">{comp.readiness}%</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${
                        isSelected ? "text-pink-500 dark:text-indigo-400 translate-x-0.5" : "text-zinc-400 dark:text-zinc-650"
                      }`} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right Column: Roadmap Preview & Recommendation (7/12) */}
          <div className="lg:col-span-7 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCompany}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Roadmap Timeline Card */}
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md p-6 relative overflow-hidden shadow-xl">
                  {/* Backdrop glow */}
                  <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-tr from-transparent to-pink-500/5 dark:to-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-900 mb-6">
                    <div>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-pink-500 dark:text-indigo-400" />
                        {activeData.name} Preparation Roadmap
                      </h3>
                      <p className="text-[10px] text-zinc-500">Weekly preparation plan mapping topics to drives.</p>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-wider">
                      {activeData.difficulty} Drive
                    </span>
                  </div>

                  {/* Horizontal/Vertical Connected Timeline */}
                  <div className="relative pl-6 space-y-6">
                    {/* Timeline line */}
                    <div className="absolute top-1 bottom-1 left-2 w-[1.5px] bg-gradient-to-b from-pink-500/40 via-rose-500/40 dark:from-indigo-500/40 dark:via-purple-500/40 to-transparent" />

                    {activeData.roadmap.map((wData, index) => (
                      <div key={index} className="relative flex flex-col sm:flex-row sm:items-start gap-2.5 sm:gap-6">
                        {/* Circle node indicator */}
                        <div className="absolute -left-[23px] top-1 z-10 w-[15px] h-[15px] rounded-full border border-pink-500 dark:border-indigo-500 bg-white dark:bg-zinc-950 flex items-center justify-center shadow-lg">
                          <div className="w-1.5 h-1.5 rounded-full bg-pink-500 dark:bg-indigo-400" />
                        </div>

                        <span className="text-2xs font-extrabold text-pink-500 dark:text-indigo-400 uppercase tracking-widest block w-14 shrink-0 pt-0.5 leading-none">
                          {wData.week}
                        </span>

                        <div className="flex-1 space-y-1.5">
                          <div className="flex flex-wrap gap-1.5">
                            {wData.topics.map((tName, tIdx) => (
                              <span key={tIdx} className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 px-2.5 py-1 rounded-lg">
                                {tName}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Recommendation Card */}
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md p-6 relative overflow-hidden shadow-xl">
                  {/* Backdrop glow */}
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-transparent to-pink-500/5 dark:to-purple-500/5 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-900 mb-5">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-pink-500 dark:text-purple-400 animate-pulse" />
                        Recommended for You
                      </h4>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-550">Personalized actions based on target readiness.</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">Current Readiness:</span>
                      <span className="text-xs font-black text-pink-500 dark:text-indigo-400">{activeData.readiness}%</span>
                    </div>
                  </div>

                  {/* Actions checklist */}
                  <div className="space-y-3">
                    {activeData.recommendations.map((rec, rIdx) => (
                      <div key={rIdx} className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-900/80 rounded-xl">
                        <div className="w-5 h-5 rounded-md bg-pink-500/10 dark:bg-purple-500/10 border border-pink-500/20 dark:border-purple-500/20 flex items-center justify-center text-[9px] font-bold text-pink-500 dark:text-purple-400">
                          {rIdx + 1}
                        </div>
                        <span className="text-xs text-zinc-700 dark:text-zinc-350 font-semibold">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

        </div>

        {/* Bottom Stats Showcase Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 pt-8 border-t border-zinc-200 dark:border-zinc-800/60"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: "50+ Companies", icon: Building2 },
              { label: "5000+ Questions", icon: BookOpen },
              { label: "100+ Roadmaps", icon: Award },
              { label: "AI Recommendations", icon: Zap }
            ].map((stat, sIdx) => {
              const Icon = stat.icon;
              return (
                <div key={sIdx} className="flex items-center gap-3 justify-center">
                  <div className="w-9 h-9 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5 text-pink-500 dark:text-indigo-400" />
                  </div>
                  <span className="text-xs font-black text-zinc-900 dark:text-zinc-200 tracking-wide">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA Button */}
        <div className="mt-16 flex justify-center">
          <Link href="/register" className="group">
            <motion.div
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 dark:from-purple-600 dark:via-indigo-600 dark:to-blue-600 rounded-xl opacity-75 group-hover:opacity-100 blur transition-opacity duration-300 shadow-[0_0_15px_rgba(219,39,119,0.2)] dark:shadow-[0_0_15px_rgba(99,102,241,0.2)]" />
              <button className="relative flex items-center gap-2 px-8 py-3.5 rounded-xl bg-aurora-primary text-white font-bold text-sm w-full justify-center border border-aurora-primary/20 cursor-pointer">
                Explore Company Roadmaps
                <ChevronRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </Link>
        </div>

      </div>
    </section>
  );
}
