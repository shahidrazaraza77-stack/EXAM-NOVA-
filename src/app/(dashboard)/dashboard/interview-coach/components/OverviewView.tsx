"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Video, Award, TrendingUp, MessageSquare, Brain,
  Sparkles, Clock, Target, ArrowRight, Star, Lightbulb,
  BarChart3, Zap, Activity, Loader2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { interviewService } from "@/services/interview.service";

const quickActions = [
  { id: "start", label: "Start Interview", desc: "Begin a new practice session", color: "from-violet-600 to-indigo-600", icon: Video },
  { id: "history", label: "View History", desc: "Review past sessions", color: "from-blue-600 to-cyan-600", icon: Clock },
  { id: "analytics", label: "Analytics", desc: "Track your progress", color: "from-emerald-600 to-teal-600", icon: BarChart3 },
];

export default function OverviewView({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInterviews: 0,
    averageScore: 0,
    bestScore: 0,
    confidenceScore: 0,
    communicationScore: 0,
    technicalScore: 0,
    problemSolvingScore: 0,
  });
  const [insights, setInsights] = useState<string[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    const userId = user.id;
    async function loadData() {
      try {
        const [sessions, progress] = await Promise.all([
          interviewService.getSessions(userId),
          interviewService.getProgress(userId),
        ]);

        if (sessions && sessions.length > 0) {
          const total = sessions.length;
          const scores = sessions.map(s => s.score || 0);
          const best = Math.max(...scores, 0);
          const avg = progress?.avg_score || Math.round(scores.reduce((a, b) => a + b, 0) / total);

          const communication = Math.round(sessions.reduce((acc, s) => acc + (s.communication_score || 0), 0) / total);
          const technical = Math.round(sessions.reduce((acc, s) => acc + (s.technical_score || 0), 0) / total);
          const confidence = Math.round(sessions.reduce((acc, s) => acc + (s.confidence_score || 0), 0) / total);
          const problemSolving = Math.round((technical + communication) / 2);

          setStats({
            totalInterviews: total,
            averageScore: avg,
            bestScore: best,
            confidenceScore: confidence,
            communicationScore: communication,
            technicalScore: technical,
            problemSolvingScore: problemSolving,
          });

          // Map recent activities
          const mappedActivities = sessions.slice(0, 3).map((s, idx) => ({
            id: idx,
            type: "interview_completed",
            message: `Completed ${s.mode.toUpperCase()} interview for ${s.role}`,
            timestamp: s.created_at ? new Date(s.created_at).toLocaleDateString() : "Just now",
          }));
          setActivities(mappedActivities);
        } else {
          setActivities([
            { id: 1, type: "practice_reminder", message: "Start your first mock interview to measure placement readiness", timestamp: "Today" }
          ]);
        }

        if (progress?.improvement_notes) {
          const notes = progress.improvement_notes.split("\n").filter(n => n.trim().length > 0);
          setInsights(notes.slice(0, 3));
        } else {
          setInsights([
            "Complete your first interview to get AI coaching insights.",
            "AI analyzes your communication, confidence, and technical depth.",
            "Personalized prep roadmaps are updated after every session.",
          ]);
        }
      } catch (err) {
        console.error("Failed to load overview data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  const statCards = [
    { label: "Interviews Completed", value: String(stats.totalInterviews), icon: Video, color: "from-violet-600 to-indigo-600", bg: "bg-violet-50 dark:bg-violet-950/40", textColor: "text-violet-600 dark:text-violet-400" },
    { label: "Average Score", value: `${stats.averageScore}%`, icon: Award, color: "from-emerald-600 to-teal-600", bg: "bg-emerald-50 dark:bg-emerald-950/40", textColor: "text-emerald-600 dark:text-emerald-400" },
    { label: "Best Score", value: `${stats.bestScore}%`, icon: TrendingUp, color: "from-amber-600 to-orange-600", bg: "bg-amber-50 dark:bg-amber-950/40", textColor: "text-amber-600 dark:text-amber-400" },
    { label: "Confidence", value: `${stats.confidenceScore}%`, icon: Zap, color: "from-blue-600 to-cyan-600", bg: "bg-blue-50 dark:bg-blue-950/40", textColor: "text-blue-600 dark:text-blue-400" },
    { label: "Communication", value: `${stats.communicationScore}%`, icon: MessageSquare, color: "from-pink-600 to-rose-600", bg: "bg-pink-50 dark:bg-pink-950/40", textColor: "text-pink-600 dark:text-pink-400" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <CardContent className="p-4 space-y-3">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", stat.bg)}>
                    <Icon className={cn("w-4 h-5", stat.textColor)} />
                  </div>
                  <div>
                    <div className="text-xl font-extrabold text-zinc-900 dark:text-white">{stat.value}</div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-violet-600" />
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Quick Start</h3>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {quickActions.map(action => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => onNavigate?.(action.id === "start" ? "start" : action.id)}
                      className={cn(
                        "p-5 rounded-2xl text-left transition-all border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br hover:scale-[1.02] cursor-pointer border-none w-full",
                        action.color.replace("from-", "from-").split(" ")[0] + "/5 dark:" + action.color.replace("from-", "from-").split(" ")[0] + "/10"
                      )}
                    >
                      <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3 shadow-sm", action.color)}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-white">{action.label}</h4>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">{action.desc}</p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Recent Activity</h3>
              </div>
              <div className="space-y-3">
                {activities.map((item) => {
                  const iconMap: Record<string, React.ReactNode> = {
                    interview_completed: <Video className="w-4 h-4 text-violet-600" />,
                    score_milestone: <Star className="w-4 h-4 text-amber-600" />,
                    practice_reminder: <Lightbulb className="w-4 h-4 text-emerald-600" />,
                  };
                  return (
                    <div key={item.id} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-950 flex items-center justify-center shadow-sm shrink-0">
                        {iconMap[item.type] || <Activity className="w-4 h-4 text-violet-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{item.message}</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{item.timestamp}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white border-none shadow-lg">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-violet-200" />
                <h3 className="font-bold text-sm">AI Insights</h3>
              </div>
              <div className="space-y-3">
                {insights.slice(0, 3).map((insight, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                    <p className="text-xs text-indigo-100 leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Score Breakdown</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Communication", score: stats.communicationScore },
                  { label: "Technical", score: stats.technicalScore },
                  { label: "Confidence", score: stats.confidenceScore },
                  { label: "Problem Solving", score: stats.problemSolvingScore },
                ].map(item => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-zinc-500 dark:text-zinc-400">{item.label}</span>
                      <span className="text-violet-600 dark:text-violet-400">{item.score}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.score}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => onNavigate?.("analytics")}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors bg-violet-50 dark:bg-violet-950/40 hover:bg-violet-100 dark:hover:bg-violet-950/60 rounded-xl py-2.5 border-none cursor-pointer"
              >
                View Detailed Analytics <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
