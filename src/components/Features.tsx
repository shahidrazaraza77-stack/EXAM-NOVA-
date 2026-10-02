"use client";

import React from "react";
import Link from "next/link";
import { 
  FileText, ShieldCheck, Mic, Code2, 
  BarChart3, Building2, ArrowRight, Sparkles, Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./ui/Button";

const FEATURE_CARDS = [
  {
    icon: FileText,
    title: "AI Resume Builder",
    description: "Craft high-converting resumes tailored to your target roles with real-time AI feedback and formatting.",
    color: "from-pink-500 to-rose-500",
    iconBg: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    badge: "Instant Optimization"
  },
  {
    icon: ShieldCheck,
    title: "ATS Optimization",
    description: "Scan your resume against real job descriptions to ensure 95%+ ATS pass rate before submitting.",
    color: "from-purple-500 to-indigo-500",
    iconBg: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    badge: "95% Success Rate"
  },
  {
    icon: Mic,
    title: "Interview Coach",
    description: "Practice technical and HR mock interviews with real-time speech analysis and score cards.",
    color: "from-indigo-500 to-blue-500",
    iconBg: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    badge: "Voice & Video AI"
  },
  {
    icon: Code2,
    title: "Coding Challenges",
    description: "Master company-specific Data Structures and Algorithms with automated test suites and solutions.",
    color: "from-cyan-500 to-emerald-500",
    iconBg: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    badge: "500+ Questions"
  },
  {
    icon: BarChart3,
    title: "Placement Analytics",
    description: "Track your preparation velocity, skill breakdown, percentile rank, and readiness score.",
    color: "from-emerald-500 to-teal-500",
    iconBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    badge: "Deep Insights"
  },
  {
    icon: Building2,
    title: "Company Hub",
    description: "Access actual recent placement papers and interview questions for Google, TCS, Infosys, and Amazon.",
    color: "from-amber-500 to-orange-500",
    iconBg: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    badge: "Top 50+ Tech Corps"
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring" as const,
      stiffness: 90,
      damping: 15
    } 
  },
};

export default function Features() {
  return (
    <section id="features" className="relative py-14 bg-examnova-pastel overflow-hidden">
      
      {/* Background Soft Lights */}
      <div className="absolute top-1/3 left-1/4 w-[450px] h-[450px] bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-pink-400/10 dark:bg-pink-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-zinc-900/80 border border-pink-500/20 shadow-md backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span className="text-xs font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent uppercase tracking-wider">
              Core Capabilities
            </span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight"
          >
            Built for Engineers. <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Powered by AI Intelligence.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-base text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto"
          >
            Everything you need to stand out from 500,000+ applicants and land your target offer letter.
          </motion.p>
        </div>

        {/* Feature Grid - 6 Glassmorphism Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {FEATURE_CARDS.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative rounded-[28px] p-8 glass-card-saas border border-white/60 dark:border-white/10 shadow-xl shadow-purple-500/5 hover:shadow-2xl hover:shadow-purple-500/15 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Gradient Border Accent line on top */}
                <div className={`absolute top-0 left-8 right-8 h-1 rounded-full bg-gradient-to-r ${feature.color} opacity-80 group-hover:opacity-100 transition-opacity`} />

                <div className="space-y-6">
                  {/* Top Row: Icon + Badge */}
                  <div className="flex items-center justify-between">
                    <div className={`w-14 h-14 rounded-2xl ${feature.iconBg} flex items-center justify-center border shadow-inner group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                      {feature.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight group-hover:text-purple-600 dark:group-hover:text-pink-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Action Link */}
                <div className="pt-6 mt-6 border-t border-purple-500/10 dark:border-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-500 group-hover:text-purple-600 dark:group-hover:text-pink-400 transition-colors">
                    Explore Tool
                  </span>
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-purple-600 group-hover:text-white transition-all">
                    <ArrowRight className="w-4 h-4 text-purple-600 dark:text-purple-300 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 rounded-[32px] p-8 sm:p-12 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white shadow-2xl shadow-purple-500/25 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="space-y-2 max-w-xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full text-white">
                <Zap className="w-3.5 h-3.5" /> Instant Access
              </span>
              <h3 className="text-2xl sm:text-3xl font-black">Ready to test your ATS resume score?</h3>
              <p className="text-white/80 text-sm">Upload your resume and get detailed feedback in under 30 seconds.</p>
            </div>
            <Link href="/register">
              <Button
                size="lg"
                className="rounded-2xl bg-white text-zinc-950 hover:bg-zinc-100 font-extrabold px-8 py-4 text-base shadow-lg hover:scale-105 transition-transform border-0"
              >
                Analyze My Resume Now
              </Button>
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
