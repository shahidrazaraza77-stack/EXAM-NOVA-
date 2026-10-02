"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  PlayCircle, 
  ChevronRight, 
  BookOpen, 
  AlertTriangle,
  Grid,
  Type,
  Link2,
  Database,
  Shuffle,
  Network,
  GitBranch,
  Crown,
  Share2,
  Brain,
  Repeat,
  RotateCcw,
  Sparkles,
  Trophy,
  Activity,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { codingService } from "@/services/coding";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } }
};
const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 120, damping: 15 } }
};

const TOPIC_ICON_CONFIG: Record<string, { icon: any; color: string }> = {
  "arrays":              { icon: Grid,       color: "#22C55E" },
  "strings":             { icon: Type,       color: "#3B82F6" },
  "linked list":         { icon: Link2,      color: "#6366F1" },
  "stack":               { icon: Database,   color: "#8B5CF6" },
  "queue":               { icon: Shuffle,    color: "#EC4899" },
  "trees":               { icon: Network,    color: "#06B6D4" },
  "binary trees":        { icon: Network,    color: "#06B6D4" },
  "binary search tree":  { icon: GitBranch,  color: "#14B8A6" },
  "bst":                 { icon: GitBranch,  color: "#14B8A6" },
  "heap":                { icon: Crown,      color: "#F59E0B" },
  "graph":               { icon: Share2,     color: "#F97316" },
  "graphs":              { icon: Share2,     color: "#F97316" },
  "dynamic programming": { icon: Brain,      color: "#EF4444" },
  "recursion":           { icon: Repeat,     color: "#A78BFA" },
  "backtracking":        { icon: RotateCcw,  color: "#F43F5E" },
};

function getTopicConfig(name: string) {
  return TOPIC_ICON_CONFIG[name.toLowerCase()] || { icon: Activity, color: "var(--aurora-text-muted)" };
}

export default function TopicsView({ onPracticeTopic }: { onPracticeTopic: (name: string) => void }) {
  const [topics, setTopics] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "progress" | "count">("progress");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTopicsData() {
      try {
        setLoading(true);
        const data = await codingService.getAnalytics("");
        setTopics(data.topicProgress || []);
        setError(null);
      } catch (err) {
        console.error("Failed to load topic stats:", err);
        setError("Unable to load topics statistics.");
      } finally {
        setLoading(false);
      }
    }
    loadTopicsData();
  }, []);

  const sorted = useMemo(() => {
    let filtered = topics.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));
    if (sortBy === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "progress") filtered.sort((a, b) => b.completedPercentage - a.completedPercentage);
    else filtered.sort((a, b) => b.questionsCount - a.questionsCount);
    return filtered;
  }, [topics, search, sortBy]);

  const totalQuestions = useMemo(() => topics.reduce((acc, t) => acc + (t.questionsCount || 0), 0), [topics]);
  const totalSolved = useMemo(() => topics.reduce((acc, t) => acc + Math.round(((t.completedPercentage || 0) / 100) * (t.questionsCount || 0)), 0), [topics]);
  const overallPercentage = totalQuestions > 0 ? Math.round((totalSolved / totalQuestions) * 100) : 0;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--aurora-text)" }}>Topics</h1>
          <p className="text-sm mt-1" style={{ color: "var(--aurora-text-secondary)" }}>
            Master each DSA topic with curated problem pathways.
          </p>
        </div>

        {!loading && topics.length > 0 && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl border"
            style={{
              background: "rgba(34,197,94,0.07)",
              borderColor: "rgba(34,197,94,0.2)",
            }}
          >
            <Trophy className="size-4 shrink-0" style={{ color: "var(--aurora-success)" }} />
            <div className="text-xs">
              <span className="font-semibold" style={{ color: "var(--aurora-text-secondary)" }}>Overall Progress: </span>
              <span className="font-bold" style={{ color: "var(--aurora-success)" }}>{totalSolved} / {totalQuestions} Solved</span>
              <span className="ml-1.5" style={{ color: "var(--aurora-text-muted)" }}>({overallPercentage}%)</span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Filter + Sort Row */}
      <motion.div
        variants={item}
        className="p-3 rounded-2xl border backdrop-blur-md flex flex-col sm:flex-row gap-3 items-center justify-between"
        style={{
          background: "rgba(16, 24, 39, 0.6)",
          borderColor: "var(--aurora-border)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
        }}
      >
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4" style={{ color: "var(--aurora-text-muted)" }} />
          <input
            type="text"
            placeholder="Search topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl text-sm font-medium placeholder-[var(--aurora-text-muted)] focus:outline-none transition-all duration-200 border"
            style={{
              background: "var(--aurora-card)",
              color: "var(--aurora-text)",
              borderColor: "var(--aurora-border)",
            }}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          <span className="text-xs font-bold hidden md:inline" style={{ color: "var(--aurora-text-muted)" }}>Sort By:</span>
          <div
            className="flex gap-1 p-1 rounded-xl border"
            style={{ background: "var(--aurora-card)", borderColor: "var(--aurora-border)" }}
          >
            {(["progress", "name", "count"] as const).map((s) => (
              <motion.button
                key={s}
                onClick={() => setSortBy(s)}
                whileHover={{ scale: 1.05 }}
                className="px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 capitalize cursor-pointer border-none"
                style={{
                  background: sortBy === s ? "var(--aurora-primary)" : "transparent",
                  color: sortBy === s ? "#fff" : "var(--aurora-text-muted)",
                  boxShadow: sortBy === s ? "0 4px 12px var(--aurora-glow-primary)" : "none",
                }}
              >
                {s === "progress" ? "Progress" : s === "name" ? "Name" : "Problems"}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {error && (
        <div
          className="p-4 rounded-xl border text-sm"
          style={{
            background: "rgba(239,68,68,0.08)",
            borderColor: "rgba(239,68,68,0.25)",
            color: "var(--aurora-danger)",
          }}
        >
          {error}
        </div>
      )}

      {/* Topics Grid */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          [...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-2xl border p-5 animate-pulse flex flex-col justify-between"
              style={{ background: "var(--aurora-card)", borderColor: "var(--aurora-border)" }}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="size-9 rounded-xl" style={{ background: "rgba(255,255,255,0.06)" }} />
                  <div className="h-4 w-20 rounded" style={{ background: "rgba(255,255,255,0.06)" }} />
                </div>
                <div className="h-5 w-14 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
              </div>
              <div className="space-y-2">
                <div className="h-2 w-full rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
                <div className="h-3 w-1/2 rounded" style={{ background: "rgba(255,255,255,0.06)" }} />
              </div>
              <div className="h-9 w-full rounded-xl" style={{ background: "rgba(255,255,255,0.06)" }} />
            </div>
          ))
        ) : (
          <AnimatePresence mode="popLayout">
            {sorted.map((topic) => {
              const solvedCount = Math.round(((topic.completedPercentage || 0) / 100) * (topic.questionsCount || 0));
              const cfg = getTopicConfig(topic.name);
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={topic.name}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="group relative overflow-hidden rounded-2xl border p-5 flex flex-col justify-between transition-all duration-300"
                  style={{
                    background: "var(--aurora-card)",
                    borderColor: "var(--aurora-border)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = `${cfg.color}40`;
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${cfg.color}15`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--aurora-border)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                >
                  {/* Ambient glow on hover */}
                  <div
                    className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                    style={{ background: `${cfg.color}12` }}
                  />

                  {/* Top: Icon + Name */}
                  <div className="flex items-center justify-between gap-3 mb-3 relative">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="p-2 rounded-xl shrink-0 border transition-all duration-300"
                        style={{
                          background: `${cfg.color}12`,
                          borderColor: `${cfg.color}25`,
                        }}
                      >
                        <Icon className="size-5 transition-transform duration-300 group-hover:scale-110" style={{ color: cfg.color }} />
                      </div>
                      <h3 className="font-bold text-sm truncate" style={{ color: "var(--aurora-text)" }}>
                        {topic.name}
                      </h3>
                    </div>
                    <span
                      className="shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full border"
                      style={{
                        color: "var(--aurora-text-muted)",
                        background: "rgba(255,255,255,0.04)",
                        borderColor: "var(--aurora-border)",
                      }}
                    >
                      {topic.questionsCount} Qs
                    </span>
                  </div>

                  {/* Difficulty pills */}
                  <div className="flex items-center gap-2 text-[9px] font-extrabold mb-3 uppercase tracking-wider relative">
                    {topic.easyCount > 0 && (
                      <span className="flex items-center gap-1" style={{ color: "var(--aurora-success)" }}>
                        <span className="size-1.5 rounded-full" style={{ background: "var(--aurora-success)" }} />
                        {topic.easyCount} Easy
                      </span>
                    )}
                    {topic.mediumCount > 0 && (
                      <span className="flex items-center gap-1" style={{ color: "var(--aurora-warning)" }}>
                        <span className="size-1.5 rounded-full" style={{ background: "var(--aurora-warning)" }} />
                        {topic.mediumCount} Med
                      </span>
                    )}
                    {topic.hardCount > 0 && (
                      <span className="flex items-center gap-1" style={{ color: "var(--aurora-danger)" }}>
                        <span className="size-1.5 rounded-full" style={{ background: "var(--aurora-danger)" }} />
                        {topic.hardCount} Hard
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5 mb-4 relative">
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${topic.completedPercentage}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}bb)` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span style={{ color: cfg.color }}>{topic.completedPercentage}% Done</span>
                      <span style={{ color: "var(--aurora-text-muted)" }}>{solvedCount} / {topic.questionsCount}</span>
                    </div>
                  </div>

                  {/* Practice button */}
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onPracticeTopic(topic.name)}
                    className="w-full h-9 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 border-none cursor-pointer transition-all duration-200 group/btn"
                    style={{
                      background: `${cfg.color}18`,
                      color: cfg.color,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = `${cfg.color}28`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = `${cfg.color}18`;
                    }}
                  >
                    <PlayCircle className="size-3.5 fill-current shrink-0" />
                    Practice
                    <ArrowUpRight className="size-3 opacity-0 -translate-x-1 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                  </motion.button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Empty State */}
      {!loading && sorted.length === 0 && (
        <div
          className="text-center py-16 border border-dashed rounded-2xl"
          style={{ borderColor: "var(--aurora-border)" }}
        >
          <Activity className="size-8 mx-auto mb-3 opacity-30" style={{ color: "var(--aurora-text-muted)" }} />
          <p className="font-bold" style={{ color: "var(--aurora-text)" }}>No topics found</p>
          <p className="text-xs mt-1" style={{ color: "var(--aurora-text-muted)" }}>
            Try clearing your search query or searching for other keywords.
          </p>
        </div>
      )}
    </motion.div>
  );
}
