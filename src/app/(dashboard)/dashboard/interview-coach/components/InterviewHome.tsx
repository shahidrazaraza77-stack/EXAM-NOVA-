"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Video, Sparkles, UserCheck, Code2, 
  MessageSquare, Calendar, TrendingUp, Clock, 
  BarChart2, ArrowRight, ShieldAlert, Award, ArrowLeft
} from "lucide-react";
import { InterviewSessionItem, Recommendation } from "./mockData";
import { motion } from "framer-motion";
import Link from "next/link";

interface InterviewHomeProps {
  onStartInterview: (type: "HR" | "Technical" | "Mixed") => void;
  onOpenSetup: () => void;
  history: InterviewSessionItem[];
  recommendations: Recommendation[];
}

export default function InterviewHome({ 
  onStartInterview, 
  onOpenSetup, 
  history, 
  recommendations 
}: InterviewHomeProps) {
  
  const totalInterviews = history.length;
  const averageScore = totalInterviews > 0 
    ? Math.round(history.reduce((acc, curr) => acc + (curr.score || 0), 0) / totalInterviews) 
    : 0;
  
  const totalFeedbacks = history.reduce((acc, curr) => acc + curr.feedbackCount, 0);
  const averageFeedback = totalInterviews > 0
    ? Math.round(totalFeedbacks / totalInterviews)
    : 0;

  const getTrend = () => {
    if (history.length < 2) return { text: "Stable", color: "text-zinc-500", icon: TrendingUp };
    const latest = history[0].score || 0;
    const prev = history[1].score || 0;
    if (latest > prev) return { text: `+${latest - prev}pts Improvement`, color: "text-emerald-500", icon: TrendingUp };
    if (latest < prev) return { text: `-${prev - latest}pts Decline`, color: "text-rose-500", icon: TrendingUp };
    return { text: "Stable", color: "text-zinc-500", icon: TrendingUp };
  };

  const trend = getTrend();
  const TrendIcon = trend.icon;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-16">
      <div className="pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3 text-center md:text-left"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-violet-500 animate-pulse" />
          Powered by Gemini AI
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-700 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
          AI Interview Coach
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base max-w-2xl leading-relaxed">
          Practice real interview questions with instant AI-driven performance feedback, granular speech patterns analysis, and detailed progress metrics.
        </p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: "Practice Sessions", val: totalInterviews, icon: Video, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/25" },
          { label: "Average Score", val: averageScore > 0 ? `${averageScore}/100` : "N/A", icon: Award, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/25" },
          { label: "Total Feedbacks", val: `${totalFeedbacks}`, icon: Clock, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/25" },
          { label: "Performance Trend", val: trend.text, icon: TrendIcon, color: trend.color, bg: "bg-zinc-50 dark:bg-zinc-900/40" },
        ].map((m, idx) => {
          const Icon = m.icon;
          return (
            <motion.div key={idx} variants={itemVariants}>
              <Card className="border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-sm p-4 flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">{m.label}</span>
                  <span className={`text-base md:text-lg font-bold ${typeof m.val === 'string' && m.val.includes('Decline') ? 'text-rose-500' : 'text-zinc-900 dark:text-white'}`}>{m.val}</span>
                </div>
                <div className={`p-2.5 rounded-xl ${m.bg} ${m.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Start Practicing</h2>
              <Button variant="ghost" size="sm" onClick={onOpenSetup} className="text-xs gap-1.5 cursor-pointer text-aurora-primary">
                Custom Setup <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {[
                { 
                  type: "HR" as const, 
                  title: "Start HR Interview", 
                  badge: "Cultural & Fit",
                  desc: "Master situational behavioral questions. Focuses on leadership, collaboration, strengths, and weaknesses.", 
                  icon: UserCheck, 
                  color: "from-blue-500 to-indigo-500" 
                },
                { 
                  type: "Technical" as const, 
                  title: "Start Technical Interview", 
                  badge: "Core Engineering",
                  desc: "Revise OOP, DBMS, SQL, REST APIs, and core React principles with standard developer interview questions.", 
                  icon: Code2, 
                  color: "from-violet-500 to-fuchsia-500" 
                },
                { 
                  type: "Mixed" as const, 
                  title: "Start Mixed Interview", 
                  badge: "Full Loop Simulation",
                  desc: "The ultimate preparation simulation. Random selection of both technical and HR behavioral questions.", 
                  icon: MessageSquare, 
                  color: "from-emerald-500 to-teal-500" 
                }
              ].map((card, idx) => {
                const Icon = card.icon;
                return (
                  <motion.div key={idx} variants={itemVariants} className="h-full">
                    <Card 
                      hoverEffect 
                      className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 flex flex-col justify-between h-72 shadow-sm transition-all duration-300 relative overflow-hidden group"
                    >
                      <div className={`absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r ${card.color}`} />
                      
                      <div className="space-y-4">
                        <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 group-hover:scale-110 transition-transform">
                          <Icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest block">{card.badge}</span>
                          <h3 className="font-bold text-base text-zinc-900 dark:text-white leading-snug">{card.title}</h3>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3">{card.desc}</p>
                        </div>
                      </div>

                      <Button 
                        onClick={() => onStartInterview(card.type)}
                        className="w-full justify-center gap-2 mt-6 cursor-pointer bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 font-semibold"
                        size="sm"
                      >
                        <Video className="w-4 h-4" />
                        Start Now
                      </Button>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">AI Coach Insights & Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((rec) => (
                <Card key={rec.id} className="border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 p-5 flex items-start gap-4">
                  <div className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                    rec.category === "communication" 
                      ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400" 
                      : rec.category === "dsa" 
                      ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400" 
                      : rec.category === "hr"
                      ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400"
                      : "bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400"
                  }`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-zinc-900 dark:text-white">{rec.title}</h4>
                    <p className="text-2xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{rec.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-5 shadow-sm">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                Session History
              </h2>
              <p className="text-2xs text-zinc-500">Track and review previous mock interview reports.</p>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <p className="text-xs text-zinc-400 font-medium">No sessions recorded yet.</p>
                <p className="text-[10px] text-zinc-500">Take your first interview to begin telemetry tracking.</p>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
                {history.map((session) => (
                  <div 
                    key={session.id} 
                    className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/20 flex items-center justify-between gap-3 hover:border-zinc-200 dark:hover:border-zinc-800 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{session.type} Mock</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          (session.score || 0) >= 80 
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}>
                          {session.score || "N/A"}/100
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 truncate max-w-[150px]">{session.role}</p>
                      <div className="flex items-center gap-2 text-[9px] text-zinc-400">
                        <span>{session.date}</span>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                      <div className="w-10 h-10 rounded-full border-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-[10px] font-bold text-violet-600 dark:text-violet-400">
                        {session.score || 0}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-none shadow-md p-6 space-y-4">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-violet-200" />
            </div>
            <div className="space-y-1.5">
              <h4 className="font-bold text-sm">AI-Powered Analysis</h4>
              <p className="text-3xs text-indigo-100/90 leading-relaxed">
                Powered by Gemini AI, ExamNova analyzes your answers for communication, technical accuracy, confidence, and clarity. Get instant feedback to improve your interview skills.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
