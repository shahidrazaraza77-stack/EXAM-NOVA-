"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Mic, Flame, Award, Zap, Crown, BookOpen, 
  TrendingUp, Video, Eye, Clock, ArrowRight, 
  ShieldCheck, CheckCircle2, Lock, ArrowLeft,
  ChevronDown, ChevronUp, Star, Play
} from "lucide-react";
import { 
  PracticeMode, 
  SpeakSessionLog, 
  AchievementBadge, 
  SpeechTopic 
} from "./mockData";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line, Legend
} from "recharts";
import { motion } from "framer-motion";
import Link from "next/link";

interface SpeakHomeProps {
  modes: PracticeMode[];
  history: SpeakSessionLog[];
  achievements: AchievementBadge[];
  onStartSession: (modeTitle: string, topic: SpeechTopic) => void;
  onStartInterview?: () => void;
}

export default function SpeakHome({
  modes,
  history,
  achievements,
  onStartSession,
  onStartInterview
}: SpeakHomeProps) {
  const [expandedMode, setExpandedMode] = useState<string | null>(null);

  // Calculate metrics
  const totalSessions = history.length;
  const avgScore = totalSessions > 0 
    ? Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / totalSessions) 
    : 0;

  // Render mock values for main metrics
  const communicationScore = avgScore || 85;
  const confidenceScore = 84;
  const eyeContactScore = 86;
  const fluencyScore = 82;
  const streakDays = 7;

  // Recharts data
  const growthData = [
    { name: "Week 1", Score: 78, Pacing: 72 },
    { name: "Week 2", Score: 81, Pacing: 75 },
    { name: "Week 3", Score: 83, Pacing: 79 },
    { name: "Week 4", Score: communicationScore, Pacing: fluencyScore },
  ];

  const trendData = [
    { name: "Session 1", Confidence: 76, EyeContact: 80 },
    { name: "Session 2", Confidence: 80, EyeContact: 82 },
    { name: "Session 3", Confidence: 82, EyeContact: 85 },
    { name: "Session 4", Confidence: confidenceScore, EyeContact: eyeContactScore },
  ];

  // Helper to map icon names
  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case "Flame": return Flame;
      case "Award": return Award;
      case "Zap": return Zap;
      case "Crown": return Crown;
      default: return Mic;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-16">
      {/* Top Navigation Back to Dashboard */}
      <div className="pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
      </div>

      {/* Hero Header */}
      <div className="space-y-2 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 dark:bg-pink-950/20 text-pink-700 dark:text-pink-300 text-xs font-semibold">
          <Zap className="w-4 h-4 text-pink-500 animate-pulse" />
          AI Speech Analytics Core
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-700 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
          SpeakWise AI
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base max-w-2xl leading-relaxed">
          Improve confidence, communication, public speaking, interview responses, and presentation skills with AI-powered speech pacing and focal analytics.
        </p>
      </div>

      {/* Aggregate Overview Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {[
          { label: "Communication Score", val: `${communicationScore}%`, sub: "Avg speech rating", icon: Mic, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-950/20" },
          { label: "Confidence Score", val: `${confidenceScore}%`, sub: "Vocal range & stability", icon: Zap, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/20" },
          { label: "Eye Contact Score", val: `${eyeContactScore}%`, sub: "Attention stability", icon: Eye, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20" },
          { label: "Fluency Score", val: `${fluencyScore}%`, sub: "Grammar & transitions", icon: Award, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
          { label: "Speaking Streak", val: `${streakDays} Days`, sub: "Consistent active practice", icon: Flame, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/20" }
        ].map((c, idx) => {
          const Icon = c.icon;
          return (
            <motion.div key={idx} variants={itemVariants}>
              <Card className="border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 p-4 flex flex-col justify-between shadow-sm h-32">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-555 uppercase tracking-wider block">{c.label}</span>
                  <div className={`p-1.5 rounded-lg ${c.bg} ${c.color} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-xl font-black text-zinc-900 dark:text-white block">{c.val}</span>
                  <span className="text-[9px] text-zinc-400 block">{c.sub}</span>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main Grid: Left (Practice & Trends) & Right (Achievements & History) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8/12) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Mock Interview CTA */}
          {onStartInterview && (
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold">🎤 Mock Interview Mode</h3>
                  <p className="text-sm text-violet-200">Practice Q&A interviews with AI-powered evaluation and real-time feedback</p>
                </div>
                <button onClick={onStartInterview}
                  className="px-5 py-2.5 bg-white text-violet-700 font-bold rounded-xl hover:bg-violet-50 transition-all cursor-pointer text-sm whitespace-nowrap shadow-lg">
                  Start Interview
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 text-center text-xs text-violet-200">
                <div className="bg-white/10 rounded-lg p-2"><span className="font-bold text-white">HR</span> Questions</div>
                <div className="bg-white/10 rounded-lg p-2"><span className="font-bold text-white">Technical</span> Questions</div>
                <div className="bg-white/10 rounded-lg p-2"><span className="font-bold text-white">Mixed</span> Mode</div>
              </div>
            </div>
          )}

          {/* Practice Modes */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Practice Coaching Modes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modes.map((mode) => {
                const isExpanded = expandedMode === mode.id;
                return (
                  <Card 
                    key={mode.id}
                    className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden flex flex-col justify-between"
                  >
                    <div className="p-5 space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <h3 className="font-bold text-sm text-zinc-900 dark:text-white leading-tight">{mode.title}</h3>
                          <p className="text-2xs text-zinc-500 leading-relaxed">{mode.description}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedMode(isExpanded ? null : mode.id)}
                          className="p-1 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-400 cursor-pointer shrink-0"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </div>

                      {/* Expanded Topics List */}
                      {isExpanded && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="pt-3 border-t border-zinc-100 dark:border-zinc-900 mt-2 space-y-2"
                        >
                          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">SELECT A TOPIC TO PRACTISE:</span>
                          {mode.topics.map((topic) => (
                            <div 
                              key={topic.id}
                              className="p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/10 hover:border-pink-300 dark:hover:border-pink-900/60 flex items-center justify-between group transition-colors"
                            >
                              <div className="space-y-0.5">
                                <span className="text-xs font-bold text-zinc-850 dark:text-zinc-200 block">{topic.title}</span>
                                <span className="text-[9px] text-zinc-400 block">{topic.instructions.length} criteria targets</span>
                              </div>
                              <Button
                                onClick={() => onStartSession(mode.title, topic)}
                                size="sm"
                                className="px-2.5 py-1.5 rounded-md text-[10px] font-semibold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 flex items-center gap-1 cursor-pointer"
                              >
                                <Play className="w-2.5 h-2.5 fill-current" /> Start
                              </Button>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Recharts Analytics Trends */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Communication Trends</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Chart 1: Weekly Growth */}
              <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-4">
                <div>
                  <h4 className="font-bold text-xs">Weekly Communication Growth</h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Overall rating tracking across the past 4 weeks.</p>
                </div>
                <div className="h-56 w-full select-none text-[10px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growthData}>
                      <defs>
                        <linearGradient id="scoreGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" className="dark:stroke-zinc-900" />
                      <XAxis dataKey="name" tick={{ fill: "#71717a", fontSize: 9 }} />
                      <YAxis tick={{ fill: "#71717a", fontSize: 9 }} domain={[50, 100]} />
                      <Tooltip />
                      <Area type="monotone" dataKey="Score" stroke="#ec4899" fillOpacity={1} fill="url(#scoreGlow)" strokeWidth={2} />
                      <Area type="monotone" dataKey="Pacing" stroke="#3b82f6" fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Chart 2: Confidence & Eye Contact */}
              <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-4">
                <div>
                  <h4 className="font-bold text-xs">Vocal Stability & Eye Contact</h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Telemetry metrics correlation per session.</p>
                </div>
                <div className="h-56 w-full select-none text-[10px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" className="dark:stroke-zinc-900" />
                      <XAxis dataKey="name" tick={{ fill: "#71717a", fontSize: 9 }} />
                      <YAxis tick={{ fill: "#71717a", fontSize: 9 }} domain={[60, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="Confidence" stroke="#f59e0b" strokeWidth={2} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="EyeContact" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

            </div>
          </div>
        </div>

        {/* Right Column (4/12) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Recommended Today */}
          <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-4 shadow-sm">
            <h4 className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1.5">
              <Star className="w-4.5 h-4.5 text-pink-500 fill-current" /> Recommended Today
            </h4>
            <div className="space-y-3">
              {[
                { title: "Self Introduction Pitch", time: "60-90s drill", desc: "Work on WPM pacing limit (target 130 WPM)" },
                { title: "Explain OOP concepts", time: "2 min technical mock", desc: "Reduce 'basically' transition dependencies" }
              ].map((rec, i) => (
                <div key={i} className="p-3 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-900 rounded-xl space-y-1">
                  <div className="flex justify-between text-2xs font-bold text-zinc-800 dark:text-zinc-200">
                    <span>{rec.title}</span>
                    <span className="text-[9px] text-pink-500 font-semibold">{rec.time}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500">{rec.desc}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Achievements badge board */}
          <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-4 shadow-sm">
            <h4 className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-2">
              <Crown className="w-4.5 h-4.5 text-amber-500" /> Earned Achievements
            </h4>
            <div className="space-y-3">
              {achievements.map((badge) => {
                const Icon = getBadgeIcon(badge.iconName);
                return (
                  <div 
                    key={badge.id} 
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                      badge.earned 
                        ? "border-amber-200/60 dark:border-amber-900/30 bg-amber-500/[0.02] dark:bg-amber-500/[0.01]" 
                        : "border-zinc-100 dark:border-zinc-900 bg-zinc-50/20 dark:bg-zinc-900/5 opacity-55"
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${
                      badge.earned ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-zinc-100 text-zinc-400 dark:bg-zinc-900"
                    }`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-2xs font-extrabold text-zinc-800 dark:text-zinc-200">{badge.title}</span>
                        {!badge.earned && <Lock className="w-2.5 h-2.5 text-zinc-400" />}
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-snug">{badge.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* History Page representation */}
          <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-4 shadow-sm">
            <div className="space-y-0.5">
              <h4 className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Clock className="w-4.5 h-4.5 text-pink-500" /> Previous Sessions
              </h4>
              <p className="text-[9px] text-zinc-500">History list tracking speech performance.</p>
            </div>

            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {history.map((log) => (
                <div 
                  key={log.id} 
                  className="p-3 border border-zinc-100 dark:border-zinc-900 bg-zinc-50/40 dark:bg-zinc-900/10 rounded-xl flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="text-2xs font-extrabold text-zinc-850 dark:text-zinc-200 block truncate max-w-[150px]">{log.topic}</span>
                    <span className="text-[9px] text-zinc-500 block">{log.type} • {log.date}</span>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      log.score >= 85 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}>
                      {log.score}%
                    </span>
                    <span className="text-[9px] text-zinc-400 block mt-1">{log.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
