"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGamification } from "@/context/GamificationContext";
import { useNotifications } from "@/context/NotificationContext";
import { StreakFire } from "@/components/gamification/StreakFire";
import { Confetti } from "@/components/gamification/Confetti";
import {
  Zap, Trophy, Flame, BadgeCheck, TrendingUp, Target, Medal, Star,
  Sword, Brain, Code, MessageSquare, Users, Crown, Calendar,
  CheckCircle, Clock, Sparkles, ArrowUp, ChevronRight,
  BarChart3, Activity, BookOpen,
} from "lucide-react";

type Tab = "overview" | "badges" | "leaderboard" | "challenges" | "missions" | "notifications";

export default function GamificationPage() {
  const { state, levelTitle, levelProgress, currentLevelXP, nextLevelXP, awardXP, trackActivity, updateChallengeProgress, updateMissionProgress } = useGamification();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, filteredNotifications, settings, updateSettings, toggleCategory } = useNotifications();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showConfetti, setShowConfetti] = useState(false);
  const [leaderboardCategory, setLeaderboardCategory] = useState<"global" | "coding" | "aptitude" | "interview" | "placement">("global");
  const [leaderboardEntries, setLeaderboardEntries] = useState<any[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  const fetchLeaderboard = React.useCallback(async (cat: string) => {
    setLeaderboardLoading(true);
    try {
      const rawToken = localStorage.getItem("supabase.auth.token");
      let token = "";
      if (rawToken) {
        token = JSON.parse(rawToken)?.currentSession?.access_token || "";
      }
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`/api/gamification/leaderboard?category=${cat}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setLeaderboardEntries(data.leaderboard || []);
      }
    } catch (e) {
      console.error("Failed to fetch leaderboard:", e);
    } finally {
      setLeaderboardLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (activeTab === "leaderboard") {
      fetchLeaderboard(leaderboardCategory);
    }
  }, [activeTab, leaderboardCategory, fetchLeaderboard]);

  const earnedBadges = state.badges.filter((b) => b.unlockedAt);
  const inProgressBadges = state.badges.filter((b) => !b.unlockedAt && b.progress > 0);
  const lockedBadges = state.badges.filter((b) => !b.unlockedAt && b.progress === 0);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <Zap className="h-4 w-4" /> },
    { id: "badges", label: "Badges", icon: <Trophy className="h-4 w-4" /> },
    { id: "leaderboard", label: "Leaderboard", icon: <Users className="h-4 w-4" /> },
    { id: "challenges", label: "Challenges", icon: <Target className="h-4 w-4" /> },
    { id: "missions", label: "Missions", icon: <Sword className="h-4 w-4" /> },
    { id: "notifications", label: "Notifications", icon: <BellIcon className="h-4 w-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      <Confetti active={showConfetti} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-[10px] font-semibold">
              Gamification System
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
            <Sparkles className="h-7 w-7 text-violet-500" />
            Engagement Hub
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Track your XP, streak, badges, and daily progress</p>
        </div>
      </div>

      {/* Level Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 rounded-2xl p-6 sm:p-8 text-white overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="h-20 w-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <span className="text-4xl font-black">{state.level}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-violet-200">Level {state.level}</span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-semibold">{levelTitle}</span>
            </div>
            <p className="text-2xl font-bold">{state.totalXP.toLocaleString()} Total XP</p>
            <div className="mt-3 max-w-md">
              <div className="flex justify-between text-xs text-violet-200 mb-1">
                <span>{currentLevelXP} XP earned</span>
                <span>{nextLevelXP} XP to Level {state.level + 1}</span>
              </div>
              <div className="h-2.5 bg-violet-950/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${levelProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <StreakFire streak={state.practiceStreak} size="lg" />
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Flame, label: "Login Streak", value: `${state.loginStreak} days`, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/20" },
          { icon: BookOpen, label: "Questions Solved", value: state.totalQuestionsSolved.toString(), color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20" },
          { icon: Code, label: "Coding Done", value: state.totalCodingProblems.toString(), color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
          { icon: Trophy, label: "Badges Earned", value: `${earnedBadges.length}/${state.badges.length}`, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/20" },
          { icon: MessageSquare, label: "Interviews Done", value: state.totalInterviewsCompleted.toString(), color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-950/20" },
          { icon: Target, label: "Mock Placements", value: state.totalMockPlacements.toString(), color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/20" },
          { icon: Activity, label: "Tests Completed", value: state.totalTestsCompleted.toString(), color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-950/20" },
          { icon: TrendingUp, label: "Level", value: levelTitle, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/20" },
        ].map((stat) => (
          <motion.div key={stat.label} whileHover={{ scale: 1.02 }}
            className={`${stat.bg} rounded-xl p-4 border border-zinc-200 dark:border-zinc-800`}>
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{stat.label}</span>
            </div>
            <p className={`text-lg font-extrabold ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2 border-b border-zinc-200 dark:border-zinc-800">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isNotifTab = tab.id === "notifications";
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isActive ? "bg-violet-600 text-white shadow-sm" : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}>
              {tab.icon}
              {tab.label}
              {isNotifTab && unreadCount > 0 && (
                <span className="ml-1 h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">{unreadCount}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Daily Challenges Preview */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
                  <Target className="h-4 w-4 text-violet-500" /> Daily Challenges
                </h3>
                <div className="space-y-3">
                  {state.dailyChallenges.map((c) => (
                    <div key={c.id} className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${c.completed ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"}`}>
                        {c.completed ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{c.title}</p>
                        <div className="h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full mt-1 overflow-hidden">
                          <div className={`h-full rounded-full ${c.completed ? "bg-emerald-500" : "bg-violet-500"}`} style={{ width: `${(c.progress / c.target) * 100}%` }} />
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{c.progress}/{c.target} · +{c.xpReward} XP</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-violet-500" /> Recent Activity
                </h3>
                {state.recentActivity.length > 0 ? (
                  <div className="space-y-2">
                    {state.recentActivity.slice(0, 10).map((a, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">{a.action}</span>
                        <span className="text-xs font-bold text-violet-500">+{a.xp} XP</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400 text-center py-4">Start practicing to see your activity here</p>
                )}
              </div>

              {/* AI Suggestions */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-500" /> AI Suggestions
                </h3>
                <div className="space-y-2">
                  {state.aiSuggestions.map((s) => (
                    <div key={s.id} className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-900/30 text-sm text-violet-700 dark:text-violet-300">
                      {s.message}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "badges" && (
            <div className="space-y-6">
              {/* Earned */}
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" /> Earned ({earnedBadges.length})
                </h3>
                {earnedBadges.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {earnedBadges.map((b) => (
                      <div key={b.id} className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
                        <span className="text-3xl block mb-2">{b.icon}</span>
                        <p className="text-xs font-bold text-amber-800 dark:text-amber-200">{b.name}</p>
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">{b.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400 text-center py-8">Complete activities to earn badges</p>
                )}
              </div>

              {/* In Progress */}
              {inProgressBadges.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-violet-500" /> In Progress ({inProgressBadges.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {inProgressBadges.map((b) => (
                      <div key={b.id} className="bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-center">
                        <span className="text-3xl block mb-2 opacity-50">{b.icon}</span>
                        <p className="text-xs font-bold text-zinc-500">{b.name}</p>
                        <div className="mt-2 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500 rounded-full" style={{ width: `${b.progress}%` }} />
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-1">{b.progress}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Locked */}
              {lockedBadges.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-4 text-zinc-400">Locked ({lockedBadges.length})</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {lockedBadges.map((b) => (
                      <div key={b.id} className="bg-zinc-100 dark:bg-zinc-800/20 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-center opacity-50">
                        <span className="text-3xl block mb-2 grayscale">{b.icon}</span>
                        <p className="text-xs font-bold text-zinc-500">{b.name}</p>
                        <p className="text-[10px] text-zinc-400 mt-1">{b.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "leaderboard" && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden space-y-4 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <Crown className="h-4 w-4 text-amber-500" /> Top Performers
                </h3>
                <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap py-1 scrollbar-none">
                  {(["global", "coding", "aptitude", "interview", "placement"] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setLeaderboardCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                        leaderboardCategory === cat
                          ? "bg-violet-600 text-white shadow-xs"
                          : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => fetchLeaderboard(leaderboardCategory)} 
                  className="text-xs text-violet-500 hover:text-violet-600 font-semibold cursor-pointer border-none bg-transparent"
                >
                  Refresh
                </button>
              </div>

              {leaderboardLoading ? (
                <div className="flex items-center justify-center py-10">
                  <span className="text-xs text-zinc-500">Loading Leaderboard...</span>
                </div>
              ) : leaderboardEntries.length > 0 ? (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {leaderboardEntries.map((entry, i) => (
                    <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-lg ${i < 3 ? "bg-amber-50/10 dark:bg-amber-950/5" : ""}`}>
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold ${i === 0 ? "bg-amber-500 text-white" : i === 1 ? "bg-zinc-300 dark:bg-zinc-600 text-white" : i === 2 ? "bg-amber-700 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}`}>
                        {entry.rank}
                      </span>
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                        {entry.full_name.split(" ").map((n: string) => n[0]).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{entry.full_name}</p>
                        <p className="text-[10px] text-zinc-400">Level {entry.level} Student</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50">{entry.xp.toLocaleString()} XP</p>
                        <p className="text-[10px] text-zinc-400">Streak: {entry.streak} days</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-400 text-center py-8">No leaderboard data found for this category</p>
              )}
            </div>
          )}

          {activeTab === "challenges" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.dailyChallenges.map((c) => (
                <div key={c.id} className={`bg-white dark:bg-zinc-900 border rounded-xl p-5 ${c.completed ? "border-emerald-200 dark:border-emerald-900/30" : "border-zinc-200 dark:border-zinc-800"}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-zinc-900 dark:text-zinc-50">{c.title}</h3>
                      <p className="text-xs text-zinc-500 mt-1">{c.description}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-bold">+{c.xpReward} XP</span>
                  </div>
                  <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(c.progress / c.target) * 100}%` }}
                      className={`h-full rounded-full ${c.completed ? "bg-emerald-500" : "bg-violet-500"}`}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-zinc-400">{c.progress}/{c.target} completed</span>
                    {c.completed && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "missions" && (
            <div className="space-y-6">
              {/* Weekly Missions */}
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-violet-500" /> Weekly Missions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {state.weeklyMissions.map((m) => (
                    <div key={m.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-50">{m.title}</h4>
                        <span className="text-xs font-bold text-violet-500">+{m.xpReward} XP</span>
                      </div>
                      <p className="text-xs text-zinc-500 mb-3">{m.description}</p>
                      <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${m.completed ? "bg-emerald-500" : "bg-violet-500"}`} style={{ width: `${(m.progress / m.target) * 100}%` }} />
                      </div>
                      <p className="text-xs text-zinc-400 mt-2">{m.progress}/{m.target}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Placement Missions */}
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
                  <Target className="h-4 w-4 text-amber-500" /> Placement Missions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {state.placementMissions.map((pm) => (
                    <div key={pm.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-sm">{pm.company[0]}</div>
                        <div>
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-50">{pm.title}</h4>
                          <p className="text-xs text-zinc-400">+{pm.xpReward} XP on completion</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {pm.targets.map((t) => (
                          <div key={t.label}>
                            <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                              <span>{t.label}</span>
                              <span>{Math.round(t.current)}%/{t.target}%</span>
                            </div>
                            <div className="h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(t.current / t.target) * 100}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-4">
              {/* Settings Controls */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">Notification Settings</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(Object.entries(settings.categories) as [string, boolean][]).map(([cat, enabled]) => (
                    <button key={cat} onClick={() => toggleCategory(cat as any)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer capitalize ${enabled ? "bg-violet-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"}`}>
                      {cat.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={settings.quietMode} onChange={() => updateSettings({ quietMode: !settings.quietMode })} className="rounded" />
                    Quiet Mode
                  </label>
                  <select value={settings.frequency} onChange={(e) => updateSettings({ frequency: e.target.value as any })}
                    className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs border-0 cursor-pointer">
                    <option value="realtime">Real-time</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              {/* Notification List */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">{notifications.length} notifications</span>
                  <div className="flex gap-1">
                    {unreadCount > 0 && <button onClick={markAllAsRead} className="text-[10px] px-2 py-1 rounded bg-aurora-surface text-aurora-text-muted hover:text-aurora-text cursor-pointer">Mark all read</button>}
                    <button onClick={clearAll} className="text-[10px] px-2 py-1 rounded bg-aurora-surface text-aurora-text-muted hover:text-aurora-danger cursor-pointer">Clear all</button>
                  </div>
                </div>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-zinc-400 text-center py-8">No notifications yet</p>
                  ) : (
                    notifications.slice(0, 30).map((n) => (
                      <div key={n.id} className={`flex items-start gap-3 p-3 ${!n.read ? "bg-violet-50/50 dark:bg-violet-950/10" : ""}`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-semibold ${!n.read ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-400"}`}>{n.title}</span>
                            <span className={`h-1.5 w-1.5 rounded-full ${n.priority === "high" ? "bg-red-500" : n.priority === "medium" ? "bg-amber-500" : "bg-blue-500"}`} />
                          </div>
                          <p className="text-[11px] text-zinc-500 mt-0.5">{n.message}</p>
                          <p className="text-[10px] text-zinc-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                        </div>
                        {!n.read && (
                          <button onClick={() => markAsRead(n.id)} className="p-1 rounded text-zinc-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 cursor-pointer">
                            <CheckCircle className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function BellIcon(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>; }
