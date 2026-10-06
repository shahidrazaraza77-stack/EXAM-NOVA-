"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight, Sparkles, Play, X, CheckCircle2,
  FileText, Mic, BarChart3, Code2, Rocket, BookOpen, BrainCircuit,
  Star, ShieldCheck, Users, TrendingUp, Building2
} from "lucide-react";
import { Button } from "./ui/Button";
import { motion, AnimatePresence } from "framer-motion";

const SPEECH_MESSAGES = [
  "👋 Hello Future Engineer!",
  "Let's build your dream career 🚀",
  "Ready for placements?",
  "AI is waiting for you.",
  "Keep learning every day.",
];

const ROTATING_HEADLINES = [
  {
    prefix: "Land Your",
    title: "Dream Job",
    highlight: "Faster.",
    gradient: "from-pink-500 via-purple-600 to-indigo-600",
  },
  {
    prefix: "Ace Real-Time",
    title: "AI Mock Interviews",
    highlight: "Live.",
    gradient: "from-purple-500 via-indigo-600 to-blue-600",
  },
  {
    prefix: "Build 100%",
    title: "ATS Resumes",
    highlight: "Instantly.",
    gradient: "from-pink-500 via-rose-600 to-purple-600",
  },
  {
    prefix: "Crack Technical",
    title: "Coding Rounds",
    highlight: "Easily.",
    gradient: "from-blue-500 via-indigo-600 to-purple-600",
  },
  {
    prefix: "Secure Top Tier",
    title: "Tech Placements",
    highlight: "Guaranteed.",
    gradient: "from-emerald-500 via-teal-600 to-indigo-600",
  },
];

export default function Hero() {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [speechIndex, setSpeechIndex] = useState(0);
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [isHeadlinePaused, setIsHeadlinePaused] = useState(false);

  // Cycle speech bubble messages every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setSpeechIndex((prev) => (prev + 1) % SPEECH_MESSAGES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  // Continuous changing headline rotation (pauses on hover)
  useEffect(() => {
    if (isHeadlinePaused) return;
    const timer = setInterval(() => {
      setHeadlineIndex((prev) => (prev + 1) % ROTATING_HEADLINES.length);
    }, 1600);
    return () => clearInterval(timer);
  }, [isHeadlinePaused]);

  return (
    <section id="hero" className="relative min-h-[85vh] flex items-center pt-24 pb-12 overflow-hidden bg-examnova-pastel">
      {/* Background Soft Pastel Radial Gradients & Glow Blobs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-400/20 dark:bg-purple-600/15 rounded-full blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-pink-400/20 dark:bg-pink-600/15 rounded-full blur-[130px] pointer-events-none animate-pulse" style={{ animationDelay: '1.5s' }} />
      <div className="absolute bottom-10 left-1/3 w-[350px] h-[350px] bg-indigo-400/15 dark:bg-indigo-600/10 rounded-full blur-[110px] pointer-events-none" />

      {/* Floating Tiny Ambient Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-pink-400/30 to-purple-400/30 animate-particle-drift"
            style={{
              width: `${(i % 5) + 4}px`,
              height: `${(i % 5) + 4}px`,
              top: `${((i * 19) % 80) + 10}%`,
              left: `${((i * 29) % 90) + 5}%`,
              animationDuration: `${6 + (i % 5)}s`,
              animationDelay: `${i % 4}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT SIDE CONTENT */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-7 space-y-8"
          >
            {/* Top AI Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-zinc-900/80 border border-pink-500/20 dark:border-pink-500/30 shadow-lg shadow-pink-500/5 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-pink-500 animate-ping" />
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span className="text-xs font-bold tracking-wide bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent uppercase">
                Next-Gen Placement Intelligence
              </span>
            </div>

            {/* Continuously Rotating Dynamic Headline */}
            <div
              className="relative min-h-[110px] sm:min-h-[130px] lg:min-h-[155px] flex flex-col justify-center"
              onMouseEnter={() => setIsHeadlinePaused(true)}
              onMouseLeave={() => setIsHeadlinePaused(false)}
            >
              <AnimatePresence mode="wait">
                <motion.h1
                  key={headlineIndex}
                  initial={{ opacity: 0, y: 14, filter: "blur(2px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -14, filter: "blur(2px)" }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-black text-zinc-950 dark:text-white tracking-tight leading-[1.15]"
                >
                  {ROTATING_HEADLINES[headlineIndex].prefix}{" "}
                  <span className="font-extrabold text-zinc-950 dark:text-white">
                    {ROTATING_HEADLINES[headlineIndex].title}
                  </span>{" "}
                  <span
                    className={`bg-gradient-to-r ${ROTATING_HEADLINES[headlineIndex].gradient} bg-clip-text text-transparent inline-block drop-shadow-sm`}
                  >
                    {ROTATING_HEADLINES[headlineIndex].highlight}
                  </span>
                </motion.h1>
              </AnimatePresence>

              {/* Headline Carousel Indicator Pills */}
              <div className="flex items-center gap-1.5 pt-3">
                {ROTATING_HEADLINES.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setHeadlineIndex(idx)}
                    aria-label={`Jump to ${item.title}`}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      headlineIndex === idx
                        ? `w-8 bg-gradient-to-r ${item.gradient}`
                        : "w-2 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-600"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Paragraph with required features */}
            <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-300 font-normal leading-relaxed max-w-2xl">
              Prepare smarter using <span className="font-semibold text-zinc-900 dark:text-zinc-100">AI Resume Builder</span>,{" "}
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">Coding Challenges</span>,{" "}
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">Mock Interviews</span>,{" "}
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">ATS Optimization</span>,{" "}
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">Placement Analytics</span>, and{" "}
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">Company-wise Practice</span>.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link href="/register">
                <Button
                  size="lg"
                  variant="primary"
                  className="w-full sm:w-auto font-bold gap-2 text-base shadow-xl shadow-pink-500/25 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white hover:opacity-95 rounded-2xl h-14 px-8"
                >
                  <span>Start Preparing Free</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>

              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowDemoModal(true)}
                className="w-full sm:w-auto font-semibold gap-2 text-base border-purple-500/20 hover:border-pink-500/40 dark:border-white/10 dark:hover:border-pink-500/40 rounded-2xl h-14 px-7 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md group"
              >
                <div className="w-7 h-7 rounded-full bg-pink-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400 fill-current ml-0.5" />
                </div>
                <span>Watch Demo</span>
              </Button>
            </div>

            {/* Trust Badges & Stats */}
            <div className="pt-6 border-t border-purple-500/10 dark:border-zinc-800/60 space-y-4">
              <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-2 bg-pink-500/10 dark:bg-pink-500/15 px-3 py-1.5 rounded-full text-pink-600 dark:text-pink-400">
                  <Users className="w-4 h-4" />
                  <span>50,000+ Students</span>
                </div>
                <div className="flex items-center gap-2 bg-purple-500/10 dark:bg-purple-500/15 px-3 py-1.5 rounded-full text-purple-600 dark:text-purple-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>95% ATS Success</span>
                </div>
              </div>

              {/* Company Logo Badges */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Trusted by candidates at</span>
                <div className="flex items-center gap-4">
                  <span className="font-extrabold text-xs text-zinc-700 dark:text-zinc-300">Google</span>
                  <span className="font-extrabold text-xs text-zinc-700 dark:text-zinc-300">Microsoft</span>
                  <span className="font-extrabold text-xs text-zinc-700 dark:text-zinc-300">Amazon</span>
                  <span className="font-extrabold text-xs text-zinc-700 dark:text-zinc-300">Infosys</span>
                  <span className="font-extrabold text-xs text-zinc-700 dark:text-zinc-300">TCS</span>
                </div>
              </div>

              {/* 4-PHASE ROADMAP QUICK MILESTONE BAR */}
              <div className="pt-2 border-t border-purple-500/10 dark:border-zinc-800/60">
                <Link href="/roadmap" className="group block">
                  <div className="glass-card-saas p-2.5 rounded-2xl border border-purple-500/20 shadow-md flex items-center justify-between gap-2 hover:border-pink-500/40 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
                      <span className="text-xs font-extrabold text-zinc-900 dark:text-white">AI Placement Roadmap:</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-[11px] font-bold text-zinc-600 dark:text-zinc-300">
                      <span className="px-2 py-0.5 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400">1. ATS Resume</span>
                      <span>→</span>
                      <span className="px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">2. Aptitude & DSA</span>
                      <span>→</span>
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">3. AI Interview</span>
                      <span>→</span>
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">4. Offer 🚀</span>
                    </div>
                  </div>
                </Link>
              </div>

            </div>

          </motion.div>

          {/* RIGHT SIDE - FLOATING 3D MASCOT CENTERPIECE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="lg:col-span-5 relative flex items-center justify-center min-h-[520px]"
          >
            {/* Soft Ambient Background Glow Circle */}
            <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-pink-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl" />

            {/* 7 FLOATING GLASS CODE & AI ICONS */}
            
            {/* 1. Resume Icon - Top Left */}
            <div className="absolute -top-4 left-4 z-20 animate-float-1">
              <div className="w-13 h-13 p-3 rounded-2xl glass-card-saas flex items-center justify-center shadow-lg border border-pink-500/30 group hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-pink-500" />
              </div>
            </div>

            {/* 2. AI Icon - Top Right */}
            <div className="absolute -top-2 right-6 z-20 animate-float-2">
              <div className="w-13 h-13 p-3 rounded-2xl glass-card-saas flex items-center justify-center shadow-lg border border-purple-500/30 group hover:scale-110 transition-transform">
                <BrainCircuit className="w-6 h-6 text-purple-500" />
              </div>
            </div>

            {/* 3. Coding Icon - Middle Left */}
            <div className="absolute top-1/3 left-0 z-20 animate-float-3">
              <div className="w-13 h-13 p-3 rounded-2xl glass-card-saas flex items-center justify-center shadow-lg border border-indigo-500/30 group hover:scale-110 transition-transform">
                <Code2 className="w-6 h-6 text-indigo-500" />
              </div>
            </div>

            {/* 4. Mock Interview Icon - Middle Right */}
            <div className="absolute top-1/3 right-0 z-20 animate-float-2" style={{ animationDelay: '1.2s' }}>
              <div className="w-13 h-13 p-3 rounded-2xl glass-card-saas flex items-center justify-center shadow-lg border border-pink-500/30 group hover:scale-110 transition-transform">
                <Mic className="w-6 h-6 text-pink-500" />
              </div>
            </div>

            {/* 5. Placement Analytics Icon - Bottom Left */}
            <div className="absolute bottom-10 left-6 z-20 animate-float-1" style={{ animationDelay: '2s' }}>
              <div className="w-13 h-13 p-3 rounded-2xl glass-card-saas flex items-center justify-center shadow-lg border border-emerald-500/30 group hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-emerald-500" />
              </div>
            </div>

            {/* 6. Company Hub Icon - Bottom Right */}
            <div className="absolute bottom-12 right-6 z-20 animate-float-3" style={{ animationDelay: '2.5s' }}>
              <div className="w-13 h-13 p-3 rounded-2xl glass-card-saas flex items-center justify-center shadow-lg border border-purple-500/30 group hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6 text-purple-500" />
              </div>
            </div>

            {/* SPEECH BUBBLE FROM 3D MASCOT (Level, centered, smooth pure vertical float) */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-30 pointer-events-none w-max max-w-[92vw]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={speechIndex}
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.95 }}
                  transition={{ duration: 0.35 }}
                  className="animate-float-bubble glass-pill px-4 py-2 rounded-2xl shadow-xl border border-pink-500/30 flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-white relative"
                >
                  <span>{SPEECH_MESSAGES[speechIndex]}</span>
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-zinc-800 rotate-45 border-r border-b border-pink-500/30" />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* 3D ROBOT MASCOT IMAGE */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              
              <div className="absolute top-2 right-2 z-30 bg-white/90 dark:bg-zinc-900/90 border border-orange-500/30 rounded-full p-2 shadow-md animate-robot-wave">
                <span className="text-xl select-none">👋</span>
              </div>

              <div className="relative w-64 sm:w-80 h-[280px] sm:h-[340px] flex items-center justify-center animate-float-mascot">
                <img
                  src="/cute-orange-robot.png"
                  alt="ExamNova AI Mascot"
                  className="w-full h-full object-contain filter drop-shadow-[0_20px_35px_rgba(255,140,0,0.35)] select-none pointer-events-none"
                />
              </div>

              {/* Soft Ground Shadow */}
              <div className="w-48 h-3.5 rounded-full bg-orange-500/20 dark:bg-orange-500/30 blur-md mt-[-10px] animate-pulse-shadow" />
            </div>

          </motion.div>

        </div>
      </div>

      {/* VIDEO DEMO MODAL */}
      <AnimatePresence>
        {showDemoModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setShowDemoModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            >
              <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-500" />
                  <span className="text-sm font-bold text-white">ExamNova AI Platform Tour</span>
                </div>
                <button
                  onClick={() => setShowDemoModal(false)}
                  className="text-zinc-400 hover:text-white p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors border-0 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative aspect-video bg-black flex items-center justify-center">
                <video
                  className="w-full h-full object-contain"
                  src="/watch-demo.mp4"
                  controls
                  autoPlay
                  playsInline
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
