"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Calendar,
  Star,
  Trophy,
  CheckCircle2,
  Clock,
  Zap,
  Target,
  ChevronRight,
  Code2,
  Sparkles,
  RefreshCw,
  BookOpen,
  Award,
  TrendingUp,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import ProblemDetailView from "./ProblemDetailView";

interface DailyChallenge {
  id: string;
  challenge_date: string;
  xp_reward: number;
  bonus_xp: number;
  is_completed: boolean;
  total_completions: number;
}

interface DailyProblem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  description: string;
  acceptance_rate?: string;
}

interface DailyChallengeViewProps {
  onOpenProblem?: (id: string) => void;
}

const DIFF_STYLES: Record<string, { text: string; bg: string; border: string }> = {
  Easy:   { text: "var(--aurora-success)", bg: "rgba(34,197,94,0.1)",  border: "rgba(34,197,94,0.25)"  },
  Medium: { text: "var(--aurora-warning)", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
  Hard:   { text: "var(--aurora-danger)",  bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.25)"  },
};

function StreakFlame({ streak }: { streak: number }) {
  return (
    <div className="relative flex flex-col items-center">
      <div className="relative animate-float-1">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(180deg, #FB923C, #EF4444)",
            boxShadow: "0 8px 32px rgba(249,115,22,0.4)",
          }}
        >
          <Flame className="w-10 h-10 text-white drop-shadow" />
        </div>
        {streak > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
            style={{
              background: "var(--aurora-warning)",
              color: "#111",
              border: "2px solid var(--aurora-card)",
            }}
          >
            {streak}
          </motion.div>
        )}
      </div>
      <p className="mt-2 text-sm font-bold" style={{ color: "var(--aurora-text-secondary)" }}>
        {streak === 0 ? "Start your streak!" : `${streak} day streak 🔥`}
      </p>
    </div>
  );
}

function XPBadge({ amount, label }: { amount: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
        style={{
          background: "rgba(139,92,246,0.12)",
          borderColor: "rgba(139,92,246,0.25)",
        }}
      >
        <Zap className="w-3.5 h-3.5" style={{ color: "#A78BFA" }} />
        <span className="text-sm font-bold" style={{ color: "#A78BFA" }}>+{amount} XP</span>
      </div>
      <span className="text-xs" style={{ color: "var(--aurora-text-muted)" }}>{label}</span>
    </div>
  );
}

export default function DailyChallengeView({ onOpenProblem }: DailyChallengeViewProps) {
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [problem, setProblem] = useState<DailyProblem | null>(null);
  const [streak, setStreak] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showProblem, setShowProblem] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const fetchChallenge = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch("/api/coding/daily");
      if (!res.ok) throw new Error("Failed to load daily challenge");
      const data = await res.json();
      setChallenge(data.challenge);
      setProblem(data.problem);
      setStreak(data.streak || 0);
    } catch (err: any) {
      setError(err.message || "Failed to load daily challenge");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchChallenge(); }, [fetchChallenge]);

  const handleSolveProblem = () => { if (problem) setShowProblem(true); };

  const handleBackFromProblem = useCallback(async () => {
    setShowProblem(false);
    await fetchChallenge();
  }, [fetchChallenge]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  if (showProblem && problem) {
    return (
      <ProblemDetailView
        problemId={problem.id}
        onBack={handleBackFromProblem}
        dailyChallengeId={challenge?.id}
        onDailyChallengeComplete={async () => {
          if (challenge && !challenge.is_completed) {
            try {
              await apiFetch("/api/coding/daily", {
                method: "POST",
                body: JSON.stringify({ daily_challenge_id: challenge.id }),
              });
              setJustCompleted(true);
            } catch (e) {
              console.error("Error marking challenge complete:", e);
            }
          }
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin">
            <Flame className="w-8 h-8" style={{ color: "#F97316" }} />
          </div>
          <p className="text-sm" style={{ color: "var(--aurora-text-secondary)" }}>Loading today's challenge...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(239,68,68,0.1)" }}>
          <Target className="w-7 h-7" style={{ color: "var(--aurora-danger)" }} />
        </div>
        <p className="text-sm" style={{ color: "var(--aurora-text-secondary)" }}>{error}</p>
        <button
          onClick={fetchChallenge}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border"
          style={{
            background: "var(--aurora-card)",
            color: "var(--aurora-text-secondary)",
            borderColor: "var(--aurora-border)",
          }}
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  if (!challenge || !problem) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "var(--aurora-card)" }}>
          <Calendar className="w-7 h-7" style={{ color: "var(--aurora-text-muted)" }} />
        </div>
        <p style={{ color: "var(--aurora-text-secondary)" }}>No daily challenge available today.</p>
      </div>
    );
  }

  const diffStyle = DIFF_STYLES[problem.difficulty] || DIFF_STYLES.Medium;
  const isCompleted = challenge.is_completed || justCompleted;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--aurora-text)" }}>
            <Flame className="w-5 h-5" style={{ color: "#F97316" }} />
            Daily Challenge
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--aurora-text-secondary)" }}>{today}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={fetchChallenge}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer"
          style={{
            background: "var(--aurora-card)",
            color: "var(--aurora-text-secondary)",
            borderColor: "var(--aurora-border)",
          }}
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </motion.button>
      </div>

      {/* Streak + XP Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Streak */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-1 rounded-2xl border p-6 flex flex-col items-center gap-3"
          style={{ background: "var(--aurora-card)", borderColor: "var(--aurora-border)" }}
        >
          <StreakFlame streak={streak} />
        </motion.div>

        {/* XP */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="col-span-1 rounded-2xl border p-6 flex flex-col items-center justify-center gap-4"
          style={{ background: "var(--aurora-card)", borderColor: "var(--aurora-border)" }}
        >
          <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--aurora-text-secondary)" }}>
            <Star className="w-4 h-4" style={{ color: "var(--aurora-warning)" }} />
            Today's Rewards
          </div>
          <div className="flex items-center gap-6">
            <XPBadge amount={challenge.xp_reward} label="Solve" />
            <XPBadge amount={challenge.bonus_xp} label="Bonus" />
          </div>
        </motion.div>

        {/* Completions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-1 rounded-2xl border p-6 flex flex-col items-center justify-center gap-2"
          style={{ background: "var(--aurora-card)", borderColor: "var(--aurora-border)" }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "rgba(34,197,94,0.12)" }}
          >
            <Trophy className="w-6 h-6" style={{ color: "var(--aurora-success)" }} />
          </div>
          <div className="text-center">
            <p className="text-2xl font-black" style={{ color: "var(--aurora-text)" }}>{challenge.total_completions}</p>
            <p className="text-xs" style={{ color: "var(--aurora-text-muted)" }}>solved today</p>
          </div>
        </motion.div>
      </div>

      {/* Problem Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border-2 overflow-hidden"
        style={{
          background: isCompleted ? "rgba(34,197,94,0.05)" : "var(--aurora-card)",
          borderColor: isCompleted ? "rgba(34,197,94,0.4)" : "var(--aurora-border)",
        }}
      >
        {/* Completed Banner */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="px-6 py-3 flex items-center justify-between"
              style={{ background: "var(--aurora-success)" }}
            >
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Challenge Complete! You earned {challenge.xp_reward} XP today 🎉
              </div>
              <Sparkles className="w-4 h-4 text-white/70" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-medium border"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    color: "var(--aurora-text-secondary)",
                    borderColor: "var(--aurora-border)",
                  }}
                >
                  {problem.topic}
                </span>
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-bold border"
                  style={{
                    background: diffStyle.bg,
                    color: diffStyle.text,
                    borderColor: diffStyle.border,
                  }}
                >
                  {problem.difficulty}
                </span>
                {problem.acceptance_rate && (
                  <span
                    className="px-2.5 py-1 rounded-full text-xs border"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      color: "var(--aurora-text-muted)",
                      borderColor: "var(--aurora-border)",
                    }}
                  >
                    {problem.acceptance_rate} acceptance
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold mb-3" style={{ color: "var(--aurora-text)" }}>
                {problem.title}
              </h3>

              <p className="text-sm leading-relaxed line-clamp-3" style={{ color: "var(--aurora-text-secondary)" }}>
                {problem.description?.replace(/<[^>]+>/g, "").substring(0, 300)}...
              </p>
            </div>

            <div className="sm:ml-6 shrink-0">
              {isCompleted ? (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  onClick={handleSolveProblem}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border transition-all cursor-pointer"
                  style={{
                    background: "rgba(34,197,94,0.1)",
                    borderColor: "rgba(34,197,94,0.3)",
                    color: "var(--aurora-success)",
                  }}
                >
                  <BookOpen className="w-4 h-4" />
                  Review Solution
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSolveProblem}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-bold border-none cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #F97316, #EF4444)",
                    boxShadow: "0 8px 24px rgba(249,115,22,0.35)",
                  }}
                >
                  <Flame className="w-4 h-4" />
                  Solve Challenge
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="rounded-xl border p-4"
        style={{
          background: "rgba(245,158,11,0.05)",
          borderColor: "rgba(245,158,11,0.2)",
        }}
      >
        <div className="flex items-start gap-3">
          <Award className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--aurora-warning)" }} />
          <div className="text-sm" style={{ color: "var(--aurora-text-secondary)" }}>
            <span className="font-semibold" style={{ color: "var(--aurora-text)" }}>Daily Tip: </span>
            Solve today's challenge to maintain your streak. Longer streaks earn bonus XP multipliers!
            Complete challenges for 7 consecutive days to unlock the "Week Warrior" achievement.
          </div>
        </div>
      </motion.div>
    </div>
  );
}
