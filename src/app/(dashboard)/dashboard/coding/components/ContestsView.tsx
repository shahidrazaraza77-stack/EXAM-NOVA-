"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Clock,
  Users,
  Calendar,
  ChevronRight,
  RefreshCw,
  Zap,
  Medal,
  Crown,
  Code2,
  Play,
  Star,
  Lock,
  CheckCircle2,
  ArrowLeft,
  Target,
  Timer,
  AlertCircle,
  BarChart3,
  Flame,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import ProblemDetailView from "./ProblemDetailView";

interface Contest {
  id: string;
  title: string;
  description: string;
  rules: string;
  status: "upcoming" | "active" | "ended";
  start_time: string;
  end_time: string;
  is_rated: boolean;
  max_participants: number | null;
  participant_count: number;
  problem_count: number;
  is_registered?: boolean;
}

interface ContestProblem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  points: number;
  order_index: number;
  description?: string;
}

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  total_score: number;
  problems_solved: number;
  last_submission_at: string;
}

const STATUS_CONFIG = {
  active: { label: "Live", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", dot: "bg-emerald-400" },
  upcoming: { label: "Upcoming", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", dot: "bg-amber-400" },
  ended: { label: "Ended", color: "text-zinc-400", bg: "bg-zinc-500/10", border: "border-zinc-500/30", dot: "bg-zinc-400" },
};

const DIFFICULTY_COLORS = {
  Easy: "text-emerald-400",
  Medium: "text-amber-400",
  Hard: "text-red-400",
};

function CountdownTimer({ endTime }: { endTime: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Ended"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return <span className="font-mono text-sm font-bold">{timeLeft}</span>;
}

function TimeUntilStart({ startTime }: { startTime: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(startTime).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Starting soon"); return; }
      const days = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      if (days > 0) setTimeLeft(`${days}d ${h}h`);
      else if (h > 0) setTimeLeft(`${h}h ${m}m`);
      else setTimeLeft(`${m}m`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [startTime]);

  return <span className="font-mono text-sm font-bold">{timeLeft}</span>;
}

function ContestCard({ contest, onSelect }: { contest: Contest; onSelect: () => void }) {
  const status = STATUS_CONFIG[contest.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={onSelect}
      className="cursor-pointer rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5 transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1">
          {/* Status badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${status.bg} ${status.color} ${status.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${contest.status === "active" ? "animate-pulse" : ""}`} />
              {status.label}
            </span>
            {contest.is_rated && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-400 font-medium">
                <Star className="w-2.5 h-2.5" /> Rated
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">{contest.title}</h3>
          {contest.description && (
            <p className="text-sm text-zinc-500 mb-3 line-clamp-2">{contest.description}</p>
          )}

          {/* Stats row */}
          <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <Code2 className="w-3 h-3" /> {contest.problem_count} problems
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" /> {contest.participant_count} participants
            </span>
            {contest.status === "active" && (
              <span className="flex items-center gap-1 text-red-400">
                <Timer className="w-3 h-3" />
                Ends in <CountdownTimer endTime={contest.end_time} />
              </span>
            )}
            {contest.status === "upcoming" && (
              <span className="flex items-center gap-1 text-amber-400">
                <Clock className="w-3 h-3" />
                Starts in <TimeUntilStart startTime={contest.start_time} />
              </span>
            )}
            {contest.status === "ended" && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(contest.end_time).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {contest.is_registered && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-3 h-3" /> Registered
            </span>
          )}
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        </div>
      </div>
    </motion.div>
  );
}

function ContestLobby({
  contestId,
  onBack,
  onOpenProblem,
}: {
  contestId: string;
  onBack: () => void;
  onOpenProblem?: (id: string) => void;
}) {
  const [contest, setContest] = useState<Contest | null>(null);
  const [problems, setProblems] = useState<ContestProblem[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"problems" | "rules" | "leaderboard">("problems");
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);

  const fetchContestData = useCallback(async () => {
    try {
      const [contestRes, lbRes] = await Promise.all([
        apiFetch(`/api/coding/contests/${contestId}`),
        apiFetch(`/api/coding/contests/${contestId}/submissions`),
      ]);

      if (contestRes.ok) {
        const data = await contestRes.json();
        setContest(data.contest);
        setProblems(data.problems || []);
      }
      if (lbRes.ok) {
        const data = await lbRes.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (err) {
      console.error("Error loading contest:", err);
    } finally {
      setLoading(false);
    }
  }, [contestId]);

  useEffect(() => {
    fetchContestData();
    // Poll leaderboard every 30s if active
    const interval = setInterval(fetchContestData, 30000);
    return () => clearInterval(interval);
  }, [fetchContestData]);

  const handleRegister = async () => {
    if (!contest) return;
    try {
      setRegistering(true);
      const res = await apiFetch(`/api/coding/contests/${contestId}/register`, { method: "POST" });
      if (res.ok) {
        setContest(prev => prev ? { ...prev, is_registered: true, participant_count: prev.participant_count + 1 } : prev);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to register");
      }
    } catch (err) {
      console.error("Registration error:", err);
    } finally {
      setRegistering(false);
    }
  };

  if (selectedProblemId) {
    return (
      <ProblemDetailView
        problemId={selectedProblemId}
        onBack={() => setSelectedProblemId(null)}
        contestId={contestId}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin">
          <Trophy className="w-8 h-8 text-violet-500" />
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500">Contest not found.</p>
        <button onClick={onBack} className="mt-4 text-sm text-violet-400 hover:underline">Go back</button>
      </div>
    );
  }

  const status = STATUS_CONFIG[contest.status];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Contests
      </button>

      {/* Contest Header */}
      <div className="rounded-2xl border-2 border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${status.bg} ${status.color} ${status.border}`}>
                <span className={`w-2 h-2 rounded-full ${status.dot} ${contest.status === "active" ? "animate-pulse" : ""}`} />
                {status.label}
              </span>
              {contest.is_rated && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-sm text-amber-400 font-medium">
                  <Star className="w-3 h-3" /> Rated
                </span>
              )}
              {contest.is_registered && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Registered
                </span>
              )}
            </div>

            <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">{contest.title}</h2>
            {contest.description && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{contest.description}</p>
            )}

            {/* Time info */}
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-zinc-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(contest.start_time).toLocaleString()}
              </span>
              <span>→</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {new Date(contest.end_time).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Stats + Action */}
          <div className="flex flex-col gap-3 items-end">
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-xl font-black text-zinc-900 dark:text-white">{contest.problem_count}</p>
                <p className="text-xs text-zinc-500">Problems</p>
              </div>
              <div>
                <p className="text-xl font-black text-zinc-900 dark:text-white">{contest.participant_count}</p>
                <p className="text-xs text-zinc-500">Participants</p>
              </div>
            </div>

            {contest.status !== "ended" && !contest.is_registered && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRegister}
                disabled={registering}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all disabled:opacity-60"
              >
                {registering ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {registering ? "Joining..." : "Join Contest"}
              </motion.button>
            )}

            {contest.status === "active" && (
              <div className="flex items-center gap-1.5 text-red-400 text-sm font-semibold">
                <Timer className="w-4 h-4" />
                <CountdownTimer endTime={contest.end_time} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/50">
        {(["problems", "rules", "leaderboard"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
              activeTab === tab
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            {tab === "leaderboard" ? (
              <span className="flex items-center justify-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" /> Leaderboard
              </span>
            ) : tab === "problems" ? (
              <span className="flex items-center justify-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" /> Problems
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> Rules
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "problems" && (
          <motion.div key="problems" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {problems.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">No problems in this contest yet.</div>
            ) : (
              problems.map((prob, idx) => {
                const diffColor = DIFFICULTY_COLORS[prob.difficulty] || DIFFICULTY_COLORS.Medium;
                const canSolve = contest.status === "active" && contest.is_registered;

                return (
                  <motion.div
                    key={prob.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => canSolve && setSelectedProblemId(prob.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 ${canSolve ? "cursor-pointer hover:border-violet-500/40 hover:bg-violet-500/5 transition-all" : "opacity-75"}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-sm font-bold text-violet-400 shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-zinc-900 dark:text-white truncate">{prob.title}</h4>
                      <div className="flex items-center gap-2 mt-0.5 text-xs">
                        <span className={diffColor}>{prob.difficulty}</span>
                        <span className="text-zinc-500">·</span>
                        <span className="text-zinc-500">{prob.topic}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400">
                        <Zap className="w-3 h-3" /> {prob.points} pts
                      </div>
                      {!canSolve && contest.status === "active" && (
                        <Lock className="w-3.5 h-3.5 text-zinc-400" />
                      )}
                      {canSolve && <ChevronRight className="w-4 h-4 text-zinc-400" />}
                    </div>
                  </motion.div>
                );
              })
            )}

            {contest.status === "active" && !contest.is_registered && (
              <div className="flex items-center justify-center gap-3 p-5 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5">
                <Lock className="w-4 h-4 text-amber-400" />
                <p className="text-sm text-amber-400 font-medium">Join the contest to solve problems</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "rules" && (
          <motion.div key="rules" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
              {contest.rules ? (
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                  {contest.rules}
                </div>
              ) : (
                <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200">Standard Contest Rules:</p>
                  <ul className="space-y-2 list-disc pl-4">
                    <li>Solve as many problems as possible within the time limit.</li>
                    <li>Each problem has a fixed point value. Correct submissions earn full points.</li>
                    <li>Rankings are determined by total score, then by earliest last-accepted submission time.</li>
                    <li>You may submit multiple times — only the best accepted submission counts.</li>
                    <li>Use of external AI tools during the contest is not recommended.</li>
                    <li>Plagiarism will result in disqualification.</li>
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "leaderboard" && (
          <motion.div key="leaderboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
            {leaderboard.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                No submissions yet. Be the first to solve a problem!
              </div>
            ) : (
              leaderboard.map((entry, idx) => (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    idx === 0
                      ? "border-amber-500/30 bg-amber-500/5"
                      : idx === 1
                      ? "border-zinc-400/30 bg-zinc-500/5"
                      : idx === 2
                      ? "border-orange-400/30 bg-orange-500/5"
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                  }`}
                >
                  {/* Rank */}
                  <div className="w-8 text-center font-black text-lg shrink-0">
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${entry.rank}`}
                  </div>

                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {entry.full_name?.[0]?.toUpperCase() || "?"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-zinc-900 dark:text-white text-sm truncate">{entry.full_name}</p>
                    <p className="text-xs text-zinc-500">{entry.problems_solved} solved</p>
                  </div>

                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-400 font-black text-sm shrink-0">
                    <Zap className="w-3 h-3" />
                    {entry.total_score}
                  </div>
                </motion.div>
              ))
            )}

            <div className="flex items-center justify-end">
              <button
                onClick={fetchContestData}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Refresh leaderboard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ContestsView({ onOpenProblem }: { onOpenProblem?: (id: string) => void }) {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContestId, setSelectedContestId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<"all" | "active" | "upcoming" | "ended">("all");

  const fetchContests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch("/api/coding/contests");
      if (!res.ok) throw new Error("Failed to load contests");
      const data = await res.json();
      setContests(data.contests || []);
    } catch (err: any) {
      setError(err.message || "Failed to load contests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContests();
  }, [fetchContests]);

  if (selectedContestId) {
    return (
      <ContestLobby
        contestId={selectedContestId}
        onBack={() => setSelectedContestId(null)}
        onOpenProblem={onOpenProblem}
      />
    );
  }

  const filtered = filterTab === "all" ? contests : contests.filter(c => c.status === filterTab);

  const activeCount = contests.filter(c => c.status === "active").length;
  const upcomingCount = contests.filter(c => c.status === "upcoming").length;
  const endedCount = contests.filter(c => c.status === "ended").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Coding Contests
          </h2>
          <p className="text-sm text-zinc-500 mt-0.5">Compete, earn points, and climb the leaderboard</p>
        </div>
        <button
          onClick={fetchContests}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Live Now", count: activeCount, icon: Flame, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Upcoming", count: upcomingCount, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Completed", count: endedCount, icon: CheckCircle2, color: "text-zinc-400", bg: "bg-zinc-500/10" },
        ].map(({ label, count, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 text-center">
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mx-auto mb-2`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-xl font-black text-zinc-900 dark:text-white">{count}</p>
            <p className="text-xs text-zinc-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/50">
        {(["all", "active", "upcoming", "ended"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
              filterTab === tab
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Contest List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin">
            <Trophy className="w-8 h-8 text-violet-500" />
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-zinc-500 text-sm">{error}</p>
          <button onClick={fetchContests} className="text-xs text-violet-400 hover:underline">Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <Trophy className="w-7 h-7 text-zinc-400" />
          </div>
          <p className="text-zinc-500 text-sm">No {filterTab === "all" ? "" : filterTab} contests found.</p>
          <p className="text-xs text-zinc-400">Check back later or ask an admin to create one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((contest) => (
            <ContestCard
              key={contest.id}
              contest={contest}
              onSelect={() => setSelectedContestId(contest.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
