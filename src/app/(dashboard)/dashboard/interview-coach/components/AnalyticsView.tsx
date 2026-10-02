"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, Target, Trophy, Brain,
  Star, Zap, ArrowUp, ArrowDown, Activity, Award, Loader2
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { interviewService } from "@/services/interview.service";

export default function AnalyticsView() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [activeChart, setActiveChart] = useState("radar");

  useEffect(() => {
    if (!user?.id) return;
    const userId = user.id;
    async function loadData() {
      try {
        const [sessionsData, progressData] = await Promise.all([
          interviewService.getSessions(userId),
          interviewService.getProgress(userId),
        ]);
        setSessions(sessionsData || []);
        setProgress(progressData || null);
      } catch (err) {
        console.error("Failed to load analytics data:", err);
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

  const total = sessions.length;
  const scores = sessions.map(s => s.score || 0);
  const averageScore = progress?.avg_score || (total > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / total) : 0);
  const bestScore = total > 0 ? Math.max(...scores, 0) : 0;

  const avgBreakdown = {
    communication: total > 0 ? Math.round(sessions.reduce((acc, s) => acc + (s.communication_score || 0), 0) / total) : 0,
    technical: total > 0 ? Math.round(sessions.reduce((acc, s) => acc + (s.technical_score || 0), 0) / total) : 0,
    confidence: total > 0 ? Math.round(sessions.reduce((acc, s) => acc + (s.confidence_score || 0), 0) / total) : 0,
    clarity: total > 0 ? Math.round(sessions.reduce((acc, s) => acc + (s.communication_score || 0), 0) / total) : 0,
  };

  const radarData = [
    { subject: "Communication", value: avgBreakdown.communication, fullMark: 100 },
    { subject: "Technical", value: avgBreakdown.technical, fullMark: 100 },
    { subject: "Confidence", value: avgBreakdown.confidence, fullMark: 100 },
    { subject: "Clarity", value: avgBreakdown.clarity, fullMark: 100 },
    { subject: "Problem Solving", value: Math.round((avgBreakdown.technical + avgBreakdown.clarity) / 2), fullMark: 100 },
  ];

  const scoreTrendData = [...sessions].reverse().map((s, i) => ({
    session: `#${i + 1}`,
    score: s.score || 0,
    date: s.created_at ? new Date(s.created_at).toLocaleDateString() : "",
  }));

  const getFilteredAvg = (mode: string) => {
    const filtered = sessions.filter(s => s.mode === mode);
    return filtered.length > 0 ? Math.round(filtered.reduce((acc, s) => acc + (s.score || 0), 0) / filtered.length) : 0;
  };

  const typePerformance = [
    { name: "HR", score: getFilteredAvg("hr"), fill: "#6366f1" },
    { name: "Technical", score: getFilteredAvg("technical"), fill: "#10b981" },
    { name: "Mixed", score: getFilteredAvg("mixed"), fill: "#f59e0b" },
    { name: "Company", score: getFilteredAvg("company"), fill: "#8b5cf6" },
    { name: "Resume", score: getFilteredAvg("resume"), fill: "#ec4899" },
  ];

  const recentScores = sessions.slice(0, 5);
  const trend = recentScores.length >= 2
    ? (recentScores[0]?.score || 0) > (recentScores[recentScores.length - 1]?.score || 0) ? "up" : "down"
    : "stable";

  const statsCards = [
    { label: "Total Sessions", value: String(total), icon: Activity, color: "text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-950/40" },
    { label: "Avg Score", value: `${averageScore}%`, icon: Award, color: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40" },
    { label: "Best Score", value: `${bestScore}%`, icon: Trophy, color: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40" },
    { label: "Trend", value: trend === "up" ? "Improving" : trend === "down" ? "Needs Focus" : "Stable", icon: trend === "up" ? ArrowUp : ArrowDown, color: trend === "up" ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <CardContent className="p-5 space-y-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.color.split(" ").slice(1).join(" "))}>
                    <Icon className={cn("w-5 h-5", stat.color.split(" ")[0])} />
                  </div>
                  <div>
                    <div className="text-xl font-extrabold text-zinc-900 dark:text-white">{stat.value}</div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="flex gap-1 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-fit">
        {[
          { id: "radar", label: "Skills", icon: Brain },
          { id: "trend", label: "Trend", icon: TrendingUp },
          { id: "types", label: "By Type", icon: BarChart3 },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeChart === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveChart(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border-none cursor-pointer",
                isActive ? "bg-white dark:bg-zinc-950 text-violet-600 dark:text-violet-400 shadow-sm border border-zinc-200 dark:border-zinc-800" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200"
              )}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeChart === "radar" && (
          <Card className="lg:col-span-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-900 pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Brain className="w-4 h-5 text-violet-600" /> Skill Radar
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e4e4e7" className="dark:stroke-zinc-800" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: "#a1a1aa" }} />
                  <Radar name="Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {activeChart === "trend" && (
          <Card className="lg:col-span-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-900 pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-5 text-violet-600" /> Score Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={scoreTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" className="dark:stroke-zinc-800" />
                  <XAxis dataKey="session" stroke="#a1a1aa" fontSize={10} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#a1a1aa" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: "12px", fontSize: "11px", color: "#fff" }} />
                  <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{ r: 5, fill: "#6366f1" }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {activeChart === "types" && (
          <Card className="lg:col-span-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-900 pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BarChart3 className="w-4 h-5 text-violet-600" /> Performance by Type
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={typePerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" className="dark:stroke-zinc-800" />
                  <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#a1a1aa" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: "12px", fontSize: "11px", color: "#fff" }} />
                  <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                    {typePerformance.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardHeader className="border-b border-zinc-100 dark:border-zinc-900 pb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Star className="w-4 h-5 text-emerald-600" /> Strong Areas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {[
              { label: "Communication", score: avgBreakdown.communication },
              { label: "Clarity", score: avgBreakdown.clarity },
              { label: "Confidence", score: avgBreakdown.confidence },
            ].sort((a, b) => b.score - a.score).slice(0, 3).map((item, i) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className={cn("w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-extrabold",
                  i === 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-900")}>
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{item.label}</p>
                  <div className="h-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden mt-1">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${item.score}%` }} className="h-full rounded-full bg-emerald-505" style={{ width: `${item.score}%` }} />
                  </div>
                </div>
                <span className="text-sm font-extrabold text-emerald-600">{item.score}%</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardHeader className="border-b border-zinc-100 dark:border-zinc-900 pb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Target className="w-4 h-5 text-amber-600" /> Weak Areas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {[
              { label: "Technical", score: avgBreakdown.technical },
              { label: "Problem Solving", score: Math.round((avgBreakdown.technical + avgBreakdown.clarity) / 2) },
            ].sort((a, b) => a.score - b.score).map((item, i) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center text-[10px] font-extrabold text-amber-700 dark:text-amber-400">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{item.label}</p>
                  <div className="h-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden mt-1">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${item.score}%` }} className="h-full rounded-full bg-amber-500" style={{ width: `${item.score}%` }} />
                  </div>
                </div>
                <span className="text-sm font-extrabold text-amber-600">{item.score}%</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
