import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { gamificationService } from "@/services/gamification.service";
import { motion, Variants } from "framer-motion";
import {
  Trophy,
  Flame,
  Crown,
  Loader2,
  Award,
  Sparkles,
  Zap,
  Target,
} from "lucide-react";

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

const rankColors = [
  "from-yellow-400 to-amber-500 text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/40 border-yellow-100",
  "from-slate-300 to-slate-450 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 border-slate-100",
  "from-amber-600 to-orange-700 text-amber-700 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-100",
];

const categoryMap: Record<string, "global" | "coding" | "aptitude" | "interview" | "placement"> = {
  score: "global",
  accuracy: "placement",
  streak: "aptitude",
};

export default function LeaderboardView() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"score" | "accuracy" | "streak">("score");

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true);
        const cat = categoryMap[sortBy] || "global";
        const data = await gamificationService.getLeaderboard(cat);
        setLeaderboard(data);
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [sortBy]);

  // Extract Top 3 for Podium
  const podiumData = useMemo(() => {
    if (leaderboard.length === 0) return { first: null, second: null, third: null, rest: [] };
    return {
      first: leaderboard[0] || null,
      second: leaderboard[1] || null,
      third: leaderboard[2] || null,
      rest: leaderboard.slice(3),
    };
  }, [leaderboard]);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Title Header with ambient decoration */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600/5 to-indigo-600/5 p-6 border border-violet-500/10"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent dark:from-violet-400 dark:to-indigo-400">
          Prep Leaderboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
          See how you rank against fellow students. Complete practice exercises and mock tests to earn points and climb the ranks.
        </p>
      </motion.div>

      {/* Sorting filters */}
      <motion.div
        variants={item}
        className="flex items-center justify-between flex-wrap gap-3 border-b border-zinc-100 dark:border-zinc-850 pb-4"
      >
        <div className="flex gap-1.5 p-1.5 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/35 border border-zinc-150 dark:border-zinc-800/80 w-fit">
          {(["score", "accuracy", "streak"] as const).map((s) => {
            const labelMap = { score: "Top Points", accuracy: "Top Accuracy", streak: "Highest Streak" };
            return (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border-none cursor-pointer capitalize ${
                  sortBy === s
                    ? "bg-gradient-to-r from-violet-600 to-indigo-650 text-white shadow-xs"
                    : "text-zinc-505 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white bg-transparent"
                }`}
              >
                {labelMap[s] || s}
              </button>
            );
          })}
        </div>
        <div className="text-xs font-bold text-zinc-400 flex items-center gap-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/85 px-3 py-1.5 rounded-xl">
          <Sparkles className="size-3.5 text-amber-500 animate-pulse" /> Rankings update in real-time
        </div>
      </motion.div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-medium animate-pulse">Loading Leaderboard rankings...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 max-w-lg mx-auto">
          <Trophy className="size-8 mx-auto mb-3 text-zinc-400 opacity-60" />
          <p className="font-bold text-zinc-900 dark:text-white">No rankings found</p>
          <p className="text-xs text-zinc-450 dark:text-zinc-500 mt-1 max-w-xs mx-auto">
            Solve questions and complete mocks to be the first to enter the leaderboard list.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Podium Row */}
          {podiumData.first && (
            <motion.div
              variants={item}
              className="grid grid-cols-3 gap-3 max-w-xl mx-auto pt-8 items-end text-center relative px-2"
            >
              {/* 2nd Place (Left) */}
              {podiumData.second ? (
                <div className="flex flex-col items-center">
                  <div className="relative group flex flex-col items-center">
                    <div className="size-11 rounded-full bg-slate-100 dark:bg-slate-900 border-2 border-slate-300 flex items-center justify-center text-slate-500 shadow-sm relative z-10 font-black text-xs">
                      2
                    </div>
                    <span className="absolute -top-3 text-slate-400 z-20">
                      <Crown className="size-4" />
                    </span>
                  </div>
                  <p className="text-xs font-bold text-zinc-850 dark:text-zinc-200 mt-2 truncate w-24">
                    {podiumData.second.full_name.split(" ")[0]}
                  </p>
                  <p className="text-[10px] font-black text-slate-500 mt-0.5">{podiumData.second.xp} pts</p>
                  <div className="w-20 bg-gradient-to-t from-slate-200 to-slate-100 dark:from-slate-900 dark:to-slate-950 border border-slate-300/40 rounded-t-xl h-20 mt-3 shadow-xs flex items-center justify-center">
                    <span className="text-xl font-extrabold text-slate-450 opacity-40">2nd</span>
                  </div>
                </div>
              ) : <div />}

              {/* 1st Place (Center - Highlighted) */}
              <div className="flex flex-col items-center z-10 -translate-y-2">
                <div className="relative group flex flex-col items-center">
                  <div className="size-14 rounded-full bg-yellow-50 dark:bg-yellow-950/40 border-2 border-yellow-500 flex items-center justify-center text-yellow-600 shadow-md relative z-10 font-black text-sm">
                    1
                  </div>
                  <span className="absolute -top-4.5 text-yellow-500 z-20 animate-pulse">
                    <Crown className="size-5.5 fill-current" />
                  </span>
                </div>
                <p className="text-sm font-extrabold text-zinc-900 dark:text-white mt-2 truncate w-28">
                  {podiumData.first.full_name.split(" ")[0]}
                </p>
                <p className="text-[11px] font-black text-yellow-600 mt-0.5">{podiumData.first.xp} pts</p>
                <div className="w-24 bg-gradient-to-t from-yellow-100 to-yellow-50 dark:from-yellow-950/20 dark:to-yellow-950/5 border-2 border-yellow-500/30 rounded-t-xl h-28 mt-3 shadow-sm flex items-center justify-center relative">
                  <div className="absolute top-2 w-1.5 h-1.5 bg-yellow-500 rounded-full blur-xs" />
                  <span className="text-2xl font-black text-yellow-600/80">1st</span>
                </div>
              </div>

              {/* 3rd Place (Right) */}
              {podiumData.third ? (
                <div className="flex flex-col items-center">
                  <div className="relative group flex flex-col items-center">
                    <div className="size-11 rounded-full bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-700/50 flex items-center justify-center text-amber-700 shadow-sm relative z-10 font-black text-xs">
                      3
                    </div>
                    <span className="absolute -top-3 text-amber-700 z-20">
                      <Crown className="size-4" />
                    </span>
                  </div>
                  <p className="text-xs font-bold text-zinc-850 dark:text-zinc-200 mt-2 truncate w-24">
                    {podiumData.third.full_name.split(" ")[0]}
                  </p>
                  <p className="text-[10px] font-black text-amber-700 mt-0.5">{podiumData.third.xp} pts</p>
                  <div className="w-20 bg-gradient-to-t from-amber-100 to-amber-50 dark:from-amber-950/10 dark:to-amber-950/5 border border-amber-700/20 rounded-t-xl h-16 mt-3 shadow-xs flex items-center justify-center">
                    <span className="text-base font-extrabold text-amber-700/60">3rd</span>
                  </div>
                </div>
              ) : <div />}
            </motion.div>
          )}

          {/* Leaderboard Table List (Ranks 4+) */}
          <motion.div variants={item} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xs overflow-hidden max-w-xl mx-auto divide-y divide-zinc-100 dark:divide-zinc-850">
            {podiumData.rest.map((player, idx) => {
              const actualRank = idx + 4;
              const isCurrent = player.full_name === user?.full_name || player.user_id === user?.id;

              return (
                <div
                  key={player.full_name + idx}
                  className={`flex items-center gap-4 p-4.5 transition-all duration-200 ${
                    isCurrent
                      ? "bg-violet-500/[0.03] border-l-4 border-l-violet-500"
                      : "hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10"
                  }`}
                >
                  {/* Rank Circle */}
                  <div className="size-8 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 flex items-center justify-center shrink-0">
                    <span className="text-xs font-extrabold text-zinc-450 dark:text-zinc-550 tabular-nums">{actualRank}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-extrabold text-zinc-900 dark:text-white truncate ${isCurrent ? "text-violet-650 dark:text-violet-400" : ""}`}>
                        {player.full_name}
                        {isCurrent && <span className="text-[10px] font-bold text-violet-550 bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 rounded-md border border-violet-100 dark:border-violet-900/20 ml-2">You</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-3.5 text-xs font-bold text-zinc-400 dark:text-zinc-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Award className="size-3.5 text-violet-500" /> Lvl {player.level}
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="size-3.5 text-orange-500 fill-current" /> {player.streak} day{player.streak !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-base font-black text-zinc-900 dark:text-white tabular-nums leading-none">{player.xp}</p>
                    <p className="text-[9px] text-zinc-400 font-extrabold uppercase mt-1 tracking-wider">Points</p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
