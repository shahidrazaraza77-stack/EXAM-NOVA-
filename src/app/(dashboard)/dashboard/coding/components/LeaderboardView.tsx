"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import React from "react";
import { Medal, Flame, Crown, Code2 } from "lucide-react";
import { gamificationService, LeaderboardUser } from "@/services/gamification.service";
import { supabase } from "@/lib/supabase";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const rankColors = ["from-yellow-400 to-amber-600", "from-slate-300 to-slate-500", "from-amber-600 to-orange-700"];
const rankIcons = [Crown, Medal, Medal];

export default function LeaderboardView() {
  const [sortBy, setSortBy] = useState<"score" | "solved" | "streak">("score");
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true);
        // Map sortBy UI options to gamification categories
        const category = sortBy === "score" ? "global" : sortBy === "solved" ? "coding" : "global";
        const data = await gamificationService.getLeaderboard(category);
        setLeaderboard(data);
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [sortBy]);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Compete with peers and track your coding rank.</p>
      </motion.div>

      <motion.div variants={item} className="flex gap-1 p-1 rounded-lg bg-muted w-fit">
        {(["score", "solved", "streak"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors capitalize cursor-pointer border-none ${
              sortBy === s ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {s === "score" ? "Score" : s === "solved" ? "Problems" : "Streak"}
          </button>
        ))}
      </motion.div>

      <motion.div variants={item} className="rounded-xl border bg-card divide-y">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4 animate-pulse">
              <div className="size-8 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-3 w-24 bg-muted rounded" />
              </div>
              <div className="h-6 w-12 bg-muted rounded" />
            </div>
          ))
        ) : (
          leaderboard.map((user, idx) => {
            const rank = user.rank || idx + 1;
            const isTop3 = rank <= 3;
            // Check if this row is the current user (you can match names or pass down user ids if returned)
            // Wait, we don't have user_id in LeaderboardUser interface, but let's see if we can check it
            const isCurrent = currentUserId && (user as any).user_id === currentUserId;

            return (
              <div
                key={user.full_name + idx}
                className={`flex items-center gap-4 p-4 transition-colors ${
                  isCurrent ? "bg-emerald-50/50 dark:bg-emerald-950/10" : "hover:bg-muted/30"
                }`}
              >
                {isTop3 ? (
                  <div
                    className={`size-8 rounded-full bg-gradient-to-br ${
                      rankColors[rank - 1]
                    } flex items-center justify-center shrink-0`}
                  >
                    {React.createElement(rankIcons[rank - 1], { className: "size-4 text-white" })}
                  </div>
                ) : (
                  <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-muted-foreground">{rank}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isCurrent ? "text-emerald-600" : "text-zinc-900 dark:text-zinc-100"}`}>
                    {user.full_name}
                    {isCurrent && <span className="text-[10px] text-emerald-600 ml-1 font-bold">(You)</span>}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 font-medium">
                    <span className="flex items-center gap-1">
                      <Code2 className="size-3" /> Level {user.level}
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="size-3" /> {user.streak} day streak
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold tabular-nums text-zinc-950 dark:text-white">{user.xp}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold">XP points</p>
                </div>
              </div>
            );
          })
        )}
        {!loading && leaderboard.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm font-medium">
            No rankings available.
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

