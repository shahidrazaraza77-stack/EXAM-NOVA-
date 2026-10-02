import { useState, useMemo } from "react";
import { motion, Variants } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Brain,
  Target,
  LineChart,
  Activity,
  Award,
} from "lucide-react";
import { mockAnalyticsData } from "../mockData";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 120, damping: 15 } },
};

function SimpleBar({ value, max, color = "bg-primary", label }: { value: number; max: number; color?: string; label: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-bold text-zinc-550 dark:text-zinc-400">
        <span className="truncate">{label}</span>
        <span className="tabular-nums bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/80 px-2 py-0.5 rounded-md">{value}</span>
      </div>
      <div className="h-2 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

interface AnalyticsViewProps {
  analyticsData: any;
}

export default function AnalyticsView({ analyticsData }: AnalyticsViewProps) {
  const [tab, setTab] = useState<"accuracy" | "activity" | "time">("accuracy");

  const stats = {
    totalSolved: analyticsData?.totalSolved ?? 0,
    accuracy: analyticsData?.accuracy ?? 0,
    averageScore: analyticsData?.averageScore ?? 0,
    timeSpent: analyticsData?.timeSpent || "0m",
  };

  const topicAccuracy = analyticsData?.topicAccuracy || [];
  const weeklySolved = analyticsData?.weeklySolved || [];

  const timePerTopic = analyticsData?.timePerTopic && analyticsData.timePerTopic.length > 0
    ? analyticsData.timePerTopic
    : mockAnalyticsData.timePerTopic;

  const monthlyScoreTrend = useMemo(() => {
    return analyticsData?.monthlyScoreTrend || mockAnalyticsData.monthlyScore;
  }, [analyticsData]);

  const weeklyActivityComparison = useMemo(() => {
    return analyticsData?.weeklyActivityComparison || [
      { label: "This Week", value: 185 },
      { label: "Last Week", value: 160 },
      { label: "2 Weeks Ago", value: 140 },
      { label: "3 Weeks Ago", value: 120 },
    ];
  }, [analyticsData]);

  const maxWeeklyActivity = useMemo(() => {
    const highestVal = Math.max(...weeklyActivityComparison.map((w: any) => w.value));
    return highestVal > 0 ? Math.max(100, highestVal) : 100;
  }, [weeklyActivityComparison]);

  const statsCards = useMemo(() => {
    return [
      { icon: Brain, label: "Total Solved", value: stats?.totalSolved ?? 0, color: "from-violet-500 to-purple-650", bgGlow: "rgba(139, 92, 246, 0.15)" },
      { icon: Target, label: "Overall Accuracy", value: `${stats?.accuracy ?? 0}%`, color: "from-emerald-500 to-teal-600", bgGlow: "rgba(16, 185, 129, 0.15)" },
      { icon: Award, label: "Avg Score", value: `${stats?.averageScore ?? 0}%`, color: "from-blue-500 to-cyan-600", bgGlow: "rgba(59, 130, 246, 0.15)" },
      { icon: Clock, label: "Time Spent", value: stats?.timeSpent || "0m", color: "from-orange-500 to-amber-600", bgGlow: "rgba(249, 115, 22, 0.15)" },
    ];
  }, [stats]);

  const maxQuestions = useMemo(() => Math.max(1, ...weeklySolved.map((d: any) => d.solved)), [weeklySolved]);
  const maxHours = useMemo(() => Math.max(0.1, ...timePerTopic.map((d: any) => d.hours)), [timePerTopic]);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Title Header with ambient decoration */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600/5 to-indigo-600/5 p-6 border border-violet-500/10"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent dark:from-violet-400 dark:to-indigo-400">
          Preparation Analytics
        </h1>
        <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
          Deep dive into your performance patterns, accuracy rates, and time allocations to refine your study plan.
        </p>
      </motion.div>

      {/* Stats row with interactive glows */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map((s) => (
          <div
            key={s.label}
            className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-xs transition-all duration-300 hover:shadow-md hover:border-violet-500/15"
          >
            <div className={`absolute inset-0 opacity-[0.015] bg-gradient-to-br ${s.color}`} />
            <div className="relative">
              <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${s.color} text-white mb-4 shadow-sm`}>
                <s.icon className="size-4.5" />
              </div>
              <p className="text-2xl font-black text-zinc-900 dark:text-white leading-none tabular-nums">{s.value}</p>
              <p className="text-xs text-zinc-400 font-bold uppercase mt-2 tracking-wider">{s.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Tab Switcher */}
      <motion.div variants={item}>
        <div className="flex gap-1.5 mb-4 p-1.5 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/35 border border-zinc-150 dark:border-zinc-800/80 w-fit">
          {(["accuracy", "activity", "time"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border-none cursor-pointer capitalize ${
                tab === t
                  ? "bg-gradient-to-r from-violet-600 to-indigo-650 text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-405 dark:hover:text-white bg-transparent"
              }`}
            >
              {t === "accuracy" ? "Topic Accuracy" : t === "activity" ? "Weekly Activity" : "Time per Topic"}
            </button>
          ))}
        </div>

        {/* Content Box */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-xs">
          {tab === "accuracy" && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white flex items-center gap-2 mb-2">
                <Target className="size-4.5 text-emerald-500" /> Topic Performance Rates
              </h3>
              {topicAccuracy.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Target className="size-8 mx-auto mb-3 opacity-40" />
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200">No accuracy stats yet</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Solve a few practice sessions to compute topic completion rates.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {topicAccuracy
                    .sort((a: any, b: any) => b.accuracy - a.accuracy)
                    .map((t: any) => {
                      const color =
                        t.accuracy >= 80
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                          : t.accuracy >= 60
                            ? "bg-gradient-to-r from-amber-500 to-orange-400"
                            : "bg-gradient-to-r from-rose-500 to-red-400";
                      return (
                        <SimpleBar
                          key={t.topic}
                          label={t.topic}
                          value={t.accuracy}
                          max={100}
                          color={color}
                        />
                      );
                    })}
                </div>
              )}
            </div>
          )}
          {tab === "activity" && (
            <div className="space-y-6">
              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="size-4.5 text-violet-500" /> Weekly Solution Activity
              </h3>
              <div className="grid grid-cols-7 gap-3 items-end h-[160px] pt-4 px-2">
                {weeklySolved.map((d: any) => (
                  <div key={d.day} className="flex flex-col items-center gap-2 group cursor-default">
                    <div className="relative w-full flex items-end justify-center">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(d.solved / maxQuestions) * 110}px` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="w-full sm:w-8 rounded-t-lg bg-gradient-to-t from-violet-600 to-indigo-500 shadow-3xs group-hover:from-violet-500 group-hover:to-indigo-400 transition-colors"
                        style={{ minHeight: d.solved > 0 ? "8px" : "4px" }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-550">{d.day}</span>
                    <span className="text-[10px] font-extrabold text-zinc-800 dark:text-zinc-200 tabular-nums bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/80 px-1.5 py-0.5 rounded-md">
                      {d.solved}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 text-xs font-bold text-zinc-500 mt-4 border-t border-zinc-100 dark:border-zinc-900 pt-4">
                <span className="flex items-center gap-1.5">
                  <div className="size-2.5 rounded-full bg-violet-600" /> Solved: {weeklySolved.reduce((a: number, b: any) => a + b.solved, 0)}
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="size-2.5 rounded-full bg-emerald-500" /> Correct: {weeklySolved.reduce((a: number, b: any) => a + b.correct, 0)}
                </span>
              </div>
            </div>
          )}
          {tab === "time" && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white flex items-center gap-2 mb-2">
                <Clock className="size-4.5 text-orange-500" /> Time Allocated per Topic (hours)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {timePerTopic.map((t: any) => (
                  <SimpleBar
                    key={t.topic}
                    label={t.topic}
                    value={t.hours}
                    max={maxHours}
                    color="bg-gradient-to-r from-orange-500 to-amber-400"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Performance Trends */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-xs">
          <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            <LineChart className="size-4.5 text-violet-500" /> Score Stability Trend
          </h3>
          <div className="space-y-4">
            {monthlyScoreTrend.map((m: any) => (
              <SimpleBar key={m.week} label={m.week} value={m.score} max={100} color="bg-gradient-to-r from-violet-600 to-indigo-500" />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-xs">
          <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="size-4.5 text-blue-500" /> Weekly Activity Comparison
          </h3>
          <div className="space-y-4">
            {weeklyActivityComparison.map((w: any) => (
              <SimpleBar key={w.label} label={w.label} value={w.value} max={maxWeeklyActivity} color="bg-gradient-to-r from-blue-500 to-cyan-550" />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
