"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Target, Brain, Clock, Activity, Code2, LineChart } from "lucide-react";
import { codingService } from "@/services/coding";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

function SimpleBar({
  label,
  value,
  max,
  color = "bg-emerald-500",
}: {
  label: string;
  value: number;
  max: number;
  color?: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-semibold">
        <span className="text-muted-foreground truncate">{label}</span>
        <span className="font-bold tabular-nums">{value}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

export default function AnalyticsView() {
  const [tab, setTab] = useState<"completion" | "accuracy" | "activity" | "language">("completion");
  const [analytics, setAnalytics] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalyticsData() {
      try {
        setLoading(true);
        const [analData, subsData] = await Promise.all([
          codingService.getAnalytics(""),
          codingService.getSubmissions(""),
        ]);
        setAnalytics(analData);
        setSubmissions(subsData);
        setError(null);
      } catch (err) {
        console.error("Failed to load analytics:", err);
        setError("Unable to compute progress metrics.");
      } finally {
        setLoading(false);
      }
    }
    loadAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-8 border border-dashed rounded-2xl text-center text-muted-foreground">
        <p className="font-semibold">{error || "Failed to load analytics statistics."}</p>
      </div>
    );
  }

  const totalSolved = analytics.solvedEasy + analytics.solvedMedium + analytics.solvedHard;

  // Compute languages used dynamically from submissions list
  const languageCounts: Record<string, number> = {};
  submissions.forEach((s) => {
    if (s.language) {
      languageCounts[s.language] = (languageCounts[s.language] || 0) + 1;
    }
  });
  const totalSubs = submissions.length;
  const languagesUsed = Object.entries(languageCounts)
    .map(([name, count]) => ({
      name,
      percentage: totalSubs > 0 ? Math.round((count / totalSubs) * 100) : 0,
    }))
    .sort((a, b) => b.percentage - a.percentage);

  // Difficulty breakdown array
  const difficultyBreakdown = [
    { name: "Easy", solved: analytics.solvedEasy, total: analytics.totalEasy || 10, color: "bg-emerald-500" },
    { name: "Medium", solved: analytics.solvedMedium, total: analytics.totalMedium || 10, color: "bg-amber-500" },
    { name: "Hard", solved: analytics.solvedHard, total: analytics.totalHard || 10, color: "bg-red-500" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your coding progress and performance trends.</p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Code2, label: "Total Solved", value: totalSolved, color: "from-emerald-500 to-teal-600" },
          { icon: Target, label: "Accuracy", value: `${analytics.accuracy}%`, color: "from-blue-500 to-cyan-600" },
          { icon: Clock, label: "Streak", value: `${analytics.streak} days`, color: "from-orange-500 to-amber-600" },
          { icon: TrendingUp, label: "Rating", value: analytics.rating, color: "from-violet-500 to-purple-600" },
        ].map((s) => (
          <div
            key={s.label}
            className="relative overflow-hidden rounded-xl border bg-card p-4 transition-shadow hover:shadow-md"
          >
            <div className={`absolute inset-0 opacity-[0.03] bg-gradient-to-br ${s.color}`} />
            <div className="relative">
              <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${s.color} text-white mb-3`}>
                <s.icon className="size-4" />
              </div>
              <p className="text-lg font-bold tabular-nums">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div variants={item}>
        <div className="flex gap-1 mb-4 p-1 rounded-lg bg-muted w-fit">
          {(["completion", "accuracy", "activity", "language"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors capitalize cursor-pointer border-none ${
                tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "completion" ? "Topics" : t === "accuracy" ? "Accuracy" : t === "activity" ? "Weekly" : "Languages"}
            </button>
          ))}
        </div>

        <div className="rounded-xl border bg-card p-5">
          {tab === "completion" && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
                <Brain className="size-4 text-emerald-500" /> Topic Completion
              </h3>
              {(analytics.topicProgress || [])
                .sort((a: any, b: any) => b.completedPercentage - a.completedPercentage)
                .map((t: any) => (
                  <SimpleBar
                    key={t.name}
                    label={t.name}
                    value={t.completedPercentage}
                    max={100}
                    color={
                      t.completedPercentage >= 85
                        ? "bg-emerald-500"
                        : t.completedPercentage >= 50
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }
                  />
                ))}
              {(!analytics.topicProgress || analytics.topicProgress.length === 0) && (
                <p className="text-xs text-muted-foreground">No topic progress registered.</p>
              )}
            </div>
          )}
          {tab === "accuracy" && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
                <LineChart className="size-4 text-blue-500" /> Accuracy Trend
              </h3>
              {(analytics.accuracyTrend || []).map((w: any) => (
                <SimpleBar key={w.name} label={w.name} value={w.accuracy} max={100} color="bg-blue-500" />
              ))}
            </div>
          )}
          {tab === "activity" && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
                <Activity className="size-4 text-orange-500" /> Weekly Activity
              </h3>
              {(analytics.weeklySolved || []).map((w: any) => (
                <SimpleBar
                  key={w.name}
                  label={w.name}
                  value={w.solved}
                  max={Math.max(1, ...analytics.weeklySolved.map((d: any) => d.solved))}
                  color="bg-orange-500"
                />
              ))}
            </div>
          )}
          {tab === "language" && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
                <Code2 className="size-4 text-violet-500" /> Languages Used
              </h3>
              {languagesUsed.map((l: any) => (
                <SimpleBar key={l.name} label={l.name} value={l.percentage} max={100} color="bg-violet-500" />
              ))}
              {languagesUsed.length === 0 && (
                <p className="text-xs text-muted-foreground">Submit solutions to compile language breakdown.</p>
              )}
            </div>
          )}
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="size-4 text-indigo-500" /> Difficulty Breakdown
          </h3>
          <div className="space-y-3">
            {difficultyBreakdown.map((d) => (
              <SimpleBar
                key={d.name}
                label={`${d.name} (${d.solved}/${d.total})`}
                value={d.solved}
                max={d.total}
                color={d.color}
              />
            ))}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="size-4 text-cyan-500" /> Weekly Solved Trend
          </h3>
          <div className="space-y-3">
            {(analytics.weeklySolved || []).map((w: any) => (
              <SimpleBar
                key={w.name}
                label={w.name}
                value={w.solved}
                max={Math.max(1, ...analytics.weeklySolved.map((d: any) => d.solved))}
                color="bg-cyan-500"
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

