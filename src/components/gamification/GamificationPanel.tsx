"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGamification } from "@/context/GamificationContext";
import { StreakFire } from "./StreakFire";
import {
  X, Trophy, Flame, BadgeCheck, TrendingUp, ChevronRight,
  Zap, Target, Medal, Star,
} from "lucide-react";
import Link from "next/link";

export function GamificationPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, levelTitle, levelProgress, currentLevelXP, nextLevelXP } = useGamification();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  const earnedBadges = state.badges.filter((b) => b.unlockedAt);

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50" onClick={onClose} />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 z-50 shadow-2xl overflow-y-auto"
          >
            <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between z-10">
              <h2 className="font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <Zap className="h-5 w-5 text-violet-500" /> Gamification Hub
              </h2>
              <button onClick={onClose} className="p-2 rounded-lg text-aurora-text-muted hover:text-aurora-text-secondary hover:bg-aurora-card-hover cursor-pointer transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-5">
              {/* Level & XP */}
              <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-5 text-white">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-violet-200">Level {state.level}</span>
                  <span className="text-2xl font-black">{state.level}</span>
                </div>
                <p className="text-lg font-bold">{levelTitle}</p>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-violet-200 mb-1">
                    <span>{currentLevelXP} XP</span>
                    <span>{nextLevelXP} XP</span>
                  </div>
                  <div className="h-2 bg-violet-950/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${levelProgress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-white rounded-full"
                    />
                  </div>
                  <p className="text-[10px] text-violet-300 mt-1.5">{state.totalXP.toLocaleString()} Total XP</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Flame, label: "Streak", value: `${state.practiceStreak}d`, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/20" },
                  { icon: BadgeCheck, label: "Badges", value: `${earnedBadges.length}/${state.badges.length}`, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/20" },
                  { icon: TrendingUp, label: "Level", value: levelTitle, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/20" },
                ].map((stat) => (
                  <div key={stat.label} className={`${stat.bg} rounded-xl p-3 text-center`}>
                    <stat.icon className={`h-4 w-4 mx-auto mb-1 ${stat.color}`} />
                    <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                    <p className={`text-xs font-extrabold ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Streak */}
              <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                <StreakFire streak={state.practiceStreak} />
                <div className="grid grid-cols-4 gap-2 mt-3 text-center">
                  {["Login", "Practice", "Coding", "Interview"].map((label, i) => {
                    const vals = [state.loginStreak, state.practiceStreak, state.codingStreak, state.interviewStreak];
                    return (
                      <div key={label}>
                        <p className="text-[10px] text-zinc-400">{label}</p>
                        <p className="text-sm font-extrabold text-zinc-700 dark:text-zinc-300">{vals[i]}d</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Daily Challenges */}
              <div>
                <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5" /> Daily Challenges
                </h3>
                <div className="space-y-2">
                  {state.dailyChallenges.map((c) => (
                    <div key={c.id} className="bg-zinc-50 dark:bg-zinc-800/40 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800">
                      <div className="flex justify-between items-start mb-1.5">
                        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{c.title}</p>
                        <span className="text-[10px] font-bold text-violet-500">{c.completed ? "✓" : `+${c.xpReward}XP`}</span>
                      </div>
                      <div className="h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(c.progress / c.target) * 100}%` }}
                          className={`h-full rounded-full ${c.completed ? "bg-emerald-500" : "bg-violet-500"}`}
                        />
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1">{c.progress}/{c.target}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Badge Preview */}
              <div>
                <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Medal className="h-3.5 w-3.5" /> Recent Badges
                </h3>
                <div className="flex flex-wrap gap-2">
                  {earnedBadges.slice(-5).reverse().map((b) => (
                    <div key={b.id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30">
                      <span className="text-base">{b.icon}</span>
                      <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300">{b.name}</span>
                    </div>
                  ))}
                  {earnedBadges.length === 0 && <p className="text-xs text-zinc-400">Complete activities to earn badges</p>}
                </div>
              </div>

              {/* Link to full page */}
              <Link
                href="/dashboard/gamification"
                onClick={onClose}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-900/30 text-sm font-semibold text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors"
              >
                <span className="flex items-center gap-2"><Star className="h-4 w-4" /> View Full Dashboard</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
